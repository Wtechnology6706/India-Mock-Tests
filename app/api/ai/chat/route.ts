import { NextRequest, NextResponse } from "next/server";
import { chatQuestionWithAI } from "@/lib/ai-service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      question,
      options,
      userSelected,
      correctAnswer,
      explanation,
      exam,
      subject,
      chatHistory,
      userMessage,
    } = body;

    if (!question || !options || !correctAnswer || !userMessage) {
      return NextResponse.json(
        { success: false, error: "Question, options, correctAnswer, and userMessage are required." },
        { status: 400 }
      );
    }

    const result = await chatQuestionWithAI({
      question,
      options,
      userSelected,
      correctAnswer,
      explanation,
      exam,
      subject,
      chatHistory: Array.isArray(chatHistory) ? chatHistory : [],
      userMessage: String(userMessage).trim(),
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("AI chat route error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process AI chat message." },
      { status: 500 }
    );
  }
}
