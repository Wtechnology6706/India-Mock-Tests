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

        {/* Bottom Bar with Powered By and Payment Logos */}
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

          {/* Visual Payment Logos (Mastercard, Visa, UPI, RuPay, GPay, PhonePe, Paytm, NetBanking) */}
          <div className="footer-payment-icons">
            <span className="payment-label">Accepted Payments:</span>

            {/* UPI Logo */}
            <div className="payment-logo-card" title="UPI Unified Payments Interface">
              <svg viewBox="0 0 70 24" className="pay-svg" aria-label="UPI">
                <rect width="70" height="24" rx="4" fill="#ffffff" />
                <path d="M12 6L20 18H14L10 12L12 6Z" fill="#097939" />
                <path d="M16 6L24 18H18L14 12L16 6Z" fill="#ED7524" />
                <text x="27" y="16.5" fontFamily="Arial, Helvetica, sans-serif" fontWeight="900" fontSize="11" fill="#2d3748" letterSpacing="0.5">UPI</text>
              </svg>
            </div>

            {/* Visa Logo */}
            <div className="payment-logo-card" title="Visa">
              <svg viewBox="0 0 50 24" className="pay-svg" aria-label="VISA">
                <rect width="50" height="24" rx="4" fill="#ffffff" />
                <text x="25" y="16.5" fontFamily="Arial, Helvetica, sans-serif" fontWeight="900" fontSize="13" fontStyle="italic" fill="#1A1F71" textAnchor="middle" letterSpacing="-0.5">VISA</text>
              </svg>
            </div>

            {/* Mastercard Logo */}
            <div className="payment-logo-card" title="Mastercard">
              <svg viewBox="0 0 50 24" className="pay-svg" aria-label="Mastercard">
                <rect width="50" height="24" rx="4" fill="#ffffff" />
                <circle cx="20" cy="12" r="7" fill="#EB001B" />
                <circle cx="30" cy="12" r="7" fill="#F79E1B" fillOpacity="0.88" />
              </svg>
            </div>

            {/* RuPay Logo */}
            <div className="payment-logo-card" title="RuPay">
              <svg viewBox="0 0 58 24" className="pay-svg" aria-label="RuPay">
                <rect width="58" height="24" rx="4" fill="#ffffff" />
                <text x="6" y="16.5" fontFamily="Arial, Helvetica, sans-serif" fontWeight="900" fontSize="11" fill="#005B9F">Ru</text>
                <text x="22" y="16.5" fontFamily="Arial, Helvetica, sans-serif" fontWeight="900" fontSize="11" fill="#E35205">Pay</text>
                <polygon points="46,7 53,12 46,17" fill="#00A859" />
              </svg>
            </div>

            {/* Google Pay Logo */}
            <div className="payment-logo-card" title="Google Pay">
              <svg viewBox="0 0 54 24" className="pay-svg" aria-label="Google Pay">
                <rect width="54" height="24" rx="4" fill="#ffffff" />
                <text x="8" y="16" fontFamily="Arial, Helvetica, sans-serif" fontWeight="700" fontSize="11" fill="#4285F4">G</text>
                <text x="20" y="16" fontFamily="Arial, Helvetica, sans-serif" fontWeight="600" fontSize="10" fill="#5f6368">Pay</text>
              </svg>
            </div>

            {/* PhonePe Logo */}
            <div className="payment-logo-card" title="PhonePe">
              <svg viewBox="0 0 54 24" className="pay-svg" aria-label="PhonePe">
                <rect width="54" height="24" rx="4" fill="#ffffff" />
                <circle cx="12" cy="12" r="7" fill="#5f259f" />
                <text x="12" y="15.5" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="9" fill="#ffffff" textAnchor="middle">पे</text>
                <text x="23" y="16" fontFamily="Arial, sans-serif" fontWeight="700" fontSize="9" fill="#5f259f">PhonePe</text>
              </svg>
            </div>

            {/* Paytm Logo */}
            <div className="payment-logo-card" title="Paytm">
              <svg viewBox="0 0 50 24" className="pay-svg" aria-label="Paytm">
                <rect width="50" height="24" rx="4" fill="#ffffff" />
                <text x="6" y="16" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="10" fill="#002970">Pay</text>
                <text x="27" y="16" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="10" fill="#00BAF2">tm</text>
              </svg>
            </div>

            {/* Net Banking */}
            <div className="payment-logo-card" title="Net Banking">
              <svg viewBox="0 0 64 24" className="pay-svg" aria-label="NetBanking">
                <rect width="64" height="24" rx="4" fill="#ffffff" />
                <text x="32" y="15.5" fontFamily="Arial, sans-serif" fontWeight="700" fontSize="9" fill="#1e293b" textAnchor="middle">🏦 NetBanking</text>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
