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

    let startDate: Date;
    let endDate: Date;
    let calendarTitle: string;

    if (date) {
      const baseDate = new Date(date);
      
      switch (view) {
        case "day":
          startDate = new Date(baseDate);
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date(baseDate);
          endDate.setHours(23, 59, 59, 999);
          calendarTitle = baseDate.toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          });
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
          
          calendarTitle = `Week of ${startDate.toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })}`;
          break;
          
        case "month":
        default:
          // Get start and end of month
          startDate = new Date(baseDate.getFullYear(), baseDate.getMonth(), 1);
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, 0);
          endDate.setHours(23, 59, 59, 999);
          
          calendarTitle = baseDate.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
          });
          break;
      }
    } else {
      // Default to current month
      const now = new Date();
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      endDate.setHours(23, 59, 59, 999);
      
      calendarTitle = now.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
      });
    }

    // Fetch appointments for the date range
    const appointments = await prisma.appointment.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
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
    });

    // Group appointments by date
    const appointmentsByDate = appointments.reduce((acc: any, appointment: any) => {
      const dateKey = appointment.date.toISOString().split('T')[0];
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(appointment);
      return acc;
    }, {});

    // Generate calendar grid for month view
    let calendarGrid: any[] = [];
    if (view === "month") {
      calendarGrid = generateMonthGrid(startDate, appointmentsByDate);
    } else if (view === "week") {
      calendarGrid = generateWeekGrid(startDate, appointmentsByDate);
    } else {
      // Day view - single day with hourly slots
      // Use the original date for day view to avoid timezone issues
      const dayDate = date ? new Date(date) : new Date();
      calendarGrid = generateDayGrid(dayDate, appointmentsByDate);
    }

    // Generate time slots for scheduling
    const timeSlotsStart = view === "day" && date ? new Date(date) : startDate;
    const timeSlotsEnd = view === "day" && date ? new Date(date) : endDate;
    const timeSlots = generateTimeSlots(timeSlotsStart, timeSlotsEnd, view);

    // Calculate statistics
    const stats = {
      totalAppointments: appointments.length,
      scheduled: appointments.filter((apt: any) => apt.status === "SCHEDULED").length,
      completed: appointments.filter((apt: any) => apt.status === "COMPLETED").length,
      cancelled: appointments.filter((apt: any) => apt.status === "CANCELLED").length,
      noShow: appointments.filter((apt: any) => apt.status === "NO_SHOW").length,
    };

    return NextResponse.json({
      view,
      calendarTitle,
      dateRange: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
      },
      appointments,
      appointmentsByDate,
      calendarGrid,
      timeSlots,
      stats,
      navigation: {
        previous: getPreviousDate(startDate, view).toISOString(),
        next: getNextDate(startDate, view).toISOString(),
        today: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error fetching calendar data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Generate month grid with proper calendar layout
function generateMonthGrid(monthStart: Date, appointmentsByDate: any) {
  const grid: any[] = [];
  const year = monthStart.getFullYear();
  const month = monthStart.getMonth();
  
  // Get first day of month and find what day of week it is
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDate = new Date(firstDay);
  
  // Adjust to start from Monday (or Sunday depending on locale)
  const dayOfWeek = firstDay.getDay();
  const startOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  startDate.setDate(firstDay.getDate() + startOffset);
  
  // Generate 6 weeks (42 days) to ensure full month coverage
  for (let week = 0; week < 6; week++) {
    const weekDays = [];
    for (let day = 0; day < 7; day++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + (week * 7) + day);
      
      const dateKey = currentDate.toISOString().split('T')[0];
      const dayAppointments = appointmentsByDate[dateKey] || [];
      
      weekDays.push({
        date: currentDate,
        dateKey,
        isCurrentMonth: currentDate.getMonth() === month,
        isToday: isToday(currentDate),
        appointments: dayAppointments,
        appointmentCount: dayAppointments.length,
      });
    }
    grid.push(weekDays);
  }
  
  return grid;
}

// Generate week grid
function generateWeekGrid(weekStart: Date, appointmentsByDate: any) {
  const weekDays = [];
  
  for (let day = 0; day < 7; day++) {
    const currentDate = new Date(weekStart);
    currentDate.setDate(weekStart.getDate() + day);
    
    const dateKey = currentDate.toISOString().split('T')[0];
    const dayAppointments = appointmentsByDate[dateKey] || [];
    
    weekDays.push({
      date: currentDate,
      dateKey,
      isToday: isToday(currentDate),
      appointments: dayAppointments,
      appointmentCount: dayAppointments.length,
    });
  }
  
  return [weekDays]; // Return as single week
}

// Generate day grid with hourly slots
function generateDayGrid(day: Date, appointmentsByDate: any) {
  const dateKey = day.toISOString().split('T')[0];
  const dayAppointments = appointmentsByDate[dateKey] || [];
  
  // Create hourly slots from 8 AM to 8 PM
  const hourlySlots = [];
  for (let hour = 8; hour <= 20; hour++) {
    const timeSlot = {
      time: `${hour.toString().padStart(2, '0')}:00`,
      appointments: dayAppointments.filter((apt: any) => {
        // Extract hour from startTime (e.g., "11:45" -> 11)
        const startHour = parseInt(apt.startTime.split(':')[0]);
        return startHour === hour;
      }),
    };
    hourlySlots.push(timeSlot);
  }
  
  return [{
    date: day,
    dateKey,
    isToday: isToday(day),
    appointments: dayAppointments,
    hourlySlots,
  }];
}

// Generate available time slots for scheduling
function generateTimeSlots(startDate: Date, endDate: Date, view: string) {
  const slots: any = {};
  const current = new Date(startDate);
  
  while (current <= endDate) {
    const dateKey = current.toISOString().split('T')[0];
    
    // Generate 30-minute slots from 8 AM to 8 PM
    const daySlots = [];
    for (let hour = 8; hour <= 20; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        daySlots.push({
          time: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
          available: true, // This would be calculated based on existing appointments
          duration: 30,
        });
      }
    }
    
    slots[dateKey] = daySlots;
    current.setDate(current.getDate() + 1);
  }
  
  return slots;
}

// Helper functions
function isToday(date: Date): boolean {
  const today = new Date();
  return date.toDateString() === today.toDateString();
}

function getPreviousDate(currentDate: Date, view: string): Date {
  const newDate = new Date(currentDate);
  
  switch (view) {
    case "day":
      newDate.setDate(currentDate.getDate() - 1);
      break;
    case "week":
      newDate.setDate(currentDate.getDate() - 7);
      break;
    case "month":
    default:
      newDate.setMonth(currentDate.getMonth() - 1);
      break;
  }
  
  return newDate;
}

function getNextDate(currentDate: Date, view: string): Date {
  const newDate = new Date(currentDate);
  
  switch (view) {
    case "day":
      newDate.setDate(currentDate.getDate() + 1);
      break;
    case "week":
      newDate.setDate(currentDate.getDate() + 7);
      break;
    case "month":
    default:
      newDate.setMonth(currentDate.getMonth() + 1);
      break;
  }
  
  return newDate;
}
