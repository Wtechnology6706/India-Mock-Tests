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
          <strong>India Mock Tests</strong> (<a href="https://mock.wtechnology.in" style={{ color: "var(--coral)", fontWeight: 600 }}>mock.wtechnology.in</a>) is a flagship digital examination simulation platform developed and operated by <strong>W Technology</strong> (<a href="https://wtechnology.in" target="_blank" rel="noopener noreferrer" style={{ color: "var(--coral)", fontWeight: 600 }}>wtechnology.in</a>) in close association with <strong>Make My School</strong> (<a href="https://makemyschool.com" target="_blank" rel="noopener noreferrer" style={{ color: "var(--coral)", fontWeight: 600 }}>makemyschool.com</a>).
        </p>

        {/* Corporate & EdTech Network Affiliation Box */}
        <div style={{
          background: "#ffffff",
          border: "1px solid #d9e4de",
          borderRadius: "12px",
          padding: "28px 32px",
          margin: "32px 0",
          boxShadow: "0 4px 16px rgba(23, 40, 36, 0.05)"
        }}>
          <span style={{
            fontSize: "11px",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: "var(--coral, #b94a2b)",
            display: "block",
            marginBottom: "8px"
          }}>
            PARENT ENTITY & PRODUCT ECOSYSTEM
          </span>
          <h2 style={{ fontSize: "22px", fontFamily: "Space Grotesk, sans-serif", color: "var(--ink, #172824)", margin: "0 0 14px" }}>
            Part of the W Technology & Make My School EdTech Network
          </h2>
          <p style={{ fontSize: "14.5px", lineHeight: "1.7", color: "#4d635c", margin: "0 0 16px" }}>
            <strong>W Technology</strong> is an educational and technological solutions enterprise specializing in institutional school ERP, examination management systems, and high-stakes digital practice portals. Our core ecosystem products include:
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px", marginTop: "16px" }}>
            <div style={{ background: "#f8faf9", padding: "16px 20px", borderRadius: "8px", border: "1px solid #e1ebe6" }}>
              <div style={{ fontSize: "18px", marginBottom: "4px" }}>🏫</div>
              <strong style={{ display: "block", color: "var(--ink)", fontSize: "15px" }}>Make My School</strong>
              <small style={{ color: "#627a72", display: "block", marginTop: "4px" }}>
                Flagship school management and educational ERP suite (<a href="https://makemyschool.com" target="_blank" rel="noopener noreferrer" style={{ color: "#0284c7" }}>makemyschool.com</a>).
              </small>
            </div>

            <div style={{ background: "#f8faf9", padding: "16px 20px", borderRadius: "8px", border: "1px solid #e1ebe6" }}>
              <div style={{ fontSize: "18px", marginBottom: "4px" }}>🎯</div>
              <strong style={{ display: "block", color: "var(--ink)", fontSize: "15px" }}>India Mock Tests</strong>
              <small style={{ color: "#627a72", display: "block", marginTop: "4px" }}>
                Dedicated CBT examination practice, teacher recruitment series, and question bank engine.
              </small>
            </div>

            <div style={{ background: "#f8faf9", padding: "16px 20px", borderRadius: "8px", border: "1px solid #e1ebe6" }}>
              <div style={{ fontSize: "18px", marginBottom: "4px" }}>⚙️</div>
              <strong style={{ display: "block", color: "var(--ink)", fontSize: "15px" }}>W Technology Core</strong>
              <small style={{ color: "#627a72", display: "block", marginTop: "4px" }}>
                Parent engineering & digital infrastructure umbrella (<a href="https://wtechnology.in" target="_blank" rel="noopener noreferrer" style={{ color: "#0284c7" }}>wtechnology.in</a>).
              </small>
            </div>
          </div>
          <p style={{ fontSize: "12.5px", color: "#7a9188", marginTop: "16px", marginBottom: 0, fontStyle: "italic" }}>
            💡 Notice for Billing & Payment Verification: All online transactions, merchant payouts, and subscriptions across India Mock Tests and associated subdomains are officially processed and billed under the approved merchant entity <strong>W Technology / Make My School</strong>.
          </p>
        </div>

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
