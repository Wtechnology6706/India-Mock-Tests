import Link from "next/link";
import MegaMenu from "../components/MegaMenu";
import Footer from "../components/Footer";

export default function AboutPage() {
  return (
    <main className="static-public-page">
      <MegaMenu />

      <div className="static-page-container">
        <span className="kicker">ABOUT INDIA MOCK TESTS PLATFORM</span>
        <h1>Empowering Every Aspirant<br /><em>with Trustworthy Practice.</em></h1>
        <p className="static-lede">
          <strong>India Mock Tests</strong> (developed and operated by <strong>W Technology</strong>, <a href="https://wtechnology.in" target="_blank" rel="noopener noreferrer" style={{ color: "var(--coral)", fontWeight: 600 }}>wtechnology.in</a>) was built to eliminate guesswork from competitive exam preparation. We combine authentic syllabus alignment, precision scoring analytics, and high-yield question curation for aspirants nationwide.
        </p>

        <div className="about-values-grid">
          <div className="about-value-card">
            <span className="value-icon">🎯</span>
            <h3>Precise Syllabus Mapping</h3>
            <p>Every test question is authored and tagged directly to official exam notifications, editions, subjects, and topics.</p>
          </div>
          <div className="about-value-card">
            <span className="value-icon">⚖️</span>
            <h3>Authentic Scoring Rules</h3>
            <p>Full support for exact marking schemes, 4-option / 5-option formats, and negative penalties mirroring real exam interfaces.</p>
          </div>
          <div className="about-value-card">
            <span className="value-icon">📊</span>
            <h3>Deep Diagnostic Insights</h3>
            <p>Clear accuracy breakdowns, All-India rank percentiles, and actionable weak-topic recommendations after every attempt.</p>
          </div>
        </div>

        <div className="about-cta-box">
          <h2>Ready to start your exam journey?</h2>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", marginTop: "18px", flexWrap: "wrap" }}>
            <Link href="/exams" className="admin-btn-primary" style={{ padding: "12px 24px", fontSize: "14px" }}>
              Explore Test Series →
            </Link>
            <Link href="/register" className="admin-btn-secondary" style={{ padding: "12px 24px", fontSize: "14px" }}>
              Create Free Account
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
