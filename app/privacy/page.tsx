"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import MegaMenu from "../components/MegaMenu";

export default function PrivacyPage() {
  const [portalName, setPortalName] = useState("Northstar");

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
        <span className="kicker">PRIVACY & COOKIES</span>
        <h1>Privacy Policy</h1>
        <p className="static-lede">
          Last updated: October 2026. This Privacy Policy describes how {portalName} collects, uses, protects, and discloses your information in compliance with Google AdSense, GDPR, and data protection regulations.
        </p>

        <div className="legal-content-card">
          <section className="legal-section">
            <h2>1. Information We Collect</h2>
            <p>We collect information to provide better mock test experiences to our learners:</p>
            <ul>
              <li><strong>Personal Information:</strong> Full name, email address, target examination preferences, and login credentials when you register.</li>
              <li><strong>Academic & Practice Data:</strong> Questions answered, test scores, accuracy metrics, time spent per section, and study progress.</li>
              <li><strong>Log Data & Technical Info:</strong> IP address, browser type, device information, operating system, and pages visited.</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>2. Google AdSense & Cookie Policies (DoubleClick DART Cookie)</h2>
            <p>
              {portalName} works with Google as a third-party vendor to serve advertisements on our platform.
            </p>
            <ul>
              <li>Google uses cookies, including the DoubleClick DART cookie, to serve ads to our users based on their visit to our site and other sites on the Internet.</li>
              <li>Users may opt out of the use of the DART cookie by visiting the <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer" style={{ color: "var(--coral)" }}>Google Ad and Content Network Privacy Policy</a>.</li>
              <li>Third-party ad servers or ad networks use technology in their respective advertisements and links that appear on {portalName}, which are sent directly to your browser. They automatically receive your IP address when this occurs.</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>3. How We Use Your Information</h2>
            <p>We use the collected information for:</p>
            <ul>
              <li>Delivering personalized test score analytics and syllabus recommendations.</li>
              <li>Authenticating user sessions and maintaining test history.</li>
              <li>Communicating important exam notifications, score reports, and platform updates.</li>
              <li>Preventing fraud, abuse, and ensuring platform security.</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>4. Data Protection & Security</h2>
            <p>
              We implement industry-standard security measures including cryptographically salted hashing (Scrypt/SHA-256), encrypted database sessions, and SSL/TLS transport layer security to safeguard your personal information.
            </p>
          </section>

          <section className="legal-section">
            <h2>5. Third-Party Links & Privacy Policies</h2>
            <p>
              Our website may contain links to other educational websites or official examination boards. Please note that {portalName} has no control over the content and practices of these external sites and cannot accept responsibility for their respective privacy policies.
            </p>
          </section>

          <section className="legal-section">
            <h2>6. Children's Information & Fair Educational Use</h2>
            <p>
              Protecting the privacy of young learners is paramount. {portalName} does not knowingly collect any personally identifiable information from children under the age of 13. If you believe your child has provided personal information on our website, please contact us immediately.
            </p>
          </section>

          <section className="legal-section">
            <h2>7. User Rights (GDPR & CCPA Compliance)</h2>
            <p>
              You have the right to request copies of your personal data, request corrections, or request deletion of your account and test attempt history at any time through our support team.
            </p>
          </section>

          <section className="legal-section">
            <h2>8. Contact Information</h2>
            <p>
              If you have any questions or concerns about this Privacy Policy or Google AdSense disclosures, please contact us at <Link href="/contact" style={{ color: "var(--coral)", fontWeight: 600 }}>Support Center</Link> or email privacy@{portalName.toLowerCase()}.edu.
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
