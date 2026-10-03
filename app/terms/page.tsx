"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import MegaMenu from "../components/MegaMenu";

export default function TermsPage() {
  const [portalName, setPortalName] = useState("India Mock Tests");

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

  return (
    <main className="static-public-page">
      <MegaMenu />

      <div className="static-page-container" style={{ maxWidth: "860px" }}>
        <span className="kicker">LEGAL & COMPLIANCE</span>
        <h1>Terms and Conditions of Use</h1>
        <p className="static-lede">
          Last updated: October 2026. Please read these terms carefully before accessing or using the {portalName} Mock Test Platform.
        </p>

        <div className="legal-content-card">
          <section className="legal-section">
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing, browsing, registering for, or using {portalName} ("the Platform", "we", "us", or "our"), you agree to be bound by these Terms and Conditions and our Privacy Policy. If you do not agree to these terms, please do not use our services.
            </p>
          </section>

          <section className="legal-section">
            <h2>2. Educational Practice Disclaimer</h2>
            <p>
              {portalName} is an independent online learning and mock examination practice platform. All mock tests, question banks, previous year question analyses, syllabus guides, and scoring simulations (including BPSC, STET, BTET, CTET, UGC NET, etc.) are provided for educational and preparation purposes only.
            </p>
            <p>
              {portalName} is NOT affiliated with, sponsored by, or endorsed by the Bihar Public Service Commission (BPSC), Central Board of Secondary Education (CBSE), or any government examination authority. Official exam dates, admit cards, and regulations should always be verified on the respective official government portals.
            </p>
          </section>

          <section className="legal-section">
            <h2>3. User Accounts and Security</h2>
            <p>
              When you create an account on {portalName}, you must provide accurate, complete, and updated information. You are solely responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
            </p>
          </section>

          <section className="legal-section">
            <h2>4. Intellectual Property & Fair Use</h2>
            <p>
              The design, code, proprietary question explanations, analytical algorithms, and website content are the intellectual property of {portalName}. Users are granted a non-exclusive, non-transferable license to access and practice mock tests for personal, non-commercial educational use. Scraping, unauthorized copying, redistributing, or reselling platform content is strictly prohibited.
            </p>
          </section>

          <section className="legal-section">
            <h2>5. Advertisements & Third-Party Content (Google AdSense)</h2>
            <p>
              The Platform may display advertisements served by Google AdSense and other third-party ad networks. We do not endorse the products or services advertised by third parties. Your interactions with advertisers found on or through the Platform are solely between you and the advertiser.
            </p>
          </section>

          <section className="legal-section">
            <h2>6. Premium Subscriptions & Refund Policy</h2>
            <p>
              Certain mock test series and advanced analytics features require a paid subscription. Premium fees are charged in advance on a recurring or one-time basis. Refund requests are subject to our standard 7-day satisfaction policy provided fewer than 3 premium mock tests have been attempted.
            </p>
          </section>

          <section className="legal-section">
            <h2>7. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, {portalName} and its operators shall not be liable for any indirect, incidental, or consequential damages resulting from the use of or inability to use our examination platform or educational materials.
            </p>
          </section>

          <section className="legal-section">
            <h2>8. Modifications to Services and Terms</h2>
            <p>
              We reserve the right to modify, suspend, or discontinue any aspect of the Platform or these Terms at any time. Continued use of the platform after updates constitutes acceptance of the revised Terms.
            </p>
          </section>

          <section className="legal-section">
            <h2>9. Contact Us</h2>
            <p>
              For legal inquiries or questions regarding these Terms, please reach out through our <Link href="/contact" style={{ color: "var(--coral)", fontWeight: 600 }}>Support Page</Link> or email support@{portalName.toLowerCase()}.edu.
            </p>
          </section>
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
