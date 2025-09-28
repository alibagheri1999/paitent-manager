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

    const revenueData = await prisma.record.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
        isCompleted: true,
      },
      select: {
        date: true,
        cost: true,
      },
      orderBy: {
        date: "asc",
      },
    });

    // Group by date and sum revenue
    const groupedData = revenueData.reduce((acc: any, record) => {
      const date = record.date.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = 0;
      }
      acc[date] += record.cost;
      return acc;
    }, {});

    const formattedData = Object.entries(groupedData).map(([date, revenue]) => ({
      date,
      revenue,
    }));

    return NextResponse.json(formattedData);
  } catch (error) {
    console.error("Error fetching revenue data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
