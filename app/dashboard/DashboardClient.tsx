"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { AuthUser } from "../../lib/auth-store";
import type { UserDashboardPayload, UserAttemptHistoryItem } from "../../lib/dashboard-store";
import type { OrderRecord } from "../../lib/commerce-store";
import type { MockTest } from "../../lib/admin-content";
import { mockTests } from "../../lib/syllabus";
import { featuredExams } from "../../lib/catalog";

type TabKey = "overview" | "tests" | "exams" | "progress" | "membership" | "settings";

type DashboardClientProps = {
  user: AuthUser;
  initialData?: UserDashboardPayload;
  initialMockTests?: MockTest[];
};

export default function DashboardClient({ user, initialData, initialMockTests }: DashboardClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [examFilter, setExamFilter] = useState("All");
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<OrderRecord | null>(null);
  const [logoImageUrl, setLogoImageUrl] = useState("");
  const [portalName, setPortalName] = useState("India Mock Tests");

  useEffect(() => {
    fetch("/api/admin/config")
      .then((res) => res.json())
      .then((data) => {
        if (data?.config?.logoImageUrl) setLogoImageUrl(data.config.logoImageUrl);
        if (data?.config?.portalName) setPortalName(data.config.portalName);
      })
      .catch(() => {});
  }, []);

  // Settings state
  const [displayName, setDisplayName] = useState(user.displayName);
  const [targetExam, setTargetExam] = useState("BPSC TRE 4.0");
  const [dailyGoal, setDailyGoal] = useState("45");
  const [settingsFeedback, setSettingsFeedback] = useState<string | null>(null);

  // Real dashboard data
  const stats = initialData?.stats || {
    totalAttempts: 0,
    completedTests: 0,
    averageScorePercent: 0,
    accuracyPercent: 0,
    totalTimeMinutes: 0,
    bestScorePercent: 0,
    currentStreakDays: 1,
  };

  const recentAttempts: UserAttemptHistoryItem[] = initialData?.recentAttempts || [];
  const orders: OrderRecord[] = initialData?.orders || [];
  const recommendedTests = initialData?.recommendedTests || mockTests.slice(0, 6);

  // Sync tab with URL hash if present
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace("#", "") as TabKey;
      if (["overview", "tests", "exams", "progress", "membership", "settings"].includes(hash)) {
        setActiveTab(hash);
      }
    };
    handleHash();
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, []);

  function switchTab(tab: TabKey) {
    setActiveTab(tab);
    window.location.hash = tab;
  }

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.href = "/";
    } catch {
      window.location.href = "/";
    }
  }

  // Available tests with database banners
  const availableTests = useMemo(() => {
    if (initialMockTests && initialMockTests.length > 0) {
      return initialMockTests.map((t) => ({
        slug: t.slug,
        name: t.name,
        exam: t.examName,
        subject: t.subjectName,
        track: t.trackSlug.replace(/-/g, " ").toUpperCase(),
        questions: t.questionCount,
        duration: `${t.durationMinutes} min`,
        access: t.access,
        bannerImageUrl: t.bannerImageUrl,
      }));
    }
    return mockTests;
  }, [initialMockTests]);

  // Filtered mock tests for the "tests" tab
  const filteredTests = useMemo(() => {
    return availableTests.filter((test) => {
      if (examFilter !== "All" && !test.exam.toLowerCase().includes(examFilter.toLowerCase())) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          test.name.toLowerCase().includes(q) ||
          test.subject.toLowerCase().includes(q) ||
          test.exam.toLowerCase().includes(q) ||
          test.track.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [availableTests, examFilter, searchQuery]);

  const initials = (user.displayName || "User")
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const firstName = user.displayName.split(" ")[0] || "Learner";
  const isVip = user.role === "admin" || user.subscriptionTier === "ultimate" || user.subscriptionTier === "sprint";
  const isUltimate = user.role === "admin" || user.subscriptionTier === "ultimate";

  const tierLabel = user.role === "admin"
    ? "👑 VIP ULTIMATE (ADMIN)"
    : user.subscriptionTier === "ultimate"
      ? "👑 VIP ULTIMATE"
      : user.subscriptionTier === "sprint"
        ? "⚡ VIP SPRINT"
        : "FREE ASPIRANT";

  return (
    <main className="dashboard-page">
      {/* Persistent Left Sidebar */}
      <aside className="dashboard-sidebar">
        <Link className="logo dashboard-logo-link" href="/" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
          {logoImageUrl ? (
            <img
              src={logoImageUrl}
              alt={portalName}
              style={{ height: "38px", maxHeight: "44px", maxWidth: "160px", width: "auto", objectFit: "contain", display: "block" }}
              onError={() => setLogoImageUrl("")}
            />
          ) : (
            <>
              <span className="logo-mark">{portalName.slice(0, 1).toUpperCase()}</span>
              <span>
                {portalName}<span className="logo-dot">.</span>
              </span>
            </>
          )}
        </Link>

        <nav className="dashboard-nav">
          <button
            type="button"
            className={`dashboard-nav-btn ${activeTab === "overview" ? "active" : ""}`}
            onClick={() => switchTab("overview")}
          >
            <span>📊</span>
            Overview
          </button>

          <button
            type="button"
            className={`dashboard-nav-btn ${activeTab === "tests" ? "active" : ""}`}
            onClick={() => switchTab("tests")}
          >
            <span>📝</span>
            Mock tests
          </button>

          <button
            type="button"
            className={`dashboard-nav-btn ${activeTab === "exams" ? "active" : ""}`}
            onClick={() => switchTab("exams")}
          >
            <span>🏛️</span>
            Exam directory
          </button>

          <button
            type="button"
            className={`dashboard-nav-btn ${activeTab === "progress" ? "active" : ""}`}
            onClick={() => switchTab("progress")}
          >
            <span>📈</span>
            Test results ({stats.totalAttempts})
          </button>

          <button
            type="button"
            className={`dashboard-nav-btn ${activeTab === "membership" ? "active" : ""}`}
            onClick={() => switchTab("membership")}
          >
            <span>👑</span>
            VIP Pass & Invoices
          </button>
        </nav>

        <div className="dashboard-sidebar-bottom">
          <button
            type="button"
            className={`dashboard-nav-btn ${activeTab === "settings" ? "active" : ""}`}
            onClick={() => switchTab("settings")}
          >
            <span>⚙️</span>
            Account Settings
          </button>

          {user.role === "admin" && (
            <Link
              href="/admin"
              className="dashboard-nav-btn admin-link-btn"
              style={{ marginBottom: "16px", color: "#b94a2b" }}
            >
              <span>🛡️</span>
              Admin Studio
            </Link>
          )}

          <div className="dashboard-profile">
            <span className="dashboard-avatar">{initials}</span>
            <div className="dashboard-profile-info">
              <strong>{user.displayName}</strong>
              <small>{user.email}</small>
            </div>
            <button
              type="button"
              className="btn-logout-mini"
              onClick={handleLogout}
              title="Log out"
            >
              🚪
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <section className="dashboard-main">
        {/* Top bar with Search & User Menu */}
        <header className="dashboard-topbar">
          <div className="dashboard-mobile-logo">
            {logoImageUrl ? (
              <img
                src={logoImageUrl}
                alt={portalName}
                style={{ height: "30px", maxHeight: "36px", maxWidth: "120px", width: "auto", objectFit: "contain", display: "inline-block" }}
                onError={() => setLogoImageUrl("")}
              />
            ) : (
              <>
                <span className="logo-mark">{portalName.slice(0, 1).toUpperCase()}</span>{portalName}
              </>
            )}
          </div>

          <div className="dashboard-search-container">
            <span className="search-symbol">⌕</span>
            <input
              type="text"
              placeholder="Search tests, topics, subjects, chapters..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (activeTab === "overview" && e.target.value.trim()) {
                  setActiveTab("tests");
                }
              }}
              className="dashboard-search-input"
            />
            {searchQuery && (
              <button
                type="button"
                className="search-clear-btn"
                onClick={() => setSearchQuery("")}
              >
                ✕
              </button>
            )}
          </div>

          <div className="dashboard-top-actions">
            {/* VIP Status Pill */}
            <Link
              href={isVip ? "/dashboard#membership" : "/pricing"}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                padding: "6px 12px",
                borderRadius: "20px",
                fontSize: "0.78rem",
                fontWeight: 700,
                textDecoration: "none",
                background: isUltimate ? "#fef3c7" : isVip ? "#dcfce7" : "#f1f5f9",
                color: isUltimate ? "#92400e" : isVip ? "#166534" : "#475569",
                border: isUltimate ? "1px solid #f59e0b" : isVip ? "1px solid #86efac" : "1px solid #cbd5e1",
              }}
            >
              {isVip ? tierLabel : "⚡ Upgrade to VIP"}
            </Link>

            <Link href="/" className="btn-top-home" title="Go to website home">
              🏠 Home
            </Link>

            {user.role === "admin" && (
              <Link href="/admin" className="btn-top-admin" title="Admin Studio">
                🛡 Admin
              </Link>
            )}

            {/* Profile Dropdown */}
            <div className="dashboard-user-dropdown-wrapper">
              <button
                type="button"
                className="dashboard-avatar-btn"
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                aria-label="User profile options"
              >
                <span className="dashboard-mini-avatar">{initials}</span>
                <span className="avatar-user-name">{firstName}</span>
                <span className="chevron">▾</span>
              </button>

              {profileDropdownOpen && (
                <div
                  className="dashboard-profile-menu"
                  onClick={() => setProfileDropdownOpen(false)}
                >
                  <div className="menu-header">
                    <strong>{user.displayName}</strong>
                    <small>{user.email}</small>
                    <span className="role-tag">{tierLabel}</span>
                  </div>
                  <div className="menu-items">
                    <button type="button" onClick={() => switchTab("overview")}>
                      <span>📊</span> Dashboard Overview
                    </button>
                    <button type="button" onClick={() => switchTab("tests")}>
                      <span>📝</span> My Mock Tests
                    </button>
                    <button type="button" onClick={() => switchTab("progress")}>
                      <span>📈</span> Test Performance ({stats.totalAttempts})
                    </button>
                    <button type="button" onClick={() => switchTab("membership")}>
                      <span>👑</span> VIP Pass & Invoices
                    </button>
                    <button type="button" onClick={() => switchTab("settings")}>
                      <span>⚙️</span> Account Settings
                    </button>
                    {user.role === "admin" && (
                      <Link href="/admin" className="admin-menu-link">
                        <span>🛡️</span> Admin Console →
                      </Link>
                    )}
                    <button
                      type="button"
                      className="logout-menu-btn"
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                    >
                      <span>🚪</span> {isLoggingOut ? "Logging out..." : "Sign Out"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* TAB 1: OVERVIEW */}
        {activeTab === "overview" && (
          <div className="tab-pane-content">
            <div className="dashboard-welcome">
              <div>
                <span className="kicker">
                  {new Date().toLocaleDateString("en-US", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  }).toUpperCase()}
                </span>
                <h1>
                  Good morning, {firstName}
                  <em>.</em>
                </h1>
                <p>Welcome to your personal exam practice dashboard.</p>
              </div>
              <button
                type="button"
                className="dashboard-primary"
                onClick={() => switchTab("tests")}
              >
                + Find a practice test
              </button>
            </div>

            {/* REAL USER STATS */}
            <section className="dashboard-stats">
              <div>
                <span className="dashboard-stat-icon coral-icon">↗</span>
                <small>OVERALL ACCURACY</small>
                <strong>{stats.accuracyPercent}%</strong>
                <em>{stats.completedTests > 0 ? `Across ${stats.completedTests} finished tests` : "Take a test to calculate"}</em>
              </div>
              <div>
                <span className="dashboard-stat-icon teal-icon">◷</span>
                <small>PRACTICE TIME</small>
                <strong>{stats.totalTimeMinutes}m</strong>
                <em>Total time engaged</em>
                <i className="dashboard-ring">{stats.completedTests}</i>
              </div>
              <div>
                <span className="dashboard-stat-icon gold-icon">✦</span>
                <small>COMPLETED TESTS</small>
                <strong>{stats.completedTests}</strong>
                <em>{stats.totalAttempts} total attempts initiated</em>
              </div>
            </section>

            {/* VIP STATUS BANNER */}
            <section style={{ marginTop: "24px" }}>
              <div
                style={{
                  background: isUltimate
                    ? "linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)"
                    : isVip
                      ? "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)"
                      : "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
                  border: isUltimate ? "1px solid #fde68a" : isVip ? "1px solid #bbf7d0" : "1px solid #e2e8f0",
                  borderRadius: "10px",
                  padding: "20px 24px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "16px",
                }}
              >
                <div>
                  <span
                    style={{
                      fontSize: "0.72rem",
                      fontWeight: 800,
                      letterSpacing: "1px",
                      color: isUltimate ? "#b45309" : isVip ? "#15803d" : "#64748b",
                    }}
                  >
                    MEMBERSHIP STATUS
                  </span>
                  <h3 style={{ margin: "4px 0 6px", fontSize: "1.2rem", fontFamily: "Space Grotesk" }}>
                    {isUltimate
                      ? "All-Exam Ultimate VIP Pass (Active)"
                      : isVip
                        ? "Single Exam Sprint Pass (Active)"
                        : "Free Aspirant Account"}
                  </h3>
                  <p style={{ margin: 0, fontSize: "0.85rem", color: "#64748b" }}>
                    {isUltimate
                      ? "Unlimited access to all state PSCs, TET, CTET, and BPSC TRE mock tests."
                      : isVip
                        ? "Access to all full-length mocks for your selected exam series."
                        : "You currently have access to free diagnostic tests. Upgrade to unlock all 500+ test series."}
                  </p>
                </div>
                <div>
                  {isVip ? (
                    <button
                      type="button"
                      className="dashboard-plan-btn"
                      onClick={() => switchTab("membership")}
                      style={{ background: "#1e3a34", color: "#fff", padding: "10px 18px", borderRadius: "6px", cursor: "pointer", fontWeight: 600, fontSize: "0.85rem" }}
                    >
                      View Billing & Invoices →
                    </button>
                  ) : (
                    <Link
                      href="/checkout?plan=ultimate"
                      style={{
                        display: "inline-block",
                        background: "linear-gradient(135deg, #b94a2b 0%, #d97706 100%)",
                        color: "#fff",
                        padding: "10px 20px",
                        borderRadius: "6px",
                        fontWeight: 700,
                        textDecoration: "none",
                        fontSize: "0.88rem",
                      }}
                    >
                      ⚡ Upgrade to VIP Pass →
                    </Link>
                  )}
                </div>
              </div>
            </section>

            {/* RECENT OR CONTINUING TEST */}
            <section className="dashboard-continue">
              <div className="dashboard-section-title">
                <div>
                  <span className="kicker">YOUR LATEST ACTIVITY</span>
                  <h2>{recentAttempts.length > 0 ? "Latest Attempt" : "Recommended Mock Test"}</h2>
                </div>
                <button
                  type="button"
                  className="link-plain-btn"
                  onClick={() => switchTab("tests")}
                >
                  View all tests →
                </button>
              </div>

              {recentAttempts.length > 0 ? (
                <div className="continue-card">
                  <div className="continue-symbol">✓</div>
                  <div className="continue-copy">
                    <span>{recentAttempts[0].exam.toUpperCase()}</span>
                    <h3>{recentAttempts[0].title}</h3>
                    <p>
                      {recentAttempts[0].isCompleted
                        ? `Score: ${recentAttempts[0].score}/${recentAttempts[0].maxScore} · ${recentAttempts[0].accuracy}% Accuracy`
                        : "In progress · Continue answering questions"}
                    </p>
                    <div className="dashboard-progress">
                      <i
                        style={{
                          width: recentAttempts[0].isCompleted
                            ? `${recentAttempts[0].accuracy}%`
                            : "50%",
                        }}
                      />
                    </div>
                  </div>
                  <strong>
                    {recentAttempts[0].isCompleted
                      ? `${recentAttempts[0].score} pts`
                      : "Active"}
                  </strong>
                  <Link
                    className="continue-action"
                    href={
                      recentAttempts[0].isCompleted
                        ? `/results/${recentAttempts[0].id}`
                        : `/attempt/${recentAttempts[0].testSlug}`
                    }
                  >
                    {recentAttempts[0].isCompleted ? "Review Analysis" : "Resume Test"} <span>→</span>
                  </Link>
                </div>
              ) : (
                <div className="continue-card">
                  <div className="continue-symbol">✦</div>
                  <div className="continue-copy">
                    <span>BPSC TRE 4.0 · FULL LENGTH MOCK 01</span>
                    <h3>BPSC TRE 4.0 General Studies & Language Diagnostic Test</h3>
                    <p>150 Questions · 150 Minutes · 5-Option OMR Format</p>
                  </div>
                  <Link className="continue-action" href="/attempt/bpsc-tre-4-full-mock-01">
                    Start Test <span>→</span>
                  </Link>
                </div>
              )}
            </section>

            {/* LOWER GRID: RECENT RESULTS & FOCUS AREAS */}
            <section className="dashboard-lower" id="progress">
              <div className="dashboard-panel">
                <div className="dashboard-section-title">
                  <div>
                    <span className="kicker">TEST HISTORY</span>
                    <h2>Recent attempts</h2>
                  </div>
                  <button
                    type="button"
                    className="link-plain-btn"
                    onClick={() => switchTab("progress")}
                  >
                    View all ({stats.totalAttempts}) →
                  </button>
                </div>
                <div className="result-list">
                  {recentAttempts.length > 0 ? (
                    recentAttempts.slice(0, 5).map((attempt) => (
                      <Link
                        href={attempt.isCompleted ? `/results/${attempt.id}` : `/attempt/${attempt.testSlug}`}
                        className="result-row"
                        key={attempt.id}
                        style={{ textDecoration: "none", color: "inherit" }}
                      >
                        <span className="result-mark">{attempt.isCompleted ? "✓" : "◷"}</span>
                        <div>
                          <strong>{attempt.title}</strong>
                          <small>
                            {attempt.exam} · {new Date(attempt.startedAt).toLocaleDateString()}
                          </small>
                        </div>
                        <b>{attempt.isCompleted ? `${attempt.score}/${attempt.maxScore}` : "Ongoing"}</b>
                        <span>↗</span>
                      </Link>
                    ))
                  ) : (
                    <div style={{ padding: "20px 0", color: "#94a3b8", fontSize: "0.88rem" }}>
                      No mock tests attempted yet. Pick a test from the mock tests tab to start tracking your progress!
                    </div>
                  )}
                </div>
              </div>

              <div className="dashboard-panel">
                <div className="dashboard-section-title">
                  <div>
                    <span className="kicker">TARGET SYLLABUS</span>
                    <h2>High-weightage Topics</h2>
                  </div>
                </div>
                <div className="focus-list">
                  {[
                    { topic: "Bihar History & Freedom Movement", exam: "BPSC TRE 4.0", weight: "22 Qs", color: "coral" },
                    { topic: "Child Development & Pedagogy (CDP)", exam: "CTET / STET", weight: "30 Qs", color: "teal" },
                    { topic: "Quantitative Aptitude & Number Systems", exam: "General Studies", weight: "18 Qs", color: "gold" },
                    { topic: "Indian National Movement & Geography", exam: "Class 9-10 & 11-12", weight: "25 Qs", color: "coral" },
                  ].map((focus, idx) => (
                    <div className="focus-row" key={idx}>
                      <span className={`focus-dot ${focus.color}`} />
                      <div>
                        <strong>{focus.topic}</strong>
                        <small>{focus.exam}</small>
                      </div>
                      <b>{focus.weight}</b>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        )}

        {/* TAB 2: MOCK TESTS */}
        {activeTab === "tests" && (
          <div className="tab-pane-content">
            <div className="dashboard-welcome">
              <div>
                <span className="kicker">EXAMINATION MOCK TESTS</span>
                <h1>Practice test library</h1>
                <p>Curated tests aligned with current syllabus, negative marking, and timer controls.</p>
              </div>
            </div>

            {/* Exam Filter Chips */}
            <div className="dashboard-filter-bar">
              {["All", "BPSC TRE 4.0", "Bihar STET", "CTET"].map((filter) => (
                <button
                  type="button"
                  key={filter}
                  className={`filter-chip ${examFilter === filter ? "active" : ""}`}
                  onClick={() => setExamFilter(filter)}
                >
                  {filter}
                </button>
              ))}
            </div>

            <div className="tests-grid-layout">
              {filteredTests.map((test: any) => (
                <div className="test-card-item" key={test.slug}>
                  {test.bannerImageUrl ? (
                    <div className="test-card-custom-banner-wrap" style={{ height: "100px", margin: "-18px -18px 12px -18px" }}>
                      <img src={test.bannerImageUrl} alt={test.name} className="test-card-custom-banner-img" />
                      <div className="test-card-custom-banner-overlay">
                        <span className="catalog-subject-tag-overlay">{test.exam || "Official Exam"}</span>
                        <span className={test.access === "Premium" ? "test-vip-tag-overlay" : "test-free-tag-overlay"}>
                          {test.access === "Premium" ? "★ VIP Pass" : "Free"}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="test-card-badge-row">
                      <span className="test-exam-tag">{test.exam}</span>
                      <span className={`test-tier-tag ${test.access === "Premium" ? "premium" : "free"}`}>
                        {test.access === "Premium" ? "★ VIP Pass" : "Free"}
                      </span>
                    </div>
                  )}
                  <h3>{test.name}</h3>
                  <p className="test-desc">{test.subject} · {test.track}</p>
                  <div className="test-card-meta">
                    <span>⏱ {test.duration}</span>
                    <span>📝 {test.questions} Questions</span>
                  </div>
                  <div className="test-card-actions">
                    <Link href={`/attempt/${test.slug}`} className="btn-start-test">
                      Start Test →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: EXAM DIRECTORY */}
        {activeTab === "exams" && (
          <div className="tab-pane-content">
            <div className="dashboard-welcome">
              <div>
                <span className="kicker">NATIONAL & STATE EXAMS</span>
                <h1>Target Examination Profiles</h1>
                <p>Official exam tracks with syllabus breakdowns, marking schemes, and subject hierarchies.</p>
              </div>
            </div>

            <div className="exams-directory-grid">
              {featuredExams.map((exam) => (
                <div className="dashboard-exam-card" key={exam.slug}>
                  <div className="exam-card-icon">{exam.symbol || "🏛"}</div>
                  <h2>{exam.title}</h2>
                  <p>{exam.meta}</p>
                  <div className="exam-card-stats">
                    <div>
                      <small>Mock Tests</small>
                      <strong>{exam.tests}</strong>
                    </div>
                    <div>
                      <small>Category</small>
                      <strong>{exam.badge}</strong>
                    </div>
                  </div>
                  <Link href={`/exams/${exam.slug}`} className="btn-view-exam">
                    Explore Tracks & Syllabus →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: TEST RESULTS & PROGRESS */}
        {activeTab === "progress" && (
          <div className="tab-pane-content">
            <div className="dashboard-welcome">
              <div>
                <span className="kicker">PERFORMANCE ANALYTICS</span>
                <h1>Your Test Results History</h1>
                <p>Detailed breakdown of your completed and in-progress mock tests.</p>
              </div>
            </div>

            {recentAttempts.length > 0 ? (
              <div className="performance-table-container">
                <table className="results-table">
                  <thead>
                    <tr>
                      <th>Test Title & Exam</th>
                      <th>Date Taken</th>
                      <th>Score</th>
                      <th>Accuracy</th>
                      <th>Correct / Wrong</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentAttempts.map((attempt) => (
                      <tr key={attempt.id}>
                        <td>
                          <strong>{attempt.title}</strong>
                          <small style={{ display: "block", color: "#94a3b8" }}>{attempt.exam}</small>
                        </td>
                        <td>{new Date(attempt.startedAt).toLocaleDateString()}</td>
                        <td>
                          <strong style={{ color: "#b94a2b" }}>
                            {attempt.isCompleted ? `${attempt.score} / ${attempt.maxScore}` : "—"}
                          </strong>
                        </td>
                        <td>
                          {attempt.isCompleted ? (
                            <span className="accuracy-pill">{attempt.accuracy}%</span>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td>
                          {attempt.isCompleted ? (
                            <span>
                              <span style={{ color: "#166534", fontWeight: 600 }}>+{attempt.correct}</span> /{" "}
                              <span style={{ color: "#991b1b", fontWeight: 600 }}>-{attempt.incorrect}</span>
                            </span>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td>
                          <span className={`status-badge ${attempt.isCompleted ? "completed" : "active"}`}>
                            {attempt.isCompleted ? "Completed" : "In Progress"}
                          </span>
                        </td>
                        <td>
                          <Link
                            href={attempt.isCompleted ? `/results/${attempt.id}` : `/attempt/${attempt.testSlug}`}
                            className="btn-table-action"
                          >
                            {attempt.isCompleted ? "Review Solutions" : "Resume"}
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state-box">
                <div className="empty-icon">📊</div>
                <h3>No Test History Yet</h3>
                <p>When you attempt mock tests, your scorecards, question-by-question analytics, and answer rationales will appear here.</p>
                <button type="button" className="dashboard-primary" onClick={() => switchTab("tests")}>
                  Take a Diagnostic Test Now →
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: MEMBERSHIP & INVOICES */}
        {activeTab === "membership" && (
          <div className="tab-pane-content">
            <div className="dashboard-welcome">
              <div>
                <span className="kicker">VIP MEMBERSHIP & BILLING</span>
                <h1>Subscription Details & Invoices</h1>
                <p>Manage your VIP pass, review transaction history, and download official receipts.</p>
              </div>
              <Link href="/pricing" className="dashboard-primary" style={{ textDecoration: "none" }}>
                + Browse All Plans
              </Link>
            </div>

            {/* Plan Details Card */}
            <div
              style={{
                background: "#fff",
                border: "1px solid #e2e8f0",
                borderRadius: "10px",
                padding: "24px",
                marginBottom: "28px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
                <div>
                  <div
                    style={{
                      display: "inline-block",
                      padding: "4px 10px",
                      borderRadius: "16px",
                      fontSize: "0.75rem",
                      fontWeight: 800,
                      background: isUltimate ? "#fef3c7" : isVip ? "#dcfce7" : "#f1f5f9",
                      color: isUltimate ? "#92400e" : isVip ? "#166534" : "#475569",
                      marginBottom: "8px",
                    }}
                  >
                    CURRENT TIER: {tierLabel}
                  </div>
                  <h2 style={{ margin: "4px 0 8px", fontFamily: "Space Grotesk" }}>
                    {isUltimate
                      ? "All-Exam Ultimate VIP Pass"
                      : isVip
                        ? "Single Exam Sprint Pass"
                        : "Free Aspirant Account"}
                  </h2>
                  <p style={{ margin: 0, color: "#64748b", fontSize: "0.9rem" }}>
                    {isUltimate
                      ? "Full unrestricted access to 500+ mock tests across BPSC TRE, Bihar STET, CTET & State TETs."
                      : isVip
                        ? "Targeted access for 1 selected exam test series with bilingual answer explanations."
                        : "Basic access to free diagnostic tests."}
                  </p>
                </div>

                <div style={{ textAlign: "right" }}>
                  <span style={{ display: "block", fontSize: "0.78rem", color: "#94a3b8", fontWeight: 700 }}>
                    VALIDITY STATUS
                  </span>
                  <strong style={{ fontSize: "1.1rem", color: isVip ? "#166534" : "#64748b" }}>
                    {user.role === "admin"
                      ? "Permanent Administrator Pass"
                      : user.subscriptionExpiresAt
                        ? `Valid until ${new Date(user.subscriptionExpiresAt).toLocaleDateString()}`
                        : "No Expiry (Free Plan)"}
                  </strong>
                  <div style={{ marginTop: "12px" }}>
                    <Link
                      href="/checkout?plan=ultimate"
                      style={{
                        display: "inline-block",
                        background: "#1e3a34",
                        color: "#fff",
                        padding: "8px 16px",
                        borderRadius: "6px",
                        fontSize: "0.82rem",
                        fontWeight: 600,
                        textDecoration: "none",
                      }}
                    >
                      {isVip ? "Extend / Renew Pass →" : "Upgrade to Ultimate VIP →"}
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Transactions & Invoices Table */}
            <div className="dashboard-section-title">
              <div>
                <span className="kicker">ORDER HISTORY</span>
                <h2>Transaction Receipts ({orders.length})</h2>
              </div>
            </div>

            {orders.length > 0 ? (
              <div className="performance-table-container">
                <table className="results-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Plan Description</th>
                      <th>Date</th>
                      <th>Amount Paid</th>
                      <th>Payment Method</th>
                      <th>Status</th>
                      <th>Invoice</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id}>
                        <td>
                          <strong>{order.orderNumber}</strong>
                        </td>
                        <td>{order.planName} ({order.durationMonths} Months)</td>
                        <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                        <td>
                          <strong style={{ color: "#1e3a34" }}>₹{order.amount}</strong>
                        </td>
                        <td>{order.paymentMethod}</td>
                        <td>
                          <span className="status-badge completed" style={{ background: "#dcfce7", color: "#15803d" }}>
                            Paid (Success)
                          </span>
                        </td>
                        <td>
                          <button
                            type="button"
                            className="btn-table-action"
                            onClick={() => setSelectedInvoice(order)}
                          >
                            View Receipt 📄
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state-box">
                <div className="empty-icon">🧾</div>
                <h3>No Transactions Recorded</h3>
                <p>When you purchase a VIP Pass via our simulated payment gateway, your tax invoices and payment receipts will be archived here.</p>
                <Link href="/checkout?plan=ultimate" className="dashboard-primary" style={{ textDecoration: "none" }}>
                  Simulate a Checkout Now →
                </Link>
              </div>
            )}

            {/* INVOICE MODAL */}
            {selectedInvoice && (
              <div
                style={{
                  position: "fixed",
                  inset: 0,
                  background: "rgba(0, 0, 0, 0.6)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 9999,
                  padding: "16px",
                }}
                onClick={() => setSelectedInvoice(null)}
              >
                <div
                  style={{
                    background: "#fff",
                    borderRadius: "12px",
                    maxWidth: "520px",
                    width: "100%",
                    padding: "28px",
                    boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e2e8f0", paddingBottom: "14px" }}>
                    <div>
                      <span className="logo-mark" style={{ display: "inline-block", width: "24px", height: "24px", background: "#b94a2b", color: "#fff", textAlign: "center", borderRadius: "4px", fontWeight: "bold" }}>I</span>
                      <strong style={{ marginLeft: "8px", fontFamily: "Space Grotesk" }}>INDIA MOCK TESTS</strong>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedInvoice(null)}
                      style={{ background: "none", border: "none", fontSize: "1.2rem", cursor: "pointer" }}
                    >
                      ✕
                    </button>
                  </div>

                  <div style={{ padding: "18px 0" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                      <small style={{ color: "#64748b" }}>Invoice ID:</small>
                      <strong>{selectedInvoice.invoiceNumber}</strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                      <small style={{ color: "#64748b" }}>Order ID:</small>
                      <strong>{selectedInvoice.orderNumber}</strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                      <small style={{ color: "#64748b" }}>Billed To:</small>
                      <strong>{user.displayName} ({user.email})</strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                      <small style={{ color: "#64748b" }}>Date & Time:</small>
                      <span>{new Date(selectedInvoice.createdAt).toLocaleString()}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                      <small style={{ color: "#64748b" }}>Payment Method:</small>
                      <span>{selectedInvoice.paymentMethod}</span>
                    </div>

                    <div style={{ borderTop: "1px dashed #cbd5e1", margin: "14px 0", paddingTop: "14px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                        <span>{selectedInvoice.planName} ({selectedInvoice.durationMonths} Mo)</span>
                        <strong>₹{selectedInvoice.amount}</strong>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", color: "#64748b" }}>
                        <span>Included 18% GST (CGST + SGST)</span>
                        <span>₹{selectedInvoice.taxAmount}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "10px", fontSize: "1.1rem" }}>
                        <strong>Total Paid</strong>
                        <strong style={{ color: "#1e3a34" }}>₹{selectedInvoice.amount}</strong>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                    <button
                      type="button"
                      onClick={() => window.print()}
                      style={{
                        padding: "8px 16px",
                        borderRadius: "6px",
                        border: "1px solid #cbd5e1",
                        background: "#f8fafc",
                        cursor: "pointer",
                        fontWeight: 600,
                      }}
                    >
                      Print Invoice 🖨
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedInvoice(null)}
                      style={{
                        padding: "8px 16px",
                        borderRadius: "6px",
                        background: "#1e3a34",
                        color: "#fff",
                        border: "none",
                        cursor: "pointer",
                        fontWeight: 600,
                      }}
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 6: SETTINGS */}
        {activeTab === "settings" && (
          <div className="tab-pane-content">
            <div className="dashboard-welcome">
              <div>
                <span className="kicker">PREFERENCES</span>
                <h1>Account & Goal Settings</h1>
                <p>Update your display profile and target examination pace.</p>
              </div>
            </div>

            <div className="settings-form-container">
              {settingsFeedback && (
                <div className="settings-alert success">{settingsFeedback}</div>
              )}

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setSettingsFeedback("Your preferences have been saved.");
                  setTimeout(() => setSettingsFeedback(null), 3500);
                }}
              >
                <div className="form-field-group">
                  <label>Display Name</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-field-group">
                  <label>Email Address</label>
                  <input type="email" value={user.email} disabled />
                  <small>Email address cannot be modified once verified.</small>
                </div>

                <div className="form-field-group">
                  <label>Primary Target Examination</label>
                  <select
                    value={targetExam}
                    onChange={(e) => setTargetExam(e.target.value)}
                  >
                    <option value="BPSC TRE 4.0">BPSC TRE 4.0 (Teaching Service)</option>
                    <option value="Bihar STET">Bihar STET (Paper 1 & Paper 2)</option>
                    <option value="CTET">Central Teacher Eligibility Test (CTET)</option>
                  </select>
                </div>

                <div className="form-field-group">
                  <label>Daily Study Goal (Minutes)</label>
                  <input
                    type="number"
                    value={dailyGoal}
                    onChange={(e) => setDailyGoal(e.target.value)}
                    min="15"
                    max="300"
                  />
                </div>

                <button type="submit" className="dashboard-primary">
                  Save Preferences
                </button>
              </form>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
