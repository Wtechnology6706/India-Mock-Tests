import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-store";
import { createGenericRazorpayOrder, getRazorpayConfig } from "@/lib/razorpay";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Please log in to add money to your wallet." }, { status: 401 });
    }

    const body = await req.json();
    const amount = Number(body.amount);

    if (!amount || amount < 10 || amount > 50000) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid top-up amount between ₹10 and ₹50,000." },
        { status: 400 }
      );
    }

    const rzpConfig = await getRazorpayConfig();

    // If Razorpay credentials are configured, create a real Razorpay order
    if (rzpConfig.keyId && rzpConfig.keySecret) {
      const orderRes = await createGenericRazorpayOrder({
        userId: user.id,
        amountInRupees: amount,
        purpose: "Wallet Top-up",
        notes: {
          userEmail: user.email,
          userName: user.displayName,
          type: "wallet_recharge",
        },
      });

      if (!orderRes.success) {
        return NextResponse.json({ success: false, error: orderRes.error }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        mode: "razorpay",
        orderId: orderRes.orderId,
        amount: orderRes.amount,
        currency: orderRes.currency,
        keyId: orderRes.keyId,
        user: {
          name: user.displayName,
          email: user.email,
        },
      });
    }

    // Fallback: simulated recharge order
    const simOrderId = `WAL-SIM-${Date.now()}`;
    return NextResponse.json({
      success: true,
      mode: "simulated",
      orderId: simOrderId,
      amount: Math.round(amount * 100),
      currency: "INR",
      user: {
        name: user.displayName,
        email: user.email,
      },
    });
  } catch (error: any) {
    console.error("Wallet topup create-order error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
