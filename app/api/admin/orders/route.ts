import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "../../../../lib/admin-auth";
import { db } from "../../../../lib/db";
import type { RowDataPacket } from "mysql2";

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if ("response" in auth) return auth.response;

  try {
    const [rows] = await db.query<(RowDataPacket & {
      id: string;
      user_id: number | string;
      user_email: string | null;
      user_name: string | null;
      plan_id: number | string;
      plan_slug: string | null;
      plan_name: string | null;
      amount_minor: number;
      currency: string;
      status: string;
      provider: string;
      provider_order_id: string | null;
      provider_payment_id: string | null;
      tax_details: string | null;
      created_at: Date | string;
      paid_at: Date | string | null;
    })[]>(
      `SELECT o.*, u.email AS user_email, u.display_name AS user_name, cp.slug AS plan_slug, cp.name AS plan_name
       FROM orders o
       LEFT JOIN users u ON u.id = o.user_id
       LEFT JOIN commerce_plans cp ON cp.id = o.plan_id
       ORDER BY o.created_at DESC
       LIMIT 100`
    );

    const orders = rows.map((r) => {
      let taxObj: any = {};
      try {
        taxObj = r.tax_details ? JSON.parse(r.tax_details) : {};
      } catch {}

      const planSlug = r.plan_slug || (String(r.plan_id) === "2" ? "ultimate" : "sprint");
      const planName = taxObj.planName || r.plan_name || (planSlug === "ultimate" ? "All-Exam Ultimate VIP Pass" : "Single Exam Sprint Pass");

      return {
        id: r.id,
        orderNumber: taxObj.orderNumber || r.provider_order_id || `ORD-${r.id.slice(0, 8)}`,
        invoiceNumber: taxObj.invoiceNumber || `INV-${r.id.slice(0, 8)}`,
        userId: String(r.user_id),
        userEmail: r.user_email || "Aspirant User",
        userName: r.user_name || "Learner",
        planSlug,
        planName,
        targetExamSlug: taxObj.targetExamSlug || null,
        targetExamName: taxObj.targetExamName || null,
        amount: (r.amount_minor || 0) / 100,
        currency: r.currency || "INR",
        status: r.status || "paid",
        provider: r.provider || "razorpay",
        paymentMethod: taxObj.paymentMethod || "Razorpay (UPI / Card / NetBanking)",
        paymentId: r.provider_payment_id || "Live / Verified",
        createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
        paidAt: r.paid_at ? new Date(r.paid_at).toISOString() : null,
      };
    });

    return NextResponse.json({ orders });
  } catch (error) {
    console.error("Admin orders API error:", error);
    return NextResponse.json({ orders: [] });
  }
}
