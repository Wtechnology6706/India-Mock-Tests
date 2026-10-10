import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "../../../../lib/admin-auth";
import { db } from "../../../../lib/db";
import { featuredExams } from "../../../../lib/catalog";
import type { RowDataPacket, ResultSetHeader } from "mysql2";

type ExamRow = RowDataPacket & {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  status: string;
  badge: string | null;
  visual_tone: string;
  visual_symbol: string;
  image_url: string | null;
};

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if ("response" in auth) return auth.response;

  try {
    const [rows] = await db.query<ExamRow[]>(
      `SELECT id, name, slug, description, status, badge, visual_tone, visual_symbol, image_url
       FROM exams ORDER BY id ASC`
    );
    if (rows.length > 0) {
      return NextResponse.json({
        exams: rows.map((r) => ({
          id: String(r.id),
          slug: r.slug,
          title: r.name,
          description: r.description ?? "",
          status: r.status,
          badge: r.badge ?? "",
          tone: r.visual_tone,
          symbol: r.visual_symbol,
          imageUrl: r.image_url ?? undefined,
        })),
      });
    }
  } catch {
    // fallback
  }

  return NextResponse.json({ exams: featuredExams });
}

export async function PATCH(request: NextRequest) {
  const auth = await requireAdmin(request);
  if ("response" in auth) return auth.response;

  try {
    const body = await request.json();
    const slug = String(body.slug ?? "");
    const imageUrl = body.imageUrl !== undefined ? String(body.imageUrl).trim() : null;
    const badge = body.badge !== undefined ? String(body.badge).trim() : null;

    if (!slug) {
      return NextResponse.json({ error: "Exam slug is required." }, { status: 400 });
    }

    // 1. Update in-memory fallback
    const match = featuredExams.find(
      (e) => e.slug === slug || e.title.toLowerCase() === slug.toLowerCase()
    );
    if (match) {
      match.imageUrl = imageUrl || undefined;
      if (badge) match.badge = badge;
    }

    // 2. Update Database with auto-column ensure
    try {
      try {
        await db.execute<ResultSetHeader>(
          `UPDATE exams SET image_url = ?, badge = COALESCE(?, badge) WHERE slug = ? OR name LIKE ?`,
          [imageUrl || null, badge || null, slug, `%${slug}%`]
        );
      } catch (err: any) {
        // If image_url column is missing, add it and retry
        if (err.message && err.message.includes("image_url")) {
          await db.query(`ALTER TABLE exams ADD COLUMN image_url VARCHAR(500) NULL AFTER visual_symbol`);
          await db.execute<ResultSetHeader>(
            `UPDATE exams SET image_url = ?, badge = COALESCE(?, badge) WHERE slug = ? OR name LIKE ?`,
            [imageUrl || null, badge || null, slug, `%${slug}%`]
          );
        }
      }
    } catch (dbErr) {
      console.warn("Notice updating exams in DB:", dbErr);
    }

    return NextResponse.json({ success: true, slug, imageUrl, badge });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update exam image." },
      { status: 500 }
    );
  }
}
