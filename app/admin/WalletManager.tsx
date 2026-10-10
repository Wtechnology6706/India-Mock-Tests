"use client";

import { useState, useEffect } from "react";
import type { WalletTransaction } from "@/lib/wallet-store";

export default function WalletManager() {
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, []);

  async function fetchTransactions() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/wallet-transactions?limit=100");
      const data = await res.json();
      if (data.success) {
        setTransactions(data.transactions || []);
        setTotal(data.total || 0);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  const totalRecharge = transactions
    .filter((t) => t.type === "credit")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalSpent = transactions
    .filter((t) => t.type === "debit")
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="admin-module-container" style={{ padding: "24px" }}>
      {/* Header */}
      <div className="module-header-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <span className="kicker" style={{ color: "#0f766e", fontWeight: 800 }}>STUDENT WALLET & RECHARGE ENGINE</span>
          <h2 className="module-title" style={{ fontSize: "24px", fontWeight: 800, margin: "4px 0" }}>
            Student Wallets & Transaction History
          </h2>
          <p className="module-desc" style={{ color: "#64748b", margin: 0, fontSize: "14px" }}>
            Real-time audit log of all candidate wallet top-ups via Razorpay / UPI and subscription pass checkouts.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchTransactions}
          style={{
            padding: "8px 16px",
            background: "#f1f5f9",
            border: "1px solid #cbd5e1",
            borderRadius: "8px",
            color: "#334155",
            fontWeight: 700,
            fontSize: "13px",
            cursor: "pointer",
          }}
        >
          🔄 Refresh Feed
        </button>
      </div>

      {/* Metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "24px" }}>
        <div style={{ background: "#fff", padding: "16px 20px", borderRadius: "12px", border: "1px solid #e2e8f0", borderLeft: "4px solid #059669" }}>
          <small style={{ color: "#64748b", fontWeight: 700, fontSize: "11px" }}>TOTAL WALLET CREDITS</small>
          <div style={{ fontSize: "24px", fontWeight: 800, color: "#065f46", margin: "4px 0" }}>
            ₹{totalRecharge.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </div>
          <span style={{ fontSize: "12px", color: "#64748b" }}>Top-up recharges completed</span>
        </div>

        <div style={{ background: "#fff", padding: "16px 20px", borderRadius: "12px", border: "1px solid #e2e8f0", borderLeft: "4px solid #2563eb" }}>
          <small style={{ color: "#64748b", fontWeight: 700, fontSize: "11px" }}>TOTAL SPENT VIA WALLET</small>
          <div style={{ fontSize: "24px", fontWeight: 800, color: "#1d4ed8", margin: "4px 0" }}>
            ₹{totalSpent.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </div>
          <span style={{ fontSize: "12px", color: "#64748b" }}>VIP test passes redeemed</span>
        </div>

        <div style={{ background: "#fff", padding: "16px 20px", borderRadius: "12px", border: "1px solid #e2e8f0", borderLeft: "4px solid #0d9488" }}>
          <small style={{ color: "#64748b", fontWeight: 700, fontSize: "11px" }}>TRANSACTION EVENTS</small>
          <div style={{ fontSize: "24px", fontWeight: 800, color: "#0f766e", margin: "4px 0" }}>
            {total}
          </div>
          <span style={{ fontSize: "12px", color: "#64748b" }}>Audited in database</span>
        </div>
      </div>

      {/* Transaction Feed */}
      {loading ? (
        <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>Loading transactions...</div>
      ) : (
        <div style={{ background: "#fff", borderRadius: "14px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
            <thead>
              <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", color: "#475569" }}>
                <th style={{ padding: "14px 18px" }}>Txn ID / Date</th>
                <th style={{ padding: "14px 18px" }}>Student / Candidate</th>
                <th style={{ padding: "14px 18px" }}>Type</th>
                <th style={{ padding: "14px 18px" }}>Description</th>
                <th style={{ padding: "14px 18px" }}>Amount</th>
                <th style={{ padding: "14px 18px" }}>Balance After</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: "30px", textAlign: "center", color: "#64748b" }}>
                    No wallet transactions recorded yet.
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "14px 18px" }}>
                      <div style={{ fontWeight: 700, color: "#0f172a", fontFamily: "monospace" }}>{tx.id}</div>
                      <small style={{ color: "#64748b" }}>{new Date(tx.createdAt).toLocaleString()}</small>
                    </td>
                    <td style={{ padding: "14px 18px" }}>
                      <div style={{ fontWeight: 600, color: "#1e293b" }}>{tx.userName || "Student User"}</div>
                      <small style={{ color: "#64748b" }}>{tx.userEmail || `ID: ${tx.userId}`}</small>
                    </td>
                    <td style={{ padding: "14px 18px" }}>
                      <span
                        style={{
                          padding: "3px 8px",
                          borderRadius: "999px",
                          fontSize: "11px",
                          fontWeight: 800,
                          background: tx.type === "credit" ? "#ecfdf5" : "#fef2f2",
                          color: tx.type === "credit" ? "#065f46" : "#991b1b",
                        }}
                      >
                        {tx.type === "credit" ? "+ CREDIT" : "- DEBIT"}
                      </span>
                    </td>
                    <td style={{ padding: "14px 18px", color: "#334155" }}>
                      {tx.description}
                      {tx.referenceId && (
                        <small style={{ display: "block", color: "#64748b", fontFamily: "monospace" }}>
                          Ref: {tx.referenceId}
                        </small>
                      )}
                    </td>
                    <td style={{ padding: "14px 18px", fontWeight: 800, color: tx.type === "credit" ? "#059669" : "#dc2626" }}>
                      {tx.type === "credit" ? "+" : "-"}₹{tx.amount.toFixed(2)}
                    </td>
                    <td style={{ padding: "14px 18px", fontWeight: 700, color: "#0f172a" }}>
                      ₹{tx.balanceAfter.toFixed(2)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
