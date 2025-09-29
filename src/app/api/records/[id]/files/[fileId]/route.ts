import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deleteFile } from "@/lib/minio";

// Delete a file from a record
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; fileId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: recordId, fileId } = await params;

    // Verify the record exists
    const record = await prisma.record.findUnique({
      where: {
        id: recordId,
      },
    });

    if (!record) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 });
    }

    // Get the file record
    const recordFile = await (prisma as any).recordFile.findFirst({
      where: {
        id: fileId,
        recordId,
      },
    });

    if (!recordFile) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Delete from MinIO
    await deleteFile(recordFile.fileUrl);

    // Delete from database
    await (prisma as any).recordFile.delete({
      where: { id: fileId },
    });

    return NextResponse.json({ message: "File deleted successfully" });
  } catch (error) {
    console.error("Error deleting file:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
