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

    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    // Get total patients
    const totalPatients = await prisma.patient.count();

    // Get today's appointments
    const startOfToday = new Date(today);
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date(today);
    endOfToday.setHours(23, 59, 59, 999);
    
    const todayAppointments = await prisma.appointment.count({
      where: {
        date: {
          gte: startOfToday,
          lte: endOfToday,
        },
      },
    });

    // Get monthly revenue
    const monthlyRevenue = await prisma.record.aggregate({
      where: {
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
        isCompleted: true,
      },
      _sum: {
        cost: true,
      },
    });

    // Get active patients (patients with appointments in the last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const activePatients = await prisma.patient.count({
      where: {
        appointments: {
          some: {
            date: {
              gte: thirtyDaysAgo,
            },
          },
        },
      },
    });

    return NextResponse.json({
      totalPatients,
      todayAppointments,
      monthlyRevenue: monthlyRevenue._sum.cost || 0,
      activePatients,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
