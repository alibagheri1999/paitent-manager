import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { smsService } from "@/lib/sms";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id: params.id },
      include: {
        patient: true,
      },
    });

    if (!appointment) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }

    return NextResponse.json(appointment);
  } catch (error) {
    console.error("Error fetching appointment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { patientId, date, startTime, endTime, treatmentType, description, notes, status } = body;

    const appointment = await prisma.appointment.findUnique({
      where: { id: params.id },
      include: { patient: true },
    });

    if (!appointment) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }

    // Check if appointment is being cancelled
    const isBeingCancelled = status === "CANCELLED" && appointment.status !== "CANCELLED";
    
    const updatedAppointment = await prisma.appointment.update({
      where: { id: params.id },
      data: {
        patientId,
        date: new Date(date),
        startTime,
        endTime,
        treatmentType,
        description,
        notes,
        status,
        userId: session.user.id,
      },
      include: {
        patient: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Send SMS notification if appointment is cancelled
    if (isBeingCancelled && appointment.patient) {
      const appointmentDate = new Date(appointment.date).toLocaleDateString();
      const reason = body.cancellationReason || "No specific reason provided";
      
      try {
        await smsService.sendAppointmentCancellation(
          appointment.patient.phone,
          `${appointment.patient.firstName} ${appointment.patient.lastName}`,
          appointmentDate,
          appointment.startTime,
          reason
        );
        console.log(`📱 SMS notification sent for cancelled appointment: ${params.id}`);
      } catch (smsError) {
        console.error("Failed to send cancellation SMS:", smsError);
        // Don't fail the request if SMS fails
      }
    }

    return NextResponse.json(updatedAppointment);
  } catch (error) {
    console.error("Error updating appointment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id: params.id },
      include: { patient: true },
    });

    if (!appointment) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }

    // Send SMS notification before deleting
    if (appointment.patient) {
      const appointmentDate = new Date(appointment.date).toLocaleDateString();
      
      try {
        await smsService.sendAppointmentCancellation(
          appointment.patient.phone,
          `${appointment.patient.firstName} ${appointment.patient.lastName}`,
          appointmentDate,
          appointment.startTime,
          "Appointment cancelled by clinic"
        );
        console.log(`📱 SMS notification sent for deleted appointment: ${params.id}`);
      } catch (smsError) {
        console.error("Failed to send deletion SMS:", smsError);
        // Continue with deletion even if SMS fails
      }
    }

    await prisma.appointment.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Appointment deleted successfully" });
  } catch (error) {
    console.error("Error deleting appointment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
