import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-store";
import { listExamGroups, upsertExamGroup, deleteExamGroup } from "@/lib/exam-group-store";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "admin" && user.role !== "editor")) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") as "group" | "individual" | null;
    const examSlug = searchParams.get("examSlug") || undefined;

    const groups = await listExamGroups({
      type: type || undefined,
      examSlug,
      activeOnly: false,
    });

    return NextResponse.json({ success: true, groups });
  } catch (error: any) {
    console.error("Admin exam groups GET error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ success: false, error: "Admin access required" }, { status: 403 });
    }

    const body = await request.json();
    if (!body.title || !body.examSlug || !body.type) {
      return NextResponse.json(
        { success: false, error: "Group title, exam category, and group type are required" },
        { status: 400 }
      );
    }

    const saved = await upsertExamGroup({
      id: body.id,
      slug: body.slug,
      title: body.title.trim(),
      type: body.type,
      examSlug: body.examSlug.trim(),
      examName: body.examName?.trim() || body.examSlug,
      targetSubject: body.targetSubject?.trim(),
      clubbedSubjects: Array.isArray(body.clubbedSubjects) ? body.clubbedSubjects : [],
      includedTestSlugs: Array.isArray(body.includedTestSlugs) ? body.includedTestSlugs : [],
      price: Number(body.price) || 299,
      validityDays: Number(body.validityDays) || 90,
      description: body.description?.trim() || "",
      badge: body.badge?.trim() || undefined,
      active: body.active !== false,
      sortOrder: Number(body.sortOrder) || 0,
    });

    return NextResponse.json({ success: true, group: saved });
  } catch (error: any) {
    console.error("Admin exam groups POST error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ success: false, error: "Admin access required" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Group ID is required" }, { status: 400 });
    }

    const success = await deleteExamGroup(id);
    return NextResponse.json({ success });
  } catch (error: any) {
    console.error("Admin exam groups DELETE error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
