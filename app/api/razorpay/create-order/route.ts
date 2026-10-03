import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getUserForToken, SubscriptionTier } from "../../../../lib/auth-store";
import { createRazorpayOrder } from "../../../../lib/razorpay";

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("northstar_session")?.value;
    const user = await getUserForToken(token);

    if (!user) {
      return NextResponse.json({ error: "Please log in to proceed with Razorpay checkout." }, { status: 401 });
    }

    const body = await request.json();
    const tier: SubscriptionTier = body.tier === "ultimate" ? "ultimate" : "sprint";
    const amountInRupees = Number(body.amount) || (tier === "ultimate" ? 999 : 499);
    const planName = body.planName || (tier === "ultimate" ? "All-Exam Ultimate VIP Pass" : "Single Exam Sprint Pass");

    const orderResult = await createRazorpayOrder({
      userId: user.id,
      amountInRupees,
      planName,
      tier,
    });

    if (!orderResult.success) {
      return NextResponse.json({ error: orderResult.error || "Failed to initiate Razorpay order." }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      orderId: orderResult.orderId,
      amount: orderResult.amount,
      currency: orderResult.currency,
      keyId: orderResult.keyId,
      receipt: orderResult.receipt,
      user: {
        name: user.displayName,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Razorpay create-order error:", error);
    return NextResponse.json({ error: "Server error creating Razorpay order." }, { status: 500 });
  }
}
