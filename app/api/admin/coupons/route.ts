import { NextRequest, NextResponse } from "next/server";
import { getAllCoupons, createCoupon } from "@/lib/coupon-store";
import { getCurrentUser } from "@/lib/auth-store";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }

    const coupons = await getAllCoupons();
    return NextResponse.json({ success: true, coupons });
  } catch (error: any) {
    console.error("Error fetching coupons:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    if (!body.code || !body.discountValue) {
      return NextResponse.json(
        { success: false, error: "Coupon code and discount value are required." },
        { status: 400 }
      );
    }

    const coupon = await createCoupon(body);
    return NextResponse.json({ success: true, coupon });
  } catch (error: any) {
    console.error("Error creating coupon:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
