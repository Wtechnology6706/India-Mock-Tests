"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import MegaMenu from "../components/MegaMenu";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [portalName, setPortalName] = useState("India Mock Tests");
  const [contactEmail, setContactEmail] = useState("support@indiamocktests.com");
  const [supportPhone, setSupportPhone] = useState("+91 98765 43210");

  useEffect(() => {
    fetch("/api/config")
      .then((res) => res.json())
      .then((data) => {
        if (data?.config) {
          if (data.config.portalName) setPortalName(data.config.portalName);
          if (data.config.contactEmail) setContactEmail(data.config.contactEmail);
          if (data.config.supportPhone) setSupportPhone(data.config.supportPhone);
        }
      })
      .catch(() => {});
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <main className="static-public-page">
      <MegaMenu />

      <div className="static-page-container" style={{ maxWidth: "860px" }}>
        <span className="kicker">SUPPORT & INQUIRIES</span>
        <h1>Get in touch with our team.</h1>
        <p className="static-lede">
          Have a question regarding mock test series, scoring patterns, or subscription access? We are here to help you succeed.
        </p>

        <div className="contact-layout-grid">
          {/* Contact Details Card */}
          <div className="contact-info-card">
            <h3>Student Helpdesk</h3>
            <p>Our academic support counselors and technical team respond to every learner ticket promptly.</p>

            <div className="contact-channel-item">
              <span className="channel-icon">✉️</span>
              <div>
                <strong>Email Support</strong>
                <a href={`mailto:${contactEmail}`}>{contactEmail}</a>
              </div>
            </div>

            <div className="contact-channel-item">
              <span className="channel-icon">📞</span>
              <div>
                <strong>Helpline (Mon - Sat)</strong>
                <span>{supportPhone}</span>
              </div>
            </div>

            <div className="contact-channel-item">
              <span className="channel-icon">⚡</span>
              <div>
                <strong>Response Time</strong>
                <span>Within 24 business hours</span>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="contact-form-wrapper">
            {submitted ? (
              <div className="contact-success-card">
                <span className="success-icon">✓</span>
                <h3>Message Received!</h3>
                <p>
                  Thank you for reaching out to {portalName}. A support ticket has been created and our team will email you shortly.
                </p>
                <button
                  type="button"
                  className="btn-send-another"
                  onClick={() => setSubmitted(false)}
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="contact-form-styled">
                <div className="form-group-field">
                  <label>Your Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    className="contact-input"
                  />
                </div>

                <div className="form-group-field">
                  <label>Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. rahul@example.com"
                    className="contact-input"
                  />
                </div>

                <div className="form-group-field">
                  <label>Subject / Topic *</label>
                  <select className="contact-input">
                    <option>Exam / Test Series Inquiry</option>
                    <option>Question / Answer Correction Report</option>
                    <option>Billing & Subscription Access</option>
                    <option>General Feedback / Suggestion</option>
                  </select>
                </div>

                <div className="form-group-field">
                  <label>Message / Details *</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Describe your query or issue in detail..."
                    className="contact-input"
                  />
                </div>

                <button type="submit" className="contact-submit-btn">
                  Send Message →
                </button>
              </form>
            )}
          </div>
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
