import Link from "next/link";
import MegaMenu from "../../../components/MegaMenu";
import EarlyAccessNotifyForm from "../../../components/EarlyAccessNotifyForm";

interface TutorialPageProps {
  params: Promise<{ category: string; topic: string }>;
}

export function generateStaticParams() {
  return [
    { category: "tet", topic: "ctet" },
    { category: "tet", topic: "stet" },
    { category: "tet", topic: "bpsc-tre" },
    { category: "tet", topic: "ugc-net" },
    { category: "technical", topic: "programming" },
    { category: "technical", topic: "cloud-computing" },
    { category: "technical", topic: "ai-ml" },
    { category: "technical", topic: "networking" },
    { category: "technical", topic: "cybersecurity" },
  ];
}

const topicTitles: Record<string, string> = {
  ctet: "CTET Exam Tutorial & Concepts",
  stet: "STET Teacher Eligibility Video Series",
  "bpsc-tre": "BPSC TRE Teacher Recruitment Masterclass",
  "ugc-net": "UGC NET Paper 1 & Teaching Methodology",
  programming: "Programming Fundamentals (Python, Java, C++, JS)",
  "cloud-computing": "Cloud Computing (AWS, Azure & Cloud Infrastructure)",
  "ai-ml": "Artificial Intelligence & Machine Learning",
  networking: "Computer Networking & Protocols",
  cybersecurity: "Cybersecurity, Ethical Hacking & Defensive Systems",
};

export default async function TutorialPage({ params }: TutorialPageProps) {
  const { category, topic } = await params;
  const title = topicTitles[topic] || topic.replace(/-/g, " ").toUpperCase();
  const categoryLabel = category === "tet" ? "TET Tutorials" : "Technical Tutorials";

  return (
    <main className="development-page">
      <MegaMenu />

      <div className="dev-content-wrap">
        {/* Breadcrumb */}
        <nav className="dev-breadcrumb">
          <Link href="/">Home</Link>
          <span>/</span>
          <Link href="/tutorials">Tutorials</Link>
          <span>/</span>
          <span>{categoryLabel}</span>
          <span>/</span>
          <strong className="dev-current-crumb">{title}</strong>
        </nav>

        {/* Hero Card */}
        <section className="dev-hero-card tutorial-tone">
          <div className="dev-badge-row">
            <span className="dev-status-badge">📹 LECTURES & TUTORIALS IN PRODUCTION</span>
            <span className="dev-exam-badge">{categoryLabel}</span>
          </div>

          <h1>
            {title}
            <br />
            <em>Video tutorials & notes are currently under development.</em>
          </h1>

          <p className="dev-description">
            Our instructional design team is currently filming and curating high-definition concept lectures, chapter notes, and solved examples for <strong>{title}</strong>.
          </p>

          <div className="dev-notify-box">
            <h4>Get notified when this tutorial course is published:</h4>
            <EarlyAccessNotifyForm
              buttonText="Subscribe for Early Access 🔔"
              successMessage="You will be notified when this tutorial is released!"
            />
          </div>
        </section>

        <section className="dev-available-section">
          <div className="dev-section-heading">
            <div>
              <span className="kicker">AVAILABLE PRACTICE</span>
              <h2>Start Practicing with Live Mocks</h2>
            </div>
            <Link href="/exams" className="text-link">
              Explore test series ↗
            </Link>
          </div>

          <div className="dev-exams-grid">
            <Link href="/exams/bpsc-tre-4" className="dev-exam-card saffron">
              <span className="dev-card-icon">✦</span>
              <h3>BPSC TRE 4.0 Mock Tests</h3>
              <p>150-question mock tests with detailed solutions</p>
              <span className="dev-card-link">Start practice →</span>
            </Link>

            <Link href="/exams/bihar-stet" className="dev-exam-card blue">
              <span className="dev-card-icon">◒</span>
              <h3>Bihar STET Tests</h3>
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
