import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDateForExcel, formatDateTimeForExcel, formatCurrencyForExcel, formatFileUrls } from "@/lib/excel";
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
    const treatmentType = searchParams.get('treatmentType');
    const isCompleted = searchParams.get('isCompleted');

    // Build where clause
    const where: any = {};
    
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }
    
    if (treatmentType) {
      where.treatmentType = treatmentType;
    }
    
    if (isCompleted !== null && isCompleted !== undefined) {
      where.isCompleted = isCompleted === 'true';
    }

    const records = await prisma.record.findMany({
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
        files: {
          select: {
            id: true,
            originalName: true,
            fileUrl: true,
            fileSize: true,
            mimeType: true,
            uploadedAt: true,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    });

    // Transform data for Excel export
    const excelData = records.map((record: any) => ({
      'Record ID': record.id,
      'Patient Name': `${record.patient.firstName} ${record.patient.lastName}`,
      'Patient Email': record.patient.email,
      'Patient Phone': record.patient.phone,
      'Date': formatDateForExcel(record.date),
      'Treatment Type': record.treatmentType,
      'Description': record.description,
      'Cost': formatCurrencyForExcel(Number(record.cost)),
      'Status': record.isCompleted ? 'Completed' : 'Pending',
      'Notes': record.notes || '',
      'File URLs': formatFileUrls(record.files),
      'Created At': formatDateTimeForExcel(record.createdAt),
      'Updated At': formatDateTimeForExcel(record.updatedAt),
    }));

    // Generate filename with filters
    const filters = [];
    if (startDate) filters.push(`from_${startDate}`);
    if (endDate) filters.push(`until_${endDate}`);
    if (treatmentType) filters.push(`type_${treatmentType}`);
    if (isCompleted !== null) filters.push(`status_${isCompleted}`);
    
    const filterString = filters.length > 0 ? `_${filters.join('_')}` : '';
    const filename = `records_export${filterString}_${new Date().toISOString().split('T')[0]}`;

    // Create Excel file
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Records');
    
    // Generate buffer
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}.xlsx"`,
      },
    });
  } catch (error) {
    console.error("Error exporting records:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
