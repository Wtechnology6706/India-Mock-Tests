"use client";

import { useState, useEffect } from "react";
import type { WalletTransaction } from "../../lib/wallet-store";

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  userDisplayName?: string;
  initialBalance?: number | null;
  onBalanceUpdate?: (newBalance: number) => void;
}

export default function WalletModal({
  isOpen,
  onClose,
  userDisplayName = "Student",
  initialBalance = null,
  onBalanceUpdate,
}: WalletModalProps) {
  const [activeTab, setActiveTab] = useState<"topup" | "transactions">("topup");
  const [balance, setBalance] = useState<number>(initialBalance ?? 0);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [txFilter, setTxFilter] = useState<"all" | "credit" | "debit">("all");

  // Topup state
  const [topupAmount, setTopupAmount] = useState<number>(499);
  const [topupLoading, setTopupLoading] = useState(false);
  const [topupMsg, setTopupMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    if (initialBalance !== null && initialBalance !== undefined) {
      setBalance(initialBalance);
    }
  }, [initialBalance]);

  useEffect(() => {
    if (isOpen) {
      fetchWalletData();
    }
  }, [isOpen]);

  async function fetchWalletData() {
    setIsLoading(true);
    try {
      const res = await fetch("/api/wallet");
      const data = await res.json();
      if (data?.success) {
        if (data.wallet) {
          setBalance(data.wallet.balance);
          if (onBalanceUpdate) onBalanceUpdate(data.wallet.balance);
        }
        if (Array.isArray(data.transactions)) {
          setTransactions(data.transactions);
        }
      }
    } catch (err) {
      console.error("Failed to fetch wallet data:", err);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleWalletTopup(amount: number) {
    if (amount < 10) return;
    setTopupLoading(true);
    setTopupMsg(null);
    try {
      const res = await fetch("/api/wallet/topup/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });
      const data = await res.json();
      if (!data.success) {
        setTopupMsg({ text: data.error || "Top-up failed", type: "error" });
        setTopupLoading(false);
        return;
      }

      if (data.mode === "simulated") {
        const verifyRes = await fetch("/api/wallet/topup/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount,
            isSimulated: true,
            razorpayOrderId: data.orderId,
          }),
        });
        const verifyData = await verifyRes.json();
        if (verifyData.success) {
          setBalance(verifyData.newBalance);
          if (onBalanceUpdate) onBalanceUpdate(verifyData.newBalance);
          setTopupMsg({ text: `✓ ₹${amount} added to your wallet successfully!`, type: "success" });
          fetchWalletData();
          setTimeout(() => {
            setTopupMsg(null);
            setActiveTab("transactions");
          }, 1400);
        } else {
          setTopupMsg({ text: verifyData.error || "Verification failed", type: "error" });
        }
      } else if (data.mode === "razorpay") {
        if (!(window as any).Razorpay) {
          const script = document.createElement("script");
          script.src = "https://checkout.razorpay.com/v1/checkout.js";
          script.async = true;
          document.body.appendChild(script);
          await new Promise((resolve) => {
            script.onload = resolve;
          });
        }

        const options = {
          key: data.keyId,
          amount: data.amount,
          currency: data.currency,
          name: "Sarkari Practice",
          description: "Student Wallet Recharge",
          order_id: data.orderId,
          handler: async (response: any) => {
            try {
              const verifyRes = await fetch("/api/wallet/topup/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  amount,
                  razorpayOrderId: response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpaySignature: response.razorpay_signature,
                }),
              });
              const verifyData = await verifyRes.json();
              if (verifyData.success) {
                setBalance(verifyData.newBalance);
                if (onBalanceUpdate) onBalanceUpdate(verifyData.newBalance);
                setTopupMsg({ text: `✓ ₹${amount} added to your wallet successfully!`, type: "success" });
                fetchWalletData();
                setTimeout(() => {
                  setTopupMsg(null);
                  setActiveTab("transactions");
                }, 1400);
              } else {
                setTopupMsg({ text: verifyData.error || "Payment verification failed", type: "error" });
              }
            } catch (err: any) {
              setTopupMsg({ text: err.message || "Verification network error", type: "error" });
            }
          },
          prefill: {
            name: userDisplayName,
          },
          theme: { color: "#059669" },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      }
    } catch (err: any) {
      setTopupMsg({ text: err.message || "Network error", type: "error" });
    } finally {
      setTopupLoading(false);
    }
  }

  if (!isOpen) return null;

  const filteredTransactions = transactions.filter((tx) => {
    if (txFilter === "credit") return tx.type === "credit";
    if (txFilter === "debit") return tx.type === "debit";
    return true;
  });

  const totalCredits = transactions
    .filter((t) => t.type === "credit")
    .reduce((acc, t) => acc + t.amount, 0);

  const totalDebits = transactions
    .filter((t) => t.type === "debit")
    .reduce((acc, t) => acc + t.amount, 0);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15, 23, 42, 0.65)",
        backdropFilter: "blur(4px)",
        zIndex: 99999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#ffffff",
          borderRadius: "18px",
          maxWidth: "600px",
          width: "100%",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.35)",
          overflow: "hidden",
          animation: "modalFadeIn 0.2s ease-out",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div
          style={{
            padding: "20px 24px 16px",
            borderBottom: "1px solid #e2e8f0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "12px",
                background: "linear-gradient(135deg, #ecfdf5, #d1fae5)",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "20px",
              }}
            >
              <img src="/wallet.png" alt="Wallet" style={{ width: "22px", height: "22px", objectFit: "contain" }} />
            </span>
            <div>
              <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 800, color: "#0f172a" }}>
                Student Digital Wallet &amp; Passbook
              </h3>
              <p style={{ margin: "2px 0 0", fontSize: "0.82rem", color: "#64748b" }}>
                Instant checkout for test series, VIP passes &amp; full transaction records
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              border: "1px solid #e2e8f0",
              background: "#f8fafc",
              color: "#64748b",
              fontSize: "14px",
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ✕
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div style={{ padding: "20px 24px", overflowY: "auto", flex: 1 }}>
          {/* Main Wallet Balance Card */}
          <div
            style={{
              background: "linear-gradient(135deg, #064e3b 0%, #0f766e 50%, #047857 100%)",
              borderRadius: "16px",
              padding: "22px 24px",
              color: "#ffffff",
              marginBottom: "20px",
              boxShadow: "0 10px 25px -5px rgba(6, 78, 59, 0.4)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Background subtle glow */}
            <div
              style={{
                position: "absolute",
                right: "-20px",
                bottom: "-20px",
                width: "120px",
                height: "120px",
                borderRadius: "50%",
                background: "rgba(255, 255, 255, 0.08)",
                pointerEvents: "none",
              }}
            />

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
              <span style={{ fontSize: "0.74rem", letterSpacing: "1px", textTransform: "uppercase", opacity: 0.85, fontWeight: 700 }}>
                AVAILABLE WALLET BALANCE
              </span>
              <span
                style={{
                  background: "rgba(255, 255, 255, 0.2)",
                  padding: "3px 10px",
                  borderRadius: "999px",
                  fontSize: "0.72rem",
                  fontWeight: 800,
                }}
              >
                100% SECURE
              </span>
            </div>

            <div style={{ fontSize: "2.3rem", fontWeight: 900, letterSpacing: "-0.02em" }}>
              ₹{balance.toFixed(2)}
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: "14px",
                paddingTop: "12px",
                borderTop: "1px solid rgba(255, 255, 255, 0.2)",
                fontSize: "0.82rem",
                opacity: 0.9,
              }}
            >
              <span>Aspirant: <strong>{userDisplayName}</strong></span>
              <span>Total Recharged: <strong>₹{totalCredits.toFixed(0)}</strong></span>
            </div>
          </div>

          {/* Navigation Tabs (Top-up vs Transactions) */}
          <div
            style={{
              display: "flex",
              borderBottom: "2px solid #f1f5f9",
              marginBottom: "18px",
              gap: "8px",
            }}
          >
            <button
              type="button"
              onClick={() => setActiveTab("topup")}
              style={{
                padding: "10px 18px",
                border: "none",
                background: "none",
                fontSize: "0.92rem",
                fontWeight: 700,
                cursor: "pointer",
                color: activeTab === "topup" ? "#059669" : "#64748b",
                borderBottom: activeTab === "topup" ? "3px solid #059669" : "3px solid transparent",
                marginBottom: "-2px",
                transition: "all 0.15s ease",
              }}
            >
              💳 Add Money / Top-up
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("transactions")}
              style={{
                padding: "10px 18px",
                border: "none",
                background: "none",
                fontSize: "0.92rem",
                fontWeight: 700,
                cursor: "pointer",
                color: activeTab === "transactions" ? "#059669" : "#64748b",
                borderBottom: activeTab === "transactions" ? "3px solid #059669" : "3px solid transparent",
                marginBottom: "-2px",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                transition: "all 0.15s ease",
              }}
            >
              <span>📜 Passbook &amp; Transactions</span>
              <span
                style={{
                  background: activeTab === "transactions" ? "#ecfdf5" : "#f1f5f9",
                  color: activeTab === "transactions" ? "#065f46" : "#64748b",
                  padding: "1px 7px",
                  borderRadius: "999px",
                  fontSize: "0.75rem",
                  fontWeight: 800,
                }}
              >
                {transactions.length}
              </span>
            </button>
          </div>

          {/* TAB 1: ADD MONEY / TOP-UP */}
          {activeTab === "topup" && (
            <div>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: "#334155", marginBottom: "8px" }}>
                Select Top-up Amount:
              </label>

              {/* Quick Amount Chips */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", marginBottom: "14px" }}>
                {[100, 250, 499, 999, 1499, 2499].map((amt) => {
                  const isSelected = topupAmount === amt;
                  return (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setTopupAmount(amt)}
                      style={{
                        padding: "12px 8px",
                        borderRadius: "10px",
                        border: isSelected ? "2px solid #059669" : "1px solid #e2e8f0",
                        background: isSelected ? "#ecfdf5" : "#f8fafc",
                        color: isSelected ? "#065f46" : "#334155",
                        fontWeight: 800,
                        fontSize: "0.95rem",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                      }}
                    >
                      ₹{amt}
                    </button>
                  );
                })}
              </div>

              {/* Custom amount input */}
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#64748b", marginBottom: "6px" }}>
                  Or enter specific amount (₹10 – ₹50,000):
                </label>
                <div style={{ position: "relative" }}>
                  <span
                    style={{
                      position: "absolute",
                      left: "14px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      fontWeight: 800,
                      color: "#64748b",
                      fontSize: "1rem",
                    }}
                  >
                    ₹
                  </span>
                  <input
                    type="number"
                    min="10"
                    max="50000"
                    value={topupAmount}
                    onChange={(e) => setTopupAmount(Number(e.target.value))}
                    style={{
                      width: "100%",
                      padding: "12px 14px 12px 34px",
                      borderRadius: "10px",
                      border: "1px solid #cbd5e1",
                      fontSize: "1.05rem",
                      fontWeight: 800,
                      color: "#0f172a",
                      outline: "none",
                    }}
                    placeholder="Enter amount..."
                  />
                </div>
              </div>

              {/* Feedback Alert */}
              {topupMsg && (
                <div
                  style={{
                    padding: "12px 16px",
                    borderRadius: "10px",
                    marginBottom: "16px",
                    fontSize: "0.88rem",
                    fontWeight: 600,
                    background: topupMsg.type === "success" ? "#ecfdf5" : "#fef2f2",
                    color: topupMsg.type === "success" ? "#065f46" : "#991b1b",
                    border: `1px solid ${topupMsg.type === "success" ? "#a7f3d0" : "#fecaca"}`,
                  }}
                >
                  {topupMsg.text}
                </div>
              )}

              {/* Recharge Submit Button */}
              <button
                type="button"
                disabled={topupLoading || topupAmount < 10}
                onClick={() => handleWalletTopup(topupAmount)}
                style={{
                  width: "100%",
                  padding: "14px",
                  background: "linear-gradient(135deg, #059669, #047857)",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "10px",
                  fontSize: "1rem",
                  fontWeight: 800,
                  cursor: topupLoading || topupAmount < 10 ? "not-allowed" : "pointer",
                  boxShadow: "0 4px 14px rgba(5, 150, 105, 0.35)",
                  transition: "all 0.15s ease",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                }}
              >
                {topupLoading ? (
                  <>
                    <span className="spinner" style={{ width: "16px", height: "16px", border: "2px solid #fff", borderTopColor: "transparent", borderRadius: "50%", display: "inline-block", animation: "spin 0.8s linear infinite" }} />
                    <span>Processing Recharge...</span>
                  </>
                ) : (
                  <span>Recharge ₹{topupAmount} to Wallet →</span>
                )}
              </button>

              <div style={{ marginTop: "14px", textAlign: "center", fontSize: "0.78rem", color: "#64748b" }}>
                🔒 Instant Wallet Credit · Powered by UPI / QR / Net Banking / Razorpay
              </div>
            </div>
          )}

          {/* TAB 2: TRANSACTIONS & PASSBOOK */}
          {activeTab === "transactions" && (
            <div>
              {/* Filter Pills */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                <div style={{ display: "flex", gap: "6px" }}>
                  <button
                    type="button"
                    onClick={() => setTxFilter("all")}
                    style={{
                      padding: "4px 12px",
                      borderRadius: "999px",
                      fontSize: "0.78rem",
                      fontWeight: 700,
                      cursor: "pointer",
                      border: "1px solid",
                      borderColor: txFilter === "all" ? "#0f172a" : "#e2e8f0",
                      background: txFilter === "all" ? "#0f172a" : "#fff",
                      color: txFilter === "all" ? "#fff" : "#64748b",
                    }}
                  >
                    All ({transactions.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setTxFilter("credit")}
                    style={{
                      padding: "4px 12px",
                      borderRadius: "999px",
                      fontSize: "0.78rem",
                      fontWeight: 700,
                      cursor: "pointer",
                      border: "1px solid",
                      borderColor: txFilter === "credit" ? "#059669" : "#e2e8f0",
                      background: txFilter === "credit" ? "#ecfdf5" : "#fff",
                      color: txFilter === "credit" ? "#065f46" : "#64748b",
                    }}
                  >
                    + Credits
                  </button>
                  <button
                    type="button"
                    onClick={() => setTxFilter("debit")}
                    style={{
                      padding: "4px 12px",
                      borderRadius: "999px",
                      fontSize: "0.78rem",
                      fontWeight: 700,
                      cursor: "pointer",
                      border: "1px solid",
                      borderColor: txFilter === "debit" ? "#dc2626" : "#e2e8f0",
                      background: txFilter === "debit" ? "#fef2f2" : "#fff",
                      color: txFilter === "debit" ? "#991b1b" : "#64748b",
                    }}
                  >
                    - Debits
                  </button>
                </div>

                <button
                  type="button"
                  onClick={fetchWalletData}
                  style={{
                    background: "none",
                    border: "none",
                    fontSize: "0.78rem",
                    color: "#4338ca",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  🔄 Refresh
                </button>
              </div>

              {isLoading ? (
                <div style={{ padding: "30px", textAlign: "center", color: "#64748b" }}>
                  Loading transaction history...
                </div>
              ) : filteredTransactions.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {filteredTransactions.map((tx) => {
                    const isCredit = tx.type === "credit";
                    return (
                      <div
                        key={tx.id}
                        style={{
                          background: "#ffffff",
                          border: "1px solid #e2e8f0",
                          borderRadius: "12px",
                          padding: "12px 16px",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          gap: "12px",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <span
                            style={{
                              width: "36px",
                              height: "36px",
                              borderRadius: "50%",
                              background: isCredit ? "#dcfce7" : "#fee2e2",
                              color: isCredit ? "#15803d" : "#b91c1c",
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "16px",
                              fontWeight: 800,
                              flexShrink: 0,
                            }}
                          >
                            {isCredit ? "↓" : "↑"}
                          </span>

                          <div>
                            <strong style={{ fontSize: "0.9rem", color: "#0f172a", display: "block" }}>
                              {tx.description || (isCredit ? "Wallet Recharge" : "Mock Test Purchase")}
                            </strong>
                            <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "2px" }}>
                              <span>{new Date(tx.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                              {tx.referenceId && <span> • ID: {tx.referenceId.slice(0, 14)}</span>}
                            </div>
                          </div>
                        </div>

                        <div style={{ textAlign: "right" }}>
                          <strong
                            style={{
                              fontSize: "1rem",
                              color: isCredit ? "#15803d" : "#b91c1c",
                              display: "block",
                            }}
                          >
                            {isCredit ? "+" : "-"}₹{tx.amount.toFixed(2)}
                          </strong>
                          <span style={{ fontSize: "0.72rem", color: "#64748b" }}>
                            Bal: ₹{tx.balanceAfter.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div
                  style={{
                    padding: "36px 16px",
                    textAlign: "center",
                    background: "#f8fafc",
                    borderRadius: "12px",
                    border: "1px dashed #cbd5e1",
                  }}
                >
                  <span style={{ fontSize: "2rem", display: "block", marginBottom: "8px" }}>📜</span>
                  <h4 style={{ margin: "0 0 4px", fontSize: "0.95rem", color: "#334155" }}>
                    No Transactions Recorded Yet
                  </h4>
                  <p style={{ margin: "0 0 14px", fontSize: "0.82rem", color: "#64748b" }}>
                    When you recharge your wallet or purchase test series, full debit and credit receipts will appear here.
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab("topup")}
                    style={{
                      background: "#059669",
                      color: "#fff",
                      border: "none",
                      padding: "8px 16px",
                      borderRadius: "8px",
                      fontWeight: 700,
                      fontSize: "0.85rem",
                      cursor: "pointer",
                    }}
                  >
                    + Add Money Now
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
