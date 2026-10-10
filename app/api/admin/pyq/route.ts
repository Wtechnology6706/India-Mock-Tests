import { NextRequest, NextResponse } from "next/server";
import { getAllPYQs, createPYQ } from "@/lib/pyq-store";
import { getCurrentUser } from "@/lib/auth-store";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }

    const pyqs = await getAllPYQs();
    return NextResponse.json({ success: true, pyqs });
  } catch (error: any) {
    console.error("Error fetching admin PYQs:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    if (!body.title || !body.examSlug || !body.fileUrl) {
      return NextResponse.json(
        { success: false, error: "Title, Exam, and File URL are required." },
        { status: 400 }
      );
    }

    const pyq = await createPYQ(body);
    return NextResponse.json({ success: true, pyq });
  } catch (error: any) {
    console.error("Error creating PYQ:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
