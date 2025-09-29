import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDateForExcel, formatDateTimeForExcel } from "@/lib/excel";
import * as XLSX from 'xlsx';

export async function GET(request: NextRequest) {
  try {
    console.log("Export appointments API called");
    const session = await getServerSession(authOptions);
    console.log("Session:", session ? "exists" : "null");
    
    if (!session) {
      console.log("No session found, returning 401");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const status = searchParams.get('status');

    // Build where clause
    const where: any = {};
    
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }
    
    if (status) {
      where.status = status;
    }

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        patient: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    });

    // Transform data for Excel export
    const excelData = appointments.map(appointment => ({
      'Appointment ID': appointment.id,
      'Patient Name': `${appointment.patient.firstName} ${appointment.patient.lastName}`,
      'Patient Email': appointment.patient.email,
      'Patient Phone': appointment.patient.phone,
      'Date': formatDateForExcel(appointment.date),
      'Start Time': appointment.startTime,
      'End Time': appointment.endTime,
      'Treatment Type': appointment.treatmentType,
      'Status': appointment.status,
      'Notes': appointment.notes || '',
      'Created At': formatDateTimeForExcel(appointment.createdAt),
      'Updated At': formatDateTimeForExcel(appointment.updatedAt),
    }));

    // Generate filename with date range
    const dateRange = startDate && endDate 
      ? `_${startDate}_to_${endDate}` 
      : startDate 
        ? `_from_${startDate}` 
        : endDate 
          ? `_until_${endDate}` 
          : '';
    
    const filename = `appointments_export${dateRange}_${new Date().toISOString().split('T')[0]}`;

    // Create Excel file
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Appointments');
    
    // Generate buffer
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}.xlsx"`,
      },
    });
  } catch (error) {
    console.error("Error exporting appointments:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
