import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-store";
import { getRazorpayConfig, verifyRazorpayPaymentSignature } from "@/lib/razorpay";
import { creditWallet } from "@/lib/wallet-store";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Please log in." }, { status: 401 });
    }

    const body = await req.json();
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, amount, isSimulated } = body;

    const topupAmount = Number(amount);
    if (!topupAmount || topupAmount <= 0) {
      return NextResponse.json({ success: false, error: "Invalid topup amount." }, { status: 400 });
    }

    if (isSimulated) {
      const creditRes = await creditWallet({
        userId: user.id,
        amount: topupAmount,
        description: `Wallet top-up (UPI / NetBanking)`,
        referenceType: "topup",
        referenceId: razorpayOrderId || `SIM-${Date.now()}`,
      });

      if (!creditRes.success) {
        return NextResponse.json({ success: false, error: creditRes.error }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        newBalance: creditRes.newBalance,
        transactionId: creditRes.transactionId,
        message: `₹${topupAmount.toFixed(2)} added to your wallet successfully!`,
      });
    }

    // Razorpay signature verification
    const rzpConfig = await getRazorpayConfig();
    if (!rzpConfig.keySecret) {
      return NextResponse.json({ success: false, error: "Razorpay Secret is not configured." }, { status: 500 });
    }

    const isValid = verifyRazorpayPaymentSignature({
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      keySecret: rzpConfig.keySecret,
    });

    if (!isValid) {
      return NextResponse.json({ success: false, error: "Payment verification failed. Invalid signature." }, { status: 400 });
    }

    const creditRes = await creditWallet({
      userId: user.id,
      amount: topupAmount,
      description: `Wallet top-up via Razorpay (${razorpayPaymentId})`,
      referenceType: "topup",
      referenceId: razorpayPaymentId,
    });

    if (!creditRes.success) {
      return NextResponse.json({ success: false, error: creditRes.error }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      newBalance: creditRes.newBalance,
      transactionId: creditRes.transactionId,
      message: `₹${topupAmount.toFixed(2)} added to your wallet successfully!`,
    });
  } catch (error: any) {
    console.error("Wallet topup verification error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
