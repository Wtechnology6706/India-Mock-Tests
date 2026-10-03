import { NextRequest, NextResponse } from "next/server";
import { submitAttempt } from "../../../../../lib/attempt-store";

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  let body: { answers?: Record<string | number, number>; reviewed?: number[] } | undefined;
  try {
    body = await request.json();
  } catch {
    // Empty body is allowed
  }

  const result = await submitAttempt(id, body?.answers, body?.reviewed);
  if (!result) return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
  return NextResponse.json({ data: result });
}
