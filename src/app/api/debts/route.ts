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

    console.log("Fetching debt report...");

    // First, get all patients
    const allPatients = await prisma.patient.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        phone: true,
        email: true,
      }
    });

    console.log(`Found ${allPatients.length} patients`);

    // Get all records with payment status UNPAID or PARTIAL
    const unpaidRecords = await prisma.record.findMany({
      where: {
        paymentStatus: {
          in: ["UNPAID", "PARTIAL"]
        }
      },
      select: {
        id: true,
        patientId: true,
        treatmentType: true,
        description: true,
        cost: true,
        paymentStatus: true,
        date: true,
      }
    });

    console.log(`Found ${unpaidRecords.length} unpaid/partial records`);

    // Get all payment steps for these records
    const allPaymentSteps = await prisma.paymentStep.findMany({
      where: {
        recordId: {
          in: unpaidRecords.map((record: any) => record.id)
        }
      },
      select: {
        id: true,
        recordId: true,
        stepNumber: true,
        amount: true,
        dueDate: true,
        notes: true,
        isPaid: true,
      },
      orderBy: {
        stepNumber: 'asc'
      }
    });

    console.log(`Found ${allPaymentSteps.length} payment steps`);

    // Calculate debt amounts for each patient
    const debtReport = allPatients.map((patient: any) => {
      const patientRecords = unpaidRecords.filter((record: any) => record.patientId === patient.id);
      
      if (patientRecords.length === 0) {
        return null; // No debts for this patient
      }

      let totalDebt = 0;
      let unpaidRecordsCount = 0;

      const recordsWithDebts = patientRecords.map((record: any) => {
        const recordPaymentSteps = allPaymentSteps.filter((step: any) => step.recordId === record.id);
        
        let recordDebt = 0;
        
        if (recordPaymentSteps.length === 0) {
          // No payment steps - use full record cost for UNPAID records
          if (record.paymentStatus === "UNPAID") {
            recordDebt = Number(record.cost);
            unpaidRecordsCount++;
          }
        } else {
          // Has payment steps - calculate from unpaid steps
          const unpaidSteps = recordPaymentSteps.filter((step: any) => !step.isPaid);
          recordDebt = unpaidSteps.reduce((sum: any, step: any) => sum + Number(step.amount), 0);
          
          if (recordDebt > 0) {
            unpaidRecordsCount++;
          }
        }

        totalDebt += recordDebt;

        return {
          recordId: record.id,
          treatmentType: record.treatmentType,
          description: record.description,
          totalCost: Number(record.cost),
          paymentStatus: record.paymentStatus,
          recordDebt: recordDebt,
          unpaidSteps: recordPaymentSteps
            .filter((step: any) => !step.isPaid)
            .map((step: any) => ({
              stepNumber: step.stepNumber,
              amount: Number(step.amount),
              dueDate: step.dueDate,
              notes: step.notes
            }))
        };
      });

      // Only include patients with actual debt
      if (totalDebt <= 0) {
        return null;
      }

      return {
        patientId: patient.id,
        patientName: `${patient.firstName} ${patient.lastName}`,
        patientPhone: patient.phone,
        patientEmail: patient.email,
        totalDebt: totalDebt,
        unpaidRecords: unpaidRecordsCount,
        records: recordsWithDebts.filter((record: any) => record.recordDebt > 0)
      };
    }).filter((patient: any) => patient !== null);

    console.log(`Found ${debtReport.length} patients with debts`);

    // Sort by total debt (highest first)
    debtReport.sort((a: any, b: any) => b.totalDebt - a.totalDebt);

    const result = {
      totalPatientsWithDebts: debtReport.length,
      totalDebtAmount: debtReport.reduce((sum: any, patient: any) => sum + patient.totalDebt, 0),
      patients: debtReport
    };

    console.log("Debt report result:", result);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching debt report:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
