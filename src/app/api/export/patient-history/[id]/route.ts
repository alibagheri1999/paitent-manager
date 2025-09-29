import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDateForExcel, formatDateTimeForExcel, formatCurrencyForExcel, formatFileUrls } from "@/lib/excel";
import * as XLSX from 'xlsx';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log("Patient history export API called");
    const session = await getServerSession(authOptions);
    console.log("Session:", session ? "exists" : "null");
    
    if (!session) {
      console.log("No session found, returning 401");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: patientId } = await params;
    console.log("Patient ID:", patientId);

    // Fetch patient information
    console.log("Fetching patient information for:", patientId);
    const patient = await (prisma as any).patient.findUnique({
      where: { id: patientId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        dateOfBirth: true,
        address: true,
        emergencyContact: true,
        emergencyPhone: true,
        medicalHistory: true,
        allergies: true,
        insuranceProvider: true,
        insuranceNumber: true,
        insuranceGroup: true,
        notes: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    console.log("Patient found:", patient ? "Yes" : "No");

    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    // Fetch patient's records with files
    console.log("Fetching records for patient:", patientId);
    const records = await (prisma as any).record.findMany({
      where: { patientId },
      include: {
        files: {
          select: {
            id: true,
            originalName: true,
            fileSize: true,
            mimeType: true,
            fileUrl: true,
            uploadedAt: true,
          },
        },
      },
      orderBy: { date: 'desc' },
    });
    console.log("Found records:", records.length);

    // Fetch patient's appointments
    console.log("Fetching appointments for patient:", patientId);
    const appointments = await (prisma as any).appointment.findMany({
      where: { patientId },
      orderBy: { date: 'desc' },
    });
    console.log("Found appointments:", appointments.length);

    // Create single sheet with only record details
    console.log("Creating Excel workbook");
    const workbook = XLSX.utils.book_new();

    // Create data with only record details and file information
    console.log("Creating record details data");
    const excelData = records.map(record => ({
      // Record Information
      'Record ID': record.id,
      'Treatment Type': record.treatmentType,
      'Description': record.description,
      'Cost': formatCurrencyForExcel(record.cost),
      'Record Date': formatDateForExcel(record.date),
      'Record Notes': record.notes || '',
      'Is Completed': record.isCompleted ? 'Yes' : 'No',
      'Record Created At': formatDateTimeForExcel(record.createdAt),
      'Record Updated At': formatDateTimeForExcel(record.updatedAt),
      
      // File Information
      'File Count': record.files.length,
      'File URLs': record.files.map(file => file.fileUrl).join('; '),
      'File Names': record.files.map(file => file.originalName).join('; '),
      'File Sizes': record.files.map(file => file.fileSize).join('; '),
      'File Types': record.files.map(file => file.mimeType).join('; '),
    }));

    // If no records, create empty sheet
    if (excelData.length === 0) {
      console.log("No records found, creating empty sheet");
      excelData.push({
        'Record ID': 'No records found',
        'Treatment Type': '',
        'Description': '',
        'Cost': '',
        'Record Date': '',
        'Record Notes': '',
        'Is Completed': '',
        'Record Created At': '',
        'Record Updated At': '',
        'File Count': 0,
        'File URLs': '',
        'File Names': '',
        'File Sizes': '',
        'File Types': '',
      });
    }

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Patient Records');
    console.log("Patient records sheet created");

    // Generate filename
    console.log("Generating filename");
    const filename = `patient_history_${patient.firstName}_${patient.lastName}_${new Date().toISOString().split('T')[0]}`;
    console.log("Filename:", filename);

    // Generate buffer
    console.log("Generating Excel buffer");
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    console.log("Buffer generated successfully");

    console.log("Returning Excel file response");
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}.xlsx"`,
      },
    });
  } catch (error) {
    console.error("Error exporting patient history:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
