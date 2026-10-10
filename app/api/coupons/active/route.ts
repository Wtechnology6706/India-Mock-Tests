import { NextResponse } from "next/server";
import { getActiveCoupons } from "@/lib/coupon-store";

export async function GET() {
  try {
    const coupons = await getActiveCoupons();
    return NextResponse.json({ success: true, coupons });
  } catch (error: any) {
    console.error("Error fetching active coupons:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
