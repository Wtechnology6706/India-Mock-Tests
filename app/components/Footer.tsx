"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export default function Footer() {
  const [portalName, setPortalName] = useState("India Mock Tests");
  const [logoImageUrl, setLogoImageUrl] = useState("");

  useEffect(() => {
    fetch("/api/config")
      .then((res) => res.json())
      .then((data) => {
        if (data?.config?.portalName) setPortalName(data.config.portalName);
        if (data?.config?.logoImageUrl) setLogoImageUrl(data.config.logoImageUrl);
      })
      .catch(() => {});
  }, []);

  return (
    <footer className="global-site-footer">
      <div className="global-footer-container">
        {/* Top Section: Brand & Navigation Columns */}
        <div className="footer-grid">
          {/* Column 1: Brand & Identity */}
          <div className="footer-col footer-col-brand">
            <Link href="/" className="footer-brand-logo">
              {logoImageUrl ? (
                <img
                  src={logoImageUrl}
                  alt={portalName}
                  className="footer-logo-img"
                  style={{ maxHeight: "46px", width: "auto", objectFit: "contain" }}
                />
              ) : (
                <div className="footer-logo-text">
                  <span className="footer-logo-badge">I</span>
                  <span className="footer-logo-title">
                    {portalName}
                    <span className="footer-dot">.</span>
                  </span>
                </div>
              )}
            </Link>
            <p className="footer-brand-tagline">
              India&apos;s authoritative online examination simulation and CBT practice hub. Mapped directly to official recruitment commission syllabi and previous-year benchmarking.
            </p>
            <div className="footer-trust-badges">
              <span className="trust-badge-pill">🔒 256-Bit SSL Encrypted</span>
              <span className="trust-badge-pill">⚡ Instant Digital Access</span>
              <span className="trust-badge-pill">🇮🇳 100% Indian Exam Syllabus</span>
            </div>
          </div>

          {/* Column 2: Exam Hub */}
          <div className="footer-col">
            <h4 className="footer-heading">Top Exam Series</h4>
            <ul className="footer-link-list">
              <li>
                <Link href="/exams/bpsc-tre-4">BPSC TRE 4.0 Mock Tests</Link>
              </li>
              <li>
                <Link href="/exams/bihar-stet">Bihar STET 2026 Series</Link>
              </li>
              <li>
                <Link href="/exams/ctet">CTET Paper I & II Mocks</Link>
              </li>
              <li>
                <Link href="/exams">All State & Central Exams →</Link>
              </li>
              <li>
                <Link href="/pricing">VIP All-Access Pass</Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Learning & Platform */}
          <div className="footer-col">
            <h4 className="footer-heading">Student Center</h4>
            <ul className="footer-link-list">
              <li>
                <Link href="/dashboard">My Practice Dashboard</Link>
              </li>
              <li>
                <Link href="/pricing">VIP Pricing & Plans</Link>
              </li>
              <li>
                <Link href="/about">About India Mock Tests</Link>
              </li>
              <li>
                <Link href="/contact">Student Helpdesk & Support</Link>
              </li>
              <li>
                <Link href="/admin">Educator & Admin Portal</Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Legal & Gateway Compliance */}
          <div className="footer-col">
            <h4 className="footer-heading">Legal & Compliance</h4>
            <ul className="footer-link-list">
              <li>
                <Link href="/terms">Terms & Conditions</Link>
              </li>
              <li>
                <Link href="/privacy">Privacy Policy</Link>
              </li>
              <li>
                <Link href="/refund">Cancellation & Refund Policy</Link>
              </li>
              <li>
                <Link href="/shipping">Shipping & Digital Delivery</Link>
              </li>
              <li>
                <Link href="/contact">Grievance & Contact</Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Disclaimer Bar */}
        <div className="footer-disclaimer-bar">
          <p>
            <strong>Disclaimer:</strong> {portalName} is an independent educational mock testing platform developed and operated by <strong>W Technology</strong>. All examination names, logos, syllabi references, and trademarks (such as BPSC, BSEB, CBSE, CTET, STET) belong to their respective government authorities and examination bodies. Their use does not imply any affiliation, sponsorship, or endorsement.
          </p>
        </div>

        {/* Bottom Bar with Powered By and Payments */}
        <div className="footer-bottom-bar">
          <div className="footer-copyright">
            <span>© {new Date().getFullYear()} {portalName} · All Rights Reserved.</span>
          </div>

          {/* Powered by W Technology */}
          <div className="footer-powered-by">
            <span>Powered by </span>
            <a
              href="https://wtechnology.in"
              target="_blank"
              rel="noopener noreferrer"
              className="powered-by-link"
            >
              W Technology
            </a>
          </div>

          <div className="footer-payment-icons">
            <span className="payment-label">Supported Payments:</span>
            <span className="pay-badge">UPI</span>
            <span className="pay-badge">GPay</span>
            <span className="pay-badge">PhonePe</span>
            <span className="pay-badge">Paytm</span>
            <span className="pay-badge">RuPay</span>
            <span className="pay-badge">Visa / MC</span>
            <span className="pay-badge">NetBanking</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
