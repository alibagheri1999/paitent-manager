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
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const skip = (page - 1) * limit;

    const whereClause: any = {
      isActive: true,
    };
    
    if (search) {
      console.log('Searching patients with:', search);
      const searchTerms = search.trim().split(/\s+/); // Split by whitespace
      
      const searchConditions = [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search } },
        { nationalId: { contains: search } },
      ];

      // If search has multiple words, try to match first + last name combinations
      if (searchTerms.length >= 2) {
        // Try different combinations of first and last name
        for (let i = 0; i < searchTerms.length; i++) {
          for (let j = i + 1; j < searchTerms.length; j++) {
            const firstName = searchTerms[i];
            const lastName = searchTerms[j];
            
            searchConditions.push(
              {
                AND: [
                  { firstName: { contains: firstName, mode: "insensitive" } },
                  { lastName: { contains: lastName, mode: "insensitive" } }
                ]
              },
              {
                AND: [
                  { firstName: { contains: lastName, mode: "insensitive" } },
                  { lastName: { contains: firstName, mode: "insensitive" } }
                ]
              }
            );
          }
        }
      }

      whereClause.OR = searchConditions;
      console.log('Where clause:', JSON.stringify(whereClause, null, 2));
    }

    const [patients, totalCount] = await Promise.all([
      prisma.patient.findMany({
        where: whereClause,
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.patient.count({ where: whereClause }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      patients,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching patients:", error);
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

    // Check if patient with same national ID already exists
    if (nationalId) {
      const existingPatient = await prisma.patient.findUnique({
        where: { nationalId },
      });

      if (existingPatient) {
        return NextResponse.json(
          { error: "Patient with this national ID already exists" },
          { status: 400 }
        );
      }
    }

    const patient = await prisma.patient.create({
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
        userId: session.user.id,
      },
    });

    return NextResponse.json(patient);
  } catch (error) {
    console.error("Error creating patient:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
