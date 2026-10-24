import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getUserForToken } from "../lib/auth-store";
import { getFeaturedExams } from "../lib/catalog-server";
import { getSiteConfiguration } from "../lib/site-config";
import MegaMenu from "./components/MegaMenu";
import HeroSearch from "./components/HeroSearch";
import TestimonialsSection from "./components/TestimonialsSection";
import ConditionalCTA from "./components/ConditionalCTA";
import Footer from "./components/Footer";

const categories = [
  ["Teaching Exams", "BPSC TRE 4.0 · STET · CTET · Super TET", "🎓", "peach", "teaching"],
  ["Civil Services & PSC", "UPSC CSE · BPSC Admin · State PSC", "🏛️", "lavender", "civil"],
  ["Banking & SSC", "IBPS PO · Clerk · SSC CGL · CHSL", "🏦", "mint", "banking"],
  ["Engineering & Tech", "GATE · RRB JE · Technical & CS", "⚙️", "sky", "engineering"],
];

export default async function Home() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("northstar_session")?.value;
  const user = await getUserForToken(sessionToken);

  if (user && user.role !== "admin") {
    redirect("/dashboard");
  }

  const [config, exams] = await Promise.all([
    getSiteConfiguration(),
    getFeaturedExams(),
  ]);
  return (
    <main>
      {/* Dynamic 3-Layer Mega Menu */}
      <MegaMenu initialConfig={config} />

      {/* Hero Section */}
      <section className="hero" id="top">
        <div className="hero-copy">
          <div className="eyebrow" style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <span className="eyebrow-line" /> INDIA'S FOCUSED MOCK-TEST PLATFORM
            <span style={{ background: "#ecfdf5", color: "#065f46", padding: "2px 8px", borderRadius: "999px", fontSize: "0.72rem", fontWeight: 700, border: "1px solid #a7f3d0" }}>
              🇮🇳 हिंदी एवं English दोनों माध्यम
            </span>
            <span style={{ background: "#eff6ff", color: "#1d4ed8", padding: "2px 8px", borderRadius: "999px", fontSize: "0.72rem", fontWeight: 700, border: "1px solid #bfdbfe" }}>
              🤖 AI Tutor Enabled
            </span>
          </div>
          <h1 className="hero-headline">
            Practice with purpose.<br />
            <span className="headline-accent">Perform with confidence.</span>
          </h1>
          <p className="hero-lede">
            Realistic mock tests, clear analytics, and a smarter path to your next exam. Start with one question today.
          </p>

          {/* Interactive Working Hero Search */}
          <HeroSearch />

          {/* High-Impact Lead Magnet Hook */}
          <div style={{ marginTop: "14px", display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <Link
              href="/exams"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                background: "#fef3c7",
                border: "1px solid #fde68a",
                color: "#92400e",
                padding: "6px 14px",
                borderRadius: "999px",
                fontSize: "0.82rem",
                fontWeight: 700,
                textDecoration: "none",
                transition: "all 0.15s ease",
              }}
            >
              <span>🎁</span>
              <span>Take Free Diagnostic Mock Test (150 Qs + AI Analysis)</span>
              <span>↗</span>
            </Link>
            <span style={{ fontSize: "0.78rem", color: "#64748b", fontWeight: 600 }}>
              • No card required • Instant results
            </span>
          </div>

          <div className="hero-proof" style={{ marginTop: "20px" }}>
            <div className="proof-avatars">
              <span>AK</span>
              <span>RS</span>
              <span>PM</span>
              <b>+</b>
            </div>
            <p>
              <strong>15,000+ active aspirants</strong>
              <br />
              practising with 500+ official pattern mocks
            </p>
          </div>
        </div>

        {/* Live Interactive Examination Simulation Terminal */}
        <div className="hero-terminal-wrapper" aria-label="Live interactive examination terminal preview">
          <div className="hero-cbt-terminal">
            <div className="terminal-header">
              <div className="terminal-badges">
                <span className="terminal-pulse-badge">
                  <span className="live-dot" /> LIVE CBT SIMULATION
                </span>
                <span className="terminal-exam-title">BPSC TRE 4.0 · Paper 1</span>
              </div>
              <div className="terminal-timer">
                <span>⏱️ 14:28 Remaining</span>
              </div>
            </div>
            <div className="terminal-meta-bar">
              <span>QUESTION 24 OF 150</span>
              <span>Marking: <b className="mark-pos">+1.0</b> / <b className="mark-neg">−0.25</b></span>
            </div>
            <div className="terminal-question-box">
              <p className="terminal-question-text">
                Article 21A of the Constitution of India provides for which of the following Fundamental Rights?
              </p>
              <div className="terminal-options-list">
                <div className="terminal-option">
                  <span className="opt-marker">A</span>
                  <span className="opt-label">Equality before law and equal protection of the laws</span>
                </div>
                <div className="terminal-option selected-correct">
                  <span className="opt-marker">B</span>
                  <span className="opt-label">Right to free and compulsory education (Ages 6 to 14)</span>
                  <span className="opt-check">✓ Answer</span>
                </div>
                <div className="terminal-option">
                  <span className="opt-marker">C</span>
                  <span className="opt-label">Freedom of speech, expression, and assembly</span>
                </div>
                <div className="terminal-option">
                  <span className="opt-marker">D</span>
                  <span className="opt-label">Right to constitutional remedies under Supreme Court</span>
                </div>
              </div>
              <div className="terminal-solution-card">
                <div className="sol-badge">💡 STEP-BY-STEP EXPLANATION</div>
                <p className="sol-text">
                  The <strong>86th Constitutional Amendment Act, 2002</strong> inserted Article 21A, making education a Fundamental Right for children aged 6 to 14.
                </p>
              </div>
            </div>
            <div className="terminal-floating-card merit-card">
              <span className="merit-icon">🏆</span>
              <div>
                <strong>Bihar State Rank #142</strong>
                <small>Top 0.8% in General Studies Cohort</small>
              </div>
            </div>
            <div className="terminal-floating-card accuracy-card">
              <span className="acc-number">94.2%</span>
              <small>Accuracy in Pedagogy &amp; GS</small>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Live Trust & Capabilities Strip */}
      <section className="trust-strip">
        <span>EXAM-READY FOUNDATION</span>
        <div>
          <span className="trust-pill">🎯 100% Commission Syllabus Pattern</span>
          <span className="trust-pill">🤖 AI Bilingual Doubt Solver</span>
          <span className="trust-pill">⚡ Negative Marking Simulation</span>
          <span className="trust-pill">📱 1-Click WhatsApp Scorecards</span>
          <span className="trust-pill">🇮🇳 15,000+ Aspirants</span>
        </div>
      </section>

      {/* Featured Exams Section */}
      <section className="section" id="exams">
        <div className="section-intro">
          <div>
            <span className="kicker">FIND YOUR STARTING POINT</span>
            <h2>
              Exams that matter<br />
              <em>to your next chapter.</em>
            </h2>
          </div>
          <Link className="text-link" href="/exams">
            Browse all exams <span>↗</span>
          </Link>
        </div>

        <div className="exam-grid">
          {exams.map((exam) => {
            const imgSrc = exam.imageUrl
              ? exam.imageUrl.startsWith("http") || exam.imageUrl.startsWith("/")
                ? exam.imageUrl
                : `/${exam.imageUrl}`
              : null;
            return (
              <article className={`exam-card ${exam.tone}`} key={exam.title}>
                <div className="exam-visual">
                  {imgSrc ? (
                    <img
                      src={imgSrc}
                      alt={exam.title}
                      className="exam-card-custom-img"
                      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                    />
                  ) : (
                    <>
                      <span className="exam-symbol">{exam.symbol}</span>
                      <span className="exam-badge">{exam.badge}</span>
                      <div className="ring-shape" />
                    </>
                  )}
                  {imgSrc && exam.badge && (
                    <span className="exam-badge" style={{ position: "absolute", top: "12px", right: "12px", background: "rgba(255,255,255,0.95)", color: "#0f172a" }}>
                      {exam.badge}
                    </span>
                  )}
                </div>
                <div className="exam-body">
                  <small>{exam.meta}</small>
                  <h3>{exam.title}</h3>
                  <p>{exam.tests}<span> · </span>Free & premium</p>
                  <Link href={`/exams/${exam.slug}`}>
                    View test series <span>→</span>
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Categories Section */}
      <section className="section category-section" id="categories">
        <div className="section-intro">
          <div>
            <span className="kicker">EXPLORE BY CATEGORY</span>
            <h2>
              A better way to<br />
              <em>find your focus.</em>
            </h2>
          </div>
          <p className="section-note">
            Everything you need to practise<br />
            with intention, in one place.
          </p>
        </div>
        <div className="category-grid">
          {categories.map(([title, meta, icon, tone, slug]) => (
            <Link href={`/exams?category=${slug}`} className={`category-card ${tone}`} key={title}>
              <span className="category-icon">{icon}</span>
              <span>
                <strong>{title}</strong>
                <small>{meta}</small>
              </span>
              <b>↗</b>
            </Link>
          ))}
        </div>
      </section>

      {/* Practice Band */}
      <section className="practice-band" id="practice">
        <div className="practice-copy">
          <span className="kicker">START SMALL. GO FAR.</span>
          <h2>
            Your next best<br />
            <em>practice session.</em>
          </h2>
          <p>
            Short on time? Make the next 20 minutes count with focused tests built around the topics you need most.
          </p>
          <Link className="dark-button" href="/exams">
            Explore free tests <span>→</span>
          </Link>
        </div>
        <div className="practice-list">
          <Link href="/exams/bpsc-tre-4" className="practice-item" style={{ textDecoration: "none" }}>
            <div className="practice-number">01</div>
            <div>
              <small>QUICK PRACTICE · 20 MIN</small>
              <h3>Teaching aptitude essentials</h3>
              <p>20 questions <span>·</span> Beginner-friendly</p>
            </div>
            <span className="practice-arrow">↗</span>
          </Link>
          <Link href="/exams/bpsc-tre-4" className="practice-item" style={{ textDecoration: "none" }}>
            <div className="practice-number">02</div>
            <div>
              <small>PREVIOUS YEAR · 45 MIN</small>
              <h3>BPSC TRE General Studies</h3>
              <p>50 questions <span>·</span> Exam-level</p>
            </div>
            <span className="practice-arrow">↗</span>
          </Link>
          <Link href="/exams/bihar-stet" className="practice-item" style={{ textDecoration: "none" }}>
            <div className="practice-number">03</div>
            <div>
              <small>WEAK TOPIC · 15 MIN</small>
              <h3>Reasoning: series & patterns</h3>
              <p>15 questions <span>·</span> Personalised</p>
            </div>
            <span className="practice-arrow">↗</span>
          </Link>
        </div>
      </section>

      {/* How it Works / Analytics Feature */}
      <section className="feature-section" id="how-it-works">
        <div className="feature-image">
          <div className="feature-window">
            <div className="window-top">
              <span>Sarkari Practice</span>
              <i>•••</i>
            </div>
            <div className="window-content">
              <small>WEEKLY PROGRESS</small>
              <strong>Keep going, Aspirant.</strong>
              <div className="progress-number">78<span>%</span></div>
              <div className="progress-line"><i /></div>
              <div className="progress-days">
                <span>M</span><span>T</span><span>W</span><span className="current">T</span><span>F</span><span>S</span><span>S</span>
              </div>
            </div>
          </div>
          <div className="feature-sticker">
            ✦ <span>small wins<br />add up.</span>
          </div>
        </div>
        <div className="feature-copy">
          <span className="kicker">CLARITY AFTER EVERY TEST</span>
          <h2>
            Know exactly<br />
            <em>what to do next.</em>
          </h2>
          <p>
            Not just a score. See your accuracy by subject, understand every mistake, and get a clear recommendation for your next session.
          </p>
          <div className="feature-points">
            <div>
              <span>01</span>
              <strong>Simple, honest analytics</strong>
            </div>
            <div>
              <span>02</span>
              <strong>Weak-topic recommendations</strong>
            </div>
            <div>
              <span>03</span>
              <strong>Progress you can feel</strong>
            </div>
          </div>
          <Link className="text-link" href="/dashboard">
            See how analytics work <span>↗</span>
          </Link>
        </div>
      </section>

      {/* AI Strategic Advantage Section */}
      <section className="section" style={{ background: "linear-gradient(180deg, #f8fafc 0%, #eff6ff 100%)", borderRadius: "24px", padding: "64px 32px", margin: "40px auto", maxWidth: "1240px", border: "1px solid #e2e8f0" }}>
        <div style={{ textAlign: "center", maxWidth: "720px", margin: "0 auto 48px auto" }}>
          <span style={{ display: "inline-block", background: "#dbeafe", color: "#1e40af", padding: "4px 14px", borderRadius: "999px", fontSize: "0.8rem", fontWeight: 700, marginBottom: "12px", letterSpacing: "0.05em" }}>
            ✨ POWERED BY MODERN AI
          </span>
          <h2 style={{ fontSize: "2.2rem", fontWeight: 800, color: "#0f172a", margin: "0 0 16px 0", letterSpacing: "-0.03em" }}>
            Learn 3x faster with our <em style={{ fontStyle: "italic", color: "#4338ca" }}>AI Bilingual Doubt Tutor.</em>
          </h2>
          <p style={{ fontSize: "1.05rem", color: "#475569", lineHeight: "1.6", margin: 0 }}>
            No more waiting for teacher doubt sessions. Antigravity AI breaks down every question immediately after you finish your mock test.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px" }}>
          {/* Card 1 */}
          <div style={{ background: "#ffffff", padding: "32px 28px", borderRadius: "18px", border: "1px solid #cbd5e1", boxShadow: "0 4px 16px rgba(0,0,0,0.04)" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "#e0e7ff", color: "#4338ca", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", marginBottom: "20px" }}>
              🤖
            </div>
            <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#0f172a", margin: "0 0 10px 0" }}>
              Step-by-Step AI Doubt Tutor
            </h3>
            <p style={{ fontSize: "0.92rem", color: "#475569", lineHeight: "1.6", margin: 0 }}>
              On-demand explanations on every test scorecard. AI breaks down exactly why the correct answer is right and why your selected distractor was a common trap.
            </p>
          </div>

          {/* Card 2 */}
          <div style={{ background: "#ffffff", padding: "32px 28px", borderRadius: "18px", border: "1px solid #cbd5e1", boxShadow: "0 4px 16px rgba(0,0,0,0.04)" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "#fef3c7", color: "#b45309", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", marginBottom: "20px" }}>
              💡
            </div>
            <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#0f172a", margin: "0 0 10px 0" }}>
              Bilingual Mnemonics & Memory Tricks
            </h3>
            <p style={{ fontSize: "0.92rem", color: "#475569", lineHeight: "1.6", margin: 0 }}>
              Learn complex dates, articles, and formulas in Hindi &amp; English with high-yield memory aids crafted specifically for Indian competitive exams.
            </p>
          </div>

          {/* Card 3 */}
          <div style={{ background: "#ffffff", padding: "32px 28px", borderRadius: "18px", border: "1px solid #cbd5e1", boxShadow: "0 4px 16px rgba(0,0,0,0.04)" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "#dcfce7", color: "#15803d", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", marginBottom: "20px" }}>
              📱
            </div>
            <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#0f172a", margin: "0 0 10px 0" }}>
              1-Click WhatsApp Scorecard Sharing
            </h3>
            <p style={{ fontSize: "0.92rem", color: "#475569", lineHeight: "1.6", margin: 0 }}>
              Instantly share verified scorecard summaries, accuracy badges, and invite peer study groups on WhatsApp to compete on the live leaderboard.
            </p>
          </div>
        </div>
      </section>

      {/* Student & Parent Testimonials Section */}
      <TestimonialsSection initialTestimonials={config.testimonials} />

      {/* Final CTA */}
      <section className="final-cta">
        <span className="kicker">YOUR PREPARATION, YOUR PACE</span>
        <h2>
          Ready to make<br />
          <em>your attempt count?</em>
        </h2>
        <p>Join thousands of learners building their confidence one test at a time.</p>
        <ConditionalCTA
          loggedOutText="Create your free account"
          loggedOutHref="/register"
          loggedInText="Continue to Student Dashboard"
          loggedInHref="/dashboard"
          className="light-button"
        />
      </section>

      {/* Footer */}
      <Footer />
    </main>
  );
}