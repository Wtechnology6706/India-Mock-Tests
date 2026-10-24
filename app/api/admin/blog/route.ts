import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-store";
import { getAllBlogs, createBlog } from "@/lib/blog-store";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }

    const blogs = await getAllBlogs();
    return NextResponse.json({ success: true, blogs });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load blogs" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    if (!body.title || !body.excerpt || !body.content) {
      return NextResponse.json(
        { success: false, error: "Title, excerpt, and content are required fields." },
        { status: 400 }
      );
    }

    const newBlog = await createBlog({
      title: body.title,
      slug: body.slug,
      subtitle: body.subtitle,
      excerpt: body.excerpt,
      content: body.content,
      category: body.category,
      tags: body.tags,
      focusKeyword: body.focusKeyword,
      featuredImage: body.featuredImage,
      videoUrl: body.videoUrl,
      authorName: body.authorName || user.displayName || "Admin",
      authorRole: body.authorRole,
      authorAvatar: body.authorAvatar,
      isFeatured: body.isFeatured,
      status: body.status,
      publishedAt: body.publishedAt,
    });

    return NextResponse.json({ success: true, blog: newBlog });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create blog post" },
      { status: 500 }
    );
  }
}
