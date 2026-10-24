import { Metadata } from "next";
import Link from "next/link";
import MegaMenu from "../components/MegaMenu";
import Footer from "../components/Footer";
import EarlyAccessNotifyForm from "../components/EarlyAccessNotifyForm";

export const metadata: Metadata = {
  title: "Concept Tutorials & Video Masterclasses | Sarkari Practice",
  description:
    "Comprehensive video tutorials, chapter-by-chapter concept breakdowns, and revision notes for BPSC TRE 4.0, Bihar STET, CTET, and competitive teaching exams.",
};

export default function TutorialsHubPage() {
  return (
    <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#f8fafc" }}>
      <MegaMenu />

      <div style={{ flex: 1, maxWidth: "1000px", width: "100%", margin: "0 auto", padding: "40px 20px" }}>
        {/* Breadcrumb */}
        <nav style={{ fontSize: "13px", color: "#64748b", marginBottom: "24px", display: "flex", gap: "8px", alignItems: "center" }}>
          <Link href="/" style={{ color: "#475569", textDecoration: "none" }}>
            Home
          </Link>
          <span>/</span>
          <strong style={{ color: "#0f172a" }}>Tutorials & Masterclasses</strong>
        </nav>

        {/* Hero Card */}
        <div
          style={{
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: "16px",
            padding: "50px 32px",
            textAlign: "center",
            boxShadow: "0 10px 30px rgba(0,0,0,0.04)",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 16px",
              background: "#fef3c7",
              color: "#92400e",
              borderRadius: "20px",
              fontSize: "0.82rem",
              fontWeight: 800,
              letterSpacing: "0.5px",
              marginBottom: "20px",
            }}
          >
            <span>📹</span> VIDEO LECTURES & CONCEPT NOTES
          </div>

          <h1 style={{ fontSize: "2.4rem", fontWeight: 800, color: "#0f172a", margin: "0 0 16px", lineHeight: 1.25 }}>
            Comprehensive Video Masterclasses
            <br />
            <span style={{ color: "#d96548" }}>Launching Very Soon!</span>
          </h1>

          <p style={{ color: "#475569", fontSize: "1.05rem", lineHeight: 1.6, maxWidth: "640px", margin: "0 auto 36px" }}>
            Our top faculty and subject experts are curating high-definition concept lectures, PYQ video explanations, and downloadable PDF revision summaries for BPSC TRE, Bihar STET, and CTET.
          </p>

          {/* Value Pillars */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "20px",
              textAlign: "left",
              margin: "0 0 36px",
            }}
          >
            <div style={{ background: "#f8fafc", padding: "22px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
              <div style={{ fontSize: "28px", marginBottom: "10px" }}>🎯</div>
              <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "#0f172a", margin: "0 0 6px" }}>
                Teaching Exam Masterclasses
              </h3>
              <p style={{ fontSize: "0.86rem", color: "#64748b", margin: 0, lineHeight: 1.5 }}>
                Bilingual theory breakdown covering CDP, Pedagogy, General Studies, Science, and Mathematics.
              </p>
            </div>

            <div style={{ background: "#f8fafc", padding: "22px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
              <div style={{ fontSize: "28px", marginBottom: "10px" }}>📑</div>
              <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "#0f172a", margin: "0 0 6px" }}>
                High-Yield PDF Revision Notes
              </h3>
              <p style={{ fontSize: "0.86rem", color: "#64748b", margin: 0, lineHeight: 1.5 }}>
                Downloadable formula sheets, mnemonics, and chapter mind maps curated for speedy revision.
              </p>
            </div>

            <div style={{ background: "#f8fafc", padding: "22px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
              <div style={{ fontSize: "28px", marginBottom: "10px" }}>⚡</div>
              <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "#0f172a", margin: "0 0 6px" }}>
                Interactive MCQ Checks
              </h3>
              <p style={{ fontSize: "0.86rem", color: "#64748b", margin: 0, lineHeight: 1.5 }}>
                Directly test your concept mastery with topic-level quiz checkpoints linked with our mock test system.
              </p>
            </div>
          </div>

          {/* Email Notification Box */}
          <div
            style={{
              background: "#fffbeb",
              border: "1px solid #fde68a",
              borderRadius: "12px",
              padding: "24px 20px",
              maxWidth: "520px",
              margin: "0 auto 32px",
            }}
          >
            <h4 style={{ margin: "0 0 8px", color: "#92400e", fontSize: "0.98rem", fontWeight: 700 }}>
              🔔 Want to be notified when tutorials go live?
            </h4>
            <p style={{ margin: "0 0 16px", color: "#78350f", fontSize: "0.84rem" }}>
              Drop your email to receive early access passes and lecture release schedules.
            </p>
            <EarlyAccessNotifyForm
              buttonText="Notify Me 🔔"
              successMessage="You're on the early access list! We will email you once tutorials go live."
            />
          </div>

          {/* CTA Back to Practice */}
          <div style={{ display: "flex", gap: "14px", justifyContent: "center", flexWrap: "wrap" }}>
            <Link
              href="/exams"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "12px 24px",
                background: "#059669",
                color: "#ffffff",
                borderRadius: "8px",
                fontWeight: 700,
                textDecoration: "none",
                fontSize: "0.92rem",
                boxShadow: "0 2px 8px rgba(5, 150, 105, 0.25)",
              }}
            >
              📝 Practice Live Mock Tests Now →
            </Link>
            <Link
              href="/pyq"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "12px 24px",
                background: "#ffffff",
                color: "#334155",
                border: "1px solid #cbd5e1",
                borderRadius: "8px",
                fontWeight: 700,
                textDecoration: "none",
                fontSize: "0.92rem",
              }}
            >
              📄 Previous Year Papers (PYQ)
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
