import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-store";
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadsDir = path.join(process.cwd(), "public", "uploads", "pyq");
    await mkdir(uploadsDir, { recursive: true });

    const cleanFileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    const filePath = path.join(uploadsDir, cleanFileName);

    await writeFile(filePath, buffer);

    const fileUrl = `/uploads/pyq/${cleanFileName}`;
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(1) + " MB";

    return NextResponse.json({
      success: true,
      fileUrl,
      fileName: file.name,
      fileSize: sizeInMB,
    });
  } catch (error: any) {
    console.error("Error uploading PYQ file:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
