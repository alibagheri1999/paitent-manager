import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { smsService } from "@/lib/sms";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const appointment = await prisma.appointment.findUnique({
      where: { id },
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { patientId, date, startTime, endTime, treatmentType, description, notes, status, start, end } = body;

    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: { patient: true },
    });

    if (!appointment) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }

    // Handle different date formats - support both 'date' field and 'start/end' ISO strings
    let appointmentDate: Date;
    let finalStartTime: string;
    let finalEndTime: string;

    // Only update date/time if explicitly provided, otherwise keep existing values
    if (start && end) {
      // Handle ISO date format from calendar (e.g., "2025-09-26T07:00:00.000Z")
      appointmentDate = new Date(start);
      finalStartTime = new Date(start).toISOString().split('T')[1].substring(0, 5);
      finalEndTime = new Date(end).toISOString().split('T')[1].substring(0, 5);
    } else if (date) {
      // Handle separate date and time fields
      appointmentDate = new Date(date);
      finalStartTime = startTime || appointment.startTime;
      finalEndTime = endTime || appointment.endTime;
    } else {
      // Keep existing appointment data (for status-only updates)
      appointmentDate = appointment.date;
      finalStartTime = appointment.startTime;
      finalEndTime = appointment.endTime;
    }

    // Validate date input
    if (isNaN(appointmentDate.getTime())) {
      return NextResponse.json({ error: "Invalid date format" }, { status: 400 });
    }

    // Check if appointment is being cancelled
    const isBeingCancelled = status === "CANCELLED" && appointment.status !== "CANCELLED";
    
    // Check if appointment is being rescheduled
    const isBeingRescheduled = (
      appointment.date.toISOString().split('T')[0] !== appointmentDate.toISOString().split('T')[0] ||
      appointment.startTime !== finalStartTime
    ) && appointment.status !== "CANCELLED";
    
    // Build update data object with only provided fields
    const updateData: any = {
      status,
    };

    // Only include fields that are explicitly provided
    if (patientId !== undefined) updateData.patientId = patientId;
    if (date !== undefined) updateData.date = appointmentDate;
    if (startTime !== undefined) updateData.startTime = finalStartTime;
    if (endTime !== undefined) updateData.endTime = finalEndTime;
    if (treatmentType !== undefined) updateData.treatmentType = treatmentType;
    if (description !== undefined) updateData.description = description;
    if (notes !== undefined) updateData.notes = notes;

    const updatedAppointment = await (prisma as any).appointment.update({
      where: { id },
      data: updateData,
      include: {
        patient: {
          select: {
            firstName: true,
            lastName: true,
            phone: true,
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
          appointment.patient.phone || "",
          `${appointment.patient.firstName} ${appointment.patient.lastName}`,
          appointmentDate,
          appointment.startTime,
          reason
        );
        console.log(`📱 SMS notification sent for cancelled appointment: ${id}`);
      } catch (smsError) {
        console.error("Failed to send cancellation SMS:", smsError);
        // Don't fail the request if SMS fails
      }
    }

    // Send SMS notification if appointment is rescheduled
    if (isBeingRescheduled && appointment.patient) {
      const oldDate = new Date(appointment.date).toLocaleDateString();
      const newDate = appointmentDate.toLocaleDateString();
      const reason = body.rescheduleReason || "No specific reason provided";
      
      try {
        await smsService.sendAppointmentReschedule(
          appointment.patient.phone || "",
          `${appointment.patient.firstName} ${appointment.patient.lastName}`,
          oldDate,
          appointment.startTime,
          newDate,
          startTime,
          reason
        );
        console.log(`📱 SMS notification sent for rescheduled appointment: ${id}`);
      } catch (smsError) {
        console.error("Failed to send reschedule SMS:", smsError);
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const appointment = await prisma.appointment.findUnique({
      where: { id },
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
          appointment.patient.phone || "",
          `${appointment.patient.firstName} ${appointment.patient.lastName}`,
          appointmentDate,
          appointment.startTime,
          "Appointment cancelled by clinic"
        );
        console.log(`📱 SMS notification sent for deleted appointment: ${id}`);
      } catch (smsError) {
        console.error("Failed to send deletion SMS:", smsError);
        // Continue with deletion even if SMS fails
      }
    }

    await prisma.appointment.delete({
      where: { id },
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
