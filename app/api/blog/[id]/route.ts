import { NextRequest, NextResponse } from "next/server";
import { getBlogBySlug, getBlogById, incrementBlogViews } from "@/lib/blog-store";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const blog = (await getBlogBySlug(id)) || (await getBlogById(id));

    if (!blog || blog.status !== "Published") {
      return NextResponse.json({ success: false, error: "Blog not found" }, { status: 404 });
    }

    // Increment views asynchronously
    incrementBlogViews(blog.id).catch(() => {});

    return NextResponse.json({ success: true, blog });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load blog post" },
      { status: 500 }
    );
  }
}
