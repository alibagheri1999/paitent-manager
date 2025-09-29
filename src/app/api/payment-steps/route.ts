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
    const recordId = searchParams.get("recordId");

    if (!recordId) {
      return NextResponse.json({ error: "Record ID is required" }, { status: 400 });
    }

    const paymentSteps = await prisma.paymentStep.findMany({
      where: { recordId },
      orderBy: { stepNumber: 'asc' },
    });

    return NextResponse.json(paymentSteps);
  } catch (error) {
    console.error("Error fetching payment steps:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { recordId, steps } = body;

    if (!recordId || !steps || !Array.isArray(steps)) {
      return NextResponse.json(
        { error: "Record ID and payment steps are required" },
        { status: 400 }
      );
    }

    // Verify the record exists
    const record = await prisma.record.findUnique({
      where: { id: recordId },
    });
    
    if (!record) {
      return NextResponse.json(
        { error: "Record not found" },
        { status: 404 }
      );
    }

    // Delete existing payment steps
    await prisma.paymentStep.deleteMany({
      where: { recordId },
    });

    // Create new payment steps
    const paymentSteps = await Promise.all(
      steps.map((step: any, index: number) =>
        prisma.paymentStep.create({
          data: {
            recordId,
            stepNumber: index + 1,
            amount: parseFloat(step.amount),
            dueDate: step.dueDate ? new Date(step.dueDate) : null,
            notes: step.notes || null,
            userId: session.user.id,
          },
        })
      )
    );

    // Update record payment status
    await updateRecordPaymentStatus(recordId);

    return NextResponse.json(paymentSteps);
  } catch (error) {
    console.error("Error creating payment steps:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { stepId, isPaid, paymentMethod, notes } = body;

    if (!stepId) {
      return NextResponse.json(
        { error: "Step ID is required" },
        { status: 400 }
      );
    }

    const paymentStep = await prisma.paymentStep.findUnique({
      where: { id: stepId },
    });

    if (!paymentStep) {
      return NextResponse.json(
        { error: "Payment step not found" },
        { status: 404 }
      );
    }

    const updatedStep = await prisma.paymentStep.update({
      where: { id: stepId },
      data: {
        isPaid: isPaid || false,
        paidDate: isPaid ? new Date() : null,
        paymentMethod: paymentMethod || null,
        notes: notes || null,
      },
    });

    // Update record payment status
    await updateRecordPaymentStatus(paymentStep.recordId);

    return NextResponse.json(updatedStep);
  } catch (error) {
    console.error("Error updating payment step:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

async function updateRecordPaymentStatus(recordId: string) {
  const record = await prisma.record.findUnique({
    where: { id: recordId },
    include: {
      paymentSteps: true,
    },
  });

  if (!record) return;

  const totalSteps = record.paymentSteps.length;
  const paidSteps = record.paymentSteps.filter((step: any) => step.isPaid).length;

  let paymentStatus = "UNPAID";
  if (paidSteps === totalSteps && totalSteps > 0) {
    paymentStatus = "PAID";
  } else if (paidSteps > 0) {
    paymentStatus = "PARTIAL";
  }

  await prisma.record.update({
    where: { id: recordId },
    data: {
      paymentStatus: paymentStatus as any,
    },
  });
}
