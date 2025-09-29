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

    const whereClause: any = {};
    
    if (search) {
      console.log('Searching records with:', search);
      const searchLower = search.toLowerCase();
      const searchTerms = search.trim().split(/\s+/);
      
      // Create search conditions - NO treatmentType contains!
      const searchConditions: any[] = [
        { description: { contains: search, mode: "insensitive" } },
        { notes: { contains: search, mode: "insensitive" } },
      ];

      // Handle patient name search
      const patientSearchConditions: any[] = [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } }
      ];

      // Full name combinations
      if (searchTerms.length >= 2) {
        for (let i = 0; i < searchTerms.length; i++) {
          for (let j = i + 1; j < searchTerms.length; j++) {
            const firstName = searchTerms[i];
            const lastName = searchTerms[j];
            
            patientSearchConditions.push(
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

      searchConditions.push({
        patient: {
          OR: patientSearchConditions
        }
      });

      // Handle treatment type search using 'in' operator
      const treatmentTypeValues = [
        'CONSULTATION', 'CLEANING', 'FILLING', 'EXTRACTION', 'CROWN', 
        'BRIDGE', 'IMPLANT', 'ROOT_CANAL', 'ORTHODONTICS', 'COSMETIC', 'OTHER'
      ];
      
      const matchingTreatmentTypes = treatmentTypeValues.filter(type => 
        type.toLowerCase().includes(searchLower) || 
        type.toLowerCase().replace('_', ' ').includes(searchLower)
      );

      if (matchingTreatmentTypes.length > 0) {
        searchConditions.push({
          treatmentType: { in: matchingTreatmentTypes }
        });
      }

      whereClause.OR = searchConditions;
      console.log('Where clause:', JSON.stringify(whereClause, null, 2));
    }

    const [records, totalCount] = await Promise.all([
      prisma.record.findMany({
        where: whereClause,
        include: {
          patient: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
          files: {
            select: {
              id: true,
              originalName: true,
              fileSize: true,
              mimeType: true,
              uploadedAt: true,
            },
          } as any,
        },
        orderBy: {
          date: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.record.count({ where: whereClause }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      records,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching records:", error);
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
      patientId,
      treatmentType,
      description,
      cost,
      date,
      notes,
      isCompleted,
    } = body;

    // Verify the user exists
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Verify the patient exists
    const patient = await prisma.patient.findUnique({
      where: { id: patientId }
    });

    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    const record = await (prisma as any).record.create({
      data: {
        patientId,
        treatmentType,
        description,
        cost: parseFloat(cost),
        date: new Date(date),
        notes: notes || null,
        isCompleted: isCompleted || false,
        userId: session.user.id,
      },
      include: {
        patient: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        files: {
          select: {
            id: true,
            originalName: true,
            fileSize: true,
            mimeType: true,
            uploadedAt: true,
          },
        } as any,
      },
    });

    return NextResponse.json(record);
  } catch (error) {
    console.error("Error creating record:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}