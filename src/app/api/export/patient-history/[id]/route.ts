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

    // Fetch patient's records with files and payment steps
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
        paymentSteps: {
          select: {
            id: true,
            stepNumber: true,
            amount: true,
            dueDate: true,
            isPaid: true,
            paidDate: true,
            paymentMethod: true,
            notes: true,
            createdAt: true,
            updatedAt: true,
          },
          orderBy: { stepNumber: 'asc' },
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

    // Create data with record details, file information, and payment steps
    console.log("Creating record details data with payment steps");
    const excelData = records.map(record => {
      // Calculate payment totals
      const totalPaid = record.paymentSteps.reduce((sum: number, step: any) => {
        return sum + (step.isPaid ? parseFloat(step.amount.toString()) : 0);
      }, 0);
      const totalUnpaid = record.paymentSteps.reduce((sum: number, step: any) => {
        return sum + (!step.isPaid ? parseFloat(step.amount.toString()) : 0);
      }, 0);
      const totalSteps = record.paymentSteps.length;
      const paidSteps = record.paymentSteps.filter((step: any) => step.isPaid).length;
      const unpaidSteps = totalSteps - paidSteps;

      return {
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
        
        // Payment Information
        'Payment Status': record.paymentStatus || 'UNPAID',
        'Total Payment Steps': totalSteps,
        'Paid Steps': paidSteps,
        'Unpaid Steps': unpaidSteps,
        'Total Paid Amount': formatCurrencyForExcel(totalPaid),
        'Total Unpaid Amount': formatCurrencyForExcel(totalUnpaid),
        'Remaining Debt': formatCurrencyForExcel(parseFloat(record.cost.toString()) - totalPaid),
        
        // Payment Steps Details
        'Payment Steps': record.paymentSteps.map((step: any) => 
          `Step ${step.stepNumber}: ${formatCurrencyForExcel(parseFloat(step.amount.toString()))} - ${step.isPaid ? 'Paid' : 'Unpaid'}${step.dueDate ? ` (Due: ${formatDateForExcel(step.dueDate)})` : ''}${step.paymentMethod ? ` (Method: ${step.paymentMethod})` : ''}${step.notes ? ` (Notes: ${step.notes})` : ''}`
        ).join(' | '),
        
        // File Information
        'File Count': record.files.length,
        'File URLs': record.files.map(file => file.fileUrl).join('; '),
        'File Names': record.files.map(file => file.originalName).join('; '),
        'File Sizes': record.files.map(file => file.fileSize).join('; '),
        'File Types': record.files.map(file => file.mimeType).join('; '),
      };
    });

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
        'Payment Status': '',
        'Total Payment Steps': 0,
        'Paid Steps': 0,
        'Unpaid Steps': 0,
        'Total Paid Amount': '',
        'Total Unpaid Amount': '',
        'Remaining Debt': '',
        'Payment Steps': '',
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

    // Create detailed payment steps sheet
    console.log("Creating payment steps sheet");
    const paymentStepsData: any[] = [];
    
    records.forEach(record => {
      if (record.paymentSteps.length > 0) {
        record.paymentSteps.forEach((step: any) => {
          paymentStepsData.push({
            'Record ID': record.id,
            'Treatment Type': record.treatmentType,
            'Description': record.description,
            'Record Cost': formatCurrencyForExcel(record.cost),
            'Record Date': formatDateForExcel(record.date),
            'Step Number': step.stepNumber,
            'Step Amount': formatCurrencyForExcel(parseFloat(step.amount.toString())),
            'Due Date': step.dueDate ? formatDateForExcel(step.dueDate) : '',
            'Is Paid': step.isPaid ? 'Yes' : 'No',
            'Paid Date': step.paidDate ? formatDateForExcel(step.paidDate) : '',
            'Payment Method': step.paymentMethod || '',
            'Step Notes': step.notes || '',
            'Step Created At': formatDateTimeForExcel(step.createdAt),
            'Step Updated At': formatDateTimeForExcel(step.updatedAt),
          });
        });
      } else {
        // Add record with no payment steps
        paymentStepsData.push({
          'Record ID': record.id,
          'Treatment Type': record.treatmentType,
          'Description': record.description,
          'Record Cost': formatCurrencyForExcel(record.cost),
          'Record Date': formatDateForExcel(record.date),
          'Step Number': 'N/A',
          'Step Amount': '',
          'Due Date': '',
          'Is Paid': 'N/A',
          'Paid Date': '',
          'Payment Method': '',
          'Step Notes': 'No payment steps configured',
          'Step Created At': '',
          'Step Updated At': '',
        });
      }
    });

    // If no payment steps data, create empty sheet
    if (paymentStepsData.length === 0) {
      paymentStepsData.push({
        'Record ID': 'No payment steps found',
        'Treatment Type': '',
        'Description': '',
        'Record Cost': '',
        'Record Date': '',
        'Step Number': '',
        'Step Amount': '',
        'Due Date': '',
        'Is Paid': '',
        'Paid Date': '',
        'Payment Method': '',
        'Step Notes': '',
        'Step Created At': '',
        'Step Updated At': '',
      });
    }

    const paymentStepsWorksheet = XLSX.utils.json_to_sheet(paymentStepsData);
    XLSX.utils.book_append_sheet(workbook, paymentStepsWorksheet, 'Payment Steps');
    console.log("Payment steps sheet created");

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
