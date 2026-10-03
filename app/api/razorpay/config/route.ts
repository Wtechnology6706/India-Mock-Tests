import { NextResponse } from "next/server";
import { getRazorpayConfig } from "../../../../lib/razorpay";

export async function GET() {
  const config = await getRazorpayConfig();
  return NextResponse.json({
    keyId: config.keyId,
    enabled: config.enabled,
    isTestMode: config.isTestMode,
  });
}
