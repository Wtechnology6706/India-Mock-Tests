"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import MegaMenu from "../components/MegaMenu";
import Footer from "../components/Footer";

export default function TermsPage() {
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
        <span className="kicker">TERMS & LEGAL AGREEMENT</span>
        <h1>Terms and Conditions of Use</h1>
        <p className="static-lede">
          Last updated: October 2026. Please read these Terms and Conditions carefully before accessing or using {portalName} (developed and operated by <strong>W Technology</strong>, available at <a href="https://wtechnology.in" target="_blank" rel="noopener noreferrer">wtechnology.in</a>).
        </p>

        <div className="legal-content-card">
          <section className="legal-section">
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing, browsing, registering an account, or purchasing a subscription on {portalName} ("the Platform", "Service", "we", "us", or "our"), you ("User", "Student", or "Learner") agree to be bound by these Terms and Conditions, our <Link href="/privacy" style={{ color: "var(--coral)", fontWeight: 600 }}>Privacy Policy</Link>, and our <Link href="/refund" style={{ color: "var(--coral)", fontWeight: 600 }}>Refund Policy</Link>. If you do not agree with any part of these terms, you must not use this website.
            </p>
          </section>

          <section className="legal-section">
            <h2>2. Educational & Practice Simulation Disclaimer</h2>
            <p>
              {portalName} is an independent educational technology service designed to assist candidates with computer-based test (CBT) preparation, question bank practice, and performance analytics for various public competitive and recruitment examinations (such as BPSC TRE, Bihar STET, CTET, and State PSCs).
            </p>
            <p>
              <strong>Non-Government Affiliation:</strong> {portalName} and W Technology are private educational entities and are <strong>NOT affiliated with, authorized by, sponsored by, or endorsed by the Bihar Public Service Commission (BPSC), Bihar School Examination Board (BSEB), Central Board of Secondary Education (CBSE), or any government department</strong>. All official notification dates, eligibility requirements, and admit cards must be checked on respective official government portals.
            </p>
          </section>

          <section className="legal-section">
            <h2>3. User Account Registration & Security</h2>
            <p>
              To access personalized mock tests and test analytics, you must register an account. You agree to:
            </p>
            <ul>
              <li>Provide true, accurate, and current personal information during registration.</li>
              <li>Maintain the confidentiality of your login credentials.</li>
              <li>Not share, rent, resell, or distribute your account access to any third party. Single user account sharing is strictly monitored and subject to immediate suspension without refund.</li>
              <li>Notify us immediately of any unauthorized access to your account.</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>4. Pricing, Payments & Taxes</h2>
            <p>
              Access to free mock tests is provided without charge. Paid VIP passes (Sprint and Ultimate VIP) grant premium access as detailed on our <Link href="/pricing" style={{ color: "var(--coral)", fontWeight: 600 }}>Pricing Page</Link>.
            </p>
            <ul>
              <li>All prices are quoted in <strong>Indian Rupees (INR ₹)</strong>.</li>
              <li>Prices are inclusive of applicable Goods and Services Tax (GST) unless stated otherwise.</li>
              <li>Payments are processed securely via authorized payment gateways (Razorpay).</li>
              <li>Access to purchased digital passes is provisioned immediately upon transaction confirmation.</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>5. Cancellation and Refund Policy</h2>
            <p>
              Our refund policy is governed by our dedicated <Link href="/refund" style={{ color: "var(--coral)", fontWeight: 600 }}>Cancellation and Refund Policy</Link>. In brief, refunds may be requested within <strong>48 hours</strong> of purchase provided fewer than two (2) premium tests have been attempted and no terms violation has occurred.
            </p>
          </section>

          <section className="legal-section">
            <h2>6. Intellectual Property & Fair Use</h2>
            <p>
              The platform design, source code, questions curation, customized solutions, scoring engines, and brand assets are the exclusive intellectual property of <strong>W Technology</strong>. You are granted a personal, revocable, non-exclusive, non-transferable license to take mock tests for personal preparation. You may not copy, scrape, reverse-engineer, broadcast, or republish our question banks.
            </p>
          </section>

          <section className="legal-section">
            <h2>7. Limitation of Liability</h2>
            <p>
              While we make every effort to maintain accurate question banks and reliable exam engines, {portalName} and W Technology shall not be liable for any indirect, incidental, or consequential damages, including loss of study time, exam performance outcomes, or third-party internet disruptions. Mock test scores are for self-assessment only and do not guarantee final recruitment or exam selection.
            </p>
          </section>

          <section className="legal-section">
            <h2>8. Governing Law & Jurisdiction</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the Republic of India. Any disputes arising in connection with these Terms shall be subject to the exclusive jurisdiction of the competent courts in India.
            </p>
          </section>

          <section className="legal-section">
            <h2>9. Contact & Company Details</h2>
            <p>For any questions or legal inquiries regarding these Terms:</p>
            <div style={{ background: "#f8faf9", padding: "16px 20px", borderRadius: "8px", marginTop: "12px", border: "1px solid #dbe6e1" }}>
              <p style={{ margin: "0 0 6px" }}><strong>Operating Business:</strong> W Technology (<a href="https://wtechnology.in" target="_blank" rel="noopener noreferrer">wtechnology.in</a>)</p>
              <p style={{ margin: "0 0 6px" }}><strong>Associated Flagship Brand:</strong> Make My School (<a href="https://makemyschool.com" target="_blank" rel="noopener noreferrer">makemyschool.com</a>)</p>
              <p style={{ margin: "0 0 6px" }}><strong>Mock Test Platform:</strong> {portalName} (mock.wtechnology.in)</p>
              <p style={{ margin: "0 0 6px" }}><strong>Billing & Support Email:</strong> <a href={`mailto:${contactEmail}`}>{contactEmail}</a></p>
              <p style={{ margin: 0 }}><strong>Helpdesk:</strong> <Link href="/contact">Support Center</Link></p>
            </div>
          </section>
        </div>
      </div>

      <Footer />
    </main>
  );
}
