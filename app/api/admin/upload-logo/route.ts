import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "../../../../lib/admin-auth";
import fs from "fs";
import path from "path";

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "image/avif",
]);

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export async function POST(request: NextRequest) {
  const access = await requireAdmin(request);
  if ("response" in access) return access.response;

  try {
    const formData = await request.formData();
    const file = (formData.get("file") || formData.get("logo")) as File | null;

    if (!file || typeof file === "string") {
      return NextResponse.json(
        { error: "No image file provided for upload." },
        { status: 400 }
      );
    }

    if (!ALLOWED_MIME_TYPES.has(file.type.toLowerCase())) {
      return NextResponse.json(
        { error: `Invalid image type (${file.type}). Allowed formats: PNG, JPG, WEBP, SVG, GIF, AVIF.` },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File size exceeds 10MB limit. Current size: ${(file.size / (1024 * 1024)).toFixed(2)} MB` },
        { status: 400 }
      );
    }

    // Determine safe file extension
    let ext = "png";
    if (file.name && file.name.includes(".")) {
      const parts = file.name.split(".");
      ext = parts[parts.length - 1].toLowerCase().replace(/[^a-z0-9]/g, "");
      if (!ext) ext = "png";
    } else if (file.type.includes("jpeg") || file.type.includes("jpg")) {
      ext = "jpg";
    } else if (file.type.includes("webp")) {
      ext = "webp";
    } else if (file.type.includes("svg")) {
      ext = "svg";
    } else if (file.type.includes("gif")) {
      ext = "gif";
    }

    const filename = `portal-logo-${Date.now()}.${ext}`;

    // Target upload directory: public/uploads/logo
    const uploadDir = path.join(process.cwd(), "public", "uploads", "logo");
    await fs.promises.mkdir(uploadDir, { recursive: true });

    const targetFilePath = path.join(uploadDir, filename);
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    await fs.promises.writeFile(targetFilePath, buffer);

    const publicUrl = `/uploads/logo/${filename}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename,
      size: file.size,
      mimeType: file.type,
    });
  } catch (error) {
    console.error("Logo upload error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to upload logo image." },
      { status: 500 }
    );
  }
}
