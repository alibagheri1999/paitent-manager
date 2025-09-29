import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDateForExcel, formatCurrencyForExcel } from "@/lib/excel";
import * as XLSX from 'xlsx';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate') || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const endDate = searchParams.get('endDate') || new Date().toISOString().split('T')[0];

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Get analytics data
    const [
      totalPatients,
      totalAppointments,
      totalRecords,
      completedAppointments,
      completedRecords,
      revenueData,
      treatmentStats,
      monthlyStats
    ] = await Promise.all([
      // Total patients
      prisma.patient.count(),
      
      // Total appointments
      prisma.appointment.count({
        where: {
          date: { gte: start, lte: end }
        }
      }),
      
      // Total records
      prisma.record.count({
        where: {
          date: { gte: start, lte: end }
        }
      }),
      
      // Completed appointments
      prisma.appointment.count({
        where: {
          date: { gte: start, lte: end },
          status: 'COMPLETED'
        }
      }),
      
      // Completed records
      prisma.record.count({
        where: {
          date: { gte: start, lte: end },
          isCompleted: true
        }
      }),
      
      // Revenue data
      prisma.record.aggregate({
        where: {
          date: { gte: start, lte: end },
          isCompleted: true
        },
        _sum: { cost: true },
        _avg: { cost: true }
      }),
      
      // Treatment statistics
      prisma.record.groupBy({
        by: ['treatmentType'],
        where: {
          date: { gte: start, lte: end }
        },
        _count: { treatmentType: true },
        _sum: { cost: true }
      }),
      
      // Monthly statistics
      prisma.$queryRaw`
        SELECT 
          DATE_TRUNC('month', date) as month,
          COUNT(*) as count,
          SUM(cost) as revenue
        FROM "Record" 
        WHERE date >= ${start} AND date <= ${end} AND "isCompleted" = true
        GROUP BY DATE_TRUNC('month', date)
        ORDER BY month
      `
    ]);

    // Create multiple sheets
    const workbook = XLSX.utils.book_new();

    // Summary sheet
    const summaryData = [
      { Metric: 'Total Patients', Value: totalPatients },
      { Metric: 'Total Appointments (Period)', Value: totalAppointments },
      { Metric: 'Total Records (Period)', Value: totalRecords },
      { Metric: 'Completed Appointments', Value: completedAppointments },
      { Metric: 'Completed Records', Value: completedRecords },
      { Metric: 'Total Revenue', Value: formatCurrencyForExcel(revenueData._sum.cost || 0) },
      { Metric: 'Average Record Cost', Value: formatCurrencyForExcel(revenueData._avg.cost || 0) },
      { Metric: 'Period Start', Value: formatDateForExcel(start) },
      { Metric: 'Period End', Value: formatDateForExcel(end) },
    ];

    const summarySheet = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

    // Treatment statistics sheet
    const treatmentData = treatmentStats.map(stat => ({
      'Treatment Type': stat.treatmentType,
      'Count': stat._count.treatmentType,
      'Total Revenue': formatCurrencyForExcel(stat._sum.cost || 0),
      'Average Revenue': formatCurrencyForExcel((stat._sum.cost || 0) / stat._count.treatmentType),
    }));

    const treatmentSheet = XLSX.utils.json_to_sheet(treatmentData);
    XLSX.utils.book_append_sheet(workbook, treatmentSheet, 'Treatment Stats');

    // Monthly statistics sheet
    const monthlyData = (monthlyStats as any[]).map(stat => ({
      'Month': formatDateForExcel(stat.month),
      'Records Count': Number(stat.count),
      'Revenue': formatCurrencyForExcel(Number(stat.revenue)),
    }));

    const monthlySheet = XLSX.utils.json_to_sheet(monthlyData);
    XLSX.utils.book_append_sheet(workbook, monthlySheet, 'Monthly Stats');

    // Generate filename
    const filename = `analytics_export_${startDate}_to_${endDate}_${new Date().toISOString().split('T')[0]}`;

    // Generate buffer
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}.xlsx"`,
      },
    });
  } catch (error) {
    console.error("Error exporting analytics:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
