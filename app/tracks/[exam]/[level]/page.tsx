import Link from "next/link";
import MegaMenu from "../../../components/MegaMenu";
import EarlyAccessNotifyForm from "../../../components/EarlyAccessNotifyForm";

interface TrackPageProps {
  params: Promise<{ exam: string; level: string }>;
}

export function generateStaticParams() {
  return [
    { exam: "bpsc-tre-4", level: "primary-1-5" },
    { exam: "bpsc-tre-4", level: "middle-6-8" },
    { exam: "bpsc-tre-4", level: "secondary-9-10" },
    { exam: "bpsc-tre-4", level: "higher-secondary-11-12" },
    { exam: "bihar-stet", level: "paper-1-primary" },
    { exam: "bihar-stet", level: "paper-1-middle" },
    { exam: "bihar-stet", level: "paper-1" },
    { exam: "bihar-stet", level: "paper-2" },
    { exam: "btet", level: "paper-1" },
    { exam: "btet", level: "paper-2" },
    { exam: "btet", level: "paper-3" },
    { exam: "btet", level: "paper-4" },
    { exam: "ctet", level: "paper-1" },
    { exam: "ctet", level: "paper-2" },
    { exam: "ctet", level: "secondary-prep" },
    { exam: "ctet", level: "senior-prep" },
  ];
}

const examLabels: Record<string, { title: string; tone: string }> = {
  "bpsc-tre-4": { title: "BPSC TRE 4.0", tone: "saffron" },
  "bihar-stet": { title: "Bihar STET", tone: "blue" },
  btet: { title: "BTET (Bihar Teacher Eligibility)", tone: "peach" },
  ctet: { title: "CTET (Central Board)", tone: "mint" },
};

const levelLabels: Record<string, { name: string; audience: string }> = {
  "primary-1-5": { name: "Class 1–5 (Primary Level)", audience: "Primary Teacher Recruitment" },
  "middle-6-8": { name: "Class 6–8 (Middle School)", audience: "Upper Primary / Graduate Teacher" },
  "secondary-9-10": { name: "Class 9–10 (Secondary TGT)", audience: "Secondary School Teacher" },
  "higher-secondary-11-12": { name: "Class 11–12 (Higher Secondary PGT)", audience: "Post Graduate Teacher" },
  "paper-1-primary": { name: "Class 1–5 (Paper I Foundation)", audience: "Primary Eligibility" },
  "paper-1-middle": { name: "Class 6–8 (Paper I Upper Primary)", audience: "Middle Eligibility" },
  "paper-1": { name: "Class 9–10 (Paper I Secondary)", audience: "Secondary Teacher Eligibility" },
  "paper-2": { name: "Class 11–12 (Paper II Higher Secondary)", audience: "Senior Secondary Eligibility" },
  "paper-3": { name: "Class 9–10 (Secondary Paper)", audience: "Secondary Teacher Track" },
  "paper-4": { name: "Class 11–12 (Senior Secondary Paper)", audience: "Higher Secondary Track" },
  "secondary-prep": { name: "Class 9–10 (Secondary Practice)", audience: "Secondary Preparation" },
  "senior-prep": { name: "Class 11–12 (Senior Practice)", audience: "Senior Secondary Preparation" },
};

export default async function TrackPage({ params }: TrackPageProps) {
  const { exam, level } = await params;
  const examInfo = examLabels[exam] || { title: exam.toUpperCase(), tone: "saffron" };
  const levelInfo = levelLabels[level] || {
    name: level.replace(/-/g, " ").toUpperCase(),
    audience: "Target Exam Track",
  };

  return (
    <main className="development-page">
      <MegaMenu />

      <div className="dev-content-wrap">
        {/* Breadcrumb */}
        <nav className="dev-breadcrumb">
          <Link href="/">Home</Link>
          <span>/</span>
          <Link href="/exams">Mock Test</Link>
          <span>/</span>
          <span>{examInfo.title}</span>
          <span>/</span>
          <strong className="dev-current-crumb">{levelInfo.name}</strong>
        </nav>

        {/* Hero Card */}
        <section className={`dev-hero-card ${examInfo.tone}`}>
          <div className="dev-badge-row">
            <span className="dev-status-badge">🛠️ CURRICULUM MAPPING IN PROGRESS</span>
            <span className="dev-exam-badge">{examInfo.title}</span>
          </div>

          <h1>
            {levelInfo.name}
            <br />
            <em>Test series under active development.</em>
          </h1>

          <p className="dev-description">
            Our subject matter experts and question authors are actively compiling question banks,
            previous-year patterns, and topic-wise mock tests for <strong>{examInfo.title} - {levelInfo.name}</strong> ({levelInfo.audience}).
          </p>

          <div className="dev-notify-box">
            <h4>Get notified when this test series goes live:</h4>
            <EarlyAccessNotifyForm
              buttonText="Notify Me When Ready 🔔"
              successMessage="Thank you! You will be notified as soon as this series launches."
            />
            <small className="dev-privacy-note">🔒 No spam. We will only email you when tests for this syllabus are published.</small>
          </div>
        </section>

        {/* Available Live Series Grid */}
        <section className="dev-available-section">
          <div className="dev-section-heading">
            <div>
              <span className="kicker">READY TO PRACTICE NOW</span>
              <h2>Explore Live Test Series</h2>
            </div>
            <Link href="/exams" className="text-link">
              View all exams directory ↗
            </Link>
          </div>

          <div className="dev-exams-grid">
            <Link href="/exams/bpsc-tre-4" className="dev-exam-card saffron">
              <span className="dev-card-icon">✦</span>
              <h3>BPSC TRE 4.0</h3>
              <p>General Studies & Teaching Aptitude Full Mocks</p>
              <span className="dev-card-link">Start practice →</span>
            </Link>

            <Link href="/exams/bihar-stet" className="dev-exam-card blue">
              <span className="dev-card-icon">◒</span>
              <h3>Bihar STET</h3>
              <p>Pedagogy, Art of Teaching & Subject Practice</p>
              <span className="dev-card-link">Start practice →</span>
            </Link>
          </div>
        </section>
      </div>

      <footer className="footer">
        <Link className="logo" href="/">
          <span className="logo-mark">N</span>
          <span>northstar<span className="logo-dot">.</span></span>
        </Link>
        <p>Find your exam. Find your focus. Find your way forward.</p>
        <div className="footer-links">
          <Link href="/exams">Exams</Link>
          <Link href="/plans">Plans</Link>
          <Link href="/notifications">Notifications</Link>
          <Link href="/about">About</Link>
          <Link href="/contact">Support</Link>
        </div>
        <small>© 2026 Northstar Learning Technologies · Privacy · Terms</small>
      </footer>
    </main>
  );
}
