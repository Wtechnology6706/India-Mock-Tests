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
    const file = formData.get("file") as File | null;
    const testName = (formData.get("testName") as string | null) || "mock-test";

    if (!file || typeof file === "string") {
      return NextResponse.json(
        { error: "No image file provided for upload." },
        { status: 400 }
      );
    }

    if (!ALLOWED_MIME_TYPES.has(file.type.toLowerCase())) {
      return NextResponse.json(
        { error: `Invalid image type (${file.type}). Allowed formats: JPEG, PNG, WEBP, GIF, SVG, AVIF.` },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File size exceeds the 10MB limit. Current size: ${(file.size / (1024 * 1024)).toFixed(2)} MB` },
        { status: 400 }
      );
    }

    // Sanitize test name for clean filename
    const cleanTestSlug = testName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "mock-test";

    // Determine extension
    let ext = "jpg";
    if (file.name && file.name.includes(".")) {
      const parts = file.name.split(".");
      ext = parts[parts.length - 1].toLowerCase();
    } else if (file.type.includes("png")) {
      ext = "png";
    } else if (file.type.includes("webp")) {
      ext = "webp";
    } else if (file.type.includes("gif")) {
      ext = "gif";
    } else if (file.type.includes("svg")) {
      ext = "svg";
    }

    const filename = `${cleanTestSlug}-${Date.now()}.${ext}`;

    // Target upload directory: public/uploads/banners
    const uploadDir = path.join(process.cwd(), "public", "uploads", "banners");
    await fs.promises.mkdir(uploadDir, { recursive: true });

    const targetFilePath = path.join(uploadDir, filename);
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    await fs.promises.writeFile(targetFilePath, buffer);

    const publicUrl = `/uploads/banners/${filename}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename,
      size: file.size,
      mimeType: file.type,
    });
  } catch (error) {
    console.error("Banner upload error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to upload banner image." },
      { status: 500 }
    );
  }
}
