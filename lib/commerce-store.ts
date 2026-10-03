import { randomUUID } from "node:crypto";
import type { RowDataPacket, ResultSetHeader } from "mysql2";
import { db } from "./db";
import { SubscriptionTier, updateUserSubscription } from "./auth-store";

export type OrderRecord = {
  id: string;
  orderNumber: string;
  userId: string;
  planId: string;
  planSlug: string;
  planName: string;
  durationMonths: number;
  amount: number;
  currency: string;
  status: "paid" | "pending" | "failed" | "refunded";
  provider: string;
  paymentMethod: string;
  taxAmount: number;
  invoiceNumber: string;
  createdAt: string;
  paidAt: string | null;
};

export async function ensureCommercePlans() {
  try {
    const [rows] = await db.query<RowDataPacket[]>("SELECT id, slug FROM commerce_plans");
    const existing = new Set(rows.map((r) => r.slug));

    if (!existing.has("sprint")) {
      await db.execute(
        `INSERT INTO commerce_plans (id, slug, name, description, amount_minor, currency, validity_days, active, created_at)
         VALUES (1, 'sprint', 'Single Exam Sprint Pass', 'Targeted practice pass for 1 focused examination series.', 49900, 'INR', 90, 1, UTC_TIMESTAMP())
         ON DUPLICATE KEY UPDATE name=VALUES(name)`
      );
    }

    if (!existing.has("ultimate")) {
      await db.execute(
        `INSERT INTO commerce_plans (id, slug, name, description, amount_minor, currency, validity_days, active, created_at)
         VALUES (2, 'ultimate', 'All-Exam Ultimate VIP Pass', 'All-inclusive pass for every state PSC, TET, and national exam.', 99900, 'INR', 180, 1, UTC_TIMESTAMP())
         ON DUPLICATE KEY UPDATE name=VALUES(name)`
      );
    }
  } catch (err) {
    console.error("Error ensuring commerce plans:", err);
  }
}

export async function createSimulatedOrder(params: {
  userId: string;
  tier: SubscriptionTier;
  planName: string;
  amount: number; // in INR e.g. 499 or 999
  paymentMethod: string; // e.g. "UPI / QR Code", "Credit/Debit Card", "Net Banking"
  durationDays: number;
  couponCode?: string;
}): Promise<{ success: boolean; order?: OrderRecord; error?: string }> {
  try {
    await ensureCommercePlans();
    const orderId = randomUUID();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `ORD-2026-${randomSuffix}`;
    const invoiceNumber = `INV-2026-${randomSuffix}`;
    const planId = params.tier === "ultimate" ? "2" : "1";
    const amountMinor = Math.round(params.amount * 100);
    const taxAmount = Math.round((params.amount * 18) / 118); // 18% GST inclusive
    const now = new Date().toISOString();

    const taxDetails = JSON.stringify({
      orderNumber,
      invoiceNumber,
      planName: params.planName,
      paymentMethod: params.paymentMethod,
      baseAmount: params.amount - taxAmount,
      cgst: taxAmount / 2,
      sgst: taxAmount / 2,
      totalAmount: params.amount,
      durationDays: params.durationDays,
      couponCode: params.couponCode || null,
    });

    try {
      await db.execute(
        `INSERT INTO orders (id, user_id, plan_id, amount_minor, currency, status, provider, provider_order_id, provider_payment_id, tax_details, created_at, paid_at)
         VALUES (?, ?, ?, ?, 'INR', 'paid', 'simulated_gateway', ?, ?, ?, UTC_TIMESTAMP(), UTC_TIMESTAMP())`,
        [orderId, params.userId, planId, amountMinor, orderNumber, `PAY-SIM-${randomSuffix}`, taxDetails]
      );
    } catch (dbErr) {
      console.error("Database insert error for order:", dbErr);
    }

    // Update user's subscription
    await updateUserSubscription(params.userId, params.tier, params.durationDays);

    const orderRecord: OrderRecord = {
      id: orderId,
      orderNumber,
      userId: params.userId,
      planId,
      planSlug: params.tier,
      planName: params.planName,
      durationMonths: Math.round(params.durationDays / 30),
      amount: params.amount,
      currency: "INR",
      status: "paid",
      provider: "simulated_gateway",
      paymentMethod: params.paymentMethod,
      taxAmount,
      invoiceNumber,
      createdAt: now,
      paidAt: now,
    };

    return { success: true, order: orderRecord };
  } catch (error) {
    console.error("Error processing simulated order:", error);
    return { success: false, error: "Failed to complete payment transaction." };
  }
}

export async function getUserOrders(userId: string): Promise<OrderRecord[]> {
  try {
    const [rows] = await db.query<(RowDataPacket & {
      id: string;
      user_id: number | string;
      plan_id: number | string;
      amount_minor: number;
      currency: string;
      status: "paid" | "pending" | "failed" | "refunded";
      provider: string;
      provider_order_id: string;
      provider_payment_id: string;
      tax_details: string;
      created_at: Date | string;
      paid_at: Date | string | null;
    })[]>(
      "SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC",
      [userId]
    );

    return rows.map((r) => {
      let taxObj: any = {};
      try {
        taxObj = r.tax_details ? JSON.parse(r.tax_details) : {};
      } catch {}

      const planSlug = String(r.plan_id) === "2" ? "ultimate" : "sprint";
      const planName = taxObj.planName || (planSlug === "ultimate" ? "All-Exam Ultimate VIP Pass" : "Single Exam Sprint Pass");

      return {
        id: r.id,
        orderNumber: r.provider_order_id || `ORD-${r.id.slice(0, 8)}`,
        userId: String(r.user_id),
        planId: String(r.plan_id),
        planSlug,
        planName,
        durationMonths: taxObj.durationDays ? Math.round(taxObj.durationDays / 30) : (planSlug === "ultimate" ? 6 : 3),
        amount: (r.amount_minor || 0) / 100,
        currency: r.currency || "INR",
        status: r.status,
        provider: r.provider,
        paymentMethod: taxObj.paymentMethod || "UPI / QR Code",
        taxAmount: taxObj.cgst && taxObj.sgst ? taxObj.cgst + taxObj.sgst : 0,
        invoiceNumber: taxObj.invoiceNumber || `INV-${r.id.slice(0, 8)}`,
        createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
        paidAt: r.paid_at ? new Date(r.paid_at).toISOString() : null,
      };
    });
  } catch (err) {
    console.error("Error fetching user orders:", err);
    return [];
  }
}
