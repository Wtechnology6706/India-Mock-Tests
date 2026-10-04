import { createHmac, randomUUID } from "node:crypto";
import { getSiteConfiguration } from "./site-config";
import { db } from "./db";
import { SubscriptionTier, updateUserSubscription } from "./auth-store";
import { ensureCommercePlans } from "./commerce-store";

export type RazorpayConfig = {
  keyId: string;
  keySecret: string;
  webhookSecret: string;
  enabled: boolean;
  isTestMode: boolean;
};

export async function getRazorpayConfig(): Promise<RazorpayConfig> {
  const siteConfig = await getSiteConfiguration();
  const keyId = process.env.RAZORPAY_KEY_ID?.trim() || siteConfig.razorpayKeyId?.trim() || "";
  const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim() || siteConfig.razorpayKeySecret?.trim() || "";
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET?.trim() || siteConfig.razorpayWebhookSecret?.trim() || "";
  const enabled = siteConfig.razorpayEnabled ?? true;
  const isTestMode = keyId.startsWith("rzp_test_");

  return {
    keyId,
    keySecret,
    webhookSecret,
    enabled,
    isTestMode,
  };
}

export type CreateRazorpayOrderResult = {
  success: boolean;
  orderId?: string;
  amount?: number; // in paise
  currency?: string;
  keyId?: string;
  receipt?: string;
  error?: string;
};

export async function createRazorpayOrder(params: {
  userId: string;
  amountInRupees: number;
  planName: string;
  tier: SubscriptionTier;
}): Promise<CreateRazorpayOrderResult> {
  const config = await getRazorpayConfig();

  if (!config.keyId || !config.keySecret) {
    return {
      success: false,
      error: "Razorpay Key ID and Secret are not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env or Admin Settings.",
    };
  }

  const amountInPaise = Math.round(params.amountInRupees * 100);
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const receipt = `rcpt_${Date.now().toString().slice(-6)}_${randomSuffix}`;

  try {
    const authHeader = Buffer.from(`${config.keyId}:${config.keySecret}`).toString("base64");
    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${authHeader}`,
      },
      body: JSON.stringify({
        amount: amountInPaise,
        currency: "INR",
        receipt,
        notes: {
          userId: params.userId,
          planName: params.planName,
          tier: params.tier,
        },
      }),
    });

    const data = await response.json();
    if (response.ok && data.id) {
      return {
        success: true,
        orderId: data.id,
        amount: data.amount,
        currency: data.currency || "INR",
        keyId: config.keyId,
        receipt,
      };
    } else {
      const errorMsg = data.error?.description || data.message || "Failed to create order on Razorpay.";
      return {
        success: false,
        error: errorMsg,
      };
    }
  } catch (err: any) {
    console.error("Razorpay API call failed:", err);
    return {
      success: false,
      error: err.message || "Network error connecting to Razorpay API.",
    };
  }
}

export function verifyRazorpayPaymentSignature(params: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  keySecret: string;
}): boolean {
  try {
    const generatedSignature = createHmac("sha256", params.keySecret)
      .update(`${params.razorpayOrderId}|${params.razorpayPaymentId}`)
      .digest("hex");

    return generatedSignature === params.razorpaySignature;
  } catch (err) {
    console.error("Signature verification error:", err);
    return false;
  }
}

export async function recordRazorpayPayment(params: {
  userId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  tier: SubscriptionTier;
  planName: string;
  amountInRupees: number;
  durationDays: number;
  couponCode?: string;
  targetExamSlug?: string | null;
  targetExamName?: string | null;
}) {
  await ensureCommercePlans();
  const orderId = randomUUID();
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const orderNumber = `ORD-RZP-${randomSuffix}`;
  const invoiceNumber = `INV-RZP-${randomSuffix}`;
  const planId = params.tier === "ultimate" ? "2" : "1";
  const amountMinor = Math.round(params.amountInRupees * 100);
  const taxAmount = Math.round((params.amountInRupees * 18) / 118);
  const now = new Date().toISOString();

  const taxDetails = JSON.stringify({
    orderNumber,
    invoiceNumber,
    planName: params.planName,
    paymentMethod: "Razorpay (UPI / Card / NetBanking / Wallet)",
    razorpayOrderId: params.razorpayOrderId,
    razorpayPaymentId: params.razorpayPaymentId,
    baseAmount: params.amountInRupees - taxAmount,
    cgst: taxAmount / 2,
    sgst: taxAmount / 2,
    totalAmount: params.amountInRupees,
    durationDays: params.durationDays,
    couponCode: params.couponCode || null,
    targetExamSlug: params.targetExamSlug || null,
    targetExamName: params.targetExamName || null,
  });

  try {
    await db.execute(
      `INSERT INTO orders (id, user_id, plan_id, amount_minor, currency, status, provider, provider_order_id, provider_payment_id, tax_details, created_at, paid_at)
       VALUES (?, ?, ?, ?, 'INR', 'paid', 'razorpay', ?, ?, ?, UTC_TIMESTAMP(), UTC_TIMESTAMP())`,
      [orderId, params.userId, planId, amountMinor, params.razorpayOrderId, params.razorpayPaymentId, taxDetails]
    );
  } catch (err) {
    console.error("Error saving Razorpay order to DB:", err);
  }

  // Upgrade user's subscription with target exam details
  await updateUserSubscription(
    params.userId,
    params.tier,
    params.durationDays,
    params.targetExamSlug,
    params.targetExamName
  );

  return {
    id: orderId,
    orderNumber,
    invoiceNumber,
    userId: params.userId,
    planName: params.planName,
    amount: params.amountInRupees,
    targetExamSlug: params.targetExamSlug,
    targetExamName: params.targetExamName,
    status: "paid",
    paidAt: now,
  };
}
