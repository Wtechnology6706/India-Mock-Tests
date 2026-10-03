import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "node:crypto";
import { getRazorpayConfig } from "../../../../lib/razorpay";

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-razorpay-signature") || "";
    const config = await getRazorpayConfig();

    if (config.webhookSecret) {
      const expectedSignature = createHmac("sha256", config.webhookSecret)
        .update(rawBody)
        .digest("hex");

      if (expectedSignature !== signature) {
        return NextResponse.json({ error: "Invalid webhook signature." }, { status: 400 });
      }
    }

    const event = JSON.parse(rawBody);
    console.log("Received Razorpay webhook event:", event.event);

    // Handles payment.captured, order.paid
    return NextResponse.json({ status: "ok" });
  } catch (err) {
    console.error("Razorpay webhook error:", err);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
