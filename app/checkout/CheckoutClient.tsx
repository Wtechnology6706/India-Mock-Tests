"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type { AuthUser } from "../../lib/auth-store";
import { defaultExamGroups, type ExamGroup, type ExamGroupType } from "../../lib/exam-group-types";
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

  // Read URL parameters from pricing page or exam links
  const urlPlan = searchParams.get("plan");
  const urlCycle = searchParams.get("cycle");
  const urlAmount = searchParams.get("amount");
  const urlOption = searchParams.get("option") as ExamGroupType | null;
  const urlGroup = searchParams.get("group");
  const urlExam = searchParams.get("exam");

  // Initial plan selection
  const initialPlanSlug: "sprint" | "ultimate" =
    urlPlan === "ultimate" ? "ultimate" : "sprint";

  // Initial option type (Option 1: Complete Bundle vs Option 2: Individual Series)
  const initialPurchaseOption: ExamGroupType =
    urlOption === "group" || urlOption === "individual"
      ? urlOption
      : urlAmount === "499"
      ? "group"
      : "individual";

  // State for exam groups loaded from database/store
  const [examGroups, setExamGroups] = useState<ExamGroup[]>(defaultExamGroups);

  // Determine initial selected group slug
  const initialGroupSlug = useMemo(() => {
    if (urlGroup) {
      const match = defaultExamGroups.find((g) => g.slug === urlGroup || g.id === urlGroup);
      if (match) return match.slug;
    }
    if (urlExam) {
      const match = defaultExamGroups.find(
        (g) => g.examSlug === urlExam && (initialPurchaseOption === "group" ? g.type === "group" : g.type === "individual")
      );
      if (match) return match.slug;
    }
    if (initialPurchaseOption === "group") {
      return "bpsc-tre-4-all";
    }
    return "bpsc-tre-4-computer-science";
  }, [urlGroup, urlExam, initialPurchaseOption]);

  const [selectedPlan, setSelectedPlan] = useState<"sprint" | "ultimate">(initialPlanSlug);
  const [purchaseOption, setPurchaseOption] = useState<ExamGroupType>(initialPurchaseOption);
  const [selectedGroupSlug, setSelectedGroupSlug] = useState<string>(initialGroupSlug);

  const [plans, setPlans] = useState<Record<string, PlanData>>({
    sprint: {
      id: "1",
      slug: "sprint",
      name: "Single Exam Sprint Pass",
      description: "Targeted practice pass for 1 focused examination series.",
      amount: urlAmount ? Number(urlAmount) : 299,
      validityDays: 90,
      features: [
        "Full access to selected exam series and all clubbed subjects",
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
      amount: urlAmount && initialPlanSlug === "ultimate" ? Number(urlAmount) : 999,
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
  const [logoHeight, setLogoHeight] = useState<number>(40);
  const [logoOffsetX, setLogoOffsetX] = useState<number>(0);
  const [logoOffsetY, setLogoOffsetY] = useState<number>(0);
  const [portalName, setPortalName] = useState("Sarkari Practice");

  // Fetch dynamic plans, active coupons, wallet balance, and exam groups
  useEffect(() => {
    // 1. Fetch site config
    fetch(`/api/config?t=${Date.now()}`, { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (data?.config?.logoImageUrl !== undefined) setLogoImageUrl(data.config.logoImageUrl || "");
        if (data?.config?.portalName) setPortalName(data.config.portalName);
        if (data?.config?.logoHeight !== undefined) setLogoHeight(Number(data.config.logoHeight) || 40);
        if (data?.config?.logoOffsetX !== undefined) setLogoOffsetX(Number(data.config.logoOffsetX) || 0);
        if (data?.config?.logoOffsetY !== undefined) setLogoOffsetY(Number(data.config.logoOffsetY) || 0);
      })
      .catch(() => {});

    // 2. Fetch active exam groups from API
    fetch("/api/exam-groups")
      .then((res) => res.json())
      .then((data) => {
        if (data?.success && Array.isArray(data.groups) && data.groups.length > 0) {
          setExamGroups(data.groups);
        }
      })
      .catch(() => {});

    // 3. Fetch DB plans
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

    // 4. Fetch active coupons
    fetch("/api/coupons/active")
      .then((res) => res.json())
      .then((data) => {
        if (data?.success && Array.isArray(data.coupons)) {
          setActiveCoupons(data.coupons);
        }
      })
      .catch(() => {});

    // 5. Fetch user's wallet
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

    // 6. Load Razorpay script
    if (typeof window !== "undefined" && !(window as any).Razorpay) {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, [user]);

  // Separate exam groups by type
  const groupBundles = useMemo(() => examGroups.filter((g) => g.type === "group"), [examGroups]);
  const individualSeries = useMemo(() => examGroups.filter((g) => g.type === "individual"), [examGroups]);

  // Active chosen ExamGroup
  const activeExamGroup = useMemo(() => {
    const list = purchaseOption === "group" ? groupBundles : individualSeries;
    const found = list.find((g) => g.slug === selectedGroupSlug);
    if (found) return found;
    return list[0] || examGroups[0];
  }, [purchaseOption, groupBundles, individualSeries, selectedGroupSlug, examGroups]);

  // Dynamic price calculation
  const originalPrice = useMemo(() => {
    if (selectedPlan === "ultimate") {
      const ultPlan = plans.ultimate;
      if (urlPlan === "ultimate" && urlAmount) return Number(urlAmount);
      return ultPlan.amount || 999;
    }
    // If Sprint, use the price of the active exam group / bundle!
    if (activeExamGroup) {
      return activeExamGroup.price;
    }
    return 299;
  }, [selectedPlan, plans, urlPlan, urlAmount, activeExamGroup]);

  const discount = appliedCoupon ? couponDiscount : 0;
  const finalPrice = Math.max(0, originalPrice - discount);
  const taxPortion = Math.round((finalPrice * 18) / 118);

  // Switch between Option 1 (Bundle) and Option 2 (Individual)
  function handleSelectOptionType(type: ExamGroupType) {
    setPurchaseOption(type);
    setSelectedPlan("sprint");
    if (type === "group") {
      const match = groupBundles[0];
      if (match) setSelectedGroupSlug(match.slug);
    } else {
      const match = individualSeries[0];
      if (match) setSelectedGroupSlug(match.slug);
    }
    // Reset coupon if order amount falls below min requirement
    if (appliedCoupon && appliedCoupon.minOrderAmount > originalPrice) {
      removeCoupon();
    }
  }

  // Handle plan card selection
  function handleSelectPlan(planSlug: "sprint" | "ultimate") {
    setSelectedPlan(planSlug);
    if (appliedCoupon) {
      // re-validate
      handleApplyCoupon(appliedCoupon.code);
    }
  }

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

  // ---------------- WALLET CHECKOUT ----------------
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
      const chosenExamName = selectedPlan === "sprint" ? activeExamGroup.title : undefined;
      const chosenExamSlug = selectedPlan === "sprint" ? activeExamGroup.slug : undefined;

      const res = await fetch("/api/checkout/wallet-pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planSlug: selectedPlan,
          couponCode: appliedCoupon ? appliedCoupon.code : undefined,
          targetExamSlug: chosenExamSlug,
          targetExamName: chosenExamName,
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

  // ---------------- RAZORPAY CHECKOUT ----------------
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
      const chosenExamName = selectedPlan === "sprint" ? activeExamGroup.title : undefined;
      const chosenExamSlug = selectedPlan === "sprint" ? activeExamGroup.slug : undefined;
      const planDisplayName = selectedPlan === "sprint" ? activeExamGroup.title : plans.ultimate.name;
      const validityDays = selectedPlan === "sprint" ? activeExamGroup.validityDays : plans.ultimate.validityDays;

      const orderRes = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tier: selectedPlan,
          planName: planDisplayName,
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
        name: portalName || "Sarkari Practice",
        description: `${planDisplayName} (${validityDays} Days)`,
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
              planName: planDisplayName,
              amount: finalPrice,
              durationDays: validityDays,
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
          <Link href={user && user.role !== "admin" ? "/dashboard" : "/"} className="checkout-logo" style={{ display: "flex", alignItems: "center", textDecoration: "none", gap: "10px" }}>
            {logoImageUrl ? (
              <img
                src={logoImageUrl}
                alt={portalName || "Sarkari Practice"}
                style={{
                  height: "44px",
                  maxHeight: "48px",
                  maxWidth: "54px",
                  width: "auto",
                  objectFit: "contain",
                  display: "block",
                  flexShrink: 0,
                }}
                onError={() => setLogoImageUrl("")}
              />
            ) : (
              <span className="logo-mark" style={{ flexShrink: 0 }}>
                {(portalName || "Sarkari Practice").slice(0, 1).toUpperCase()}
              </span>
            )}
            <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.15 }}>
              <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: "17px", color: "var(--ink, #1e293b)" }}>
                {portalName || "Sarkari Practice"}<span className="logo-dot" style={{ color: "var(--coral, #d96548)" }}>.</span>
              </span>
              <span style={{ fontSize: "9.5px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.8px" }}>
                Order Receipt
              </span>
            </div>
          </Link>
          <div className="checkout-security-tag">
            <span>✓ Verified Secure Payment</span>
          </div>
        </header>

        <main className="checkout-success-wrap">
          <div className="checkout-success-card">
            <div className="success-badge-icon">✓</div>
            <span className="success-kicker">PAYMENT CONFIRMED &amp; ACTIVATED</span>
            <h2>Thank You! Your VIP Pass is Live</h2>
            <p className="success-sub">
              Your mock test subscription has been activated immediately on your account.
            </p>

            <div className="order-details-box">
              <div className="detail-row">
                <span>Activated Plan / Series:</span>
                <strong>
                  {successOrder.planName || (selectedPlan === "sprint" ? activeExamGroup.title : "All-Exam Ultimate Pass")}
                </strong>
              </div>
              <div className="detail-row">
                <span>Order Reference:</span>
                <code>{successOrder.orderNumber}</code>
              </div>
              <div className="detail-row">
                <span>Tax Invoice No:</span>
                <strong>{successOrder.invoiceNumber}</strong>
              </div>
              <div className="detail-row">
                <span>Amount Paid:</span>
                <strong>₹{successOrder.amount.toFixed(2)} (Inclusive of GST)</strong>
              </div>
            </div>

            {selectedPlan === "sprint" && activeExamGroup && (
              <div style={{ margin: "16px 0", background: "#f8fafc", padding: "14px", borderRadius: "10px", border: "1px solid #e2e8f0", textAlign: "left" }}>
                <span style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "6px" }}>
                  🔗 Included Clubbed Subjects Unlocked:
                </span>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {activeExamGroup.clubbedSubjects.map((sub, i) => (
                    <span key={i} style={{ fontSize: "12px", background: "#ede9fe", color: "#5b21b6", padding: "3px 8px", borderRadius: "6px", fontWeight: 600 }}>
                      ✓ {sub}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="success-actions">
              <Link href="/dashboard" className="btn-primary-success">
                Go to Practice Dashboard →
              </Link>
              <Link href="/pyq" className="btn-secondary-success">
                Explore PYQ Question Papers
              </Link>
            </div>

            <p className="success-footer-note">
              🔒 Instant activation applied to your account. You can view or download this invoice anytime from your Dashboard.
            </p>
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
        <Link href={user && user.role !== "admin" ? "/dashboard" : "/"} className="checkout-logo" style={{ display: "flex", alignItems: "center", textDecoration: "none", gap: "10px" }}>
          {logoImageUrl ? (
            <img
              src={logoImageUrl}
              alt={portalName || "Sarkari Practice"}
              style={{
                height: "44px",
                maxHeight: "48px",
                maxWidth: "54px",
                width: "auto",
                objectFit: "contain",
                display: "block",
                flexShrink: 0,
              }}
              onError={() => setLogoImageUrl("")}
            />
          ) : (
            <span className="logo-mark" style={{ flexShrink: 0 }}>
              {(portalName || "Sarkari Practice").slice(0, 1).toUpperCase()}
            </span>
          )}
          <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.15 }}>
            <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: "17px", color: "var(--ink, #1e293b)" }}>
              {portalName || "Sarkari Practice"}<span className="logo-dot" style={{ color: "var(--coral, #d96548)" }}>.</span>
            </span>
            <span style={{ fontSize: "9.5px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.8px" }}>
              VIP Checkout
            </span>
          </div>
        </Link>
        <div className="checkout-security-tag">
          <span>🔒 256-Bit SSL Encrypted Checkout</span>
        </div>
        <Link href="/pricing" className="checkout-cancel-link">
          ✕ Cancel &amp; Return
        </Link>
      </header>

      <main className="checkout-main-grid">
        {/* Left Column: Plan & Exam Selection */}
        <section className="checkout-left-col">
          <div className="checkout-section-header">
            <span className="kicker">STEP 1 OF 2</span>
            <h1>Select Your Exam Subscription</h1>
            <p>Admin-verified pricing with instant test activation. You can change plans or exams anytime below.</p>
          </div>

          {/* MAIN TIER SELECTOR: SPRINT / TARGETED EXAM vs ALL-EXAM ULTIMATE */}
          <div className="plan-selector-cards">
            {/* 1. Target Exam Series (Sprint) */}
            <div
              className={`plan-card-option ${selectedPlan === "sprint" ? "selected" : ""}`}
              onClick={() => handleSelectPlan("sprint")}
            >
              <div className="plan-card-top">
                <div className="plan-card-radio">
                  <span className={`radio-dot ${selectedPlan === "sprint" ? "checked" : ""}`} />
                </div>
                <div className="plan-card-info">
                  <div className="plan-card-header-row">
                    <h3>Targeted Exam Series Pass</h3>
                    <span className="plan-pill-highlight" style={{ background: "#059669" }}>CHOICE OF EXAM</span>
                  </div>
                  <p className="plan-duration-text">{activeExamGroup?.validityDays || 90} Days Validity</p>
                </div>
                <div className="plan-card-pricing">
                  <span className="plan-price-amount">₹{activeExamGroup ? activeExamGroup.price : 299}</span>
                  <span className="plan-price-label">All-Inclusive</span>
                </div>
              </div>
            </div>

            {/* 2. All-Exam Ultimate VIP Pass */}
            <div
              className={`plan-card-option ${selectedPlan === "ultimate" ? "selected" : ""}`}
              onClick={() => handleSelectPlan("ultimate")}
            >
              <div className="plan-card-top">
                <div className="plan-card-radio">
                  <span className={`radio-dot ${selectedPlan === "ultimate" ? "checked" : ""}`} />
                </div>
                <div className="plan-card-info">
                  <div className="plan-card-header-row">
                    <h3>All-Exam Ultimate VIP Pass</h3>
                    <span className="plan-pill-highlight">MOST POPULAR</span>
                  </div>
                  <p className="plan-duration-text">{plans.ultimate.validityDays} Days Validity</p>
                </div>
                <div className="plan-card-pricing">
                  <span className="plan-price-amount">₹{plans.ultimate.amount}</span>
                  <span className="plan-price-label">All-Inclusive</span>
                </div>
              </div>

              {selectedPlan === "ultimate" && (
                <div className="plan-card-features-tray">
                  <ul>
                    {plans.ultimate.features.map((f, i) => (
                      <li key={i}>✓ {f}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* IF TARGET EXAM PASS (SPRINT) IS SELECTED: SHOW 2 CLEAR OPTIONS */}
          {selectedPlan === "sprint" && (
            <div
              style={{
                marginTop: "20px",
                background: "#fff",
                border: "1.5px solid #0f766e",
                borderRadius: "14px",
                padding: "20px",
                boxShadow: "0 2px 8px rgba(15, 118, 110, 0.06)",
              }}
            >
              <div style={{ marginBottom: "16px" }}>
                <span className="kicker" style={{ color: "#0f766e" }}>EXAM PASS CUSTOMIZATION</span>
                <h3 style={{ margin: "4px 0 6px", fontSize: "17px", fontWeight: 800, color: "#0f172a" }}>
                  Choose Your Purchase Mode:
                </h3>
                <p style={{ margin: 0, fontSize: "13px", color: "#64748b" }}>
                  Select whether you want a full exam category bundle or an individual subject test series.
                </p>
              </div>

              {/* 2 Options Segmented Switcher */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "18px" }}>
                {/* Option 1 Button */}
                <div
                  onClick={() => handleSelectOptionType("group")}
                  style={{
                    padding: "14px",
                    borderRadius: "10px",
                    border: purchaseOption === "group" ? "2px solid #059669" : "1px solid #cbd5e1",
                    background: purchaseOption === "group" ? "#ecfdf5" : "#f8fafc",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                    <span style={{ fontSize: "18px" }}>🏢</span>
                    <strong style={{ fontSize: "14px", color: "#065f46" }}>Option 1: Complete Exam Group</strong>
                  </div>
                  <p style={{ fontSize: "12px", color: "#475569", margin: 0 }}>
                    Select an entire exam set (BPSC TRE 4.0, STET, CTET, Railway). Access all subjects &amp; mocks.
                  </p>
                  <span style={{ display: "inline-block", marginTop: "6px", fontSize: "12px", fontWeight: 800, color: "#059669" }}>
                    Starting ₹499
                  </span>
                </div>

                {/* Option 2 Button */}
                <div
                  onClick={() => handleSelectOptionType("individual")}
                  style={{
                    padding: "14px",
                    borderRadius: "10px",
                    border: purchaseOption === "individual" ? "2px solid #7c3aed" : "1px solid #cbd5e1",
                    background: purchaseOption === "individual" ? "#f5f3ff" : "#f8fafc",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                    <span style={{ fontSize: "18px" }}>🎯</span>
                    <strong style={{ fontSize: "14px", color: "#5b21b6" }}>Option 2: Individual Exam Series</strong>
                  </div>
                  <p style={{ fontSize: "12px", color: "#475569", margin: 0 }}>
                    Buy a specific subject (e.g. Computer Science, Hindi) with clubbed Language &amp; GS papers.
                  </p>
                  <span style={{ display: "inline-block", marginTop: "6px", fontSize: "12px", fontWeight: 800, color: "#7c3aed" }}>
                    Starting ₹299
                  </span>
                </div>
              </div>

              {/* DROPDOWN FOR OPTION 1: COMPLETE EXAM GROUP / BUNDLE */}
              {purchaseOption === "group" && (
                <div>
                  <label htmlFor="group-bundle-select" style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "#1e293b", marginBottom: "6px" }}>
                    Select Complete Exam Group Set:
                  </label>
                  <select
                    id="group-bundle-select"
                    value={selectedGroupSlug}
                    onChange={(e) => setSelectedGroupSlug(e.target.value)}
                    className="checkout-exam-dropdown"
                    style={{
                      width: "100%",
                      padding: "11px 14px",
                      borderRadius: "8px",
                      border: "1px solid #cbd5e1",
                      fontSize: "14px",
                      fontWeight: 600,
                      background: "#fff",
                    }}
                  >
                    {groupBundles.map((group) => (
                      <option key={group.slug} value={group.slug}>
                        {group.title} (₹{group.price} · {group.validityDays} Days)
                      </option>
                    ))}
                  </select>

                  {/* Highlights for Option 1 */}
                  {activeExamGroup && (
                    <div style={{ marginTop: "14px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "10px", padding: "14px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                        <strong style={{ fontSize: "13px", color: "#166534" }}>
                          ⭐ {activeExamGroup.title}
                        </strong>
                        <span style={{ fontSize: "13px", fontWeight: 800, color: "#15803d" }}>
                          ₹{activeExamGroup.price}
                        </span>
                      </div>
                      <p style={{ margin: "0 0 10px", fontSize: "12px", color: "#374151", lineHeight: "1.5" }}>
                        {activeExamGroup.description}
                      </p>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#15803d", fontWeight: 600 }}>
                        <span>✓</span>
                        <span>Grants full unlimited access to all full-length mocks and all subject tracks for {activeExamGroup.examName}.</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* DROPDOWN FOR OPTION 2: INDIVIDUAL EXAM SERIES */}
              {purchaseOption === "individual" && (
                <div>
                  <label htmlFor="individual-exam-select" style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "#1e293b", marginBottom: "6px" }}>
                    Select Individual Exam Offering:
                  </label>
                  <select
                    id="individual-exam-select"
                    value={selectedGroupSlug}
                    onChange={(e) => setSelectedGroupSlug(e.target.value)}
                    className="checkout-exam-dropdown"
                    style={{
                      width: "100%",
                      padding: "11px 14px",
                      borderRadius: "8px",
                      border: "1px solid #cbd5e1",
                      fontSize: "14px",
                      fontWeight: 600,
                      background: "#fff",
                    }}
                  >
                    {individualSeries.map((series) => (
                      <option key={series.slug} value={series.slug}>
                        {series.title} (₹{series.price} · {series.validityDays} Days)
                      </option>
                    ))}
                  </select>

                  {/* Clubbed Subjects Breakdown Panel */}
                  {activeExamGroup && (
                    <div style={{ marginTop: "14px", background: "#faf5ff", border: "1px solid #e9d5ff", borderRadius: "10px", padding: "14px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                        <strong style={{ fontSize: "13px", color: "#6b21a8" }}>
                          🎯 {activeExamGroup.title}
                        </strong>
                        <span style={{ fontSize: "13px", fontWeight: 800, color: "#7c3aed" }}>
                          ₹{activeExamGroup.price}
                        </span>
                      </div>
                      <p style={{ margin: "0 0 10px", fontSize: "12px", color: "#4b5563", lineHeight: "1.5" }}>
                        {activeExamGroup.description}
                      </p>

                      <div style={{ background: "#fff", borderRadius: "8px", padding: "10px 12px", border: "1px solid #f3e8ff" }}>
                        <span style={{ fontSize: "12px", fontWeight: 700, color: "#581c87", display: "block", marginBottom: "6px" }}>
                          🔗 Clubbed Subject Papers Included in This Pack ({activeExamGroup.clubbedSubjects.length}):
                        </span>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                          {activeExamGroup.clubbedSubjects.map((sub, i) => (
                            <span
                              key={i}
                              style={{
                                fontSize: "11px",
                                fontWeight: 600,
                                padding: "3px 8px",
                                borderRadius: "6px",
                                background: "#f5f3ff",
                                border: "1px solid #ddd6fe",
                                color: "#6d28d9",
                              }}
                            >
                              ✓ {sub}
                            </span>
                          ))}
                        </div>
                      </div>

                      <p style={{ margin: "8px 0 0", fontSize: "11px", color: "#6b21a8", fontStyle: "italic" }}>
                        💡 When you unlock this series, you get instant access to full CBT mocks covering all above clubbed subjects.
                      </p>
                    </div>
                  )}
                </div>
              )}
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
                <p style={{ fontSize: "12px", color: "#64748b", margin: 0 }}>GPay, PhonePe, Paytm, Cards &amp; NetBanking</p>
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
                    <img src="/wallet.png" alt="Wallet" style={{ width: "18px", height: "18px", objectFit: "contain" }} />
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
                {selectedPlan === "ultimate"
                  ? plans.ultimate.name
                  : (activeExamGroup?.title || "Exam Series Pass")}
              </span>
              <span className="summary-item-val">₹{originalPrice.toFixed(2)}</span>
            </div>

            {selectedPlan === "sprint" && activeExamGroup && (
              <div style={{ margin: "4px 0 12px", fontSize: "12px", color: "#64748b" }}>
                <span>Type: <strong>{purchaseOption === "group" ? "Complete Exam Group" : "Individual Series"}</strong></span>
                <span style={{ display: "block" }}>Includes {activeExamGroup.clubbedSubjects.length} clubbed subjects</span>
              </div>
            )}

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
                  I agree to the <Link href="/terms">Terms &amp; Conditions</Link>, <Link href="/privacy">Privacy Policy</Link>, and <Link href="/refund">Refund Policy</Link>.
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
