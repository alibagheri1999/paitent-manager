import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const skip = (page - 1) * limit;

    // First, verify the patient exists
    const patient = await prisma.patient.findUnique({
      where: { id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
      },
    });

    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    const whereClause: any = {
      patientId: id,
    };
    
    if (search) {
      console.log('Searching patient records with:', search);
      const searchLower = search.toLowerCase();
      const searchTerms = search.trim().split(/\s+/); // Split by whitespace
      
      // Create search conditions
      const searchConditions = [
        { description: { contains: search, mode: "insensitive" } },
        { notes: { contains: search, mode: "insensitive" } },
      ];

      // Handle treatment type search - check if it matches any enum value
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
        } as any);
      }

      whereClause.OR = searchConditions;
      console.log('Where clause:', JSON.stringify(whereClause, null, 2));
    }

    const [records, totalCount] = await Promise.all([
      prisma.record.findMany({
        where: whereClause,
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
      patient,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching patient records:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
