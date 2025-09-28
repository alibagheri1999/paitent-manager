import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const view = searchParams.get("view") || "month"; // day, week, month
    const date = searchParams.get("date"); // ISO date string
    const limit = parseInt(searchParams.get("limit") || "1000");
    const status = searchParams.get("status");

    let startDate: Date;
    let endDate: Date;

    if (date) {
      const baseDate = new Date(date);
      
      switch (view) {
        case "day":
          startDate = new Date(baseDate);
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date(baseDate);
          endDate.setHours(23, 59, 59, 999);
          break;
          
        case "week":
          // Get start of week (Monday)
          const dayOfWeek = baseDate.getDay();
          const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
          startDate = new Date(baseDate);
          startDate.setDate(baseDate.getDate() + daysToMonday);
          startDate.setHours(0, 0, 0, 0);
          
          endDate = new Date(startDate);
          endDate.setDate(startDate.getDate() + 6);
          endDate.setHours(23, 59, 59, 999);
          break;
          
        case "month":
        default:
          // Get start and end of month
          startDate = new Date(baseDate.getFullYear(), baseDate.getMonth(), 1);
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, 0);
          endDate.setHours(23, 59, 59, 999);
          break;
      }
    } else {
      // Default to current month
      const now = new Date();
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      endDate.setHours(23, 59, 59, 999);
    }

    const whereClause: any = {
      date: {
        gte: startDate,
        lte: endDate,
      },
    };

    if (status) {
      whereClause.status = status;
    }

    const appointments = await prisma.appointment.findMany({
      where: whereClause,
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            email: true,
          },
        },
      },
      orderBy: [
        { date: "asc" },
        { startTime: "asc" },
      ],
      take: limit,
    });

    // Group appointments by date for calendar view
    const appointmentsByDate = appointments.reduce((acc: any, appointment) => {
      const dateKey = appointment.date.toISOString().split('T')[0];
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(appointment);
      return acc;
    }, {});

    // Generate available time slots for the period
    const timeSlots = generateTimeSlots(startDate, endDate, view);

    return NextResponse.json({
      appointments,
      appointmentsByDate,
      timeSlots,
      view,
      dateRange: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
      },
      meta: {
        total: appointments.length,
        view,
        date: date || new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error fetching appointments:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Generate available time slots
function generateTimeSlots(startDate: Date, endDate: Date, view: string) {
  const slots: any = {};
  const current = new Date(startDate);
  
  while (current <= endDate) {
    const dateKey = current.toISOString().split('T')[0];
    
    // Generate hourly slots from 9 AM to 6 PM
    const daySlots = [];
    for (let hour = 9; hour <= 18; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        daySlots.push({
          time: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
          available: true, // This would be calculated based on existing appointments
        });
      }
    }
    
    slots[dateKey] = daySlots;
    current.setDate(current.getDate() + 1);
  }
  
  return slots;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { patientId, date, startTime, endTime, treatmentType, description, notes } = body;

    const appointment = await prisma.appointment.create({
      data: {
        patientId,
        date: new Date(date),
        startTime,
        endTime,
        treatmentType,
        description,
        notes,
        userId: session.user.id,
      },
      include: {
        patient: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return NextResponse.json(appointment);
  } catch (error) {
    console.error("Error creating appointment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
