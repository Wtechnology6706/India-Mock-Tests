import Link from "next/link";
import MegaMenu from "../../components/MegaMenu";
import { fallbackExamDetails } from "../../../lib/catalog";
import { syllabusTracks } from "../../../lib/syllabus";
import { listMockTests, listSubjectRequests } from "../../../lib/admin-content";
import ExamTrackExplorer from "./ExamTrackExplorer";

export function generateStaticParams() {
  return Object.keys(fallbackExamDetails).map((slug) => ({ slug }));
}

export default async function ExamPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const exam = fallbackExamDetails[slug];
  const tracks = syllabusTracks[slug] ?? [];

  if (!exam) {
    return (
      <main className="simple-page">
        <MegaMenu />
        <div style={{ maxWidth: "800px", margin: "80px auto", textAlign: "center", padding: "0 20px" }}>
          <h2>Exam series not found</h2>
          <p style={{ color: "#6e827b", margin: "16px 0 24px" }}>
            The requested examination track is not available in our catalog.
          </p>
          <Link className="dark-button" href="/exams">
            ← Return to Exam Directory
          </Link>
        </div>
      </main>
    );
  }

  // Load published tests and learner demands for this exam
  const [initialTests, initialRequests] = await Promise.all([
    listMockTests({ examSlug: slug, status: "Published" }),
    listSubjectRequests(slug),
  ]);

  const totalPublishedCount = initialTests.filter((t) => t.status === "Published").length;
  const totalSubjectsCount = tracks.reduce((acc, t) => acc + t.subjects.length, 0);

  return (
    <main className="detail-page modern-exam-page">
      <MegaMenu />

      {/* Breadcrumbs */}
      <div className="exam-breadcrumb-container">
        <nav className="exam-breadcrumbs" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span className="breadcrumb-separator">/</span>
          <Link href="/exams">Exams Directory</Link>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">{exam.title}</span>
        </nav>
      </div>

      {/* Modern Hero Section */}
      <section className={`modern-exam-hero ${exam.tone}`}>
        <div className="exam-hero-content">
          <div className="exam-hero-badge-row">
            <span className="hero-exam-badge">{exam.badge || "Official Track"}</span>
            <span className="hero-syllabus-pill">✓ 2026 Official Syllabus Mapped</span>
            <span className="hero-cbt-pill">💻 CBT Mock Engine</span>
          </div>

          <h1 className="modern-exam-title">
            {exam.title}
            <span className="exam-subtitle-serif"> {exam.meta}</span>
          </h1>

          <p className="modern-exam-lede">{exam.description}</p>

          {/* Key Exam Metrics Quick Bar */}
          <div className="exam-specs-grid">
            <div className="spec-item">
              <span className="spec-icon">⏱️</span>
              <div>
                <span className="spec-label">Duration</span>
                <strong className="spec-val">{exam.duration || "150 min"}</strong>
              </div>
            </div>

            <div className="spec-item">
              <span className="spec-icon">📝</span>
              <div>
                <span className="spec-label">Questions</span>
                <strong className="spec-val">{exam.questionCount || 150} Questions</strong>
              </div>
            </div>

            <div className="spec-item">
              <span className="spec-icon">🎯</span>
              <div>
                <span className="spec-label">Marking Scheme</span>
                <strong className="spec-val">
                  {exam.correctMarks} Correct / {exam.wrongMarks} Wrong
                </strong>
              </div>
            </div>

            <div className="spec-item">
              <span className="spec-icon">🎛️</span>
              <div>
                <span className="spec-label">Format</span>
                <strong className="spec-val">{exam.optionCount || 4} Options CBT</strong>
              </div>
            </div>
          </div>

          <div className="modern-hero-actions">
            <a className="hero-primary-btn" href="#practice-tests-section">
              <span>Start Practice Tests ({totalPublishedCount} Live)</span>
              <span className="btn-arrow">⚡</span>
            </a>
            <a className="hero-secondary-btn" href="#syllabus-section">
              <span>Explore Syllabus & Tracks</span>
              <span>📖</span>
            </a>
          </div>
        </div>

        <div className="exam-hero-graphic" aria-hidden="true">
          <div className="graphic-symbol-circle">
            <span>{exam.symbol || "✦"}</span>
          </div>
          <div className="graphic-stats-card">
            <div className="graphic-stat">
              <strong style={{ color: "#1b784e" }}>{totalPublishedCount}</strong>
              <small>Live Mocks</small>
            </div>
            <div className="graphic-divider" />
            <div className="graphic-stat">
              <strong>{tracks.length}</strong>
              <small>Class Tracks</small>
            </div>
            <div className="graphic-divider" />
            <div className="graphic-stat">
              <strong>{totalSubjectsCount}</strong>
              <small>Subject Groups</small>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Workspace: Practice Tests first, Syllabus on Demand */}
      <section className="detail-content modern-exam-content" id="practice-tests-section">
        <div className="detail-main">
          {/* Interactive Exam Track Explorer handling both Live Tests and Collapsible/Modal Syllabus */}
          <ExamTrackExplorer
            tracks={tracks}
            initialTests={initialTests}
            initialRequests={initialRequests}
            examSlug={slug}
            examTitle={exam.title}
            examTone={exam.tone}
            examMeta={exam.meta}
          />
        </div>
      </section>

      {/* Exam Pattern & Marking Guidelines */}
      <section className="exam-pattern-section">
        <div className="pattern-container">
          <div className="pattern-header">
            <span className="section-kicker">EXAMINATION ARCHITECTURE</span>
            <h3>Official Exam Pattern & Marking Scheme</h3>
            <p>Standardized structure aligned with the latest recruitment commission notifications.</p>
          </div>

          <div className="pattern-grid">
            <div className="pattern-card">
              <div className="pattern-card-icon">📖</div>
              <h4>Part I: Language Qualifier</h4>
              <p>English and choice of Hindi / Urdu / Bangla. Qualifying in nature with minimum required benchmark.</p>
              <div className="pattern-meta-chip">30 Questions · 30 Marks</div>
            </div>

            <div className="pattern-card">
              <div className="pattern-card-icon">🧠</div>
              <h4>Part II: General Studies</h4>
              <p>Elementary Math, Mental Ability, General Science, Current Affairs, Indian National Movement & Geography.</p>
              <div className="pattern-meta-chip">40 Questions · 40 Marks</div>
            </div>

            <div className="pattern-card">
              <div className="pattern-card-icon">🎯</div>
              <h4>Part III: Concerned Subject</h4>
              <p>Specialized domain subject chosen as per candidate's graduation / post-graduation specialization.</p>
              <div className="pattern-meta-chip">80 Questions · 80 Marks</div>
            </div>

            <div className="pattern-card highlight-card">
              <div className="pattern-card-icon">⏱️</div>
              <h4>Total Test Duration & Rules</h4>
              <p>Single composite paper of 150 minutes without sectional time limits. Negative marking as per official norms.</p>
              <div className="pattern-meta-chip highlight">150 Min · 150 Total Marks</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="detail-footer modern-footer">
        <div className="footer-brand">
          <Link href="/">
            northstar<span>.</span>
          </Link>
          <p>Practice with purpose. Perform with confidence.</p>
        </div>
        <div className="footer-links">
          <Link href="/exams">All Exams</Link>
          <Link href="/pricing">VIP Subscription</Link>
          <Link href="/dashboard">Student Dashboard</Link>
        </div>
      </footer>
    </main>
  );
}
