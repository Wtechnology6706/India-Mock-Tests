import { randomUUID } from "node:crypto";
import type { RowDataPacket, ResultSetHeader } from "mysql2";
import { db } from "./db";
import { SubscriptionTier, updateUserSubscription } from "./auth-store";
import { debitWallet } from "./wallet-store";
import { incrementCouponUsage } from "./coupon-store";

export type CommercePlan = {
  id: string;
  slug: string;
  name: string;
  description: string;
  amount: number; // in INR
  amountMinor: number;
  currency: string;
  validityDays: number;
  features: string[];
  active: boolean;
  createdAt: string;
  updatedAt?: string;
};

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
    await db.execute(`
      CREATE TABLE IF NOT EXISTS commerce_plans (
        id VARCHAR(64) PRIMARY KEY,
        slug VARCHAR(64) NOT NULL UNIQUE,
        name VARCHAR(128) NOT NULL,
        description TEXT,
        amount_minor INT NOT NULL DEFAULT 0,
        currency VARCHAR(8) NOT NULL DEFAULT 'INR',
        validity_days INT NOT NULL DEFAULT 90,
        features TEXT,
        active TINYINT(1) NOT NULL DEFAULT 1,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Ensure columns exist if created with old schema
    const alterStatements = [
      "ALTER TABLE commerce_plans MODIFY COLUMN id VARCHAR(64) NOT NULL",
      "ALTER TABLE commerce_plans ADD COLUMN features TEXT NULL",
      "ALTER TABLE commerce_plans ADD COLUMN validity_days INT NOT NULL DEFAULT 90",
      "ALTER TABLE commerce_plans ADD COLUMN updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP",
    ];
    for (const stmt of alterStatements) {
      try {
        await db.execute(stmt);
      } catch {
        // Ignore column exists or constraint errors
      }
    }

    const [rows] = await db.query<RowDataPacket[]>("SELECT id, slug FROM commerce_plans");
    const existing = new Set(rows.map((r) => r.slug));

    if (!existing.has("sprint")) {
      const sprintFeatures = JSON.stringify([
        "Full access to 1 targeted exam category (e.g. BPSC TRE 4.0)",
        "30+ Full Length Mock Tests + Chapter-wise drills",
        "Detailed AI performance analytics & rank prediction",
        "Bilingual Hindi & English test modes",
        "Unlimited test re-attempts & revision bookmarking",
      ]);
      await db.execute(
        `INSERT INTO commerce_plans (id, slug, name, description, amount_minor, currency, validity_days, features, active, created_at)
         VALUES ('1', 'sprint', 'Single Exam Sprint Pass', 'Targeted practice pass for 1 focused examination series.', 49900, 'INR', 90, ?, 1, UTC_TIMESTAMP())
         ON DUPLICATE KEY UPDATE name=VALUES(name)`,
        [sprintFeatures]
      );
    }

    if (!existing.has("ultimate")) {
      const ultimateFeatures = JSON.stringify([
        "All-Access Pass to EVERY Exam Category & PYQs",
        "500+ Complete Mock Tests, Subject Quizzes & PYQs",
        "Full PYQ PDF Hub with high-speed download & full-screen reader",
        "Priority Doubt Solving & Video Solutions access",
        "VIP Candidate Badge & 180-day extended validity",
      ]);
      await db.execute(
        `INSERT INTO commerce_plans (id, slug, name, description, amount_minor, currency, validity_days, features, active, created_at)
         VALUES ('2', 'ultimate', 'All-Exam Ultimate VIP Pass', 'All-inclusive pass for every state PSC, TET, and national exam.', 99900, 'INR', 180, ?, 1, UTC_TIMESTAMP())
         ON DUPLICATE KEY UPDATE name=VALUES(name)`,
        [ultimateFeatures]
      );
    }
  } catch (err) {
    console.error("Error ensuring commerce plans:", err);
  }
}

export async function getAllCommercePlans(): Promise<CommercePlan[]> {
  await ensureCommercePlans();
  try {
    const [rows] = await db.query<RowDataPacket[]>(
      "SELECT * FROM commerce_plans ORDER BY amount_minor ASC"
    );

    return rows.map(mapPlanRow);
  } catch (err) {
    console.error("Error fetching commerce plans:", err);
    return [];
  }
}

export async function getCommercePlanBySlug(slug: string): Promise<CommercePlan | null> {
  await ensureCommercePlans();
  try {
    const [rows] = await db.query<RowDataPacket[]>(
      "SELECT * FROM commerce_plans WHERE slug = ? LIMIT 1",
      [slug]
    );
    if (!rows.length) return null;
    return mapPlanRow(rows[0]);
  } catch (err) {
    console.error("Error fetching plan by slug:", err);
    return null;
  }
}

export async function getCommercePlanById(id: string): Promise<CommercePlan | null> {
  await ensureCommercePlans();
  try {
    const [rows] = await db.query<RowDataPacket[]>(
      "SELECT * FROM commerce_plans WHERE id = ? LIMIT 1",
      [id]
    );
    if (!rows.length) return null;
    return mapPlanRow(rows[0]);
  } catch (err) {
    console.error("Error fetching plan by id:", err);
    return null;
  }
}

export async function updateCommercePlan(
  id: string,
  input: {
    name?: string;
    description?: string;
    amount?: number; // in INR
    validityDays?: number;
    features?: string[];
    active?: boolean;
  }
): Promise<CommercePlan | null> {
  await ensureCommercePlans();
  const updates: string[] = [];
  const values: any[] = [];

  if (input.name !== undefined) {
    updates.push("name = ?");
    values.push(input.name);
  }
  if (input.description !== undefined) {
    updates.push("description = ?");
    values.push(input.description);
  }
  if (input.amount !== undefined) {
    updates.push("amount_minor = ?");
    values.push(Math.round(input.amount * 100));
  }
  if (input.validityDays !== undefined) {
    updates.push("validity_days = ?");
    values.push(input.validityDays);
  }
  if (input.features !== undefined) {
    updates.push("features = ?");
    values.push(JSON.stringify(input.features));
  }
  if (input.active !== undefined) {
    updates.push("active = ?");
    values.push(input.active ? 1 : 0);
  }

  if (!updates.length) return getCommercePlanById(id);

  values.push(id);
  await db.execute(
    `UPDATE commerce_plans SET ${updates.join(", ")}, updated_at = UTC_TIMESTAMP() WHERE id = ?`,
    values
  );

  return getCommercePlanById(id);
}

function mapPlanRow(r: RowDataPacket): CommercePlan {
  let features: string[] = [];
  try {
    features = r.features ? JSON.parse(r.features) : [];
  } catch {
    features = [];
  }

  return {
    id: String(r.id),
    slug: String(r.slug),
    name: String(r.name),
    description: String(r.description || ""),
    amount: (r.amount_minor || 0) / 100,
    amountMinor: Number(r.amount_minor || 0),
    currency: r.currency || "INR",
    validityDays: Number(r.validity_days || 90),
    features: Array.isArray(features) ? features : [],
    active: Boolean(r.active),
    createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
    updatedAt: r.updated_at ? new Date(r.updated_at).toISOString() : undefined,
  };
}

export async function createSimulatedOrder(params: {
  userId: string;
  tier: SubscriptionTier;
  planName: string;
  amount: number; // in INR e.g. 499 or 999
  paymentMethod: string; // e.g. "UPI / QR Code", "Credit/Debit Card", "Net Banking", "Student Wallet"
  durationDays: number;
  couponCode?: string;
  provider?: string;
  providerOrderId?: string;
  providerPaymentId?: string;
}): Promise<{ success: boolean; order?: OrderRecord; error?: string }> {
  try {
    await ensureCommercePlans();
    const orderId = randomUUID();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = params.providerOrderId || `ORD-2026-${randomSuffix}`;
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
         VALUES (?, ?, ?, ?, 'INR', 'paid', ?, ?, ?, ?, UTC_TIMESTAMP(), UTC_TIMESTAMP())`,
        [
          orderId,
          params.userId,
          planId,
          amountMinor,
          params.provider || "gateway",
          orderNumber,
          params.providerPaymentId || `PAY-SUC-${randomSuffix}`,
          taxDetails,
        ]
      );
    } catch (dbErr) {
      console.error("Database insert error for order:", dbErr);
    }

    // Update user's subscription
    await updateUserSubscription(params.userId, params.tier, params.durationDays);

    if (params.couponCode) {
      await incrementCouponUsage(params.couponCode);
    }

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
      provider: params.provider || "gateway",
      paymentMethod: params.paymentMethod,
      taxAmount,
      invoiceNumber,
      createdAt: now,
      paidAt: now,
    };

    return { success: true, order: orderRecord };
  } catch (error) {
    console.error("Error processing order:", error);
    return { success: false, error: "Failed to complete payment transaction." };
  }
}

export async function processWalletPlanPurchase(params: {
  userId: string;
  planSlug: string;
  couponCode?: string;
}): Promise<{ success: boolean; order?: OrderRecord; error?: string }> {
  const plan = await getCommercePlanBySlug(params.planSlug);
  if (!plan) {
    return { success: false, error: "Plan not found." };
  }

  let finalAmount = plan.amount;
  if (params.couponCode) {
    const { validateAndCalculateCoupon } = await import("./coupon-store");
    const couponRes = await validateAndCalculateCoupon(params.couponCode, plan.amount);
    if (couponRes.valid && couponRes.finalAmount !== undefined) {
      finalAmount = couponRes.finalAmount;
    }
  }

  // Debit wallet
  const debitRes = await debitWallet({
    userId: params.userId,
    amount: finalAmount,
    description: `Subscription to ${plan.name} (${plan.validityDays} Days)`,
    referenceType: "purchase",
    referenceId: plan.id,
  });

  if (!debitRes.success) {
    return { success: false, error: debitRes.error || "Insufficient wallet balance." };
  }

  const orderRes = await createSimulatedOrder({
    userId: params.userId,
    tier: plan.slug as SubscriptionTier,
    planName: plan.name,
    amount: finalAmount,
    paymentMethod: "Student Wallet Balance",
    durationDays: plan.validityDays,
    couponCode: params.couponCode,
    provider: "wallet",
    providerOrderId: `WAL-ORD-${randomUUID().slice(0, 8)}`,
    providerPaymentId: debitRes.transactionId || `WAL-PAY-${randomUUID().slice(0, 8)}`,
  });

  return orderRes;
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
