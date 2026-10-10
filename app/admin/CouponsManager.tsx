"use client";

import { useState, useEffect } from "react";
import type { Coupon } from "@/lib/coupon-store";

export default function CouponsManager() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    code: "",
    discountType: "percentage" as "percentage" | "fixed",
    discountValue: 20,
    minOrderAmount: 299,
    maxDiscountAmount: 200,
    description: "",
    active: true,
    expiresAt: "",
    usageLimit: 0,
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  async function fetchCoupons() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/coupons");
      const data = await res.json();
      if (data.success) {
        setCoupons(data.coupons || []);
      }
    } catch {
      setError("Failed to fetch coupons");
    } finally {
      setLoading(false);
    }
  }

  function handleOpenCreate() {
    setEditingCoupon(null);
    setFormData({
      code: "",
      discountType: "percentage",
      discountValue: 15,
      minOrderAmount: 299,
      maxDiscountAmount: 200,
      description: "",
      active: true,
      expiresAt: "",
      usageLimit: 0,
    });
    setModalOpen(true);
    setError("");
    setSuccess("");
  }

  function handleOpenEdit(c: Coupon) {
    setEditingCoupon(c);
    setFormData({
      code: c.code,
      discountType: c.discountType,
      discountValue: c.discountValue,
      minOrderAmount: c.minOrderAmount,
      maxDiscountAmount: c.maxDiscountAmount,
      description: c.description,
      active: c.active,
      expiresAt: c.expiresAt ? c.expiresAt.slice(0, 10) : "",
      usageLimit: c.usageLimit,
    });
    setModalOpen(true);
    setError("");
    setSuccess("");
  }

  async function handleToggleActive(c: Coupon) {
    try {
      const res = await fetch(`/api/admin/coupons/${c.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !c.active }),
      });
      const data = await res.json();
      if (data.success) {
        setCoupons((prev) =>
          prev.map((item) => (item.id === c.id ? { ...item, active: !c.active } : item))
        );
      }
    } catch {
      alert("Failed to toggle coupon status");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this coupon?")) return;
    try {
      const res = await fetch(`/api/admin/coupons/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setCoupons((prev) => prev.filter((c) => c.id !== id));
      }
    } catch {
      alert("Failed to delete coupon");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.code) {
      setError("Please provide a coupon code.");
      return;
    }

    try {
      if (editingCoupon) {
        const res = await fetch(`/api/admin/coupons/${editingCoupon.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        if (data.success) {
          setSuccess("Coupon updated successfully!");
          fetchCoupons();
          setTimeout(() => setModalOpen(false), 1000);
        } else {
          setError(data.error || "Update failed.");
        }
      } else {
        const res = await fetch("/api/admin/coupons", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        if (data.success) {
          setSuccess("Coupon created successfully!");
          fetchCoupons();
          setTimeout(() => setModalOpen(false), 1000);
        } else {
          setError(data.error || "Creation failed.");
        }
      }
    } catch (err: any) {
      setError(err.message || "Failed to save coupon.");
    }
  }

  return (
    <div className="admin-module-container" style={{ padding: "24px" }}>
      {/* Header */}
      <div className="module-header-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <span className="kicker" style={{ color: "#d97706", fontWeight: 800 }}>PROMOTIONS & DISCOUNT CONTROL</span>
          <h2 className="module-title" style={{ fontSize: "24px", fontWeight: 800, margin: "4px 0" }}>
            Coupon Codes & Checkout Discounts
          </h2>
          <p className="module-desc" style={{ color: "#64748b", margin: 0, fontSize: "14px" }}>
            Manage active promotional discounts. Only enabled and non-expired coupons appear at checkout; inactive coupons are strictly rejected.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          style={{
            padding: "10px 20px",
            background: "linear-gradient(135deg, #d97706, #b45309)",
            color: "#fff",
            borderRadius: "10px",
            fontWeight: 700,
            fontSize: "14px",
            border: "none",
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(217, 119, 6, 0.3)",
          }}
        >
          + Create New Coupon
        </button>
      </div>

      {/* Metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "24px" }}>
        <div style={{ background: "#fff", padding: "16px 20px", borderRadius: "12px", border: "1px solid #e2e8f0", borderLeft: "4px solid #059669" }}>
          <small style={{ color: "#64748b", fontWeight: 700, fontSize: "11px" }}>ACTIVE COUPONS</small>
          <div style={{ fontSize: "24px", fontWeight: 800, color: "#065f46", margin: "4px 0" }}>
            {coupons.filter((c) => c.active).length}
          </div>
          <span style={{ fontSize: "12px", color: "#64748b" }}>Live on checkout</span>
        </div>

        <div style={{ background: "#fff", padding: "16px 20px", borderRadius: "12px", border: "1px solid #e2e8f0", borderLeft: "4px solid #2563eb" }}>
          <small style={{ color: "#64748b", fontWeight: 700, fontSize: "11px" }}>TOTAL REDEMPTIONS</small>
          <div style={{ fontSize: "24px", fontWeight: 800, color: "#1d4ed8", margin: "4px 0" }}>
            {coupons.reduce((acc, c) => acc + c.usageCount, 0).toLocaleString()}
          </div>
          <span style={{ fontSize: "12px", color: "#64748b" }}>Applied by students</span>
        </div>
      </div>

      {/* Coupons Table */}
      {loading ? (
        <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>Loading coupon codes...</div>
      ) : (
        <div style={{ background: "#fff", borderRadius: "14px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
            <thead>
              <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", color: "#475569" }}>
                <th style={{ padding: "14px 18px" }}>Coupon Code</th>
                <th style={{ padding: "14px 18px" }}>Discount</th>
                <th style={{ padding: "14px 18px" }}>Min. Order</th>
                <th style={{ padding: "14px 18px" }}>Usage Count</th>
                <th style={{ padding: "14px 18px" }}>Expires</th>
                <th style={{ padding: "14px 18px" }}>Status</th>
                <th style={{ padding: "14px 18px", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((c) => (
                <tr key={c.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "14px 18px" }}>
                    <div style={{ fontWeight: 800, color: "#0f172a", fontFamily: "monospace", fontSize: "14px" }}>
                      🏷️ {c.code}
                    </div>
                    <small style={{ color: "#64748b" }}>{c.description}</small>
                  </td>
                  <td style={{ padding: "14px 18px", fontWeight: 700, color: "#059669" }}>
                    {c.discountType === "percentage" ? `${c.discountValue}% OFF` : `₹${c.discountValue} FLAT`}
                  </td>
                  <td style={{ padding: "14px 18px", color: "#334155" }}>₹{c.minOrderAmount}</td>
                  <td style={{ padding: "14px 18px", fontWeight: 700, color: "#1d4ed8" }}>
                    {c.usageCount} {c.usageLimit > 0 ? `/ ${c.usageLimit}` : "uses"}
                  </td>
                  <td style={{ padding: "14px 18px", color: "#64748b" }}>
                    {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : "Never"}
                  </td>
                  <td style={{ padding: "14px 18px" }}>
                    <button
                      type="button"
                      onClick={() => handleToggleActive(c)}
                      style={{
                        padding: "4px 10px",
                        borderRadius: "999px",
                        fontSize: "11px",
                        fontWeight: 800,
                        border: "none",
                        cursor: "pointer",
                        background: c.active ? "#ecfdf5" : "#fef2f2",
                        color: c.active ? "#065f46" : "#991b1b",
                      }}
                    >
                      {c.active ? "● ACTIVE" : "○ INACTIVE"}
                    </button>
                  </td>
                  <td style={{ padding: "14px 18px", textAlign: "right" }}>
                    <div style={{ display: "inline-flex", gap: "8px" }}>
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(c)}
                        style={{
                          padding: "6px 10px",
                          background: "#e0f2fe",
                          color: "#0369a1",
                          border: "1px solid #bae6fd",
                          borderRadius: "6px",
                          cursor: "pointer",
                          fontSize: "12px",
                          fontWeight: 700,
                        }}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(c.id)}
                        style={{
                          padding: "6px 10px",
                          background: "#fee2e2",
                          color: "#b91c1c",
                          border: "1px solid #fecaca",
                          borderRadius: "6px",
                          cursor: "pointer",
                          fontSize: "12px",
                          fontWeight: 700,
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create / Edit Modal */}
      {modalOpen && (
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
          onClick={() => setModalOpen(false)}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "16px",
              width: "100%",
              maxWidth: "540px",
              padding: "28px",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 800, color: "#0f172a" }}>
                {editingCoupon ? "Edit Coupon Code" : "Create New Coupon Code"}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                style={{ background: "transparent", border: "none", fontSize: "18px", cursor: "pointer", color: "#64748b" }}
              >
                ✕
              </button>
            </div>

            {error && (
              <div style={{ padding: "10px 14px", background: "#fef2f2", color: "#991b1b", borderRadius: "8px", marginBottom: "14px", fontSize: "13px" }}>
                {error}
              </div>
            )}
            {success && (
              <div style={{ padding: "10px 14px", background: "#ecfdf5", color: "#065f46", borderRadius: "8px", marginBottom: "14px", fontSize: "13px" }}>
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "4px" }}>
                  Coupon Code (Uppercase):
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. TRE4SPECIAL"
                  required
                  style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "14px", fontWeight: 800, fontFamily: "monospace" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "4px" }}>
                    Discount Type:
                  </label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value as any })}
                    style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px" }}
                  >
                    <option value="percentage">Percentage (% OFF)</option>
                    <option value="fixed">Fixed (₹ FLAT OFF)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "4px" }}>
                    Discount Value:
                  </label>
                  <input
                    type="number"
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: Number(e.target.value) })}
                    placeholder="e.g. 20 (for 20%) or 100"
                    required
                    style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "4px" }}>
                    Min. Order Amount (₹):
                  </label>
                  <input
                    type="number"
                    value={formData.minOrderAmount}
                    onChange={(e) => setFormData({ ...formData, minOrderAmount: Number(e.target.value) })}
                    style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "4px" }}>
                    Max. Discount Cap (₹):
                  </label>
                  <input
                    type="number"
                    value={formData.maxDiscountAmount}
                    onChange={(e) => setFormData({ ...formData, maxDiscountAmount: Number(e.target.value) })}
                    style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px" }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "4px" }}>
                  Description / Offer Highlight:
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Special 20% discount on all VIP Exam Passes"
                  style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "4px" }}>
                    Expiry Date (Optional):
                  </label>
                  <input
                    type="date"
                    value={formData.expiresAt}
                    onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                    style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "4px" }}>
                    Usage Limit (0 = Unlimited):
                  </label>
                  <input
                    type="number"
                    value={formData.usageLimit}
                    onChange={(e) => setFormData({ ...formData, usageLimit: Number(e.target.value) })}
                    style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "12px" }}>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  style={{ padding: "10px 18px", background: "#f1f5f9", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "13px", fontWeight: 700, cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: "10px 24px", background: "#d97706", color: "#fff", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: 700, cursor: "pointer" }}
                >
                  {editingCoupon ? "Save Changes" : "Create Coupon"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
