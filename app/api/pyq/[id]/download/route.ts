import { NextRequest, NextResponse } from "next/server";
import { incrementPYQDownload, getPYQById } from "@/lib/pyq-store";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const pyq = await getPYQById(id);
    if (!pyq) {
      return NextResponse.json({ success: false, error: "PYQ not found" }, { status: 404 });
    }

    await incrementPYQDownload(id);
    return NextResponse.json({
      success: true,
      fileUrl: pyq.fileUrl,
      downloadCount: pyq.downloadCount + 1,
    });
  } catch (error: any) {
    console.error("Error downloading PYQ:", error);
    return NextResponse.json({ success: false, error: "Download failed" }, { status: 500 });
  }
}
