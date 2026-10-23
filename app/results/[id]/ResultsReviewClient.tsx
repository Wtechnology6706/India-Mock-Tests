"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

interface QuestionItem {
  id: string | number;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
  section: string;
}

interface ResultsReviewClientProps {
  testId: string;
  testTitle: string;
  examName: string;
  testSlug?: string;
  score: number;
  maxScore: number;
  accuracy: number;
  correctCount: number;
  incorrectCount: number;
  unansweredCount: number;
  questions: QuestionItem[];
  answers: Record<string | number, number | null | undefined>;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  time: string;
}

function renderFormattedMarkdown(text: string) {
  if (!text) return null;

  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let currentList: React.ReactNode[] = [];

  const parseInline = (str: string): React.ReactNode[] => {
    const regex = /(\*\*\*[\s\S]+?\*\*\*|\*\*[\s\S]+?\*\*|\*[\s\S]+?\*|`[\s\S]+?`)/g;
    const parts = str.split(regex);

    return parts.map((part, i) => {
      if (part.startsWith("***") && part.endsWith("***") && part.length >= 6) {
        return (
          <strong key={i} style={{ color: "#1e1b4b" }}>
            <em>{part.slice(3, -3)}</em>
          </strong>
        );
      }
      if (part.startsWith("**") && part.endsWith("**") && part.length >= 4) {
        return (
          <strong key={i} style={{ color: "#1e1b4b" }}>
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith("*") && part.endsWith("*") && part.length >= 2) {
        return <em key={i}>{part.slice(1, -1)}</em>;
      }
      if (part.startsWith("`") && part.endsWith("`") && part.length >= 2) {
        return (
          <code
            key={i}
            style={{
              background: "rgba(67, 56, 202, 0.08)",
              padding: "1px 6px",
              borderRadius: "4px",
              fontSize: "0.85em",
              color: "#3730a3",
              fontFamily: "monospace",
            }}
          >
            {part.slice(1, -1)}
          </code>
        );
      }
      // Strip any stray asterisks
      const cleaned = part.replace(/\*\*/g, "").replace(/(^|[^\w])\*([^\w]|$)/g, "$1$2");
      return cleaned;
    });
  };

  const flushList = () => {
    if (currentList.length > 0) {
      elements.push(
        <ul
          key={`ul-${elements.length}`}
          style={{
            margin: "6px 0 10px 0",
            paddingLeft: "22px",
            listStyleType: "disc",
            display: "flex",
            flexDirection: "column",
            gap: "5px",
          }}
        >
          {currentList}
        </ul>
      );
      currentList = [];
    }
  };

  lines.forEach((rawLine, idx) => {
    const line = rawLine.trim();

    // List item (e.g. * Item or - Item or • Item)
    const bulletMatch = line.match(/^(\*|-|•)\s+(.*)$/);
    if (bulletMatch) {
      const content = bulletMatch[2];
      currentList.push(
        <li key={`li-${idx}`} style={{ lineHeight: "1.55" }}>
          {parseInline(content)}
        </li>
      );
      return;
    }

    // Numbered list item
    const numMatch = line.match(/^(\d+)\.\s+(.*)$/);
    if (numMatch) {
      flushList();
      elements.push(
        <div
          key={`num-${idx}`}
          style={{
            display: "flex",
            gap: "8px",
            margin: "4px 0",
            lineHeight: "1.55",
          }}
        >
          <span style={{ fontWeight: 800, color: "#4338ca", minWidth: "18px" }}>
            {numMatch[1]}.
          </span>
          <div style={{ flex: 1 }}>{parseInline(numMatch[2])}</div>
        </div>
      );
      return;
    }

    flushList();

    if (!line) {
      elements.push(<div key={`sp-${idx}`} style={{ height: "6px" }} />);
      return;
    }

    // Heading lines
    if (line.startsWith("### ") || line.startsWith("## ")) {
      const headingText = line.replace(/^#+\s*/, "");
      elements.push(
        <div
          key={`h-${idx}`}
          style={{
            fontWeight: 800,
            fontSize: "0.95rem",
            color: "#312e81",
            marginTop: "10px",
            marginBottom: "4px",
          }}
        >
          {parseInline(headingText)}
        </div>
      );
      return;
    }

    // Standard paragraph line
    elements.push(
      <p key={`p-${idx}`} style={{ margin: "4px 0", lineHeight: "1.58" }}>
        {parseInline(line)}
      </p>
    );
  });

  flushList();

  return <>{elements}</>;
}

export default function ResultsReviewClient({
  testId,
  testTitle,
  examName,
  testSlug,
  score,
  maxScore,
  accuracy,
  correctCount,
  incorrectCount,
  unansweredCount,
  questions,
  answers,
}: ResultsReviewClientProps) {
  // Question filter state
  const [filterMode, setFilterMode] = useState<"all" | "incorrect" | "correct" | "unanswered">("all");
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [currentOrigin, setCurrentOrigin] = useState("");

  // AI Chat Conversation State per question index
  const [activeChatQIndex, setActiveChatQIndex] = useState<number | null>(null);
  const [chatConversations, setChatConversations] = useState<Record<number, ChatMessage[]>>({});
  const [inputPrompts, setInputPrompts] = useState<Record<number, string>>({});
  const [isSendingChat, setIsSendingChat] = useState<Record<number, boolean>>({});
  const chatScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentOrigin(window.location.origin);
    }
  }, []);

  // Compute dynamic test URL using current window origin
  const dynamicBaseUrl = currentOrigin || (typeof window !== "undefined" ? window.location.origin : "");
  const dynamicTestUrl = testSlug
    ? `${dynamicBaseUrl}/tests/${testSlug}`
    : (typeof window !== "undefined" ? window.location.href : "");

  // Generate WhatsApp Share Message
  const shareText = `🎯 Just completed *${testTitle}* (${examName}) on Sarkari Practice!
📊 Score: *${score}/${maxScore}*
⚡ Accuracy: *${accuracy}%* (${correctCount} Correct, ${incorrectCount} Incorrect)
Can you beat my score? Attempt this official mock test here:
${dynamicTestUrl}`;

  const whatsappShareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;

  function handleCopyShare() {
    navigator.clipboard.writeText(shareText);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 3000);
  }

  // Initialize or Toggle AI Chat for a question
  function handleToggleAiChat(qIndex: number) {
    if (activeChatQIndex === qIndex) {
      setActiveChatQIndex(null);
      return;
    }

    setActiveChatQIndex(qIndex);

    // If chat doesn't have messages yet, seed with initial welcome analysis
    if (!chatConversations[qIndex] || chatConversations[qIndex].length === 0) {
      const q = questions[qIndex];
      const selectedRaw = answers[q.id] !== undefined ? answers[q.id] : answers[String(q.id)];
      const selectedText = selectedRaw !== undefined && selectedRaw !== null && q.options[Number(selectedRaw)]
        ? q.options[Number(selectedRaw)]
        : undefined;
      const correctText = q.options[q.correctIndex] || "Option " + String.fromCharCode(65 + q.correctIndex);
      const isCorrect = selectedRaw !== undefined && Number(selectedRaw) === q.correctIndex;

      let welcomeText = `👋 **Hello! I am your AI Doubt Tutor for Question #${qIndex + 1}** (${q.section}).\n\n`;
      if (!selectedText) {
        welcomeText += `You left this question **unanswered**. The correct answer is **${correctText}**.\n\n`;
      } else if (isCorrect) {
        welcomeText += `🎉 **Great job!** You selected **"${selectedText}"**, which is the correct answer!\n\n`;
      } else {
        welcomeText += `You chose **"${selectedText}"**, but the correct answer is **"${correctText}"**.\n\n`;
      }
      welcomeText += `Ask me any doubt regarding this specific question, options, why an option is right/wrong, or ask for a memory trick!`;

      const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      setChatConversations((prev) => ({
        ...prev,
        [qIndex]: [{ role: "assistant", content: welcomeText, time: now }],
      }));
    }
  }

  // Send a message in AI chat
  async function handleSendChatMessage(qIndex: number, messageToSend?: string) {
    const text = (messageToSend || inputPrompts[qIndex] || "").trim();
    if (!text || isSendingChat[qIndex]) return;

    const q = questions[qIndex];
    if (!q) return;

    const selectedRaw = answers[q.id] !== undefined ? answers[q.id] : answers[String(q.id)];
    const selectedText = selectedRaw !== undefined && selectedRaw !== null && q.options[Number(selectedRaw)]
      ? q.options[Number(selectedRaw)]
      : undefined;
    const correctText = q.options[q.correctIndex] || "Option " + String.fromCharCode(65 + q.correctIndex);

    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const userMsg: ChatMessage = { role: "user", content: text, time: now };

    const currentHistory = chatConversations[qIndex] || [];
    const updatedHistory = [...currentHistory, userMsg];

    setChatConversations((prev) => ({
      ...prev,
      [qIndex]: updatedHistory,
    }));
    setInputPrompts((prev) => ({ ...prev, [qIndex]: "" }));
    setIsSendingChat((prev) => ({ ...prev, [qIndex]: true }));

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: q.prompt,
          options: q.options,
          userSelected: selectedText,
          correctAnswer: correctText,
          explanation: q.explanation,
          exam: examName,
          subject: q.section,
          chatHistory: updatedHistory.map((m) => ({ role: m.role, content: m.content })),
          userMessage: text,
        }),
      });

      const data = await res.json();
      const aiReplyTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

      if (data.success && data.reply) {
        setChatConversations((prev) => ({
          ...prev,
          [qIndex]: [...(prev[qIndex] || updatedHistory), { role: "assistant", content: data.reply, time: aiReplyTime }],
        }));
      } else {
        setChatConversations((prev) => ({
          ...prev,
          [qIndex]: [
            ...(prev[qIndex] || updatedHistory),
            {
              role: "assistant",
              content: data.error || "⚠️ Could not connect to AI Tutor. Please check your network or try again.",
              time: aiReplyTime,
            },
          ],
        }));
      }
    } catch (err) {
      const errTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      setChatConversations((prev) => ({
        ...prev,
        [qIndex]: [
          ...(prev[qIndex] || updatedHistory),
          { role: "assistant", content: "⚠️ Network connection error. Please try again.", time: errTime },
        ],
      }));
    } finally {
      setIsSendingChat((prev) => ({ ...prev, [qIndex]: false }));
    }
  }

  // Filter questions
  const filteredQuestions = questions.map((q, idx) => {
    const selectedRaw = answers[q.id] !== undefined ? answers[q.id] : answers[String(q.id)];
    const hasAnswered = selectedRaw !== undefined && selectedRaw !== null;
    const isCorrect = hasAnswered && Number(selectedRaw) === Number(q.correctIndex);
    return {
      question: q,
      originalIndex: idx,
      hasAnswered,
      isCorrect,
      selectedRaw,
    };
  }).filter(({ hasAnswered, isCorrect }) => {
    if (filterMode === "correct") return isCorrect;
    if (filterMode === "incorrect") return hasAnswered && !isCorrect;
    if (filterMode === "unanswered") return !hasAnswered;
    return true;
  });

  return (
    <div style={{ marginTop: "40px" }}>
      {/* 1. VIRAL WHATSAPP SCORECARD & SHARE BANNER */}
      <section
        style={{
          background: "linear-gradient(135deg, #064e3b 0%, #0f766e 100%)",
          color: "#fff",
          borderRadius: "16px",
          padding: "24px 28px",
          marginTop: "20px",
          marginBottom: "32px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "20px",
          boxShadow: "0 10px 25px rgba(6, 78, 59, 0.2)",
        }}
      >
        <div style={{ maxWidth: "600px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
            <span style={{ background: "rgba(255,255,255,0.2)", padding: "3px 10px", borderRadius: "12px", fontSize: "0.75rem", fontWeight: 800 }}>
              VERIFIED SCORECARD
            </span>
            <span style={{ fontSize: "0.82rem", opacity: 0.9 }}>Bilingual Analysis · 2026 Commission Pattern</span>
          </div>
          <h2 style={{ fontSize: "1.45rem", margin: "0 0 6px 0", fontWeight: 800, letterSpacing: "-0.01em" }}>
            Share Your Scorecard & Challenge Friends!
          </h2>
          <p style={{ margin: 0, opacity: 0.92, fontSize: "0.94rem", lineHeight: 1.5 }}>
            Challenge your study group friends on WhatsApp and see how their score compares with yours on this test!
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <a
            href={whatsappShareUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
              // Ensure dynamic origin is used at the exact moment of click
              if (typeof window !== "undefined" && (!currentOrigin || currentOrigin !== window.location.origin)) {
                e.preventDefault();
                const latestOrigin = window.location.origin;
                const latestTestUrl = testSlug ? `${latestOrigin}/tests/${testSlug}` : window.location.href;
                const latestShareText = `🎯 Just completed *${testTitle}* (${examName}) on Sarkari Practice!\n📊 Score: *${score}/${maxScore}*\n⚡ Accuracy: *${accuracy}%* (${correctCount} Correct, ${incorrectCount} Incorrect)\nCan you beat my score? Attempt this official mock test here:\n${latestTestUrl}`;
                window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(latestShareText)}`, "_blank");
              }
            }}
            style={{
              background: "#25D366",
              color: "#fff",
              textDecoration: "none",
              padding: "12px 22px",
              borderRadius: "10px",
              fontWeight: 800,
              fontSize: "0.95rem",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              boxShadow: "0 4px 14px rgba(37, 211, 102, 0.4)",
            }}
          >
            <span>📲 Share to WhatsApp</span>
          </a>

          <button
            type="button"
            onClick={handleCopyShare}
            style={{
              background: "rgba(255,255,255,0.15)",
              color: "#fff",
              border: "1px solid rgba(255,255,255,0.3)",
              padding: "12px 18px",
              borderRadius: "10px",
              fontWeight: 700,
              fontSize: "0.9rem",
              cursor: "pointer",
            }}
          >
            {copyFeedback ? "✓ Copied Link!" : "📋 Copy Score Summary"}
          </button>
        </div>
      </section>

      {/* Filter Tabs */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
          marginBottom: "20px",
          paddingBottom: "12px",
          borderBottom: "1px solid #e2e8f0",
        }}
      >
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={() => setFilterMode("all")}
            style={{
              padding: "6px 14px",
              borderRadius: "20px",
              fontSize: "0.85rem",
              fontWeight: 700,
              cursor: "pointer",
              border: "1px solid",
              borderColor: filterMode === "all" ? "#0f172a" : "#cbd5e1",
              background: filterMode === "all" ? "#0f172a" : "#fff",
              color: filterMode === "all" ? "#fff" : "#475569",
            }}
          >
            All Questions ({questions.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterMode("incorrect")}
            style={{
              padding: "6px 14px",
              borderRadius: "20px",
              fontSize: "0.85rem",
              fontWeight: 700,
              cursor: "pointer",
              border: "1px solid",
              borderColor: filterMode === "incorrect" ? "#dc2626" : "#cbd5e1",
              background: filterMode === "incorrect" ? "#fef2f2" : "#fff",
              color: filterMode === "incorrect" ? "#dc2626" : "#475569",
            }}
          >
            Incorrect ({incorrectCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterMode("correct")}
            style={{
              padding: "6px 14px",
              borderRadius: "20px",
              fontSize: "0.85rem",
              fontWeight: 700,
              cursor: "pointer",
              border: "1px solid",
              borderColor: filterMode === "correct" ? "#16a34a" : "#cbd5e1",
              background: filterMode === "correct" ? "#f0fdf4" : "#fff",
              color: filterMode === "correct" ? "#16a34a" : "#475569",
            }}
          >
            Correct ({correctCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterMode("unanswered")}
            style={{
              padding: "6px 14px",
              borderRadius: "20px",
              fontSize: "0.85rem",
              fontWeight: 700,
              cursor: "pointer",
              border: "1px solid",
              borderColor: filterMode === "unanswered" ? "#ca8a04" : "#cbd5e1",
              background: filterMode === "unanswered" ? "#fefce8" : "#fff",
              color: filterMode === "unanswered" ? "#ca8a04" : "#475569",
            }}
          >
            Unanswered ({unansweredCount})
          </button>
        </div>

        <div style={{ fontSize: "0.85rem", color: "#64748b", fontWeight: 600 }}>
          Showing {filteredQuestions.length} of {questions.length} questions
        </div>
      </div>

      {/* Question Review List */}
      <section className="answer-review">
        {filteredQuestions.map(({ question, originalIndex, hasAnswered, isCorrect, selectedRaw }) => {
          const selectedIndex = hasAnswered ? Number(selectedRaw) : undefined;
          const selectedText = selectedIndex !== undefined && question.options[selectedIndex]
            ? question.options[selectedIndex]
            : undefined;
          const correctText = question.options[question.correctIndex] ?? "—";
          const isChatOpen = activeChatQIndex === originalIndex;
          const chatMessages = chatConversations[originalIndex] || [];
          const isSending = Boolean(isSendingChat[originalIndex]);

          return (
            <article
              className={`review-row ${!hasAnswered
                  ? "unanswered-row"
                  : isCorrect
                    ? "correct-row"
                    : "incorrect-row"
                }`}
              key={question.id || originalIndex}
              style={{ position: "relative" }}
            >
              <span className="review-status">
                {!hasAnswered ? "—" : isCorrect ? "✓" : "×"}
              </span>

              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "8px" }}>
                  <small style={{ color: "#64748b", fontWeight: 700 }}>
                    {question.section} · Question {originalIndex + 1}
                  </small>

                  {/* ASK AI CHAT BUTTON (Icon + Hover Tooltip) */}
                  {isChatOpen ? (
                    <button
                      type="button"
                      onClick={() => handleToggleAiChat(originalIndex)}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        background: "#312e81",
                        color: "#ffffff",
                        border: "1px solid #4338ca",
                        padding: "6px 14px",
                        borderRadius: "16px",
                        fontSize: "0.82rem",
                        fontWeight: 700,
                        cursor: "pointer",
                        boxShadow: "0 2px 8px rgba(67, 56, 202, 0.3)",
                        transition: "all 0.15s ease",
                      }}
                    >
                      <span>✕ Close AI Tutor</span>
                    </button>
                  ) : (
                    <div style={{ position: "relative", display: "inline-flex", alignItems: "center" }} className="ai-chat-btn-wrapper">
                      <button
                        type="button"
                        onClick={() => handleToggleAiChat(originalIndex)}
                        aria-label="Ask AI Doubt Tutor"
                        title="Ask AI Doubt Tutor"
                        className="ai-chat-icon-btn"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: "36px",
                          height: "36px",
                          borderRadius: "50%",
                          background: "linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)",
                          color: "#ffffff",
                          border: "1.5px solid #a5b4fc",
                          cursor: "pointer",
                          boxShadow: "0 4px 10px rgba(67, 56, 202, 0.25)",
                          transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                          padding: 0,
                        }}
                      >
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                          <circle cx="9" cy="10" r="1" fill="currentColor" />
                          <circle cx="12" cy="10" r="1" fill="currentColor" />
                          <circle cx="15" cy="10" r="1" fill="currentColor" />
                        </svg>
                      </button>
                      <span className="ai-chat-hover-label">
                        Ask AI Doubt Tutor
                      </span>
                    </div>
                  )}
                </div>

                <h3 style={{ margin: "8px 0 10px", fontSize: "1.05rem", lineHeight: 1.45 }}>{question.prompt}</h3>

                <p style={{ margin: "0 0 12px", fontSize: "0.88rem" }}>
                  {!hasAnswered ? (
                    <span style={{ color: "#778782" }}>Not answered</span>
                  ) : (
                    <span>
                      Your answer:{" "}
                      <strong style={{ color: isCorrect ? "#19693b" : "#c03a1b" }}>
                        {selectedText}
                      </strong>
                    </span>
                  )}{" "}
                  <span>·</span> Correct: <strong style={{ color: "#166534" }}>{correctText}</strong>
                </p>

                {/* 1. STANDARD EXPLANATION: Disappears when AI Chat is Open! */}
                {!isChatOpen && question.explanation && (
                  <em
                    style={{
                      display: "block",
                      color: "#475569",
                      fontSize: "0.85rem",
                      fontStyle: "normal",
                      background: "#f8fafc",
                      padding: "10px 14px",
                      borderRadius: "6px",
                      borderLeft: "3px solid #cbd5e1",
                      marginBottom: "10px",
                    }}
                  >
                    <strong>Explaination:</strong> {question.explanation}
                  </em>
                )}

                {/* 2. INTERACTIVE AI CHAT CONVERSATION SCREEN: Replaces explanation area */}
                {isChatOpen && (
                  <div
                    style={{
                      marginTop: "12px",
                      background: "#ffffff",
                      border: "2px solid #6366f1",
                      borderRadius: "14px",
                      overflow: "hidden",
                      boxShadow: "0 8px 24px rgba(99, 102, 241, 0.12)",
                    }}
                  >
                    {/* Chat Header */}
                    <div
                      style={{
                        background: "linear-gradient(135deg, #312e81 0%, #4338ca 100%)",
                        color: "#fff",
                        padding: "12px 18px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: "10px",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontSize: "1.2rem" }}>🤖</span>
                        <div>
                          <strong style={{ fontSize: "0.92rem", display: "block" }}>
                            AI Doubt Tutor · Question #{originalIndex + 1}
                          </strong>
                          <span style={{ fontSize: "0.72rem", opacity: 0.85 }}>
                            Strictly focused on {question.section} · Bilingual (Hindi &amp; English)
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleToggleAiChat(originalIndex)}
                        style={{
                          background: "rgba(255,255,255,0.2)",
                          color: "#fff",
                          border: "none",
                          borderRadius: "6px",
                          padding: "4px 10px",
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        Show Standard Explanation ✕
                      </button>
                    </div>

                    {/* Quick Topic Chips */}
                    <div
                      style={{
                        padding: "10px 16px",
                        background: "#f8fafc",
                        borderBottom: "1px solid #e2e8f0",
                        display: "flex",
                        gap: "8px",
                        flexWrap: "wrap",
                      }}
                    >
                      <button
                        type="button"
                        disabled={isSending}
                        onClick={() => handleSendChatMessage(originalIndex, "Why is my selected choice wrong? Explain the trap simply.")}
                        style={{
                          background: "#fff",
                          border: "1px solid #cbd5e1",
                          padding: "4px 10px",
                          borderRadius: "12px",
                          fontSize: "0.76rem",
                          cursor: isSending ? "not-allowed" : "pointer",
                          color: "#334155",
                          fontWeight: 600,
                        }}
                      >
                        💡 Why is my choice wrong?
                      </button>
                      <button
                        type="button"
                        disabled={isSending}
                        onClick={() => handleSendChatMessage(originalIndex, "Explain this question and why the correct answer is right completely in Hindi.")}
                        style={{
                          background: "#fff",
                          border: "1px solid #cbd5e1",
                          padding: "4px 10px",
                          borderRadius: "12px",
                          fontSize: "0.76rem",
                          cursor: isSending ? "not-allowed" : "pointer",
                          color: "#334155",
                          fontWeight: 600,
                        }}
                      >
                        🇮🇳 Explain in Hindi
                      </button>
                      <button
                        type="button"
                        disabled={isSending}
                        onClick={() => handleSendChatMessage(originalIndex, "Give a memorable mnemonic or memory trick for this question.")}
                        style={{
                          background: "#fff",
                          border: "1px solid #cbd5e1",
                          padding: "4px 10px",
                          borderRadius: "12px",
                          fontSize: "0.76rem",
                          cursor: isSending ? "not-allowed" : "pointer",
                          color: "#334155",
                          fontWeight: 600,
                        }}
                      >
                        🧠 Memory Trick / Mnemonic
                      </button>
                      <button
                        type="button"
                        disabled={isSending}
                        onClick={() => handleSendChatMessage(originalIndex, "Break down the core concept tested in this question step-by-step.")}
                        style={{
                          background: "#fff",
                          border: "1px solid #cbd5e1",
                          padding: "4px 10px",
                          borderRadius: "12px",
                          fontSize: "0.76rem",
                          cursor: isSending ? "not-allowed" : "pointer",
                          color: "#334155",
                          fontWeight: 600,
                        }}
                      >
                        🎯 Core Concept Breakdown
                      </button>
                    </div>

                    {/* Chat Messages Body */}
                    <div
                      ref={chatScrollRef}
                      style={{
                        padding: "16px",
                        maxHeight: "340px",
                        overflowY: "auto",
                        display: "flex",
                        flexDirection: "column",
                        gap: "12px",
                        background: "#fafafa",
                      }}
                    >
                      {chatMessages.map((msg, mIdx) => {
                        const isUser = msg.role === "user";
                        return (
                          <div
                            key={mIdx}
                            style={{
                              display: "flex",
                              justifyContent: isUser ? "flex-end" : "flex-start",
                              alignItems: "flex-end",
                              gap: "8px",
                            }}
                          >
                            {!isUser && (
                              <div
                                style={{
                                  width: "28px",
                                  height: "28px",
                                  borderRadius: "50%",
                                  background: "#e0e7ff",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontSize: "0.9rem",
                                  flexShrink: 0,
                                }}
                              >
                                🤖
                              </div>
                            )}

                            <div
                              style={{
                                maxWidth: "82%",
                                background: isUser ? "#4338ca" : "#ffffff",
                                color: isUser ? "#ffffff" : "#1e293b",
                                padding: "12px 16px",
                                borderRadius: isUser ? "14px 14px 2px 14px" : "14px 14px 14px 2px",
                                border: isUser ? "none" : "1px solid #e2e8f0",
                                boxShadow: isUser ? "0 2px 6px rgba(67, 56, 202, 0.25)" : "0 2px 6px rgba(0,0,0,0.04)",
                                fontSize: "0.88rem",
                                lineHeight: "1.55",
                              }}
                            >
                              <div>
                                {isUser ? msg.content : renderFormattedMarkdown(msg.content)}
                              </div>
                              <span
                                style={{
                                  display: "block",
                                  fontSize: "0.68rem",
                                  opacity: 0.7,
                                  marginTop: "4px",
                                  textAlign: isUser ? "right" : "left",
                                }}
                              >
                                {msg.time}
                              </span>
                            </div>

                            {isUser && (
                              <div
                                style={{
                                  width: "28px",
                                  height: "28px",
                                  borderRadius: "50%",
                                  background: "#cbd5e1",
                                  color: "#0f172a",
                                  fontWeight: 700,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontSize: "0.75rem",
                                  flexShrink: 0,
                                }}
                              >
                                You
                              </div>
                            )}
                          </div>
                        );
                      })}

                      {/* Loading typing bubble */}
                      {isSending && (
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <div
                            style={{
                              width: "28px",
                              height: "28px",
                              borderRadius: "50%",
                              background: "#e0e7ff",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "0.9rem",
                            }}
                          >
                            🤖
                          </div>
                          <div
                            style={{
                              background: "#ffffff",
                              padding: "10px 14px",
                              borderRadius: "14px 14px 14px 2px",
                              border: "1px solid #e2e8f0",
                              fontSize: "0.85rem",
                              color: "#4338ca",
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                            }}
                          >
                            <span
                              className="spinner"
                              style={{
                                width: "12px",
                                height: "12px",
                                border: "2px solid #4338ca",
                                borderTopColor: "transparent",
                                borderRadius: "50%",
                                display: "inline-block",
                                animation: "spin 0.8s linear infinite",
                              }}
                            />
                            <span>AI Tutor is thinking...</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Chat Input Bar */}
                    <div
                      style={{
                        padding: "12px 16px",
                        background: "#ffffff",
                        borderTop: "1px solid #e2e8f0",
                      }}
                    >
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          handleSendChatMessage(originalIndex);
                        }}
                        style={{ display: "flex", gap: "8px", alignItems: "center" }}
                      >
                        <input
                          type="text"
                          value={inputPrompts[originalIndex] || ""}
                          onChange={(e) => setInputPrompts((prev) => ({ ...prev, [originalIndex]: e.target.value }))}
                          placeholder={`Ask a doubt regarding Question #${originalIndex + 1}...`}
                          disabled={isSending}
                          style={{
                            flex: 1,
                            padding: "10px 14px",
                            borderRadius: "8px",
                            border: "1px solid #cbd5e1",
                            fontSize: "0.88rem",
                            outline: "none",
                          }}
                        />

                        <button
                          type="submit"
                          disabled={isSending || !(inputPrompts[originalIndex] || "").trim()}
                          style={{
                            background: !(inputPrompts[originalIndex] || "").trim() || isSending ? "#94a3b8" : "#4338ca",
                            color: "#ffffff",
                            border: "none",
                            borderRadius: "8px",
                            padding: "10px 18px",
                            fontWeight: 700,
                            fontSize: "0.88rem",
                            cursor: !(inputPrompts[originalIndex] || "").trim() || isSending ? "not-allowed" : "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          <span>Send</span>
                          <span>➤</span>
                        </button>
                      </form>
                      <small style={{ display: "block", color: "#64748b", fontSize: "0.72rem", marginTop: "6px" }}>
                        🔒 AI Tutor is strictly guarded to answer doubts related to this question and its syllabus concept only.
                      </small>
                    </div>
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </section>

      <style jsx>{`
        .ai-chat-btn-wrapper {
          position: relative;
          display: inline-flex;
          align-items: center;
        }
        .ai-chat-icon-btn:hover {
          transform: scale(1.08);
          box-shadow: 0 6px 16px rgba(67, 56, 202, 0.35) !important;
        }
        .ai-chat-hover-label {
          visibility: hidden;
          opacity: 0;
          position: absolute;
          bottom: calc(100% + 8px);
          right: 0;
          white-space: nowrap;
          background: #1e1b4b;
          color: #ffffff;
          font-size: 0.74rem;
          font-weight: 700;
          padding: 5px 10px;
          border-radius: 6px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.18);
          pointer-events: none;
          transition: opacity 0.2s ease, transform 0.2s ease;
          transform: translateY(4px);
          z-index: 100;
        }
        .ai-chat-btn-wrapper:hover .ai-chat-hover-label {
          visibility: visible;
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>
    </div>
  );
}
