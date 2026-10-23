import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-store";
import { generateQuestionsWithAI } from "@/lib/ai-service";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "admin" && user.role !== "editor")) {
      return NextResponse.json({ success: false, error: "Unauthorized. Staff access required." }, { status: 403 });
    }

    const body = await req.json();
    const {
      exam = "BPSC TRE 4.0",
      subject = "General Studies",
      topic = "Modern History",
      questionCount = 5,
      optionCount = 5,
      difficulty = "medium",
      language = "bilingual",
    } = body;

    const result = await generateQuestionsWithAI({
      exam,
      subject,
      topic,
      questionCount: Number(questionCount) || 5,
      optionCount: Number(optionCount) === 4 ? 4 : 5,
      difficulty: difficulty === "easy" || difficulty === "hard" ? difficulty : "medium",
      language: language === "english" || language === "hindi" ? language : "bilingual",
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("AI question generation API error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to generate questions with AI." },
      { status: 500 }
    );
  }
}
