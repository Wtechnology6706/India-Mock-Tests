import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-store";
import { createQuestionsBulk, addQuestionsToMockTest } from "@/lib/admin-content";
import type { QuestionInput } from "@/lib/admin-content";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "admin" && user.role !== "editor")) {
      return NextResponse.json({ success: false, error: "Unauthorized. Staff access required." }, { status: 403 });
    }

    const body = await req.json();
    const { questions, targetTestSlug } = body;

    if (!Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json({ success: false, error: "No questions provided to import." }, { status: 400 });
    }

    const inputs: QuestionInput[] = questions.map((q: any) => ({
      exam: q.exam || "BPSC TRE 4.0",
      subject: q.subject || "General Studies",
      topic: q.topic || "Core Syllabus",
      stem: q.stem,
      options: q.options,
      explanation: q.explanation || "Official answer rationale.",
      difficulty: q.difficulty || "medium",
      status: "Published",
    }));

    const result = await createQuestionsBulk(inputs);

    // If target test slug is provided, link imported questions to that test
    let linkedCount = 0;
    if (targetTestSlug && result.imported.length > 0) {
      const qIds = result.imported.map((q) => q.id);
      try {
        linkedCount = await addQuestionsToMockTest(targetTestSlug, qIds);
      } catch (linkErr) {
        console.warn("Failed linking imported questions to test:", linkErr);
      }
    }

    return NextResponse.json({
      success: true,
      importedCount: result.importedCount,
      rejectedCount: result.rejectedCount,
      linkedCount,
      importedQuestions: result.imported,
    });
  } catch (error: any) {
    console.error("AI question import API error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to import questions." },
      { status: 500 }
    );
  }
}
