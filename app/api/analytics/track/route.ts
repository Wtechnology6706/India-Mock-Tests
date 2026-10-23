import { NextRequest, NextResponse } from "next/server";
import { trackInteraction } from "@/lib/analytics-service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { eventType, pagePath, entitySlug, entityTitle, userId, metadata } = body;

    if (!eventType || !pagePath) {
      return NextResponse.json({ success: false, error: "eventType and pagePath are required" }, { status: 400 });
    }

    const recorded = await trackInteraction({
      eventType,
      pagePath,
      entitySlug,
      entityTitle,
      userId,
      metadata,
    });

    return NextResponse.json({ success: recorded });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
