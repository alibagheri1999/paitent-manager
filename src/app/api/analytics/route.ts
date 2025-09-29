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

    // Total revenue
    const totalRevenueResult = await prisma.record.aggregate({
      where: {
        isCompleted: true,
      },
      _sum: {
        cost: true,
      },
    });

    // Monthly revenue
    const monthlyRevenueResult = await prisma.record.aggregate({
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

    // Total patients (all patients, not just active)
    const totalPatients = await prisma.patient.count();

    // Total appointments
    const totalAppointments = await prisma.appointment.count();

    // Average value per completed record (not per appointment)
    const completedRecordsCount = await prisma.record.count({
      where: {
        isCompleted: true,
      },
    });
    
    const averageValue = totalRevenueResult._sum.cost && completedRecordsCount > 0 
      ? Number(totalRevenueResult._sum.cost) / completedRecordsCount 
      : 0;

    console.log('Analytics Debug:', {
      totalRevenue: totalRevenueResult._sum.cost,
      completedRecordsCount,
      averageValue,
      totalPatients,
      totalAppointments
    });

    // Top treatments
    const topTreatments = await prisma.record.groupBy({
      by: ['treatmentType'],
      where: {
        isCompleted: true,
      },
      _count: {
        treatmentType: true,
      },
      _sum: {
        cost: true,
      },
      orderBy: {
        _sum: {
          cost: 'desc',
        },
      },
      take: 10,
    });

    const formattedTopTreatments = topTreatments.map((treatment: any) => ({
      treatmentType: treatment.treatmentType,
      count: treatment._count.treatmentType,
      revenue: treatment._sum.cost || 0,
    }));

    return NextResponse.json({
      totalRevenue: totalRevenueResult._sum.cost || 0,
      monthlyRevenue: monthlyRevenueResult._sum.cost || 0,
      totalPatients,
      totalAppointments,
      averageAppointmentValue: averageValue,
      topTreatments: formattedTopTreatments,
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
