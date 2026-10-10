"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { CommercePlan } from "@/lib/commerce-store";

type OrderItem = {
  id: string;
  orderNumber: string;
  invoiceNumber: string;
  userId: string;
  userEmail: string;
  userName: string;
  planSlug: string;
  planName: string;
  targetExamSlug?: string | null;
  targetExamName?: string | null;
  amount: number;
  currency: string;
  status: string;
  provider: string;
  paymentMethod: string;
  paymentId: string;
  createdAt: string;
  paidAt: string | null;
};

export default function CommerceManager() {
  const [plans, setPlans] = useState<CommercePlan[]>([]);
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [orderFilter, setOrderFilter] = useState("all");

  // Plan Edit State
  const [editingPlan, setEditingPlan] = useState<CommercePlan | null>(null);
  const [planForm, setPlanForm] = useState({
    name: "",
    amount: 499,
    validityDays: 90,
    description: "",
    featuresStr: "",
  });
  const [savingPlan, setSavingPlan] = useState(false);
  const [planMsg, setPlanMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    fetchPlans();
    fetchOrders();
  }, []);

  async function fetchPlans() {
    try {
      const res = await fetch("/api/admin/plans");
      const data = await res.json();
      if (data.success && Array.isArray(data.plans)) {
        setPlans(data.plans);
      }
    } catch {
      // ignore
    }
  }

  async function fetchOrders() {
    try {
      const res = await fetch("/api/admin/orders");
      const data = await res.json();
      if (data?.orders) setOrders(data.orders);
    } catch {
      // ignore
    } finally {
      setLoadingOrders(false);
    }
  }

  function handleOpenEditPlan(p: CommercePlan) {
    setEditingPlan(p);
    setPlanForm({
      name: p.name,
      amount: p.amount,
      validityDays: p.validityDays,
      description: p.description,
      featuresStr: (p.features || []).join("\n"),
    });
    setPlanMsg(null);
  }

  async function handleSavePlan(e: React.FormEvent) {
    e.preventDefault();
    if (!editingPlan) return;
    setSavingPlan(true);
    setPlanMsg(null);

    const features = planForm.featuresStr
      .split("\n")
      .map((f) => f.trim())
      .filter(Boolean);

    try {
      const res = await fetch(`/api/admin/plans/${editingPlan.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: planForm.name,
          amount: Number(planForm.amount),
          validityDays: Number(planForm.validityDays),
          description: planForm.description,
          features,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setPlanMsg({ text: `Plan '${planForm.name}' updated! New price ₹${planForm.amount} is active across checkout.`, type: "success" });
        fetchPlans();
        setTimeout(() => setEditingPlan(null), 1400);
      } else {
        setPlanMsg({ text: data.error || "Update failed", type: "error" });
      }
    } catch (err: any) {
      setPlanMsg({ text: err.message || "Failed to update plan.", type: "error" });
    } finally {
      setSavingPlan(false);
    }
  }

  const totalRevenue = orders.reduce((sum, o) => (o.status === "paid" ? sum + o.amount : sum), 0);
  const paidOrdersCount = orders.filter((o) => o.status === "paid").length;
  const ultimateOrders = orders.filter((o) => o.planSlug === "ultimate").length;
  const sprintOrders = orders.filter((o) => o.planSlug === "sprint").length;

  const filteredOrders = orders.filter((o) => {
    if (orderFilter === "ultimate") return o.planSlug === "ultimate";
    if (orderFilter === "sprint") return o.planSlug === "sprint";
    return true;
  });

  return (
    <div className="admin-module-container" style={{ padding: "24px" }}>
      {/* Module Heading */}
      <div className="module-header-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <span className="kicker" style={{ color: "#059669", fontWeight: 800 }}>COMMERCE, MONETIZATION & SUBSCRIBER OVERSIGHT</span>
          <h2 className="module-title" style={{ fontSize: "24px", fontWeight: 800, margin: "4px 0" }}>
            Subscription Plans & Orders
          </h2>
          <p className="module-desc" style={{ color: "#64748b", margin: 0, fontSize: "14px" }}>
            Edit pricing and plan validity directly. Updated amounts reflect instantly at checkout for all candidates.
          </p>
        </div>
        <Link href="/pricing" target="_blank" className="admin-btn-secondary" style={{ padding: "8px 16px", background: "#f1f5f9", borderRadius: "8px", textDecoration: "none", color: "#334155", fontWeight: 700, fontSize: "13px" }}>
          View Public Pricing Page ↗
        </Link>
      </div>

      {/* Revenue & Subscriber Metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", margin: "20px 0" }}>
        <div style={{ background: "#fff", padding: "16px 20px", borderRadius: "12px", border: "1px solid #e2e8f0", borderLeft: "4px solid #166534" }}>
          <small style={{ color: "#64748b", fontWeight: 700, fontSize: "11px" }}>TOTAL GATEWAY REVENUE</small>
          <div style={{ fontSize: "24px", fontWeight: 800, color: "#166534", margin: "4px 0" }}>
            ₹{totalRevenue.toLocaleString("en-IN")}
          </div>
          <span style={{ fontSize: "12px", color: "#64748b" }}>{paidOrdersCount} completed transactions</span>
        </div>

        <div style={{ background: "#fff", padding: "16px 20px", borderRadius: "12px", border: "1px solid #e2e8f0", borderLeft: "4px solid #b94a2b" }}>
          <small style={{ color: "#64748b", fontWeight: 700, fontSize: "11px" }}>👑 ULTIMATE VIP PASSES</small>
          <div style={{ fontSize: "24px", fontWeight: 800, color: "#b94a2b", margin: "4px 0" }}>
            {ultimateOrders}
          </div>
          <span style={{ fontSize: "12px", color: "#64748b" }}>All exams unlocked</span>
        </div>

        <div style={{ background: "#fff", padding: "16px 20px", borderRadius: "12px", border: "1px solid #e2e8f0", borderLeft: "4px solid #2563eb" }}>
          <small style={{ color: "#64748b", fontWeight: 700, fontSize: "11px" }}>⚡ SINGLE EXAM SPRINT PASSES</small>
          <div style={{ fontSize: "24px", fontWeight: 800, color: "#2563eb", margin: "4px 0" }}>
            {sprintOrders}
          </div>
          <span style={{ fontSize: "12px", color: "#64748b" }}>Targeted 1-exam passes</span>
        </div>

        <div style={{ background: "#fff", padding: "16px 20px", borderRadius: "12px", border: "1px solid #e2e8f0", borderLeft: "4px solid #0284c7" }}>
          <small style={{ color: "#64748b", fontWeight: 700, fontSize: "11px" }}>GATEWAY INTEGRATION</small>
          <div style={{ fontSize: "22px", fontWeight: 800, color: "#0284c7", margin: "4px 0" }}>
            Razorpay + Wallet
          </div>
          <span style={{ fontSize: "12px", color: "#64748b" }}>256-Bit SSL Encrypted</span>
        </div>
      </div>

      {/* Available Plans Section (Editable) */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "28px 0 16px" }}>
        <h3 style={{ fontSize: "18px", fontWeight: 800, margin: 0, color: "#1e293b" }}>
          Active Subscription Offerings (Dynamic Database Tier)
        </h3>
        <span style={{ fontSize: "12px", color: "#059669", fontWeight: 700 }}>
          ✓ Changes save immediately to Checkout & Database
        </span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px", marginBottom: "36px" }}>
        {plans.map((plan) => (
          <div
            key={plan.id}
            style={{
              background: "#fff",
              borderRadius: "16px",
              border: plan.slug === "ultimate" ? "2px solid #059669" : "1px solid #e2e8f0",
              padding: "24px",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <span style={{ fontSize: "11px", fontWeight: 800, color: "#059669", textTransform: "uppercase" }}>
                  TIER {plan.slug.toUpperCase()}
                </span>
                {plan.slug === "ultimate" && (
                  <span style={{ fontSize: "11px", fontWeight: 800, background: "#ecfdf5", color: "#065f46", padding: "2px 8px", borderRadius: "999px" }}>
                    FEATURED
                  </span>
                )}
              </div>

              <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#0f172a", margin: "0 0 6px" }}>{plan.name}</h3>
              <p style={{ fontSize: "13px", color: "#64748b", margin: "0 0 16px" }}>{plan.description}</p>

              <div style={{ marginBottom: "16px" }}>
                <span style={{ fontSize: "28px", fontWeight: 900, color: "#0f172a" }}>₹{plan.amount}</span>
                <span style={{ fontSize: "13px", color: "#64748b" }}> / {plan.validityDays} Days Validity</span>
              </div>

              <ul style={{ paddingLeft: "18px", margin: "0 0 20px", fontSize: "13px", color: "#334155", lineHeight: 1.6 }}>
                {(plan.features || []).map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            </div>

            <button
              type="button"
              onClick={() => handleOpenEditPlan(plan)}
              style={{
                width: "100%",
                padding: "10px",
                background: "#f1f5f9",
                border: "1px solid #cbd5e1",
                borderRadius: "8px",
                fontWeight: 700,
                fontSize: "13px",
                color: "#0f172a",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              ✏️ Edit Plan Price & Details
            </button>
          </div>
        ))}
      </div>

      {/* Plan Edit Modal */}
      {editingPlan && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "rgba(15, 23, 42, 0.75)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
          onClick={() => setEditingPlan(null)}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "16px",
              width: "100%",
              maxWidth: "560px",
              padding: "28px",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div>
                <span style={{ fontSize: "11px", fontWeight: 800, color: "#059669" }}>EDIT SUBSCRIPTION PLAN</span>
                <h3 style={{ margin: "2px 0 0", fontSize: "18px", fontWeight: 800, color: "#0f172a" }}>
                  {editingPlan.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingPlan(null)}
                style={{ background: "transparent", border: "none", fontSize: "18px", cursor: "pointer", color: "#64748b" }}
              >
                ✕
              </button>
            </div>

            {planMsg && (
              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: "8px",
                  marginBottom: "14px",
                  fontSize: "13px",
                  fontWeight: 600,
                  background: planMsg.type === "success" ? "#ecfdf5" : "#fef2f2",
                  color: planMsg.type === "success" ? "#065f46" : "#991b1b",
                  border: `1px solid ${planMsg.type === "success" ? "#a7f3d0" : "#fecaca"}`,
                }}
              >
                {planMsg.text}
              </div>
            )}

            <form onSubmit={handleSavePlan} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "4px" }}>
                  Plan Name:
                </label>
                <input
                  type="text"
                  value={planForm.name}
                  onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
                  required
                  style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "14px", fontWeight: 700 }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "4px" }}>
                    Price in INR (₹):
                  </label>
                  <input
                    type="number"
                    value={planForm.amount}
                    onChange={(e) => setPlanForm({ ...planForm, amount: Number(e.target.value) })}
                    required
                    style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "16px", fontWeight: 800, color: "#0f766e" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "4px" }}>
                    Validity (Days):
                  </label>
                  <input
                    type="number"
                    value={planForm.validityDays}
                    onChange={(e) => setPlanForm({ ...planForm, validityDays: Number(e.target.value) })}
                    required
                    style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "14px" }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "4px" }}>
                  Plan Description:
                </label>
                <input
                  type="text"
                  value={planForm.description}
                  onChange={(e) => setPlanForm({ ...planForm, description: e.target.value })}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "4px" }}>
                  Feature Bullet Points (1 per line):
                </label>
                <textarea
                  rows={4}
                  value={planForm.featuresStr}
                  onChange={(e) => setPlanForm({ ...planForm, featuresStr: e.target.value })}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px", lineHeight: 1.5 }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "12px" }}>
                <button
                  type="button"
                  onClick={() => setEditingPlan(null)}
                  style={{ padding: "10px 18px", background: "#f1f5f9", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "13px", fontWeight: 700, cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingPlan}
                  style={{ padding: "10px 24px", background: "#059669", color: "#fff", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: 700, cursor: savingPlan ? "not-allowed" : "pointer" }}
                >
                  {savingPlan ? "Saving..." : "Save Plan Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Orders Table */}
      <div style={{ marginTop: "36px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h3 style={{ fontSize: "18px", fontWeight: 800, margin: "0 0 4px", color: "#1e293b" }}>
              💳 Subscriber Order History
            </h3>
            <p style={{ color: "#64748b", fontSize: "13px", margin: 0 }}>
              Live audit of student subscription purchases and payment gateways.
            </p>
          </div>

          <select
            value={orderFilter}
            onChange={(e) => setOrderFilter(e.target.value)}
            style={{ padding: "8px 14px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px", background: "#fff" }}
          >
            <option value="all">All Plan Orders ({orders.length})</option>
            <option value="ultimate">👑 Ultimate VIP Pass ({ultimateOrders})</option>
            <option value="sprint">⚡ Single Exam Sprint ({sprintOrders})</option>
          </select>
        </div>

        <div style={{ background: "#fff", borderRadius: "14px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
            <thead>
              <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", color: "#475569" }}>
                <th style={{ padding: "14px 18px" }}>Order Ref</th>
                <th style={{ padding: "14px 18px" }}>Learner</th>
                <th style={{ padding: "14px 18px" }}>Purchased Pass</th>
                <th style={{ padding: "14px 18px" }}>Amount</th>
                <th style={{ padding: "14px 18px" }}>Payment Gateway</th>
                <th style={{ padding: "14px 18px" }}>Date</th>
                <th style={{ padding: "14px 18px" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {loadingOrders ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "30px", color: "#64748b" }}>
                    Loading subscriber transactions...
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "30px", color: "#64748b" }}>
                    No orders recorded yet.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "14px 18px" }}>
                      <div style={{ fontWeight: 700, color: "#0f172a" }}>{order.orderNumber}</div>
                      <small style={{ color: "#94a3b8" }}>{order.invoiceNumber}</small>
                    </td>
                    <td style={{ padding: "14px 18px" }}>
                      <div style={{ fontWeight: 600, color: "#1e293b" }}>{order.userName}</div>
                      <small style={{ color: "#64748b" }}>{order.userEmail}</small>
                    </td>
                    <td style={{ padding: "14px 18px" }}>
                      <span
                        style={{
                          padding: "3px 8px",
                          borderRadius: "4px",
                          fontSize: "12px",
                          fontWeight: 700,
                          background: order.planSlug === "ultimate" ? "#fef3c7" : "#eff6ff",
                          color: order.planSlug === "ultimate" ? "#92400e" : "#1e40af",
                        }}
                      >
                        {order.planSlug === "ultimate" ? "👑 Ultimate VIP Pass" : "⚡ Single Exam Sprint"}
                      </span>
                    </td>
                    <td style={{ padding: "14px 18px", fontWeight: 800, color: "#0f172a" }}>
                      ₹{order.amount}
                    </td>
                    <td style={{ padding: "14px 18px", color: "#334155" }}>
                      {order.paymentMethod}
                    </td>
                    <td style={{ padding: "14px 18px", color: "#64748b" }}>
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ padding: "14px 18px" }}>
                      <span style={{ padding: "3px 8px", borderRadius: "999px", background: "#ecfdf5", color: "#065f46", fontSize: "11px", fontWeight: 800 }}>
                        ✓ Paid & Active
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
