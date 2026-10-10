"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type { AuthUser } from "../../lib/auth-store";
import Footer from "../components/Footer";

type CheckoutClientProps = {
  user: AuthUser | null;
};

type ActiveCoupon = {
  id: string;
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minOrderAmount: number;
  description: string;
};

type PlanData = {
  id: string;
  slug: string;
  name: string;
  description: string;
  amount: number;
  validityDays: number;
  features: string[];
};

export default function CheckoutClient({ user }: CheckoutClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialPlanSlug = searchParams.get("plan") === "sprint" ? "sprint" : "ultimate";
  const initialExam = searchParams.get("exam") || "bpsc-tre-4";

  const EXAM_OPTIONS = [
    { slug: "bpsc-tre-4", name: "BPSC TRE 4.0 (Teaching Recruitment Exam)" },
    { slug: "bihar-stet", name: "Bihar STET 2026 (Secondary Teacher Eligibility)" },
    { slug: "ctet", name: "CTET Paper I & II (Central Teacher Eligibility)" },
    { slug: "btet", name: "Bihar Teacher Eligibility Test (BTET)" },
    { slug: "uppsc-ro-aro", name: "UPPSC Review Officer & ARO" },
    { slug: "mppsc", name: "MPPSC State Service Preliminary Exam" },
    { slug: "rajasthan-reet", name: "REET / Rajasthan Teacher Eligibility" },
  ];

  const [plans, setPlans] = useState<Record<string, PlanData>>({
    sprint: {
      id: "1",
      slug: "sprint",
      name: "Single Exam Sprint Pass",
      description: "Targeted practice pass for 1 focused examination series.",
      amount: 499,
      validityDays: 90,
      features: [
        "Full access to 1 targeted exam category (e.g. BPSC TRE 4.0)",
        "30+ Full Length Mock Tests + Chapter-wise drills",
        "Detailed AI performance analytics & rank prediction",
        "Bilingual Hindi & English test modes",
        "Unlimited test re-attempts & revision bookmarking",
      ],
    },
    ultimate: {
      id: "2",
      slug: "ultimate",
      name: "All-Exam Ultimate VIP Pass",
      description: "All-inclusive pass for every state PSC, TET, and national exam.",
      amount: 999,
      validityDays: 180,
      features: [
        "All-Access Pass to EVERY Exam Category & PYQs",
        "500+ Complete Mock Tests, Subject Quizzes & PYQs",
        "Full PYQ PDF Hub with high-speed download & full-screen reader",
        "Priority Doubt Solving & Video Solutions access",
        "VIP Candidate Badge & 180-day extended validity",
      ],
    },
  });

  const [selectedPlan, setSelectedPlan] = useState<"sprint" | "ultimate">(initialPlanSlug);
  const [targetExamSlug, setTargetExamSlug] = useState<string>(initialExam);
  const [activeCoupons, setActiveCoupons] = useState<ActiveCoupon[]>([]);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<ActiveCoupon | null>(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponError, setCouponError] = useState("");
  const [couponSuccessMsg, setCouponSuccessMsg] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(true);

  // Wallet
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<"razorpay" | "wallet">("razorpay");

  // Payment process states
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState<string>("");
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [successOrder, setSuccessOrder] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [logoImageUrl, setLogoImageUrl] = useState("");
  const [portalName, setPortalName] = useState("India Mock Tests");

  // Fetch dynamic plans, active coupons, wallet balance, and site branding
  useEffect(() => {
    // 1. Fetch site config
    fetch("/api/admin/config")
      .then((res) => res.json())
      .then((data) => {
        if (data?.config?.logoImageUrl) setLogoImageUrl(data.config.logoImageUrl);
        if (data?.config?.portalName) setPortalName(data.config.portalName);
      })
      .catch(() => {});

    // 2. Fetch DB plans
    fetch("/api/plans")
      .then((res) => res.json())
      .then((data) => {
        if (data?.success && Array.isArray(data.plans) && data.plans.length > 0) {
          const map: Record<string, PlanData> = {};
          data.plans.forEach((p: PlanData) => {
            map[p.slug] = p;
          });
          setPlans((prev) => ({ ...prev, ...map }));
        }
      })
      .catch(() => {});

    // 3. Fetch active coupons
    fetch("/api/coupons/active")
      .then((res) => res.json())
      .then((data) => {
        if (data?.success && Array.isArray(data.coupons)) {
          setActiveCoupons(data.coupons);
        }
      })
      .catch(() => {});

    // 4. Fetch user's wallet
    if (user) {
      fetch("/api/wallet")
        .then((res) => res.json())
        .then((data) => {
          if (data?.success && data.wallet) {
            setWalletBalance(data.wallet.balance);
          }
        })
        .catch(() => {});
    }

    // 5. Load Razorpay script
    if (typeof window !== "undefined" && !(window as any).Razorpay) {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, [user]);

  const activePlan = plans[selectedPlan] || plans.ultimate;
  const originalPrice = activePlan.amount;
  const discount = appliedCoupon ? couponDiscount : 0;
  const finalPrice = Math.max(0, originalPrice - discount);
  const taxPortion = Math.round((finalPrice * 18) / 118);

  async function handleApplyCoupon(codeToApply?: string) {
    const code = (codeToApply || couponCode).trim().toUpperCase();
    setCouponError("");
    setCouponSuccessMsg("");

    if (!code) {
      setCouponError("Please enter a coupon code.");
      return;
    }

    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, amount: originalPrice }),
      });
      const data = await res.json();

      if (data.valid && data.coupon) {
        setAppliedCoupon(data.coupon);
        setCouponDiscount(data.discountAmount || 0);
        setCouponCode(data.coupon.code);
        setCouponSuccessMsg(data.message || `Coupon ${data.coupon.code} applied!`);
      } else {
        setAppliedCoupon(null);
        setCouponDiscount(0);
        setCouponError(data.message || `Coupon '${code}' is invalid or expired.`);
      }
    } catch {
      setCouponError("Failed to validate coupon code. Please try again.");
    }
  }

  function removeCoupon() {
    setAppliedCoupon(null);
    setCouponDiscount(0);
    setCouponCode("");
    setCouponError("");
    setCouponSuccessMsg("");
  }

  // Wallet Checkout Direct Action
  async function handleWalletCheckout() {
    setErrorMessage(null);

    if (!agreedToTerms) {
      setErrorMessage("Please accept the terms and conditions to proceed.");
      return;
    }

    if (!user) {
      router.push(`/login?redirect=/checkout?plan=${selectedPlan}`);
      return;
    }

    if (walletBalance < finalPrice) {
      setErrorMessage(
        `Insufficient wallet balance (₹${walletBalance.toFixed(2)}). Need ₹${finalPrice.toFixed(2)}. Please recharge your wallet or select Razorpay.`
      );
      return;
    }

    setIsProcessing(true);
    setProcessingStep("Processing payment from your Student Wallet...");

    try {
      const res = await fetch("/api/checkout/wallet-pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planSlug: selectedPlan,
          couponCode: appliedCoupon ? appliedCoupon.code : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Wallet payment transaction failed.");
      }

      setWalletBalance((prev) => Math.max(0, prev - finalPrice));
      setSuccessOrder(data.order);
      setPaymentSuccess(true);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to complete wallet checkout.");
    } finally {
      setIsProcessing(false);
      setProcessingStep("");
    }
  }

  // Razorpay Checkout Action
  async function handleRazorpayPayment() {
    setErrorMessage(null);

    if (!agreedToTerms) {
      setErrorMessage("Please check and accept the Terms & Conditions, Privacy Policy, and Refund Policy before proceeding.");
      return;
    }

    if (!user) {
      router.push(`/login?redirect=/checkout?plan=${selectedPlan}`);
      return;
    }

    setIsProcessing(true);
    setProcessingStep("Connecting to payment gateway...");

    try {
      const selectedExamObj = EXAM_OPTIONS.find((e) => e.slug === targetExamSlug);
      const chosenExamName = selectedPlan === "sprint" ? (selectedExamObj?.name || "Target Exam Series") : undefined;
      const chosenExamSlug = selectedPlan === "sprint" ? targetExamSlug : undefined;

      const orderRes = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tier: selectedPlan,
          planName: activePlan.name,
          amount: finalPrice,
          targetExamSlug: chosenExamSlug,
          targetExamName: chosenExamName,
        }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok || !orderData.orderId) {
        throw new Error(orderData.error || "Failed to initialize order with payment gateway.");
      }

      setProcessingStep("Opening secure payment interface...");

      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency || "INR",
        name: "India Mock Tests",
        description: `${activePlan.name} (${activePlan.validityDays} Days)${chosenExamName ? ` - ${chosenExamName}` : ""}`,
        image: "https://cdn.razorpay.com/static/assets/logo/payment_gateway.png",
        order_id: orderData.orderId,
        handler: async function (response: any) {
          setIsProcessing(true);
          setProcessingStep("Verifying payment security signature...");

          const verifyRes = await fetch("/api/razorpay/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id || orderData.orderId,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              tier: selectedPlan,
              planName: activePlan.name,
              amount: finalPrice,
              durationDays: activePlan.validityDays,
              couponCode: appliedCoupon ? appliedCoupon.code : undefined,
              targetExamSlug: chosenExamSlug,
              targetExamName: chosenExamName,
            }),
          });

          const verifyData = await verifyRes.json();
          if (verifyRes.ok && verifyData.success) {
            setSuccessOrder(verifyData.order);
            setPaymentSuccess(true);
          } else {
            setErrorMessage(verifyData.error || "Payment signature verification failed.");
          }
          setIsProcessing(false);
        },
        prefill: {
          name: user.displayName || "",
          email: user.email || "",
        },
        theme: {
          color: "#0f766e",
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
            setProcessingStep("");
          },
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", function (resp: any) {
        setIsProcessing(false);
        setErrorMessage(resp.error?.description || "Payment was not completed. Please try again.");
      });
      rzp.open();
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "An unexpected error occurred connecting to gateway.");
      setIsProcessing(false);
    }
  }

  // ---------------- SUCCESS SCREEN ----------------
  if (paymentSuccess && successOrder) {
    return (
      <div className="checkout-page-container">
        <header className="checkout-topbar">
          <Link href="/" className="checkout-logo" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
            {logoImageUrl ? (
              <img
                src={logoImageUrl}
                alt={portalName}
                style={{ height: "40px", maxHeight: "46px", maxWidth: "180px", width: "auto", objectFit: "contain", display: "block" }}
                onError={() => setLogoImageUrl("")}
              />
            ) : (
              <>
                <span className="logo-mark">{portalName.slice(0, 1).toUpperCase()}</span>
                <span>{portalName}<span className="logo-dot">.</span></span>
              </>
            )}
          </Link>
          <div className="checkout-security-tag">
            <span>✓ Verified Secure Payment</span>
          </div>
        </header>

        <main className="checkout-success-wrap">
          <div className="checkout-success-card">
            <div className="success-badge-icon">✓</div>
            <span className="success-kicker">PAYMENT CONFIRMED & ACTIVATED</span>
            <h2>Thank You! Your VIP Pass is Live</h2>
            <p className="success-sub">
              Your mock tests and performance dashboard have been unlocked immediately. A digital tax invoice has been generated for your records.
            </p>

            <div className="success-receipt-box">
              <div className="receipt-row">
                <span>Order Reference:</span>
                <strong>{successOrder.orderNumber || "ORD-SUCCESS"}</strong>
              </div>
              <div className="receipt-row">
                <span>Invoice Number:</span>
                <strong>{successOrder.invoiceNumber || "INV-SUCCESS"}</strong>
              </div>
              <div className="receipt-row">
                <span>Plan Subscribed:</span>
                <strong>{successOrder.planName || activePlan.name}</strong>
              </div>
              <div className="receipt-row">
                <span>Amount Paid:</span>
                <strong className="receipt-price">₹{finalPrice.toFixed(2)}</strong>
              </div>
              <div className="receipt-row">
                <span>Payment Method:</span>
                <strong>{paymentMethod === "wallet" ? "Student Wallet Balance" : "Razorpay (UPI / Card / NetBanking)"}</strong>
              </div>
              <div className="receipt-row">
                <span>Validity Duration:</span>
                <strong>{activePlan.validityDays} Days Full Access</strong>
              </div>
            </div>

            <div className="success-actions-row">
              <Link href="/dashboard" className="btn-primary-success">
                Go to Practice Dashboard →
              </Link>
              <Link href="/pyq" className="btn-secondary-success">
                Explore PYQ Question Papers
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // ---------------- MAIN CHECKOUT VIEW ----------------
  return (
    <div className="checkout-page-container">
      {/* Top Header */}
      <header className="checkout-topbar">
        <Link href="/" className="checkout-logo" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
          {logoImageUrl ? (
            <img
              src={logoImageUrl}
              alt={portalName}
              style={{ height: "40px", maxHeight: "46px", maxWidth: "180px", width: "auto", objectFit: "contain", display: "block" }}
              onError={() => setLogoImageUrl("")}
            />
          ) : (
            <>
              <span className="logo-mark">{portalName.slice(0, 1).toUpperCase()}</span>
              <span>{portalName}<span className="logo-dot">.</span></span>
            </>
          )}
        </Link>
        <div className="checkout-security-tag">
          <span>🔒 256-Bit SSL Encrypted Checkout</span>
        </div>
        <Link href="/pricing" className="checkout-cancel-link">
          ✕ Cancel & Return
        </Link>
      </header>

      <main className="checkout-main-grid">
        {/* Left Column: Plan Selection & Details */}
        <section className="checkout-left-col">
          <div className="checkout-section-header">
            <span className="kicker">STEP 1 OF 2</span>
            <h1>Select Your VIP Subscription Plan</h1>
            <p>Admin-verified pricing with instant test activation and full revision analytics.</p>
          </div>

          {/* Plan Selector Toggle Tabs */}
          <div className="plan-selector-cards">
            {Object.values(plans).map((plan) => {
              const isSelected = selectedPlan === plan.slug;
              return (
                <div
                  key={plan.slug}
                  className={`plan-card-option ${isSelected ? "selected" : ""}`}
                  onClick={() => setSelectedPlan(plan.slug as any)}
                >
                  <div className="plan-card-top">
                    <div className="plan-card-radio">
                      <span className={`radio-dot ${isSelected ? "checked" : ""}`} />
                    </div>
                    <div className="plan-card-info">
                      <div className="plan-card-header-row">
                        <h3>{plan.name}</h3>
                        {plan.slug === "ultimate" && (
                          <span className="plan-pill-highlight">MOST POPULAR</span>
                        )}
                      </div>
                      <p className="plan-duration-text">{plan.validityDays} Days Validity</p>
                    </div>
                    <div className="plan-card-pricing">
                      <span className="plan-price-amount">₹{plan.amount}</span>
                      <span className="plan-price-label">All-Inclusive</span>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="plan-card-features-tray">
                      <ul>
                        {plan.features.map((f, i) => (
                          <li key={i}>✓ {f}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* If Single Sprint is selected, choose target exam */}
          {selectedPlan === "sprint" && (
            <div className="exam-selection-box" style={{ marginTop: "20px" }}>
              <label htmlFor="target-exam-select">
                <strong>Target Examination Series:</strong>
                <span>Select the specific exam you are preparing for</span>
              </label>
              <select
                id="target-exam-select"
                value={targetExamSlug}
                onChange={(e) => setTargetExamSlug(e.target.value)}
                className="checkout-exam-dropdown"
              >
                {EXAM_OPTIONS.map((exam) => (
                  <option key={exam.slug} value={exam.slug}>
                    {exam.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Payment Method Selector (Razorpay vs Student Wallet) */}
          <div style={{ marginTop: "24px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "20px" }}>
            <h3 style={{ fontSize: "15px", fontWeight: 800, color: "#0f172a", margin: "0 0 14px" }}>
              Choose Payment Method
            </h3>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              {/* Option 1: Gateway */}
              <div
                onClick={() => setPaymentMethod("razorpay")}
                style={{
                  padding: "16px",
                  borderRadius: "12px",
                  border: paymentMethod === "razorpay" ? "2px solid #0f766e" : "1px solid #cbd5e1",
                  background: paymentMethod === "razorpay" ? "rgba(15, 118, 110, 0.05)" : "#f8fafc",
                  cursor: "pointer",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                  <span style={{ fontSize: "18px" }}>💳</span>
                  <strong style={{ fontSize: "14px", color: "#0f172a" }}>Razorpay / UPI</strong>
                </div>
                <p style={{ fontSize: "12px", color: "#64748b", margin: 0 }}>GPay, PhonePe, Paytm, Cards & NetBanking</p>
              </div>

              {/* Option 2: Wallet */}
              <div
                onClick={() => setPaymentMethod("wallet")}
                style={{
                  padding: "16px",
                  borderRadius: "12px",
                  border: paymentMethod === "wallet" ? "2px solid #059669" : "1px solid #cbd5e1",
                  background: paymentMethod === "wallet" ? "rgba(16, 185, 129, 0.08)" : "#f8fafc",
                  cursor: "pointer",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ fontSize: "18px" }}>👛</span>
                    <strong style={{ fontSize: "14px", color: "#065f46" }}>Student Wallet</strong>
                  </div>
                  <span style={{ fontSize: "13px", fontWeight: 800, color: walletBalance >= finalPrice ? "#059669" : "#dc2626" }}>
                    ₹{walletBalance.toFixed(2)}
                  </span>
                </div>
                <p style={{ fontSize: "11px", color: "#64748b", margin: 0 }}>
                  {walletBalance >= finalPrice
                    ? "✓ Sufficient Balance · 1-Click Pay"
                    : "⚠️ Low Balance"}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Right Column: Order Summary, Active Coupons & Payment Button */}
        <section className="checkout-right-col">
          <div className="order-summary-card">
            <h3>Order Breakdown</h3>

            <div className="summary-item-row">
              <span className="summary-item-name">
                {activePlan.name} ({activePlan.validityDays} Days)
              </span>
              <span className="summary-item-val">₹{originalPrice.toFixed(2)}</span>
            </div>

            {/* Active Coupons Carousel / Chips */}
            <div style={{ margin: "16px 0", padding: "14px", background: "#f8fafc", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <span style={{ fontSize: "12px", fontWeight: 700, color: "#334155" }}>
                  🏷️ Available Coupons ({activeCoupons.length})
                </span>
                <span style={{ fontSize: "11px", color: "#64748b" }}>Admin Verified</span>
              </div>

              {activeCoupons.length > 0 ? (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {activeCoupons.map((cpn) => (
                    <button
                      key={cpn.id}
                      type="button"
                      onClick={() => handleApplyCoupon(cpn.code)}
                      style={{
                        padding: "5px 10px",
                        fontSize: "11px",
                        fontWeight: 800,
                        borderRadius: "6px",
                        border: appliedCoupon?.code === cpn.code ? "1px solid #059669" : "1px dashed #cbd5e1",
                        background: appliedCoupon?.code === cpn.code ? "#ecfdf5" : "#fff",
                        color: appliedCoupon?.code === cpn.code ? "#047857" : "#0f766e",
                        cursor: "pointer",
                      }}
                      title={cpn.description}
                    >
                      {cpn.code} ({cpn.discountType === "percentage" ? `${cpn.discountValue}% OFF` : `₹${cpn.discountValue} OFF`})
                    </button>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: "12px", color: "#64748b" }}>No active coupons available currently.</div>
              )}
            </div>

            {/* Coupon Code Input */}
            <div className="coupon-box">
              <div className="coupon-input-group">
                <input
                  type="text"
                  placeholder="Enter coupon code..."
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  disabled={Boolean(appliedCoupon)}
                />
                {appliedCoupon ? (
                  <button type="button" onClick={removeCoupon} className="btn-coupon-remove">
                    Remove
                  </button>
                ) : (
                  <button type="button" onClick={() => handleApplyCoupon()} className="btn-coupon-apply">
                    Apply
                  </button>
                )}
              </div>
              {couponError && <p className="coupon-error-msg">{couponError}</p>}
              {couponSuccessMsg && <p style={{ color: "#059669", fontSize: "12px", margin: "6px 0 0", fontWeight: 600 }}>{couponSuccessMsg}</p>}
            </div>

            {/* Applied Discount Row */}
            {appliedCoupon && (
              <div className="summary-item-row discount-row">
                <span>Coupon Discount ({appliedCoupon.code})</span>
                <span className="discount-amount">- ₹{couponDiscount.toFixed(2)}</span>
              </div>
            )}

            <div className="summary-divider" />

            {/* Total Row */}
            <div className="summary-total-row">
              <div>
                <strong className="total-label">Total Payable</strong>
                <span className="total-tax-note">Includes 18% GST (₹{taxPortion.toFixed(2)})</span>
              </div>
              <strong className="total-amount">₹{finalPrice.toFixed(2)}</strong>
            </div>

            {/* Terms Checkbox */}
            <div className="terms-checkbox-wrap">
              <label>
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                />
                <span>
                  I agree to the <Link href="/terms">Terms & Conditions</Link>, <Link href="/privacy">Privacy Policy</Link>, and <Link href="/refund">Refund Policy</Link>.
                </span>
              </label>
            </div>

            {/* Error banner */}
            {errorMessage && (
              <div className="checkout-error-banner">
                <span>⚠️ {errorMessage}</span>
              </div>
            )}

            {/* Primary Action Button */}
            {paymentMethod === "wallet" ? (
              <button
                type="button"
                className="btn-pay-razorpay"
                disabled={isProcessing || !agreedToTerms || walletBalance < finalPrice}
                onClick={handleWalletCheckout}
                style={{
                  background: walletBalance >= finalPrice ? "linear-gradient(135deg, #059669, #047857)" : "#94a3b8",
                }}
              >
                {isProcessing
                  ? processingStep || "Processing..."
                  : walletBalance >= finalPrice
                  ? `Pay ₹${finalPrice.toFixed(2)} from Student Wallet →`
                  : `Insufficient Wallet Balance (₹${walletBalance.toFixed(2)})`}
              </button>
            ) : (
              <button
                type="button"
                className="btn-pay-razorpay"
                disabled={isProcessing || !agreedToTerms}
                onClick={handleRazorpayPayment}
              >
                {isProcessing ? processingStep || "Processing..." : `Pay ₹${finalPrice.toFixed(2)} via Razorpay →`}
              </button>
            )}

            <div className="checkout-trust-footer">
              <span>🔒 100% Secure Checkout · Instant Subscription Activation</span>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
