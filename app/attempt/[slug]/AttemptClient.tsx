"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import type { AttemptQuestion } from "../../../lib/attempts";

type AttemptClientProps = {
  title: string;
  exam: string;
  durationSeconds: number;
  questions: AttemptQuestion[];
  testSlug: string;
};

type ResponseState = "unanswered" | "answered" | "review" | "answered-review";

export default function AttemptClient({
  title,
  exam,
  durationSeconds,
  questions,
  testSlug,
}: AttemptClientProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(durationSeconds);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [reviewed, setReviewed] = useState<number[]>([]);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paletteDrawerOpen, setPaletteDrawerOpen] = useState(false);
  const [premiumLock, setPremiumLock] = useState<{ isLocked: boolean; message?: string } | null>(null);
  const [selectedSection, setSelectedSection] = useState<string>("All");

  const answersRef = useRef<Record<number, number>>({});
  const reviewedRef = useRef<number[]>([]);
  const attemptIdRef = useRef<string | null>(null);

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  useEffect(() => {
    reviewedRef.current = reviewed;
  }, [reviewed]);

  useEffect(() => {
    attemptIdRef.current = attemptId;
  }, [attemptId]);

  const currentQuestion = questions[currentIndex] || questions[0];
  const answeredCount = Object.keys(answers).length;
  const reviewCount = reviewed.length;
  const answeredReviewCount = Object.keys(answers).filter((qId) => reviewed.includes(Number(qId))).length;
  const unansweredCount = questions.length - answeredCount;
  const correctCount = questions.filter(
    (question) => answers[question.id] === question.correctIndex
  ).length;

  // Extract unique sections
  const sections = ["All", ...Array.from(new Set(questions.map((q) => q.section || "General Studies")))];

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) {
      return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    }
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const getState = (question: AttemptQuestion): ResponseState => {
    const hasAnswer = answers[question.id] !== undefined;
    const isReviewed = reviewed.includes(question.id);
    if (hasAnswer && isReviewed) return "answered-review";
    if (isReviewed) return "review";
    if (hasAnswer) return "answered";
    return "unanswered";
  };

  // Initialize or fetch attempt from server
  useEffect(() => {
    let isMounted = true;
    fetch("/api/attempts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ testSlug }),
    })
      .then(async (res) => {
        const payload = await res.json();
        if (!isMounted) return;

        if (res.status === 403 && payload?.code === "PREMIUM_REQUIRED") {
          setPremiumLock({
            isLocked: true,
            message: payload.error || "This test is part of our Premium Pass. Upgrade to unlock full series.",
          });
          return;
        }

        const newAttemptId = payload.data?.id ?? null;
        setAttemptId(newAttemptId);
        attemptIdRef.current = newAttemptId;

        const currentAns = answersRef.current;
        if (newAttemptId && Object.keys(currentAns).length > 0) {
          for (const [qId, optIdx] of Object.entries(currentAns)) {
            fetch(`/api/attempts/${newAttemptId}/responses`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                questionId: Number(qId),
                optionIndex: optIdx,
                markForReview: reviewedRef.current.includes(Number(qId)),
              }),
            }).catch(() => {});
          }
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [testSlug]);

  // Countdown timer
  useEffect(() => {
    if (submitted || remainingSeconds <= 0 || premiumLock?.isLocked) return;
    const timer = window.setInterval(
      () => setRemainingSeconds((value) => Math.max(0, value - 1)),
      1000
    );
    return () => window.clearInterval(timer);
  }, [remainingSeconds, submitted, premiumLock]);

  // Auto submit when time runs out
  useEffect(() => {
    if (remainingSeconds === 0 && !submitted && !premiumLock?.isLocked) {
      void submitToServer();
    }
  }, [remainingSeconds, submitted, premiumLock]);

  const saveResponseToServer = (
    qId: number,
    optionIndex: number | null,
    markForReview?: boolean
  ) => {
    const activeId = attemptIdRef.current;
    if (activeId) {
      fetch(`/api/attempts/${activeId}/responses`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: qId,
          optionIndex,
          markForReview,
        }),
      }).catch(() => {});
    }
  };

  const selectAnswer = (optionIndex: number) => {
    const qId = currentQuestion.id;
    setAnswers((current) => {
      const updated = { ...current, [qId]: optionIndex };
      answersRef.current = updated;
      return updated;
    });
    saveResponseToServer(qId, optionIndex, reviewed.includes(qId));
  };

  const toggleReview = () => {
    const qId = currentQuestion.id;
    const nextReviewed = !reviewed.includes(qId);
    setReviewed((current) => {
      const updated = nextReviewed
        ? [...current, qId]
        : current.filter((id) => id !== qId);
      reviewedRef.current = updated;
      return updated;
    });
    saveResponseToServer(qId, answers[qId] ?? null, nextReviewed);
  };

  const clearAnswer = () => {
    const qId = currentQuestion.id;
    setAnswers((current) => {
      const next = { ...current };
      delete next[qId];
      answersRef.current = next;
      return next;
    });
    saveResponseToServer(qId, null, reviewed.includes(qId));
  };

  const submitToServer = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    const activeId = attemptIdRef.current;
    const currentAns = answersRef.current;
    const currentRev = reviewedRef.current;

    if (!activeId) {
      setSubmitted(true);
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await fetch(`/api/attempts/${activeId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers: currentAns,
          reviewed: currentRev,
        }),
      });

      if (res.ok) {
        window.location.href = `/results/${activeId}`;
      } else {
        window.location.href = `/results/${activeId}`;
      }
    } catch {
      window.location.href = `/results/${activeId}`;
    }
  };

  // Premium Access Lock Screen
  if (premiumLock?.isLocked) {
    return (
      <main className="attempt-page premium-locked-layout">
        <nav className="cbt-topbar">
          <Link className="cbt-brand" href="/">
            <span className="logo-mark">N</span>
            <span className="cbt-brand-text">northstar<span>.</span></span>
          </Link>
          <div className="cbt-exam-heading">
            <strong>{title}</strong>
            <small>{exam}</small>
          </div>
          <Link href="/exams" className="cbt-exit-btn">
            ✕ Exit Test
          </Link>
        </nav>

        <div className="premium-lock-container">
          <div className="premium-lock-card">
            <div className="premium-badge-icon">👑</div>
            <span className="premium-kicker">PREMIUM VIP TEST SERIES</span>
            <h2>Unlock Full Mock Test & In-Depth Analytics</h2>
            <p>
              {premiumLock.message ||
                "This mock test is part of our Northstar Premium Test Pass. Subscribe to get unlimited attempts, detailed step-by-step solutions, national percentile ranking, and speed analysis."}
            </p>

            <div className="premium-features-list">
              <div>✓ All 150+ Full Mocks, Subject Tests & PYQs</div>
              <div>✓ Bilingual (Hindi & English) with AI Explanations</div>
              <div>✓ Real NTA/CBT Time-Attack Simulation</div>
            </div>

            <div className="premium-action-row">
              <Link href="/pricing" className="btn-upgrade-primary">
                ⭐ View VIP Subscription Plans (From ₹299)
              </Link>
              <Link href="/exams" className="btn-explore-free">
                ← Explore Free Available Mocks
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Submitted Screen
  if (submitted) {
    return (
      <main className="attempt-page">
        <nav className="cbt-topbar">
          <span className="cbt-brand">
            <span className="logo-mark">N</span>
            <span className="cbt-brand-text">northstar<span>.</span></span>
          </span>
          <span className="attempt-status">Attempt submitted</span>
        </nav>
        <section className="result-card">
          <span className="result-icon">✓</span>
          <span className="kicker">YOUR PRACTICE RESULT</span>
          <h1>Test Completed Successfully!</h1>
          <p>
            Your responses have been recorded. Review your performance breakdown, accuracy, and question explanations.
          </p>
          <div className="result-score">
            <strong>{Math.round((correctCount / questions.length) * 100)}%</strong>
            <span>
              accuracy
              <br />
              {correctCount} of {questions.length} correct
            </span>
          </div>
          <div className="result-actions">
            <button
              onClick={() => {
                setSubmitted(false);
                setCurrentIndex(0);
                setRemainingSeconds(durationSeconds);
              }}
            >
              Review answers
            </button>
            <Link href="/exams">Back to exam directory</Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="cbt-attempt-viewport">
      {/* 1. Standard CBT Top Bar (Fixed, Non-Scrollable) */}
      <header className="cbt-topbar">
        <div className="cbt-brand-area">
          <Link className="cbt-brand" href="/" title="Back to Home">
            <span className="logo-mark">N</span>
            <span className="cbt-brand-text">northstar<span>.</span></span>
          </Link>
          <div className="cbt-exam-heading">
            <strong>{title}</strong>
            <small>{exam}</small>
          </div>
        </div>

        {/* Section Tabs */}
        <div className="cbt-section-tabs">
          {sections.map((sec) => (
            <button
              key={sec}
              type="button"
              className={`cbt-sec-tab ${selectedSection === sec ? "active" : ""}`}
              onClick={() => {
                setSelectedSection(sec);
                if (sec !== "All") {
                  const firstIdx = questions.findIndex((q) => (q.section || "General Studies") === sec);
                  if (firstIdx !== -1) setCurrentIndex(firstIdx);
                }
              }}
            >
              {sec}
            </button>
          ))}
        </div>

        {/* Right Top Actions: Palette Trigger + Timer + Finish */}
        <div className="cbt-top-right">
          <button
            type="button"
            className="mobile-palette-toggle-btn"
            onClick={() => setPaletteDrawerOpen(!paletteDrawerOpen)}
            aria-label="Toggle Question Grid"
          >
            📋 Palette ({currentIndex + 1}/{questions.length})
          </button>

          <div className={`cbt-timer-badge ${remainingSeconds < 300 ? "timer-warning" : ""}`}>
            <span className="timer-icon">◷</span>
            <span className="timer-digits">{formatTime(remainingSeconds)}</span>
          </div>

          <button
            type="button"
            className="cbt-finish-btn"
            disabled={isSubmitting}
            onClick={submitToServer}
          >
            {isSubmitting ? "Submitting..." : "Submit Test"}
          </button>
        </div>
      </header>

      {/* 2. Main CBT 2-Column Interface (Non-scrollable outer container) */}
      <div className="cbt-main-workspace">
        {/* Left Column: Question Area */}
        <section className="cbt-question-area">
          {/* Question Sub-Header */}
          <div className="cbt-q-header">
            <div className="cbt-q-title">
              <span className="q-badge">Question {currentIndex + 1}</span>
              <span className="q-section-badge">{currentQuestion.section || "General Studies"}</span>
            </div>
            <div className="cbt-marking-scheme">
              <span className="mark-positive">+1.00</span>
              <span className="mark-negative">-0.25</span>
            </div>
          </div>

          {/* Scrollable Question Content (Internal Scroll Only If Needed) */}
          <div className="cbt-q-scroll-body">
            <div className="cbt-q-prompt">
              <h2>{currentQuestion.prompt}</h2>
            </div>

            <div className="cbt-options-grid">
              {currentQuestion.options.map((option, optionIndex) => {
                const isSelected = answers[currentQuestion.id] === optionIndex;
                const letter = String.fromCharCode(65 + optionIndex);

                return (
                  <button
                    key={option}
                    type="button"
                    className={`cbt-option-card ${isSelected ? "selected" : ""}`}
                    onClick={() => selectAnswer(optionIndex)}
                  >
                    <span className="cbt-option-letter">{letter}</span>
                    <span className="cbt-option-text">{option}</span>
                    {isSelected && <span className="cbt-option-check">✓</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Fixed Sticky Action Bar at Bottom */}
          <footer className="cbt-bottom-bar">
            <div className="cbt-left-actions">
              <button
                type="button"
                className="cbt-btn-subtle"
                onClick={clearAnswer}
                title="Clear selected option"
              >
                Clear Response
              </button>
              <button
                type="button"
                className={`cbt-btn-review ${reviewed.includes(currentQuestion.id) ? "active" : ""}`}
                onClick={toggleReview}
              >
                {reviewed.includes(currentQuestion.id) ? "⚑ Marked for Review" : "⚑ Mark for Review"}
              </button>
            </div>

            <div className="cbt-nav-buttons">
              <button
                type="button"
                className="cbt-btn-prev"
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex((idx) => Math.max(0, idx - 1))}
              >
                ← Previous
              </button>

              {currentIndex < questions.length - 1 ? (
                <button
                  type="button"
                  className="cbt-btn-next"
                  onClick={() => setCurrentIndex((idx) => Math.min(questions.length - 1, idx + 1))}
                >
                  Save & Next →
                </button>
              ) : (
                <button
                  type="button"
                  className="cbt-btn-submit-final"
                  disabled={isSubmitting}
                  onClick={submitToServer}
                >
                  {isSubmitting ? "Submitting..." : "Submit Test ✓"}
                </button>
              )}
            </div>
          </footer>
        </section>

        {/* Right Column: Ultra-Compact Question Palette Sidebar */}
        {paletteDrawerOpen && (
          <div
            className="cbt-palette-backdrop"
            onClick={() => setPaletteDrawerOpen(false)}
          />
        )}

        <aside className={`cbt-palette-sidebar ${paletteDrawerOpen ? "mobile-drawer-open" : ""}`}>
          <div className="cbt-palette-header">
            <div className="palette-title">
              <strong>Question Palette</strong>
              <small>{questions.length} Questions Total</small>
            </div>
            <button
              type="button"
              className="cbt-close-drawer-btn"
              onClick={() => setPaletteDrawerOpen(false)}
            >
              ✕
            </button>
          </div>

          {/* Compact Mini Summary Counters */}
          <div className="cbt-palette-summary-row">
            <div className="summary-pill answered">
              <b>{answeredCount}</b>
              <span>Answered</span>
            </div>
            <div className="summary-pill review">
              <b>{reviewCount}</b>
              <span>Review</span>
            </div>
            <div className="summary-pill unanswered">
              <b>{unansweredCount}</b>
              <span>Not Answered</span>
            </div>
          </div>

          {/* High-Density Question Button Grid */}
          <div className="cbt-palette-grid-wrap">
            <div className="cbt-palette-grid">
              {questions.map((question, index) => {
                const state = getState(question);
                const isCurrent = index === currentIndex;

                return (
                  <button
                    key={question.id}
                    type="button"
                    className={`cbt-q-cell ${state} ${isCurrent ? "current" : ""}`}
                    onClick={() => {
                      setCurrentIndex(index);
                      setPaletteDrawerOpen(false);
                    }}
                    title={`Question ${index + 1} (${state})`}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Compact Color Legend */}
          <div className="cbt-palette-legend">
            <div className="legend-item">
              <span className="dot answered" />
              <span>Answered ({answeredCount})</span>
            </div>
            <div className="legend-item">
              <span className="dot review" />
              <span>Marked for Review ({reviewCount})</span>
            </div>
            <div className="legend-item">
              <span className="dot unanswered" />
              <span>Not Answered ({unansweredCount})</span>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
