"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import MegaMenu from "../components/MegaMenu";
import Footer from "../components/Footer";

export default function RefundPage() {
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
        <span className="kicker">LEGAL & BILLING POLICY</span>
        <h1>Cancellation and Refund Policy</h1>
        <p className="static-lede">
          Last updated: October 2026. This Cancellation and Refund Policy governs the purchase of digital subscription passes and mock test series on {portalName} (operated by <strong>W Technology</strong>).
        </p>

        <div className="legal-content-card">
          <section className="legal-section">
            <h2>1. Nature of Digital Services</h2>
            <p>
              {portalName} provides online computer-based mock tests, question banks, detailed explanations, and performance analytical reports. Access to purchased mock test passes is provisioned <strong>electronically and immediately</strong> upon payment verification.
            </p>
          </section>

          <section className="legal-section">
            <h2>2. 48-Hour Satisfaction Guarantee & Eligibility for Refund</h2>
            <p>
              We are committed to providing the highest quality academic practice papers. If you experience technical defects, platform incompatibility, or accidental duplicate transactions:
            </p>
            <ul>
              <li>
                <strong>Unattempted / Minimal Usage:</strong> You may request a full refund within <strong>48 hours</strong> of transaction, provided you have attempted fewer than <strong>two (2)</strong> premium mock tests.
              </li>
              <li>
                <strong>Duplicate Payments:</strong> If your bank account or UPI handle was debited more than once for a single order due to network timeout or gateway delays, the duplicate amount will be refunded automatically or upon verification.
              </li>
              <li>
                <strong>Technical Inaccessibility:</strong> If you are unable to access the paid tests due to a verified technical outage on our servers lasting more than 24 hours from purchase, a full refund or subscription extension will be provided.
              </li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>3. Non-Refundable Scenarios</h2>
            <p>Refunds will not be issued in the following circumstances:</p>
            <ul>
              <li>Requests initiated after <strong>48 hours</strong> of subscription purchase.</li>
              <li>Accounts where more than two (2) premium tests have been attempted or where substantial test questions/solutions have already been viewed.</li>
              <li>Disqualification, change of mind regarding exam application, or changes in government examination schedules.</li>
              <li>Violations of our Terms of Service (such as account sharing, unauthorized screen recording, or automated scraping).</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>4. Refund Request Procedure</h2>
            <p>To request a refund, please follow these steps:</p>
            <ol>
              <li>Email our billing desk at <a href={`mailto:${contactEmail}`} style={{ color: "var(--coral)", fontWeight: 600 }}>{contactEmail}</a> with the subject line <em>"Refund Request - [Your Order Reference]"</em>.</li>
              <li>Provide your registered email address, Order Reference ID (found on your invoice or dashboard), payment screenshot, and the reason for your refund request.</li>
              <li>Our verification team will review your account usage within <strong>24 business hours</strong>.</li>
            </ol>
          </section>

          <section className="legal-section">
            <h2>5. Refund Processing Timeline & Method</h2>
            <p>
              Once your refund request is approved by our billing team:
            </p>
            <ul>
              <li>The refund is credited back directly to the <strong>original payment method</strong> (UPI account, Credit/Debit Card, Net Banking, or Wallet) through our payment gateway (Razorpay).</li>
              <li>Depending on your issuing bank or UPI network, the funds will reflect in your account within <strong>5 to 7 business days</strong>.</li>
              <li>An official refund confirmation email containing the Gateway Refund Reference ID will be sent to your registered email address.</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>6. Subscription Cancellation</h2>
            <p>
              Users may cancel recurring plans at any time from their <Link href="/dashboard" style={{ color: "var(--coral)", fontWeight: 600 }}>Student Dashboard</Link>. Upon cancellation, you will continue to have full access until the end of your current active billing cycle.
            </p>
          </section>

          <section className="legal-section">
            <h2>7. Contact & Billing Grievance Redressal</h2>
            <p>
              For all payment-related questions, invoice requests, or billing queries, contact our dedicated nodal desk:
            </p>
            <div style={{ background: "#f8faf9", padding: "16px 20px", borderRadius: "8px", marginTop: "12px", border: "1px solid #dbe6e1" }}>
              <p style={{ margin: "0 0 6px" }}><strong>Operating Entity:</strong> W Technology</p>
              <p style={{ margin: "0 0 6px" }}><strong>Platform:</strong> {portalName}</p>
              <p style={{ margin: "0 0 6px" }}><strong>Email:</strong> <a href={`mailto:${contactEmail}`}>{contactEmail}</a></p>
              <p style={{ margin: "0 0 6px" }}><strong>Official Website:</strong> <a href="https://wtechnology.in" target="_blank" rel="noopener noreferrer">https://wtechnology.in</a></p>
              <p style={{ margin: 0 }}><strong>Support Ticket:</strong> <Link href="/contact">Visit Support Center</Link></p>
            </div>
          </section>
        </div>
      </div>

      <Footer />
    </main>
  );
}
