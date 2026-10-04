"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { Plan } from "../../lib/phase1";

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

export default function CommerceManager({ plans }: { plans: Plan[] }) {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [orderFilter, setOrderFilter] = useState("all");

  useEffect(() => {
    fetch("/api/admin/orders")
      .then((res) => res.json())
      .then((data) => {
        if (data?.orders) setOrders(data.orders);
        setLoadingOrders(false);
      })
      .catch(() => setLoadingOrders(false));
  }, []);

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
    <div className="admin-module-container">
      {/* Module Heading */}
      <div className="module-header-row">
        <div>
          <span className="kicker">COMMERCE, MONETIZATION & SUBSCRIBER OVERSIGHT</span>
          <h2 className="module-title">Subscription Plans & Orders</h2>
          <p className="module-desc">
            Monitor mock test subscriptions, track Single Exam Sprint vs All-Exam Ultimate passes, and inspect Razorpay transactions.
          </p>
        </div>
        <Link href="/pricing" target="_blank" className="admin-btn-secondary">
          View Public Pricing Page ↗
        </Link>
      </div>

      {/* Revenue & Subscriber Metrics */}
      <div className="admin-mini-metrics" style={{ margin: "20px 0" }}>
        <div className="mini-metric-card" style={{ borderLeft: "4px solid #166534" }}>
          <small>TOTAL GATEWAY REVENUE</small>
          <strong style={{ color: "#166534" }}>₹{totalRevenue.toLocaleString("en-IN")}</strong>
          <span>{paidOrdersCount} completed transactions</span>
        </div>
        <div className="mini-metric-card" style={{ borderLeft: "4px solid #b94a2b" }}>
          <small>👑 ULTIMATE VIP PASSES</small>
          <strong style={{ color: "#b94a2b" }}>{ultimateOrders}</strong>
          <span>All 150+ exams unlocked</span>
        </div>
        <div className="mini-metric-card" style={{ borderLeft: "4px solid #2563eb" }}>
          <small>⚡ SINGLE EXAM SPRINT PASSES</small>
          <strong style={{ color: "#2563eb" }}>{sprintOrders}</strong>
          <span>Targeted 1-exam passes</span>
        </div>
        <div className="mini-metric-card">
          <small>OFFICIAL GATEWAY</small>
          <strong style={{ color: "#0284c7" }}>Razorpay</strong>
          <span>256-Bit SSL & PCI-DSS Compliant</span>
        </div>
      </div>

      {/* Available Plans Section */}
      <h3 style={{ fontSize: "1.1rem", margin: "28px 0 16px", color: "#1e293b" }}>
        Active Subscription Offerings
      </h3>
      <div className="admin-grid" style={{ maxWidth: "100%", margin: "0 0 32px" }}>
        {plans.map((plan) => (
          <div className={`plan-card ${plan.badge ? "featured-plan" : ""}`} key={plan.id} style={{ transform: "none" }}>
            {plan.badge && <span className="plan-badge">{plan.badge}</span>}
            <span className="kicker">TIER {plan.id.toUpperCase()}</span>
            <h2>{plan.name}</h2>
            <p>{plan.description}</p>
            <div>
              <span className="plan-price">{plan.price}</span>
              <span className="plan-validity">/ {plan.validity}</span>
            </div>
            <ul>
              {plan.includes.map((feature, i) => (
                <li key={i}>✓ {feature}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Recent Orders & Subscriptions History Table */}
      <div style={{ marginTop: "36px" }}>
        <div className="module-header-row" style={{ marginBottom: "16px" }}>
          <div>
            <h3 style={{ fontSize: "1.15rem", margin: "0 0 4px", color: "#1e293b" }}>
              💳 Subscriber Order History & Exam Details
            </h3>
            <p style={{ color: "#64748b", fontSize: "0.85rem", margin: 0 }}>
              Audit real-time subscription purchases, buyer email accounts, and target exam entitlements.
            </p>
          </div>
          <div className="filter-group">
            <select
              value={orderFilter}
              onChange={(e) => setOrderFilter(e.target.value)}
              className="admin-select"
            >
              <option value="all">All Plan Orders ({orders.length})</option>
              <option value="ultimate">👑 Ultimate VIP Pass ({ultimateOrders})</option>
              <option value="sprint">⚡ Single Exam Sprint ({sprintOrders})</option>
            </select>
          </div>
        </div>

        <div className="admin-table-wrapper">
          <table className="admin-data-table">
            <thead>
              <tr>
                <th>Order Ref</th>
                <th>Learner</th>
                <th>Purchased Pass & Target Exam</th>
                <th>Amount</th>
                <th>Payment Gateway</th>
                <th>Date</th>
                <th>Status</th>
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
                  <td colSpan={7} className="empty-table-cell">
                    <div className="empty-state-box">
                      <span className="empty-state-icon">🧾</span>
                      <h4>No orders recorded yet</h4>
                      <p>Orders placed through Razorpay or checkout will appear here automatically.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const isUltimate = order.planSlug === "ultimate";
                  return (
                    <tr key={order.id}>
                      <td>
                        <strong>{order.orderNumber}</strong>
                        <small style={{ display: "block", color: "#94a3b8", fontSize: "0.72rem" }}>
                          {order.invoiceNumber}
                        </small>
                      </td>
                      <td>
                        <strong>{order.userName}</strong>
                        <code style={{ display: "block", fontSize: "0.78rem" }}>{order.userEmail}</code>
                      </td>
                      <td>
                        {isUltimate ? (
                          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                            <span
                              style={{
                                display: "inline-block",
                                background: "#fef3c7",
                                color: "#92400e",
                                border: "1px solid #fde68a",
                                padding: "2px 8px",
                                borderRadius: "4px",
                                fontSize: "0.75rem",
                                fontWeight: 700,
                              }}
                            >
                              👑 All-Exam Ultimate VIP Pass
                            </span>
                            <small style={{ color: "#166534", fontSize: "0.72rem", fontWeight: 600 }}>
                              ✓ Complete Access to All Exams
                            </small>
                          </div>
                        ) : (
                          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                            <span
                              style={{
                                display: "inline-block",
                                background: "#eff6ff",
                                color: "#1e40af",
                                border: "1px solid #bfdbfe",
                                padding: "2px 8px",
                                borderRadius: "4px",
                                fontSize: "0.75rem",
                                fontWeight: 700,
                              }}
                            >
                              ⚡ Single Exam Sprint Pass
                            </span>
                            <strong style={{ color: "#2563eb", fontSize: "0.75rem" }}>
                              🎯 Target: {order.targetExamName || order.targetExamSlug || "Selected Exam"}
                            </strong>
                          </div>
                        )}
                      </td>
                      <td>
                        <strong style={{ fontSize: "0.95rem", color: "#1e3a34" }}>₹{order.amount}</strong>
                      </td>
                      <td>
                        <span style={{ fontSize: "0.82rem", color: "#334155", fontWeight: 500 }}>
                          {order.paymentMethod}
                        </span>
                      </td>
                      <td className="date-cell" suppressHydrationWarning>
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td>
                        <span className="status-pill pill-active">
                          <span className="status-dot-mini" />
                          Paid & Active
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

