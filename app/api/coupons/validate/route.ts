import { NextRequest, NextResponse } from "next/server";
import { validateAndCalculateCoupon } from "@/lib/coupon-store";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, amount } = body;

    if (!code || typeof amount !== "number") {
      return NextResponse.json(
        { success: false, valid: false, message: "Coupon code and order amount are required." },
        { status: 400 }
      );
    }

    const result = await validateAndCalculateCoupon(code, amount);
    return NextResponse.json({
      success: result.valid,
      ...result,
    });
  } catch (error: any) {
    console.error("Error validating coupon:", error);
    return NextResponse.json(
      { success: false, valid: false, message: "Failed to validate coupon." },
      { status: 500 }
    );
  }
}
