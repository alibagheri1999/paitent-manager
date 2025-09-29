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
    const appointmentId = searchParams.get("appointmentId");
    const recordId = searchParams.get("recordId");

    const whereClause: any = {};
    
    if (appointmentId) {
      whereClause.appointmentId = appointmentId;
    }
    
    if (recordId) {
      whereClause.recordId = recordId;
    }

    const payments = await prisma.payment.findMany({
      where: whereClause,
      include: {
        appointment: {
          select: {
            id: true,
            date: true,
            startTime: true,
            treatmentType: true,
          },
        },
        record: {
          select: {
            id: true,
            date: true,
            treatmentType: true,
            description: true,
          },
        },
      },
      orderBy: {
        paymentDate: 'desc',
      },
    });

    return NextResponse.json(payments);
  } catch (error) {
    console.error("Error fetching payments:", error);
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
    const {
      appointmentId,
      recordId,
      amount,
      paymentMethod,
      notes,
    } = body;

    // Validate that either appointmentId or recordId is provided, but not both
    if (!appointmentId && !recordId) {
      return NextResponse.json(
        { error: "Either appointmentId or recordId is required" },
        { status: 400 }
      );
    }

    if (appointmentId && recordId) {
      return NextResponse.json(
        { error: "Cannot specify both appointmentId and recordId" },
        { status: 400 }
      );
    }

    // Verify the appointment or record exists
    if (appointmentId) {
      const appointment = await prisma.appointment.findUnique({
        where: { id: appointmentId },
      });
      
      if (!appointment) {
        return NextResponse.json(
          { error: "Appointment not found" },
          { status: 404 }
        );
      }
    }

    if (recordId) {
      const record = await prisma.record.findUnique({
        where: { id: recordId },
      });
      
      if (!record) {
        return NextResponse.json(
          { error: "Record not found" },
          { status: 404 }
        );
      }
    }

    const payment = await prisma.payment.create({
      data: {
        appointmentId: appointmentId || null,
        recordId: recordId || null,
        amount: parseFloat(amount),
        paymentMethod: paymentMethod || null,
        notes: notes || null,
        userId: session.user.id,
      },
      include: {
        appointment: {
          select: {
            id: true,
            date: true,
            startTime: true,
            treatmentType: true,
          },
        },
        record: {
          select: {
            id: true,
            date: true,
            treatmentType: true,
            description: true,
          },
        },
      },
    });

    // Update payment status for appointment or record
    if (appointmentId) {
      await updateAppointmentPaymentStatus(appointmentId);
    }
    
    if (recordId) {
      await updateRecordPaymentStatus(recordId);
    }

    return NextResponse.json(payment);
  } catch (error) {
    console.error("Error creating payment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

async function updateAppointmentPaymentStatus(appointmentId: string) {
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: {
      payments: true,
    },
  });

  if (!appointment) return;

  const totalPaid = appointment.payments.reduce((sum, payment) => sum + payment.amount, 0);
  const totalCost = appointment.cost || 0;

  let paymentStatus = "UNPAID";
  if (totalPaid >= totalCost) {
    paymentStatus = "PAID";
  } else if (totalPaid > 0) {
    paymentStatus = "PARTIAL";
  }

  await prisma.appointment.update({
    where: { id: appointmentId },
    data: {
      paidAmount: totalPaid,
      paymentStatus: paymentStatus as any,
    },
  });
}

async function updateRecordPaymentStatus(recordId: string) {
  const record = await prisma.record.findUnique({
    where: { id: recordId },
    include: {
      payments: true,
    },
  });

  if (!record) return;

  const totalPaid = record.payments.reduce((sum, payment) => sum + payment.amount, 0);
  const totalCost = record.cost;

  let paymentStatus = "UNPAID";
  if (totalPaid >= totalCost) {
    paymentStatus = "PAID";
  } else if (totalPaid > 0) {
    paymentStatus = "PARTIAL";
  }

  await prisma.record.update({
    where: { id: recordId },
    data: {
      paidAmount: totalPaid,
      paymentStatus: paymentStatus as any,
    },
  });
}
