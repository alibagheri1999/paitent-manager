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
    const days = parseInt(searchParams.get("days") || "30");

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get patient registrations by date
    const patientData = await prisma.patient.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        isActive: true,
      },
      select: {
        createdAt: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    // Group by date and count
    const groupedData = patientData.reduce((acc: any, patient) => {
      const date = patient.createdAt.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = 0;
      }
      acc[date] += 1;
      return acc;
    }, {});

    const formattedData = Object.entries(groupedData).map(([date, count]) => ({
      date,
      count,
    }));

    return NextResponse.json(formattedData);
  } catch (error) {
    console.error("Error fetching patient growth data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
