import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDateForExcel, formatDateTimeForExcel } from "@/lib/excel";
import * as XLSX from 'xlsx';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Build where clause
    const where: any = {};
    
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const patients = await prisma.patient.findMany({
      where,
      include: {
        _count: {
          select: {
            appointments: true,
            records: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Transform data for Excel export
    const excelData = patients.map((patient: any) => ({
      'Patient ID': patient.id,
      'First Name': patient.firstName,
      'Last Name': patient.lastName,
      'Email': patient.email,
      'Phone': patient.phone,
      'Date of Birth': patient.dateOfBirth ? formatDateForExcel(patient.dateOfBirth) : '',
      'Address': patient.address || '',
      'Emergency Contact': patient.emergencyContact || '',
      'Emergency Phone': patient.emergencyPhone || '',
      'Medical History': patient.medicalHistory || '',
      'Allergies': patient.allergies || '',
      'Insurance Provider': patient.insuranceProvider || '',
      'Insurance Number': patient.insuranceNumber || '',
      'Insurance Group': patient.insuranceGroup || '',
      'Total Appointments': patient._count.appointments,
      'Total Records': patient._count.records,
      'Created At': formatDateTimeForExcel(patient.createdAt),
      'Updated At': formatDateTimeForExcel(patient.updatedAt),
    }));

    // Generate filename with date range
    const dateRange = startDate && endDate 
      ? `_${startDate}_to_${endDate}` 
      : startDate 
        ? `_from_${startDate}` 
        : endDate 
          ? `_until_${endDate}` 
          : '';
    
    const filename = `patients_export${dateRange}_${new Date().toISOString().split('T')[0]}`;

    // Create Excel file
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Patients');
    
    // Generate buffer
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}.xlsx"`,
      },
    });
  } catch (error) {
    console.error("Error exporting patients:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
