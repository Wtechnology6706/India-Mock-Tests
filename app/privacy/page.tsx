"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import MegaMenu from "../components/MegaMenu";
import Footer from "../components/Footer";

export default function PrivacyPage() {
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
        <span className="kicker">PRIVACY & DATA PROTECTION</span>
        <h1>Privacy Policy</h1>
        <p className="static-lede">
          Last updated: October 2026. This Privacy Policy outlines how {portalName} (operated by <strong>W Technology</strong>, accessible via <a href="https://wtechnology.in" target="_blank" rel="noopener noreferrer">wtechnology.in</a>) collects, handles, processes, and protects your personal and academic data in compliance with the Information Technology Act, 2000, Digital Personal Data Protection (DPDP) Act, 2023, and global standards (GDPR).
        </p>

        <div className="legal-content-card">
          <section className="legal-section">
            <h2>1. Information We Collect</h2>
            <p>We collect essential information to deliver computer-based mock tests, analytics, and maintain your educational record:</p>
            <ul>
              <li><strong>Account Credentials:</strong> Full Name, Email Address, Mobile Number, Target Examination preferences, and cryptographically salted password hashes.</li>
              <li><strong>Academic & Practice Metrics:</strong> Mock test attempts, question-level response timestamps, correct/incorrect selections, test scores, All-India rank percentiles, and subject-wise accuracy benchmarks.</li>
              <li><strong>Technical & Log Data:</strong> Device IP address, operating system, browser type, session duration, and page interactions to safeguard exam integrity and optimize performance.</li>
              <li><strong>Transaction Data:</strong> For paid VIP subscriptions, we record transaction identifiers, invoice amounts, order timestamps, and payment status. <em>We do NOT store complete credit/debit card numbers or net banking passwords; all financial processing is managed directly via RBI-authorized payment aggregators (Razorpay).</em></li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>2. Purpose and Legal Basis for Processing</h2>
            <p>We utilize the collected information strictly for legitimate educational and platform operations:</p>
            <ul>
              <li>Provisioning instant access to computer-based mock tests and personalized performance reports.</li>
              <li>Generating comparative rank percentiles and syllabus completion analytics.</li>
              <li>Authenticating user sessions and preventing fraudulent multiple logins.</li>
              <li>Sending critical account notifications, payment receipts, and exam schedule updates.</li>
              <li>Complying with statutory legal obligations and taxation requirements.</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>3. Payment Processing & PCI-DSS Security</h2>
            <p>
              When you purchase a subscription on {portalName}:
            </p>
            <ul>
              <li>Payments are processed securely through <strong>Razorpay Payment Gateway</strong>, which is certified <strong>PCI-DSS Level 1 compliant</strong> (the highest standard in payment security).</li>
              <li>All transactional communication is encrypted using industry-standard <strong>256-bit SSL/TLS encryption</strong>.</li>
              <li>We never sell, rent, or lease your billing or personal data to third-party marketing companies.</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>4. Cookies & Third-Party Vendors (Google AdSense)</h2>
            <p>
              {portalName} uses essential session cookies for user authentication and may use third-party advertising cookies:
            </p>
            <ul>
              <li><strong>Essential Cookies:</strong> Required to keep you securely signed in and track test question progress during active attempts.</li>
              <li><strong>Google AdSense & DoubleClick DART Cookies:</strong> Google, as a third-party vendor, uses cookies to serve non-intrusive educational advertisements based on visits to this and other websites. Users may opt out of personalized advertising by visiting <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer" style={{ color: "var(--coral)" }}>Google Ads Settings</a>.</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>5. Data Storage, Retention & Security</h2>
            <p>
              Your personal data and mock test attempt records are stored on secure cloud database servers with strict access controls, firewall monitoring, and regular backups. We retain your account data for as long as your account remains active or as required by applicable Indian laws.
            </p>
          </section>

          <section className="legal-section">
            <h2>6. User Rights & Data Deletion</h2>
            <p>Under Indian and international data protection laws, you possess the right to:</p>
            <ul>
              <li>Access a copy of the personal information we hold about you.</li>
              <li>Request correction of inaccurate or incomplete profile details.</li>
              <li>Request the complete deletion of your account and test history by emailing <a href={`mailto:${contactEmail}`}>{contactEmail}</a>.</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>7. Grievance Officer & Contact Information</h2>
            <p>
              In accordance with the Information Technology Act 2000 and rules made thereunder, the contact details of the Grievance Officer are provided below:
            </p>
            <div style={{ background: "#f8faf9", padding: "16px 20px", borderRadius: "8px", marginTop: "12px", border: "1px solid #dbe6e1" }}>
              <p style={{ margin: "0 0 6px" }}><strong>Company / Operator:</strong> W Technology</p>
              <p style={{ margin: "0 0 6px" }}><strong>Platform Name:</strong> {portalName}</p>
              <p style={{ margin: "0 0 6px" }}><strong>Grievance Email:</strong> <a href={`mailto:${contactEmail}`}>{contactEmail}</a></p>
              <p style={{ margin: "0 0 6px" }}><strong>Company Website:</strong> <a href="https://wtechnology.in" target="_blank" rel="noopener noreferrer">https://wtechnology.in</a></p>
              <p style={{ margin: 0 }}><strong>Response Timeline:</strong> Within 48 business hours</p>
            </div>
          </section>
        </div>
      </div>

      <Footer />
    </main>
  );
}
