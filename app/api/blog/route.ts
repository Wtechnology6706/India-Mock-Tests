import { NextRequest, NextResponse } from "next/server";
import { getPublishedBlogs } from "@/lib/blog-store";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") || undefined;
    const query = searchParams.get("query") || undefined;

    const blogs = await getPublishedBlogs({ category, query });
    return NextResponse.json({ success: true, blogs });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load blogs" },
      { status: 500 }
    );
  }
}
