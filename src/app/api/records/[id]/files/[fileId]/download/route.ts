import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { minioClient, BUCKET_NAME } from "@/lib/minio";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; fileId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, fileId } = await params;

    // Get the file record
    const fileRecord = await (prisma as any).recordFile.findUnique({
      where: { id: fileId },
      include: {
        record: {
          include: {
            patient: true,
          },
        },
      },
    });

    if (!fileRecord) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Verify the file belongs to the specified record
    if (fileRecord.recordId !== id) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Determine the correct object key
    // For old files, fileName might just be the filename without the 'records/' prefix
    // For new files, fileName should be the full path like 'records/1759133099152-filename.png'
    let objectKey = fileRecord.fileName;
    
    // If the fileName doesn't start with 'records/', it's an old format
    if (!objectKey.startsWith('records/')) {
      // Try to find the file in the records/ directory
      objectKey = `records/${objectKey}`;
    }

    console.log("Attempting to download file with key:", objectKey);

    // Get the file from MinIO
    const fileStream = await minioClient.getObject(BUCKET_NAME, objectKey);

    // Convert stream to buffer
    const chunks: Buffer[] = [];
    for await (const chunk of fileStream) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    // Return the file with appropriate headers
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': fileRecord.mimeType,
        'Content-Disposition': `attachment; filename="${fileRecord.originalName}"`,
        'Content-Length': buffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("Error downloading file:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
