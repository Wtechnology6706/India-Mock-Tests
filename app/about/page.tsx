import Link from "next/link";
import MegaMenu from "../components/MegaMenu";

export default function AboutPage() {
  return (
    <main className="static-public-page">
      <MegaMenu />

      <div className="static-page-container">
        <span className="kicker">ABOUT INDIA MOCK TESTS PLATFORM</span>
        <h1>Empowering Every Aspirant<br /><em>with Trustworthy Practice.</em></h1>
        <p className="static-lede">
          India Mock Tests was built to eliminate guesswork from competitive exam preparation. We combine real syllabus alignment, precision scoring analytics, and high-yield question curation.
        </p>

        <div className="about-values-grid">
          <div className="about-value-card">
            <span className="value-icon">🎯</span>
            <h3>Precise Syllabus Mapping</h3>
            <p>Every test question is tagged to the official exam notification, edition, subject, and topic.</p>
          </div>
          <div className="about-value-card">
            <span className="value-icon">⚖️</span>
            <h3>Authentic Scoring Rules</h3>
            <p>Full support for exact marking schemes, 4-option / 5-option formats, and negative penalties.</p>
          </div>
          <div className="about-value-card">
            <span className="value-icon">📊</span>
            <h3>Deep Diagnostic Insights</h3>
            <p>Clear accuracy breakdowns and actionable weak-topic recommendations after every attempt.</p>
          </div>
        </div>

        <div className="about-cta-box">
          <h2>Ready to start your exam journey?</h2>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", marginTop: "18px" }}>
            <Link href="/exams" className="admin-btn-primary" style={{ padding: "12px 24px", fontSize: "14px" }}>
              Explore Test Series →
            </Link>
            <Link href="/register" className="admin-btn-secondary" style={{ padding: "12px 24px", fontSize: "14px" }}>
              Create Free Account
            </Link>
          </div>
        </div>
      </div>

      <footer className="footer">
        <Link className="logo" href="/">
          <span className="logo-mark">I</span>
          <span>India Mock Tests<span className="logo-dot">.</span></span>
        </Link>
        <p>Find your exam. Find your focus. Find your way forward.</p>
        <div className="footer-links">
          <Link href="/exams">Exams</Link>
          <Link href="/plans">Plans</Link>
          <Link href="/notifications">Notifications</Link>
          <Link href="/about">About</Link>
          <Link href="/contact">Support</Link>
        </div>
        <small>© 2026 India Mock Tests · Privacy · Terms</small>
      </footer>
    </main>
  );
}
