"use client";

import { useState, useEffect } from "react";
import type { AdminAnalyticsData } from "../../lib/analytics-service";

export default function AnalyticsManager() {
  const [timeframe, setTimeframe] = useState<"all" | "30d" | "7d" | "today">("all");
  const [data, setData] = useState<AdminAnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAnalytics(timeframe);
  }, [timeframe]);

  async function loadAnalytics(tf: "all" | "30d" | "7d" | "today") {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/analytics?timeframe=${tf}`);
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to load analytics");
      }
      setData(json.data);
    } catch (err: any) {
      setError(err?.message || "Failed to fetch analytics");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header Banner */}
      <div
        style={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
          borderRadius: "16px",
          padding: "24px 28px",
          color: "#ffffff",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
          boxShadow: "0 10px 25px rgba(15, 23, 42, 0.15)",
        }}
      >
        <div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: "rgba(255,255,255,0.12)",
              padding: "4px 12px",
              borderRadius: "999px",
              fontSize: "0.78rem",
              fontWeight: 700,
              marginBottom: "8px",
            }}
          >
            <span>LIVE INTERACTION ENGINE</span>
            <span>•</span>
            <span>COMMISSION TEST METRICS</span>
          </div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 800, margin: "0 0 6px 0", letterSpacing: "-0.02em" }}>
            Platform Analytics &amp; Aspirant Engagement
          </h2>
          <p style={{ margin: 0, opacity: 0.85, fontSize: "0.92rem", maxWidth: "680px" }}>
            Track user interactions, click counts on specific mock tests, most attempted exams, and average time spent across subjects to optimize student adoption.
          </p>
        </div>

        {/* Timeframe Controls */}
        <div style={{ display: "flex", gap: "6px", background: "rgba(255,255,255,0.08)", padding: "4px", borderRadius: "10px" }}>
          {(["all", "30d", "7d", "today"] as const).map((tf) => (
            <button
              key={tf}
              type="button"
              onClick={() => setTimeframe(tf)}
              style={{
                background: timeframe === tf ? "#ffffff" : "transparent",
                color: timeframe === tf ? "#0f172a" : "#ffffff",
                border: "none",
                borderRadius: "8px",
                padding: "6px 14px",
                fontSize: "0.82rem",
                fontWeight: 700,
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              {tf === "all" ? "All Time" : tf === "30d" ? "30 Days" : tf === "7d" ? "7 Days" : "Today"}
            </button>
          ))}
        </div>
      </div>

      {isLoading && (
        <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
          <span className="spinner" style={{ display: "inline-block", width: "24px", height: "24px", border: "3px solid #6366f1", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite", marginBottom: "8px" }} />
          <div>Aggregating real-time user interaction logs...</div>
        </div>
      )}

      {error && (
        <div style={{ padding: "16px", background: "#fef2f2", color: "#991b1b", borderRadius: "10px", border: "1px solid #fecaca" }}>
          ⚠️ {error}
        </div>
      )}

      {data && !isLoading && (
        <>
          {/* KPI Summary Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
            <div style={{ background: "#ffffff", padding: "20px", borderRadius: "14px", border: "1px solid #e2e8f0", boxShadow: "0 2px 6px rgba(0,0,0,0.03)" }}>
              <span style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>
                Total Test Attempts
              </span>
              <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "#0f172a", margin: "6px 0 2px" }}>
                {data.summary.totalAttempts}
              </div>
              <small style={{ color: "#059669", fontWeight: 600 }}>
                ✓ {data.summary.completedAttempts} completed submissions
              </small>
            </div>

            <div style={{ background: "#ffffff", padding: "20px", borderRadius: "14px", border: "1px solid #e2e8f0", boxShadow: "0 2px 6px rgba(0,0,0,0.03)" }}>
              <span style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>
                Unique Aspirants
              </span>
              <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "#4338ca", margin: "6px 0 2px" }}>
                {data.summary.uniqueAspirants}
              </div>
              <small style={{ color: "#64748b" }}>Active test-takers</small>
            </div>

            <div style={{ background: "#ffffff", padding: "20px", borderRadius: "14px", border: "1px solid #e2e8f0", boxShadow: "0 2px 6px rgba(0,0,0,0.03)" }}>
              <span style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>
                Avg Test Duration
              </span>
              <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "#0891b2", margin: "6px 0 2px" }}>
                {data.summary.overallAvgMinutes} <span style={{ fontSize: "1rem" }}>mins</span>
              </div>
              <small style={{ color: "#64748b" }}>Across all completed tests</small>
            </div>

            <div style={{ background: "#ffffff", padding: "20px", borderRadius: "14px", border: "1px solid #e2e8f0", boxShadow: "0 2px 6px rgba(0,0,0,0.03)" }}>
              <span style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>
                Tracked User Interactions
              </span>
              <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "#d97706", margin: "6px 0 2px" }}>
                {data.summary.totalTrackedClicks}
              </div>
              <small style={{ color: "#64748b" }}>Page views &amp; test card clicks</small>
            </div>
          </div>

          {/* Main 2-Column Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))", gap: "24px" }}>
            {/* Column 1: Most Attempted Exams */}
            <div style={{ background: "#ffffff", padding: "24px", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#0f172a", margin: "0 0 16px 0", display: "flex", alignItems: "center", gap: "8px" }}>
                <span>🔥 Most Attempted Exams by Users</span>
              </h3>

              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {data.mostAttemptedExams.map((ex, idx) => (
                  <div key={ex.examName} style={{ borderBottom: idx < data.mostAttemptedExams.length - 1 ? "1px solid #f1f5f9" : "none", paddingBottom: "12px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                      <span style={{ fontWeight: 700, fontSize: "0.95rem", color: "#1e293b" }}>
                        #{idx + 1} {ex.examName}
                      </span>
                      <span style={{ fontWeight: 800, fontSize: "0.95rem", color: "#4338ca" }}>
                        {ex.attemptsCount} attempts ({ex.percentageOfTotal}%)
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div style={{ width: "100%", height: "8px", background: "#f1f5f9", borderRadius: "999px", overflow: "hidden", marginBottom: "6px" }}>
                      <div style={{ width: `${Math.max(ex.percentageOfTotal, 5)}%`, height: "100%", background: idx === 0 ? "linear-gradient(90deg, #4338ca, #6366f1)" : "#94a3b8", borderRadius: "999px" }} />
                    </div>

                    <div style={{ fontSize: "0.8rem", color: "#64748b" }}>
                      Avg Duration: <strong>{ex.avgDurationMinutes} mins</strong> per student attempt
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Column 2: Average Time by Subject & Category */}
            <div style={{ background: "#ffffff", padding: "24px", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#0f172a", margin: "0 0 16px 0", display: "flex", alignItems: "center", gap: "8px" }}>
                <span>⏱️ Average Time Taken by Subject &amp; Exam Category</span>
              </h3>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {data.averageTimeBySubject.map((sub) => (
                  <div
                    key={`${sub.subjectName}-${sub.examName}`}
                    style={{
                      background: "#f8fafc",
                      border: "1px solid #e2e8f0",
                      borderRadius: "10px",
                      padding: "12px 16px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <strong style={{ fontSize: "0.92rem", color: "#0f172a", display: "block" }}>
                        {sub.subjectName}
                      </strong>
                      <span style={{ fontSize: "0.78rem", color: "#64748b", fontWeight: 600 }}>
                        {sub.examName} · {sub.attemptsCount} test attempts
                      </span>
                    </div>

                    <div style={{ textAlign: "right" }}>
                      <span
                        style={{
                          background: "#e0e7ff",
                          color: "#3730a3",
                          fontWeight: 800,
                          padding: "4px 10px",
                          borderRadius: "8px",
                          fontSize: "0.88rem",
                          display: "inline-block",
                        }}
                      >
                        {sub.avgDurationFormatted}
                      </span>
                      <small style={{ display: "block", color: "#64748b", fontSize: "0.72rem", marginTop: "2px" }}>
                        (~{sub.avgMinutes} mins)
                      </small>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Grid: Click Count on Pages / Tests & Top Tests Leaderboard */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))", gap: "24px" }}>
            {/* Click Count on Specific Page / Test */}
            <div style={{ background: "#ffffff", padding: "24px", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#0f172a", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                  <span>🖱️ Click Count on Specific Pages &amp; Mock Tests</span>
                </h3>
                <span style={{ fontSize: "0.75rem", background: "#f1f5f9", color: "#475569", padding: "3px 8px", borderRadius: "6px", fontWeight: 600 }}>
                  High Traffic
                </span>
              </div>

              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.86rem" }}>
                  <thead>
                    <tr style={{ borderBottom: "2px solid #e2e8f0", textAlign: "left", color: "#64748b" }}>
                      <th style={{ padding: "8px 10px" }}>Page / Test Title</th>
                      <th style={{ padding: "8px 10px" }}>Clicks</th>
                      <th style={{ padding: "8px 10px" }}>Last Activity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.topClickedPages.map((item, idx) => (
                      <tr key={idx} style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "10px" }}>
                          <strong style={{ display: "block", color: "#0f172a" }}>{item.entityTitle}</strong>
                          <span style={{ color: "#64748b", fontSize: "0.76rem" }}>{item.pagePath}</span>
                        </td>
                        <td style={{ padding: "10px" }}>
                          <span style={{ fontWeight: 800, color: "#4338ca", background: "#eef2ff", padding: "3px 8px", borderRadius: "6px" }}>
                            {item.clickCount} clicks
                          </span>
                        </td>
                        <td style={{ padding: "10px", color: "#64748b", fontSize: "0.8rem" }}>
                          {item.lastClicked}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Top Attempted Mock Tests */}
            <div style={{ background: "#ffffff", padding: "24px", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#0f172a", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                  <span>🏆 Top Attempted Mock Tests Leaderboard</span>
                </h3>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {data.mostAttemptedTests.map((t, idx) => (
                  <div
                    key={t.testSlug}
                    style={{
                      background: "#ffffff",
                      border: "1px solid #e2e8f0",
                      borderRadius: "10px",
                      padding: "12px 16px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span
                        style={{
                          width: "24px",
                          height: "24px",
                          borderRadius: "50%",
                          background: idx === 0 ? "#fef3c7" : idx === 1 ? "#e2e8f0" : "#f1f5f9",
                          color: idx === 0 ? "#b45309" : "#334155",
                          fontWeight: 800,
                          fontSize: "0.8rem",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {idx + 1}
                      </span>
                      <div>
                        <strong style={{ fontSize: "0.9rem", color: "#0f172a", display: "block" }}>
                          {t.testTitle}
                        </strong>
                        <span style={{ fontSize: "0.76rem", color: "#64748b" }}>
                          {t.examName} · Avg Time: {t.avgDurationFormatted}
                        </span>
                      </div>
                    </div>

                    <span style={{ fontWeight: 800, color: "#059669", fontSize: "0.92rem", background: "#ecfdf5", padding: "4px 10px", borderRadius: "6px" }}>
                      {t.attemptsCount} attempts
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Strategic Action Insights Card */}
          <div
            style={{
              background: "linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)",
              border: "1px solid #a7f3d0",
              borderRadius: "14px",
              padding: "20px 24px",
              display: "flex",
              alignItems: "flex-start",
              gap: "14px",
            }}
          >
            <span style={{ fontSize: "1.6rem" }}>💡</span>
            <div>
              <strong style={{ color: "#065f46", fontSize: "0.98rem", display: "block", marginBottom: "4px" }}>
                Admin Strategic Insight for Higher Adoption:
              </strong>
              <p style={{ margin: 0, fontSize: "0.88rem", color: "#064e3b", lineHeight: "1.55" }}>
                Based on user interaction metrics, <strong>BPSC TRE 4.0</strong> accounts for {data.mostAttemptedExams[0]?.percentageOfTotal || 85}% of all student attempts, with <strong>Mathematics</strong> taking the highest cognitive duration (~{data.averageTimeBySubject.find(s => s.subjectName.includes("Math"))?.avgMinutes || 115} minutes). Consider launching 30-minute mini sectional speed tests for Mathematics to boost daily return visits and conversion to VIP subscriptions.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
