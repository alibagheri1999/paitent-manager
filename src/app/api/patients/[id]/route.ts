import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const patient = await prisma.patient.findUnique({
      where: { id: params.id },
      include: {
        records: {
          orderBy: { date: "desc" },
        },
        appointments: {
          orderBy: { date: "desc" },
        },
      },
    });

    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    return NextResponse.json(patient);
  } catch (error) {
    console.error("Error fetching patient:", error);
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
    const {
      firstName,
      lastName,
      email,
      phone,
      nationalId,
      dateOfBirth,
      address,
      emergencyContact,
      emergencyPhone,
      medicalHistory,
      allergies,
      notes,
    } = body;

    // Check if patient with same national ID already exists (excluding current patient)
    if (nationalId) {
      const existingPatient = await prisma.patient.findFirst({
        where: {
          nationalId,
          id: { not: params.id },
        },
      });

      if (existingPatient) {
        return NextResponse.json(
          { error: "Patient with this national ID already exists" },
          { status: 400 }
        );
      }
    }

    const patient = await prisma.patient.update({
      where: { id: params.id },
      data: {
        firstName,
        lastName,
        email: email || null,
        phone: phone || null,
        nationalId: nationalId || null,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        address: address || null,
        emergencyContact: emergencyContact || null,
        emergencyPhone: emergencyPhone || null,
        medicalHistory: medicalHistory || null,
        allergies: allergies || null,
        notes: notes || null,
      },
    });

    return NextResponse.json(patient);
  } catch (error) {
    console.error("Error updating patient:", error);
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

    // Soft delete - set isActive to false
    const patient = await prisma.patient.update({
      where: { id: params.id },
      data: { isActive: false },
    });

    return NextResponse.json(patient);
  } catch (error) {
    console.error("Error deleting patient:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
