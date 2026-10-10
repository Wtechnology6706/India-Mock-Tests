import { NextResponse } from "next/server";
import { getAllCommercePlans } from "@/lib/commerce-store";
import { getCurrentUser } from "@/lib/auth-store";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }

    const plans = await getAllCommercePlans();
    return NextResponse.json({ success: true, plans });
  } catch (error: any) {
    console.error("Error fetching admin plans:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
