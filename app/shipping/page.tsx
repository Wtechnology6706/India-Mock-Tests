"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import MegaMenu from "../components/MegaMenu";
import Footer from "../components/Footer";

export default function ShippingPolicyPage() {
  const [portalName, setPortalName] = useState("India Mock Tests");
  const [contactEmail, setContactEmail] = useState("support@indiamocktests.com");

  useEffect(() => {
    fetch("/api/config")
      .then((res) => res.json())
      .then((data) => {
        if (data?.config?.portalName) setPortalName(data.config.portalName);
        if (data?.config?.contactEmail) setContactEmail(data.config.contactEmail);
      })
      .catch(() => {});
  }, []);

  return (
    <main className="static-public-page">
      <MegaMenu />

      <div className="static-page-container" style={{ maxWidth: "860px" }}>
        <span className="kicker">SERVICE FULFILLMENT</span>
        <h1>Shipping & Digital Delivery Policy</h1>
        <p className="static-lede">
          Last updated: October 2026. This policy outlines how educational services and digital mock test subscriptions are delivered to users of {portalName} (operated by <strong>W Technology</strong>).
        </p>

        <div className="legal-content-card">
          <section className="legal-section">
            <h2>1. Electronic & Digital Fulfillment</h2>
            <p>
              {portalName} operates exclusively as an online educational SaaS platform offering Computer Based Test (CBT) simulations, curated question banks, mock exams, and analytics.
            </p>
            <p>
              <strong>We do not ship any physical goods, books, hard-copy test papers, or materials to your physical address.</strong> All services are delivered electronically through the web platform.
            </p>
          </section>

          <section className="legal-section">
            <h2>2. Delivery Timeline (Instant Access)</h2>
            <p>
              Upon successful completion and verification of payment through our secure payment gateway (Razorpay):
            </p>
            <ul>
              <li><strong>Instant Activation:</strong> Your purchased subscription pass (Single Exam Sprint or All-Exam Ultimate VIP) is automatically activated in your student profile within <strong>seconds</strong>.</li>
              <li><strong>Email Invoice & Receipt:</strong> An electronic receipt containing your unique Order ID, Tax Invoice, and Plan Details is immediately dispatched to your registered email address.</li>
              <li><strong>Immediate Practice:</strong> You can immediately launch CBT mock tests, review answer keys, and track real-time analytics from your <Link href="/dashboard" style={{ color: "var(--coral)", fontWeight: 600 }}>Student Dashboard</Link>.</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>3. Access Issues & Delivery Troubleshooting</h2>
            <p>
              In rare cases of bank network latency where your account is debited but your pass is not immediately active:
            </p>
            <ul>
              <li>Please allow up to <strong>15 minutes</strong> for automated gateway reconciliation.</li>
              <li>Refresh your dashboard or log out and log back in.</li>
              <li>If the issue persists, please email your transaction screenshot to <a href={`mailto:${contactEmail}`} style={{ color: "var(--coral)", fontWeight: 600 }}>{contactEmail}</a> and our technical support team will manually verify and unlock your subscription within <strong>2 business hours</strong>.</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>4. Delivery Costs</h2>
            <p>
              Since all educational services and mock tests are provisioned digitally via online access, there are <strong>zero shipping, handling, or courier charges</strong>. The price displayed at checkout is inclusive of all service delivery fees.
            </p>
          </section>

          <section className="legal-section">
            <h2>5. Service Validity & Duration</h2>
            <p>
              Digital access remains valid for the exact duration of the purchased tier:
            </p>
            <ul>
              <li><strong>Single Exam Sprint Pass:</strong> 90 Days (3 Months) of continuous online access.</li>
              <li><strong>All-Exam Ultimate VIP Pass:</strong> 180 Days (6 Months) of unlimited online access across all test series.</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>6. Contact & Grievance Information</h2>
            <p>
              For any questions regarding service delivery or fulfillment:
            </p>
            <div style={{ background: "#f8faf9", padding: "16px 20px", borderRadius: "8px", marginTop: "12px", border: "1px solid #dbe6e1" }}>
              <p style={{ margin: "0 0 6px" }}><strong>Operating Business:</strong> W Technology (<a href="https://wtechnology.in" target="_blank" rel="noopener noreferrer">wtechnology.in</a>)</p>
              <p style={{ margin: "0 0 6px" }}><strong>Flagship EdTech Brand:</strong> Make My School (<a href="https://makemyschool.com" target="_blank" rel="noopener noreferrer">makemyschool.com</a>)</p>
              <p style={{ margin: "0 0 6px" }}><strong>Examination Platform:</strong> {portalName} (mock.wtechnology.in)</p>
              <p style={{ margin: "0 0 6px" }}><strong>Email Support:</strong> <a href={`mailto:${contactEmail}`}>{contactEmail}</a></p>
              <p style={{ margin: 0 }}><strong>Help Desk:</strong> <Link href="/contact">Support Center</Link></p>
            </div>
          </section>
        </div>
      </div>

      <Footer />
    </main>
  );
}
