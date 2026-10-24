import { NextRequest, NextResponse } from "next/server";
import { incrementBlogViews } from "@/lib/blog-store";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await incrementBlogViews(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to increment view" },
      { status: 500 }
    );
  }
}
