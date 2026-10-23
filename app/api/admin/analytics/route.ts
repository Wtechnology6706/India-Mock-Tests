import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-store";
import { getAdminAnalytics } from "@/lib/analytics-service";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "admin" && user.role !== "editor")) {
      return NextResponse.json({ success: false, error: "Unauthorized. Staff access required." }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const timeframe = (searchParams.get("timeframe") as "all" | "30d" | "7d" | "today") || "all";

    const data = await getAdminAnalytics(timeframe);

    return NextResponse.json({
      success: true,
      timeframe,
      data,
    });
  } catch (error: any) {
    console.error("Admin analytics fetch error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load analytics data." },
      { status: 500 }
    );
  }
}
