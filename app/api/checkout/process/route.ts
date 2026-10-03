import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getUserForToken, SubscriptionTier } from "../../../../lib/auth-store";
import { createSimulatedOrder } from "../../../../lib/commerce-store";

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("northstar_session")?.value;
    const user = await getUserForToken(token);

    if (!user) {
      return NextResponse.json({ error: "Please log in to complete checkout." }, { status: 401 });
    }

    const body = await request.json();
    const tier: SubscriptionTier = body.tier === "ultimate" ? "ultimate" : "sprint";
    const amount = Number(body.amount) || (tier === "ultimate" ? 999 : 499);
    const planName = body.planName || (tier === "ultimate" ? "All-Exam Ultimate VIP Pass" : "Single Exam Sprint Pass");
    const paymentMethod = body.paymentMethod || "UPI / QR Code";
    const durationDays = Number(body.durationDays) || (tier === "ultimate" ? 180 : 90);
    const couponCode = body.couponCode || undefined;

    const result = await createSimulatedOrder({
      userId: user.id,
      tier,
      planName,
      amount,
      paymentMethod,
      durationDays,
      couponCode,
    });

    if (!result.success || !result.order) {
      return NextResponse.json({ error: result.error || "Payment simulation failed." }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Payment of ₹${amount} received successfully!`,
      order: result.order,
      tier,
      expiresAt: new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString(),
    });
  } catch (error) {
    console.error("Checkout process API error:", error);
    return NextResponse.json({ error: "Internal server error during payment checkout." }, { status: 500 });
  }
}
