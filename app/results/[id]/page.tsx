import Link from "next/link";
import { notFound } from "next/navigation";
import { getAttemptResult } from "../../../lib/attempt-store";

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
          <span className="logo-mark">N</span>
          <span>
            northstar<span className="logo-dot">.</span>
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
            One attempt gives you a clearer next step. Review the signal, then
            return to the topic that needs you most.
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

        <div className="results-columns">
          <section className="answer-review">
            <div className="results-heading">
              <div>
                <span className="kicker">QUESTION REVIEW</span>
                <h2>Understand every answer.</h2>
              </div>
              <Link href={`/attempt/${attempt.testSlug}`}>Retake test →</Link>
            </div>

            {attempt.questions.map((question, idx) => {
              const selectedRaw =
                attempt.answers[question.id] !== undefined
                  ? attempt.answers[question.id]
                  : (attempt.answers as any)[String(question.id)];

              const hasAnswered =
                selectedRaw !== undefined && selectedRaw !== null && selectedRaw !== "";
              const selectedIndex = hasAnswered ? Number(selectedRaw) : undefined;
              const isCorrect =
                hasAnswered && selectedIndex === Number(question.correctIndex);

              const selectedText =
                selectedIndex !== undefined && question.options[selectedIndex]
                  ? question.options[selectedIndex]
                  : undefined;

              const correctText = question.options[question.correctIndex] ?? "—";

              return (
                <article
                  className={`review-row ${
                    !hasAnswered
                      ? "unanswered-row"
                      : isCorrect
                      ? "correct-row"
                      : "incorrect-row"
                  }`}
                  key={question.id || idx}
                >
                  <span className="review-status">
                    {!hasAnswered ? "—" : isCorrect ? "✓" : "×"}
                  </span>
                  <div>
                    <small>
                      {question.section} · Question {idx + 1}
                    </small>
                    <h3>{question.prompt}</h3>
                    <p>
                      {!hasAnswered ? (
                        <span style={{ color: "#778782" }}>Not answered</span>
                      ) : (
                        <span>
                          Your answer:{" "}
                          <strong
                            style={{
                              color: isCorrect ? "#19693b" : "#c03a1b",
                            }}
                          >
                            {selectedText}
                          </strong>
                        </span>
                      )}{" "}
                      <span>·</span> Correct: <strong>{correctText}</strong>
                    </p>
                    <em>{question.explanation}</em>
                  </div>
                </article>
              );
            })}
          </section>

          <aside className="next-step-card">
            <span className="kicker">RECOMMENDED NEXT STEP</span>
            <h2>Return to the questions you missed.</h2>
            <p>
              Focused repetition is where this result becomes progress. Start with
              focused practice in your dashboard.
            </p>
            <Link className="dark-button" href="/dashboard#tests">
              Find focused practice <span>→</span>
            </Link>
          </aside>
        </div>
      </section>
    </main>
  );
}
