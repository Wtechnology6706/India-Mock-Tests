import { NextResponse } from "next/server";
import { getAllCommercePlans } from "@/lib/commerce-store";

export async function GET() {
  try {
    const plans = await getAllCommercePlans();
    return NextResponse.json({ success: true, plans: plans.filter((p) => p.active) });
  } catch (error: any) {
    console.error("Error fetching plans:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
