import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { smsService } from "@/lib/sms";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { message } = await request.json();

    if (!message || message.trim().length === 0) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Find the patient
    const patient = await prisma.patient.findUnique({
      where: { id },
    });

    if (!patient) {
      return NextResponse.json(
        { error: "Patient not found" },
        { status: 404 }
      );
    }

    if (!patient.phone) {
      return NextResponse.json(
        { error: "Patient phone number not available" },
        { status: 400 }
      );
    }

    // Send SMS message
    const fullMessage = `پیام از ${session.user?.name || 'کلینیک دندانپزشکی'}: ${message.trim()}`;
    
    try {
      await smsService.sendSMS({
        to: patient.phone,
        message: fullMessage
      });
      
      return NextResponse.json({
        success: true,
        message: "Message sent successfully",
      });
    } catch (smsError) {
      console.error("Failed to send SMS:", smsError);
      return NextResponse.json(
        { error: "Failed to send message. Please try again." },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
