"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import MegaMenu from "../components/MegaMenu";

export default function PricingPage() {
  const [portalName, setPortalName] = useState("Northstar");
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("yearly");
  const [subscribedPlan, setSubscribedPlan] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/config")
      .then((res) => res.json())
      .then((data) => {
        if (data?.config?.portalName) {
          setPortalName(data.config.portalName);
        }
      })
      .catch(() => {});
  }, []);

  const [isProcessing, setIsProcessing] = useState(false);
  const [subscribeMessage, setSubscribeMessage] = useState<string | null>(null);

  async function handleSubscribe(planName: string, tier: "sprint" | "ultimate") {
    setIsProcessing(true);
    try {
      const res = await fetch("/api/subscription/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier, billingCycle }),
      });
      const data = await res.json();
      if (res.status === 401) {
        window.location.href = `/login?redirect=/pricing`;
        return;
      }
      if (res.ok) {
        setSubscribedPlan(planName);
        setSubscribeMessage(data.message || `Welcome to ${planName}!`);
      } else {
        alert(data.error || "Failed to process subscription");
      }
    } catch {
      setSubscribedPlan(planName);
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <main className="static-public-page">
      <MegaMenu />

      <div className="static-page-container" style={{ maxWidth: "1000px" }}>
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <span className="kicker">AFFORDABLE EXAM PREPARATION</span>
          <h1>Invest in your rank. Start free.</h1>
          <p className="static-lede" style={{ maxWidth: "600px", margin: "0 auto 24px" }}>
            Transparent plans built for serious aspirants. Unlimited mock tests, detailed step-by-step explanations, and real exam pattern practice.
          </p>

          {/* Billing cycle toggle */}
          <div className="pricing-toggle-wrap">
            <button
              type="button"
              className={`toggle-pill ${billingCycle === "monthly" ? "active" : ""}`}
              onClick={() => setBillingCycle("monthly")}
            >
              Quarterly (3 Months)
            </button>
            <button
              type="button"
              className={`toggle-pill ${billingCycle === "yearly" ? "active" : ""}`}
              onClick={() => setBillingCycle("yearly")}
            >
              Annual Pass (1 Year) <span className="save-badge">SAVE 45%</span>
            </button>
          </div>
        </div>

        {subscribedPlan && (
          <div className="subscription-success-modal">
            <div className="success-modal-card">
              <span className="modal-icon">🎉</span>
              <h2>Welcome to {subscribedPlan}!</h2>
              <p>Your subscription is now active. All full-length mocks and detailed analysis solutions are unlocked.</p>
              <div style={{ display: "flex", gap: "10px", justifyContent: "center", marginTop: "16px" }}>
                <Link href="/dashboard" className="btn-dashboard-nav">
                  Go to Dashboard →
                </Link>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setSubscribedPlan(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Pricing Cards Grid */}
        <div className="pricing-cards-grid">
          {/* Free Tier */}
          <div className="pricing-card">
            <span className="plan-kicker">STARTER PRACTICE</span>
            <h3>Free Aspirant</h3>
            <p className="plan-tagline">Essential practice to kickstart your preparation.</p>
            <div className="plan-price-block">
              <strong>₹0</strong>
              <span>forever free</span>
            </div>
            <ul className="plan-features">
              <li>✓ 5 Full-length diagnostic mocks</li>
              <li>✓ Basic accuracy & score card</li>
              <li>✓ Community question review</li>
              <li>✓ Standard timer interface</li>
              <li className="disabled-feat">✕ Step-by-step detailed explanations</li>
              <li className="disabled-feat">✕ All India Rank estimation</li>
            </ul>
            <Link href="/register" className="btn-plan-action outline">
              Get Started Free
            </Link>
          </div>

          {/* Single Exam Pass (Featured) */}
          <div className="pricing-card featured">
            <span className="popular-ribbon">MOST POPULAR</span>
            <span className="plan-kicker">TARGETED PREPARATION</span>
            <h3>Single Exam Sprint</h3>
            <p className="plan-tagline">Dedicated pass for BPSC TRE, STET, or CTET.</p>
            <div className="plan-price-block">
              <strong>{billingCycle === "yearly" ? "₹499" : "₹299"}</strong>
              <span>/ {billingCycle === "yearly" ? "year" : "3 months"}</span>
            </div>
            <ul className="plan-features">
              <li>✓ All 150+ full mocks for your target exam</li>
              <li>✓ Sectional tests (Language, GS, Math, Science)</li>
              <li>✓ Step-by-step bilingual explanations</li>
              <li>✓ SCERT & NCERT syllabus alignment</li>
              <li>✓ Performance trajectory & topic weakness alerts</li>
              <li>✓ Unlimited test retakes</li>
            </ul>
            <Link
              href="/checkout?plan=sprint"
              className="btn-plan-action primary"
              style={{ textAlign: "center", textDecoration: "none" }}
            >
              Unlock Exam Sprint →
            </Link>
          </div>

          {/* All Exams Ultimate Pass */}
          <div className="pricing-card">
            <span className="plan-kicker">COMPLETE ACCESS</span>
            <h3>All-Exam Ultimate Pass</h3>
            <p className="plan-tagline">Unlimited access to every exam, track, and mock test.</p>
            <div className="plan-price-block">
              <strong>{billingCycle === "yearly" ? "₹999" : "₹599"}</strong>
              <span>/ {billingCycle === "yearly" ? "year" : "3 months"}</span>
            </div>
            <ul className="plan-features">
              <li>✓ Unlimited access to ALL 500+ mock tests across India</li>
              <li>✓ BPSC TRE 4.0 (Classes 1–12 complete tracks)</li>
              <li>✓ Bihar STET, BTET, CTET, and State TET mocks</li>
              <li>✓ Previous Year Questions (PYQs) with live timer</li>
              <li>✓ Priority support & doubts clearance</li>
              <li>✓ Offline printable PDF answer keys</li>
            </ul>
            <Link
              href="/checkout?plan=ultimate"
              className="btn-plan-action primary"
              style={{ textAlign: "center", textDecoration: "none" }}
            >
              Get Ultimate Pass →
            </Link>
          </div>
        </div>

        {/* Feature Comparison Table */}
        <div className="pricing-comparison-wrap">
          <h2 style={{ textAlign: "center", marginBottom: "24px", fontFamily: "Space Grotesk" }}>
            Compare Plan Features
          </h2>
          <table className="comparison-table">
            <thead>
              <tr>
                <th>Feature</th>
                <th>Free Aspirant</th>
                <th>Single Exam Sprint</th>
                <th>All-Exam Pass</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Mock Test Question Count</td>
                <td>Limited (5 Tests)</td>
                <td>Unlimited (Selected Exam)</td>
                <td>Unlimited (All Exams)</td>
              </tr>
              <tr>
                <td>Detailed Explanations & Rationale</td>
                <td>Basic</td>
                <td>✓ Full Step-by-step</td>
                <td>✓ Full Step-by-step</td>
              </tr>
              <tr>
                <td>5-Option OMR Simulation</td>
                <td>✓ Yes</td>
                <td>✓ Yes</td>
                <td>✓ Yes</td>
              </tr>
              <tr>
                <td>All India Rank Percentile</td>
                <td>✕ No</td>
                <td>✓ Yes</td>
                <td>✓ Yes</td>
              </tr>
              <tr>
                <td>Multi-Device Access (Desktop & Mobile)</td>
                <td>✓ Yes</td>
                <td>✓ Yes</td>
                <td>✓ Yes</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <footer className="footer">
        <Link className="logo" href="/">
          <span className="logo-mark">{portalName.slice(0, 1).toUpperCase()}</span>
          <span>{portalName.toLowerCase()}<span className="logo-dot">.</span></span>
        </Link>
        <p>Practice with purpose. Perform with confidence.</p>
        <div className="footer-links">
          <Link href="/exams">Exams</Link>
          <Link href="/pricing">Premium Plans</Link>
          <Link href="/privacy">Privacy Policy</Link>
          <Link href="/terms">Terms of Service</Link>
          <Link href="/about">About</Link>
          <Link href="/contact">Support</Link>
        </div>
        <small>© 2026 {portalName} Learning Technologies · All Rights Reserved.</small>
      </footer>
    </main>
  );
}
