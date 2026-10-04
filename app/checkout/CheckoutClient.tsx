"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type { AuthUser } from "../../lib/auth-store";
import Footer from "../components/Footer";

type CheckoutClientProps = {
  user: AuthUser | null;
};

export default function CheckoutClient({ user }: CheckoutClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialPlan = searchParams.get("plan") === "sprint" ? "sprint" : "ultimate";
  const initialExam = searchParams.get("exam") || "bpsc-tre-4";

  const EXAM_OPTIONS = [
    { slug: "bpsc-tre-4", name: "BPSC TRE 4.0 (Teaching Recruitment Exam)" },
    { slug: "bihar-stet", name: "Bihar STET 2026 (Secondary Teacher Eligibility)" },
    { slug: "ctet", name: "CTET Paper I & II (Central Teacher Eligibility)" },
    { slug: "uppsc-ro-aro", name: "UPPSC Review Officer & ARO" },
    { slug: "mppsc", name: "MPPSC State Service Preliminary Exam" },
    { slug: "rajasthan-reet", name: "REET / Rajasthan Teacher Eligibility" },
  ];

  const [selectedPlan, setSelectedPlan] = useState<"sprint" | "ultimate">(initialPlan);
  const [targetExamSlug, setTargetExamSlug] = useState<string>(initialExam);
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponError, setCouponError] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(true);

  // Payment process states
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState<string>("");
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [successOrder, setSuccessOrder] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  // Load official Razorpay Checkout SDK
  useEffect(() => {
    if (typeof window !== "undefined") {
      if ((window as any).Razorpay) {
        setRazorpayLoaded(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => setRazorpayLoaded(true);
      script.onerror = () => setErrorMessage("Failed to load Razorpay SDK. Please check your internet connection.");
      document.body.appendChild(script);
    }
  }, []);

  const planDetails = {
    sprint: {
      name: "Single Exam Sprint Pass",
      tier: "sprint" as const,
      basePrice: 499,
      durationDays: 90,
      durationLabel: "3 Months (90 Days)",
      badge: "Targeted Focus",
      features: [
        "Full access to 1 selected exam test series",
        "Complete question bank & sectional drills",
        "Standard answer explanations & key",
        "Timed CBT mock test engine with review palette",
        "Instant score & accuracy breakdown",
      ],
    },
    ultimate: {
      name: "All-Exam Ultimate VIP Pass",
      tier: "ultimate" as const,
      basePrice: 999,
      durationDays: 180,
      durationLabel: "6 Months (180 Days)",
      badge: "Most Popular · Complete Access",
      features: [
        "Unlimited access to ALL exams (BPSC, STET, CTET & State PSCs)",
        "Every full-length mock & upcoming edition automatically unlocked",
        "In-depth bilingual solutions & pedagogy notes",
        "Real-time All-India percentile & negative marking analytics",
        "Priority exam request & ad-free preparation",
        "Uncapped mock test retakes & performance comparisons",
      ],
    },
  };

  const activePlan = planDetails[selectedPlan];
  const originalPrice = activePlan.basePrice;
  const discount = couponApplied ? couponDiscount : 0;
  const finalPrice = Math.max(0, originalPrice - discount);
  const taxPortion = Math.round((finalPrice * 18) / 118);

  function applyCoupon() {
    setCouponError("");
    const code = couponCode.trim().toUpperCase();
    if (!code) return;
    if (code === "INDIAMOCK100" || code === "FIRST100" || code === "VIP100") {
      setCouponApplied(true);
      setCouponDiscount(100);
    } else if (code === "SAVEMORE" || code === "BPSC50") {
      setCouponApplied(true);
      setCouponDiscount(50);
    } else {
      setCouponError("Invalid coupon code. Try 'INDIAMOCK100' for ₹100 off.");
    }
  }

  function removeCoupon() {
    setCouponApplied(false);
    setCouponDiscount(0);
    setCouponCode("");
    setCouponError("");
  }

  // Official Razorpay Checkout Launcher
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
    setProcessingStep("Connecting to Razorpay...");

    try {
      const selectedExamObj = EXAM_OPTIONS.find((e) => e.slug === targetExamSlug);
      const chosenExamName = selectedPlan === "sprint" ? (selectedExamObj?.name || "Target Exam Series") : undefined;
      const chosenExamSlug = selectedPlan === "sprint" ? targetExamSlug : undefined;

      // Step 1: Create an authentic order on Razorpay backend
      const orderRes = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tier: activePlan.tier,
          planName: activePlan.name,
          amount: finalPrice,
          targetExamSlug: chosenExamSlug,
          targetExamName: chosenExamName,
        }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok || !orderData.orderId) {
        throw new Error(orderData.error || "Failed to initialize order with Razorpay.");
      }

      if (!(window as any).Razorpay) {
        throw new Error("Razorpay payment SDK is still loading. Please try again in a moment.");
      }

      setProcessingStep("Opening Razorpay payment window...");

      // Step 2: Open official Razorpay modal
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency || "INR",
        name: "India Mock Tests VIP",
        description: `${activePlan.name} (${activePlan.durationLabel})${chosenExamName ? ` - ${chosenExamName}` : ""}`,
        image: "https://cdn.razorpay.com/static/assets/logo/payment_gateway.png",
        order_id: orderData.orderId,
        handler: async function (response: any) {
          setIsProcessing(true);
          setProcessingStep("Verifying payment signature with Razorpay...");

          // Step 3: Server-side cryptographic HMAC-SHA256 signature verification
          const verifyRes = await fetch("/api/razorpay/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id || orderData.orderId,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              tier: activePlan.tier,
              planName: activePlan.name,
              amount: finalPrice,
              durationDays: activePlan.durationDays,
              couponCode: couponApplied ? couponCode.trim().toUpperCase() : undefined,
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
          color: "#1e3a34",
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
      setErrorMessage(err.message || "An unexpected error occurred connecting to Razorpay.");
      setIsProcessing(false);
    }
  }

  return (
    <div className="checkout-page-container">
      {/* Top Header */}
      <header className="checkout-topbar">
        <Link href="/" className="checkout-logo">
          <span className="logo-mark">I</span>
          <span>
            India Mock Tests<span className="logo-dot">.</span>
          </span>
        </Link>
        <div className="checkout-security-tag">
          <span>🔒 Official Razorpay 256-Bit SSL Encrypted Checkout</span>
        </div>
        <Link href="/pricing" className="checkout-cancel-link">
          ✕ Cancel & Return
        </Link>
      </header>

      {paymentSuccess ? (
        /* Success Screen */
        <div className="checkout-success-view">
          <div className="success-card">
            <div className="success-icon-wrap">
              <span className="success-check">✓</span>
            </div>
            <span className="kicker" style={{ color: "#166534" }}>
              PAYMENT VERIFIED · VIP PASS ACTIVE
            </span>
            <h1>Payment Successful!</h1>
            <p className="success-desc">
              Your payment of <strong>₹{finalPrice}</strong> via Razorpay was successfully verified.
              Your account now has instant full access to all mock tests.
            </p>

            <div className="receipt-box">
              <div className="receipt-row">
                <span>Order Reference</span>
                <strong>{successOrder?.orderNumber || "ORD-RZP"}</strong>
              </div>
              <div className="receipt-row">
                <span>Invoice ID</span>
                <strong>{successOrder?.invoiceNumber || "INV-RZP"}</strong>
              </div>
              <div className="receipt-row">
                <span>Subscription Plan</span>
                <strong style={{ color: "#b94a2b" }}>{activePlan.name}</strong>
              </div>
              <div className="receipt-row">
                <span>Validity Duration</span>
                <strong>{activePlan.durationLabel}</strong>
              </div>
              <div className="receipt-row">
                <span>Payment Gateway</span>
                <strong>Razorpay (Live/Test Verified)</strong>
              </div>
              <div className="receipt-row">
                <span>Amount Paid</span>
                <strong style={{ fontSize: "1.1rem", color: "#1e3a34" }}>₹{finalPrice}</strong>
              </div>
            </div>

            <div className="success-actions">
              <Link href="/dashboard" className="btn-success-primary">
                Go to My Dashboard →
              </Link>
              <Link href="/exams" className="btn-success-secondary">
                Explore All Mock Tests
              </Link>
            </div>
          </div>
        </div>
      ) : (
        /* Main Checkout Form View */
        <main className="checkout-main-grid">
          {/* Left Column: Plan & Pricing Summary */}
          <section className="checkout-summary-col">
            <div className="plan-selector-box">
              <span className="kicker">SELECT YOUR PASS</span>
              <div className="plan-toggle-cards">
                <button
                  type="button"
                  className={`plan-toggle-card ${selectedPlan === "ultimate" ? "active" : ""}`}
                  onClick={() => setSelectedPlan("ultimate")}
                >
                  <div className="toggle-badge">RECOMMENDED</div>
                  <div className="toggle-header">
                    <strong>All-Exam Ultimate VIP</strong>
                    <span className="toggle-price">₹999</span>
                  </div>
                  <small>6 Months · All Exams Unlocked</small>
                </button>

                <button
                  type="button"
                  className={`plan-toggle-card ${selectedPlan === "sprint" ? "active" : ""}`}
                  onClick={() => setSelectedPlan("sprint")}
                >
                  <div className="toggle-header">
                    <strong>Single Exam Sprint</strong>
                    <span className="toggle-price">₹499</span>
                  </div>
                  <small>3 Months · 1 Focused Exam Series</small>
                </button>
              </div>

              {selectedPlan === "sprint" && (
                <div
                  style={{
                    marginTop: "16px",
                    background: "#eff6ff",
                    border: "1px solid #bfdbfe",
                    borderRadius: "10px",
                    padding: "16px",
                  }}
                >
                  <label
                    htmlFor="target-exam-select"
                    style={{
                      display: "block",
                      fontSize: "0.85rem",
                      fontWeight: 700,
                      color: "#1e3a8a",
                      marginBottom: "6px",
                    }}
                  >
                    🎯 Select Target Exam Series for this Sprint Pass:
                  </label>
                  <select
                    id="target-exam-select"
                    value={targetExamSlug}
                    onChange={(e) => setTargetExamSlug(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: "6px",
                      border: "1px solid #93c5fd",
                      background: "#ffffff",
                      fontSize: "0.88rem",
                      fontWeight: 600,
                      color: "#1e293b",
                    }}
                  >
                    {EXAM_OPTIONS.map((exam) => (
                      <option key={exam.slug} value={exam.slug}>
                        {exam.name}
                      </option>
                    ))}
                  </select>
                  <small style={{ display: "block", marginTop: "6px", color: "#2563eb", fontSize: "0.78rem" }}>
                    ℹ️ This pass will grant full access exclusively to mock tests belonging to the chosen exam series.
                  </small>
                </div>
              )}
            </div>

            {/* Selected Plan Details Card */}
            <div className="selected-plan-card">
              <div className="plan-header-row">
                <div>
                  <span className="plan-pill-tag">{activePlan.badge}</span>
                  <h2>{activePlan.name}</h2>
                </div>
                <div className="plan-big-price">
                  <span>₹{finalPrice}</span>
                  <small>{activePlan.durationLabel}</small>
                </div>
              </div>

              <ul className="plan-feature-list">
                {activePlan.features.map((feat, idx) => (
                  <li key={idx}>
                    <span className="check-mark">✓</span>
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Coupon Code Section */}
            <div className="coupon-box">
              <label htmlFor="coupon">Apply Promo / Discount Code</label>
              <div className="coupon-input-group">
                <input
                  id="coupon"
                  type="text"
                  placeholder="e.g. INDIAMOCK100"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  disabled={couponApplied}
                />
                {couponApplied ? (
                  <button type="button" className="btn-coupon-remove" onClick={removeCoupon}>
                    Remove
                  </button>
                ) : (
                  <button type="button" className="btn-coupon-apply" onClick={applyCoupon}>
                    Apply
                  </button>
                )}
              </div>
              {couponApplied && (
                <span className="coupon-success-msg">
                  ✓ Code applied! You saved ₹{couponDiscount} on this order.
                </span>
              )}
              {couponError && <span className="coupon-error-msg">{couponError}</span>}
            </div>

            {/* Price Breakdown */}
            <div className="order-breakdown-card">
              <h3>Order Price Summary</h3>
              <div className="breakdown-row">
                <span>Base Price ({activePlan.durationLabel})</span>
                <span>₹{originalPrice}</span>
              </div>
              {couponApplied && (
                <div className="breakdown-row discount-row">
                  <span>Coupon Discount</span>
                  <span>- ₹{couponDiscount}</span>
                </div>
              )}
              <div className="breakdown-row tax-row">
                <span>18% GST (CGST 9% + SGST 9%)</span>
                <span>Included (₹{taxPortion})</span>
              </div>
              <div className="breakdown-divider" />
              <div className="breakdown-total-row">
                <div>
                  <strong>Total Amount Payable</strong>
                  <small>Inclusive of all applicable taxes</small>
                </div>
                <strong>₹{finalPrice}</strong>
              </div>
            </div>

            <div className="moneyback-guarantee-note">
              <span>🛡</span>
              <p>
                <strong>Risk-Free Guarantee:</strong> 100% money-back guarantee within 48 hours if you
                are not satisfied with our practice test quality.
              </p>
            </div>
          </section>

          {/* Right Column: Dedicated Razorpay Gateway */}
          <section className="checkout-payment-col">
            <div className="gateway-container">
              <div className="gateway-header">
                <div>
                  <span className="kicker">OFFICIAL PAYMENT GATEWAY</span>
                  <h2>Razorpay Secure Checkout</h2>
                </div>
                <div className="gateway-amount-badge">
                  <small>Total to Pay</small>
                  <strong>₹{finalPrice}</strong>
                </div>
              </div>

              {!user && (
                <div className="login-prompt-banner">
                  <span>⚠️ You are not logged in.</span>
                  <p>
                    Please{" "}
                    <Link href={`/login?redirect=/checkout?plan=${selectedPlan}`}>
                      <strong>log in to your account</strong>
                    </Link>{" "}
                    before proceeding so your VIP pass is linked to your profile.
                  </p>
                </div>
              )}

              {errorMessage && (
                <div
                  style={{
                    background: "#fef2f2",
                    border: "1px solid #fecaca",
                    color: "#991b1b",
                    padding: "14px 20px",
                    fontSize: "0.85rem",
                    fontWeight: 500,
                  }}
                >
                  <strong>Payment Notice: </strong>
                  {errorMessage}
                </div>
              )}

              <div className="payment-tab-body">
                <div
                  style={{
                    background: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "12px",
                    padding: "24px",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                      background: "#f0fdf4",
                      padding: "6px 16px",
                      borderRadius: "20px",
                      border: "1px solid #bbf7d0",
                      marginBottom: "16px",
                    }}
                  >
                    <span style={{ fontSize: "1.1rem" }}>🔒</span>
                    <strong style={{ fontSize: "0.82rem", color: "#166534" }}>
                      PCI-DSS Level 1 Compliant · 256-Bit SSL
                    </strong>
                  </div>

                  <h3 style={{ fontFamily: "Space Grotesk", fontSize: "1.25rem", margin: "0 0 8px", color: "#1e3a34" }}>
                    Pay ₹{finalPrice} with Razorpay
                  </h3>
                  <p style={{ fontSize: "0.88rem", color: "#64748b", margin: "0 0 20px" }}>
                    Select your preferred payment method on the official Razorpay payment screen:
                  </p>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(2, 1fr)",
                      gap: "12px",
                      textAlign: "left",
                      marginBottom: "20px",
                    }}
                  >
                    <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "12px 14px" }}>
                      <strong style={{ display: "block", fontSize: "0.85rem", color: "#1e3a34" }}>⚡ UPI & QR Code</strong>
                      <small style={{ color: "#64748b", fontSize: "0.75rem" }}>Google Pay, PhonePe, Paytm, CRED, BHIM</small>
                    </div>

                    <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "12px 14px" }}>
                      <strong style={{ display: "block", fontSize: "0.85rem", color: "#1e3a34" }}>💳 Cards (Debit & Credit)</strong>
                      <small style={{ color: "#64748b", fontSize: "0.75rem" }}>Visa, Mastercard, RuPay, Diners</small>
                    </div>

                    <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "12px 14px" }}>
                      <strong style={{ display: "block", fontSize: "0.85rem", color: "#1e3a34" }}>🏦 Net Banking</strong>
                      <small style={{ color: "#64748b", fontSize: "0.75rem" }}>SBI, HDFC, ICICI, Axis + 50 Banks</small>
                    </div>

                    <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "12px 14px" }}>
                      <strong style={{ display: "block", fontSize: "0.85rem", color: "#1e3a34" }}>👛 Wallets & PayLater</strong>
                      <small style={{ color: "#64748b", fontSize: "0.75rem" }}>Amazon Pay, Mobikwik, Airtel Money</small>
                    </div>
                  </div>

                  {/* Mandatory Gateway Terms & Policies Acceptance */}
                  <div
                    style={{
                      background: "#f8faf9",
                      border: "1px solid #d4dfda",
                      borderRadius: "8px",
                      padding: "14px 16px",
                      textAlign: "left",
                      marginBottom: "20px",
                    }}
                  >
                    <label
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "10px",
                        cursor: "pointer",
                        fontSize: "0.82rem",
                        color: "#334155",
                        lineHeight: "1.5",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={agreedToTerms}
                        onChange={(e) => setAgreedToTerms(e.target.checked)}
                        style={{ marginTop: "3px", accentColor: "#1e3a34", width: "16px", height: "16px", cursor: "pointer" }}
                      />
                      <span>
                        I agree to the{" "}
                        <Link href="/terms" target="_blank" rel="noopener noreferrer" style={{ color: "var(--coral, #b94a2b)", fontWeight: 600, textDecoration: "underline" }}>
                          Terms & Conditions
                        </Link>
                        ,{" "}
                        <Link href="/privacy" target="_blank" rel="noopener noreferrer" style={{ color: "var(--coral, #b94a2b)", fontWeight: 600, textDecoration: "underline" }}>
                          Privacy Policy
                        </Link>
                        , and{" "}
                        <Link href="/refund" target="_blank" rel="noopener noreferrer" style={{ color: "var(--coral, #b94a2b)", fontWeight: 600, textDecoration: "underline" }}>
                          Cancellation & Refund Policy
                        </Link>
                        . I acknowledge that subscription pass access is delivered digitally and instantly upon payment confirmation.
                      </span>
                    </label>
                  </div>

                  {isProcessing ? (
                    <div style={{ padding: "16px 0" }}>
                      <div className="processing-spinner" />
                      <strong style={{ display: "block", color: "#1e3a34", fontSize: "0.95rem" }}>
                        {processingStep || "Communicating with Razorpay..."}
                      </strong>
                      <small style={{ color: "#94a3b8" }}>Please do not refresh or close this tab.</small>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="btn-pay-now"
                      onClick={handleRazorpayPayment}
                      disabled={isProcessing}
                      style={{
                        background: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)",
                        boxShadow: "0 6px 20px rgba(2, 132, 199, 0.35)",
                        fontSize: "1rem",
                        padding: "16px 24px",
                        width: "100%",
                      }}
                    >
                      ⚡ Proceed to Pay ₹{finalPrice} via Razorpay →
                    </button>
                  )}

                  <div style={{ marginTop: "16px", fontSize: "0.78rem", color: "#64748b", lineHeight: "1.5" }}>
                    <span>Official Billing Partner: <strong>W Technology</strong> & <strong>Make My School</strong> (</span>
                    <a href="https://wtechnology.in" target="_blank" rel="noopener noreferrer" style={{ color: "#0284c7", textDecoration: "none", fontWeight: 600 }}>
                      wtechnology.in
                    </a>
                    <span> / </span>
                    <a href="https://makemyschool.com" target="_blank" rel="noopener noreferrer" style={{ color: "#0284c7", textDecoration: "none", fontWeight: 600 }}>
                      makemyschool.com
                    </a>
                    <span>)</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
}
