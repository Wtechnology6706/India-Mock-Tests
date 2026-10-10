import { NextRequest, NextResponse } from "next/server";
import { getPublishedPYQs } from "@/lib/pyq-store";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const exam = searchParams.get("exam") || undefined;
    const year = searchParams.get("year") ? Number(searchParams.get("year")) : undefined;
    const search = searchParams.get("search") || undefined;

    const pyqs = await getPublishedPYQs({ examSlug: exam, year, search });
    return NextResponse.json({ success: true, pyqs });
  } catch (error: any) {
    console.error("Error fetching PYQs:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch Previous Year Question papers." },
      { status: 500 }
    );
  }
}
