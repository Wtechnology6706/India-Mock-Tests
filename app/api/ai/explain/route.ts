import { NextRequest, NextResponse } from "next/server";
import { explainQuestionWithAI } from "@/lib/ai-service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { question, options, userSelected, correctAnswer, explanation, exam, subject, userPrompt } = body;

    if (!question || !options || !correctAnswer) {
      return NextResponse.json(
        { success: false, error: "Question, options, and correctAnswer are required." },
        { status: 400 }
      );
    }

    const result = await explainQuestionWithAI({
      question,
      options,
      userSelected,
      correctAnswer,
      explanation,
      exam,
      subject,
      userPrompt,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("AI explain route error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process AI doubt resolution." },
      { status: 500 }
    );
  }
}
