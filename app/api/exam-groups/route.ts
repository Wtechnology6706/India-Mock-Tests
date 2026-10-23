import { NextResponse } from "next/server";
import { listExamGroups } from "@/lib/exam-group-store";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") as "group" | "individual" | null;
    const examSlug = searchParams.get("examSlug") || undefined;

    const groups = await listExamGroups({
      type: type || undefined,
      examSlug,
      activeOnly: true,
    });

    return NextResponse.json({
      success: true,
      groups,
      count: groups.length,
    });
  } catch (error: any) {
    console.error("Error fetching exam groups:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load exam groups" },
      { status: 500 }
    );
  }
}
