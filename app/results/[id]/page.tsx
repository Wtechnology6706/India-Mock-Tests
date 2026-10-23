import Link from "next/link";
import { notFound } from "next/navigation";
import { getAttemptResult } from "../../../lib/attempt-store";
import ResultsReviewClient from "./ResultsReviewClient";

export default async function ResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const stored = await getAttemptResult(id);
  if (!stored) notFound();

  const { attempt, result } = stored;
  const totalQuestions = attempt.questions.length;
  const accuracy =
    totalQuestions > 0 ? Math.round((result.correct / totalQuestions) * 100) : 0;

  return (
    <main className="results-page">
      <nav className="detail-nav">
        <Link className="logo" href="/">
          <span className="logo-mark">S</span>
          <span>
            Sarkari Practice<span className="logo-dot">.</span>
          </span>
        </Link>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <Link className="back-link" href="/dashboard">
            ◈ Back to Dashboard
          </Link>
          <Link className="back-link" href="/exams">
            ← Back to exam directory
          </Link>
        </div>
      </nav>

      <section className="results-hero">
        <div>
          <span className="kicker">PRACTICE RESULT · {attempt.exam.toUpperCase()}</span>
          <h1>{attempt.title}</h1>
          <p>
            One attempt gives you a clearer next step. Review your score, clear doubts with the AI tutor, and share your rank with peers.
          </p>
        </div>
        <div className="result-score-large">
          <strong>{accuracy}%</strong>
          <span>accuracy</span>
        </div>
      </section>

      <section className="results-content">
        <div className="result-metric-grid">
          <div>
            <small>SCORE</small>
            <strong>
              {result.score} / {result.maxScore}
            </strong>
            <span>marks earned</span>
          </div>
          <div>
            <small>CORRECT</small>
            <strong style={{ color: "#19693b" }}>{result.correct}</strong>
            <span>answers right</span>
          </div>
          <div>
            <small>INCORRECT</small>
            <strong style={{ color: "#c03a1b" }}>{result.incorrect}</strong>
            <span>negative marks applied</span>
          </div>
          <div>
            <small>UNANSWERED</small>
            <strong>{result.unanswered}</strong>
            <span>left for later</span>
          </div>
        </div>

        {/* Interactive Client Section: WhatsApp Viral Share + Question Review with AI Doubt Solver */}
        <ResultsReviewClient
          testId={attempt.id}
          testTitle={attempt.title}
          examName={attempt.exam}
          testSlug={attempt.testSlug}
          score={result.score}
          maxScore={result.maxScore}
          accuracy={accuracy}
          correctCount={result.correct}
          incorrectCount={result.incorrect}
          unansweredCount={result.unanswered}
          questions={attempt.questions}
          answers={attempt.answers}
        />
      </section>
    </main>
  );
}
