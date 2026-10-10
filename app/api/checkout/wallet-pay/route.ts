import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-store";
import { processWalletPlanPurchase } from "@/lib/commerce-store";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Please log in to checkout." }, { status: 401 });
    }

    const body = await req.json();
    const { planSlug, couponCode } = body;

    if (!planSlug) {
      return NextResponse.json({ success: false, error: "Plan is required." }, { status: 400 });
    }

    const result = await processWalletPlanPurchase({
      userId: user.id,
      planSlug,
      couponCode,
    });

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error || "Payment from wallet failed." }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      order: result.order,
      message: "Subscription activated successfully using your Student Wallet balance!",
    });
  } catch (error: any) {
    console.error("Wallet checkout error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
