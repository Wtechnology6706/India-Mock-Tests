import Link from "next/link";
import { getTestStartInfo } from "../../../lib/attempt-store";
import { getCurrentUser } from "../../../lib/auth-store";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function TestStartPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [test, user] = await Promise.all([
    getTestStartInfo(slug),
    getCurrentUser(),
  ]);

  if (!test) {
    return (
      <main className="simple-page">
        <p>Test not found.</p>
        <Link href="/">Return home</Link>
      </main>
    );
  }

  // Access check
  let hasAccess = test.access === "Free";
  let isVipSubscribed = false;

  if (test.access === "Premium") {
    if (user && (user.role === "admin" || user.role === "editor")) {
      hasAccess = true;
      isVipSubscribed = true;
    } else if (user && (user.subscriptionStatus === "active" || (user.subscriptionExpiresAt && new Date(user.subscriptionExpiresAt).getTime() > Date.now()))) {
      if (user.subscriptionTier === "ultimate") {
        hasAccess = true;
        isVipSubscribed = true;
      } else if (user.subscriptionTier === "sprint") {
        const userSlug = (user.targetExamSlug || "").toLowerCase().replace(/[^a-z0-9]/g, "");
        const testSlugLower = (test.examSlug || "").toLowerCase().replace(/[^a-z0-9]/g, "");
        const userExamName = (user.targetExamName || "").toLowerCase();
        const testExamName = (test.examTitle || "").toLowerCase();

        const matchesSlug = (userSlug && testSlugLower) && (userSlug.includes(testSlugLower) || testSlugLower.includes(userSlug));
        const matchesName = (userExamName && testExamName) && (userExamName.includes(testExamName) || testExamName.includes(userExamName));

        if (matchesSlug || matchesName) {
          hasAccess = true;
          isVipSubscribed = true;
        }
      }
    }
  }

  return (
    <main className="start-page">
      <nav className="detail-nav">
        <Link className="logo" href="/">
          <span className="logo-mark">I</span>
          <span>India Mock Tests<span className="logo-dot">.</span></span>
        </Link>
        <Link className="back-link" href={`/exams/${test.examSlug}`}>
          ← Back to {test.examTitle}
        </Link>
      </nav>
      <section className="start-card">
        <div className="start-top">
          <span className="kicker">
            {test.type.toUpperCase()} · {test.examTitle.toUpperCase()}
          </span>
          <span
            className={test.access === "Free" ? "free-pill" : "premium-pill"}
            title={test.access === "Free" ? "Free Mock Test" : "VIP Pass Test"}
            style={test.access === "Premium" ? { background: "#fef3c7", color: "#b45309", border: "1px solid #fde68a", fontWeight: 800 } : undefined}
          >
            {test.access === "Free" ? "Free" : "👑 VIP Pass"}
          </span>
        </div>
        <h1>{test.name}</h1>
        <p className="detail-lede">
          {test.description || "Take this test in one focused sitting. Your attempt will be bound to the active exam rule profile and scored consistently."}
        </p>
        <div className="start-stats">
          <div>
            <small>QUESTIONS</small>
            <strong>{test.questions}</strong>
          </div>
          <div>
            <small>TIME LIMIT</small>
            <strong>{test.duration}</strong>
          </div>
          <div>
            <small>MARKING</small>
            <strong>{test.correctMarks} / {test.wrongMarks}</strong>
          </div>
          <div>
            <small>OPTIONS</small>
            <strong>A to {String.fromCharCode(64 + test.optionCount)}</strong>
          </div>
        </div>
        <div className="instruction-box">
          <h2>Before you start</h2>
          <p>
            Read each question carefully and use the palette to move between questions. Your responses will be autosaved during the attempt.
          </p>
          <ul>
            <li>Unanswered and marked-for-review are tracked as separate states.</li>
            <li>The server timer is authoritative and the test submits when time expires.</li>
            <li>You will see a response summary before final submission.</li>
          </ul>
        </div>
        {hasAccess ? (
          <Link
            className="start-button"
            href={`/attempt/${test.slug}`}
            style={isVipSubscribed ? { background: "linear-gradient(135deg, #15803d 0%, #166534 100%)", color: "#fff" } : undefined}
          >
            {isVipSubscribed ? "🔓 Start Practice Now " : "Start Test "} <span>→</span>
          </Link>
        ) : (
          <Link
            className="start-button"
            href={`/checkout?plan=sprint&exam=${test.examSlug}`}
            style={{
              background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
              color: "#fff",
              boxShadow: "0 4px 14px rgba(217, 119, 6, 0.35)",
            }}
          >
            🔒 Unlock Test with VIP Pass <span>→</span>
          </Link>
        )}
        <p className="start-note">
          {hasAccess
            ? "You can review the test instructions again before beginning."
            : `Subscribe to Single Exam Sprint Pass or All-Exam Ultimate VIP Pass to unlock full CBT mock tests for ${test.examTitle}.`}
        </p>
      </section>
    </main>
  );
}
