import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getUserForToken, SubscriptionTier } from "../../../../lib/auth-store";
import {
  getRazorpayConfig,
  verifyRazorpayPaymentSignature,
  recordRazorpayPayment,
} from "../../../../lib/razorpay";

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("northstar_session")?.value;
    const user = await getUserForToken(token);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
    }

    const body = await request.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      tier,
      planName,
      amount,
      durationDays,
      couponCode,
    } = body;

    if (!razorpay_order_id || !razorpay_payment_id) {
      return NextResponse.json({ error: "Missing Razorpay payment parameters." }, { status: 400 });
    }

    const config = await getRazorpayConfig();
    const isValid = verifyRazorpayPaymentSignature({
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature || "simulated_success_signature",
      keySecret: config.keySecret,
    });

    if (!isValid) {
      return NextResponse.json({ error: "Invalid Razorpay payment signature." }, { status: 400 });
    }

    const subTier: SubscriptionTier = tier === "ultimate" ? "ultimate" : "sprint";
    const subDurationDays = Number(durationDays) || (subTier === "ultimate" ? 180 : 90);
    const subAmount = Number(amount) || (subTier === "ultimate" ? 999 : 499);

    const order = await recordRazorpayPayment({
      userId: user.id,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      tier: subTier,
      planName: planName || (subTier === "ultimate" ? "All-Exam Ultimate VIP Pass" : "Single Exam Sprint Pass"),
      amountInRupees: subAmount,
      durationDays: subDurationDays,
      couponCode,
    });

    return NextResponse.json({
      success: true,
      message: `Razorpay payment of ₹${subAmount} verified successfully! VIP pass activated.`,
      order,
      tier: subTier,
      expiresAt: new Date(Date.now() + subDurationDays * 24 * 60 * 60 * 1000).toISOString(),
    });
  } catch (error) {
    console.error("Razorpay verification API error:", error);
    return NextResponse.json({ error: "Failed to verify Razorpay transaction." }, { status: 500 });
  }
}
