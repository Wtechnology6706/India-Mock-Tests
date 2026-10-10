"use client";

import { useState, useRef, useMemo, useEffect } from "react";
import Link from "next/link";
import type { ExamTrack, SubjectGroup } from "../../../lib/syllabus";
import type { MockTest, SubjectDemandRequest } from "../../../lib/admin-content";
import type { AuthUser } from "../../../lib/auth-store";

interface ExamTrackExplorerProps {
  tracks: ExamTrack[];
  initialTests: MockTest[];
  initialRequests: SubjectDemandRequest[];
  currentUser?: AuthUser | null;
  examSlug: string;
  examTitle: string;
  examTone: string;
  examMeta?: string;
}

// Subject Icon Resolver
function getSubjectIcon(subjectName: string): string {
  const s = subjectName.toLowerCase();
  if (s.includes("language") || s.includes("hindi") || s.includes("english") || s.includes("urdu")) return "📖";
  if (s.includes("math")) return "📐";
  if (s.includes("science") || s.includes("physics") || s.includes("chemistry") || s.includes("biology")) return "🔬";
  if (s.includes("social") || s.includes("history") || s.includes("geography") || s.includes("civics")) return "🌍";
  if (s.includes("general") || s.includes("gk") || s.includes("current")) return "🏛️";
  if (s.includes("computer") || s.includes("code") || s.includes("it")) return "💻";
  if (s.includes("commerce") || s.includes("accounting") || s.includes("agriculture")) return "📈";
  if (s.includes("pedagogy") || s.includes("teaching") || s.includes("cdp") || s.includes("art")) return "🎓";
  return "📚";
}

// Track Icon Resolver
function getTrackIcon(trackSlug: string, index: number): string {
  if (trackSlug.includes("1-5") || trackSlug.includes("primary")) return "🎒";
  if (trackSlug.includes("6-8") || trackSlug.includes("middle")) return "📐";
  if (trackSlug.includes("9-10") || trackSlug.includes("paper-1") || trackSlug.includes("secondary")) return "🔬";
  if (trackSlug.includes("11-12") || trackSlug.includes("paper-2") || trackSlug.includes("higher")) return "🎓";
  const icons = ["🎒", "📐", "🔬", "🎓", "📚"];
  return icons[index % icons.length];
}

export default function ExamTrackExplorer({
  tracks,
  initialTests,
  initialRequests,
  currentUser,
  examSlug,
  examTitle,
  examTone,
  examMeta,
}: ExamTrackExplorerProps) {
  // Check subscription access for individual test series
  function checkTestAccess(test: MockTest) {
    if (test.access === "Free") {
      return { hasAccess: true, isFree: true };
    }
    if (!currentUser) {
      return { hasAccess: false, isFree: false };
    }
    if (currentUser.role === "admin" || currentUser.role === "editor") {
      return { hasAccess: true, isFree: false };
    }
    const isSubActive = currentUser.subscriptionStatus === "active" || (currentUser.subscriptionExpiresAt && new Date(currentUser.subscriptionExpiresAt).getTime() > Date.now());
    if (!isSubActive) {
      return { hasAccess: false, isFree: false };
    }
    if (currentUser.subscriptionTier === "ultimate") {
      return { hasAccess: true, isFree: false };
    }
    if (currentUser.subscriptionTier === "sprint") {
      const userSlug = (currentUser.targetExamSlug || "").toLowerCase().replace(/[^a-z0-9]/g, "");
      const currentExamSlug = (examSlug || "").toLowerCase().replace(/[^a-z0-9]/g, "");
      const userExamName = (currentUser.targetExamName || "").toLowerCase();
      const currentExamTitle = (examTitle || "").toLowerCase();

      const matchesSlug = (userSlug && currentExamSlug) && (userSlug.includes(currentExamSlug) || currentExamSlug.includes(userSlug));
      const matchesName = (userExamName && currentExamTitle) && (userExamName.includes(currentExamTitle) || currentExamTitle.includes(userExamName));

      if (matchesSlug || matchesName) {
        return { hasAccess: true, isFree: false };
      }
    }
    return { hasAccess: false, isFree: false };
  }

  // Practice tests catalog state
  const [catalogFilter, setCatalogFilter] = useState<"all" | "free" | "vip">("all");
  const [testSearchQuery, setTestSearchQuery] = useState("");

  // Syllabus section visibility: collapsed by default as requested!
  const [showSyllabusInline, setShowSyllabusInline] = useState(false);
  const [showSyllabusModal, setShowSyllabusModal] = useState(false);

  // Track & subject selection within syllabus explorer
  const [activeTrackSlug, setActiveTrackSlug] = useState<string>(tracks[0]?.slug ?? "");
  const [activeSubjectName, setActiveSubjectName] = useState<string>(
    tracks[0]?.subjects[0]?.name ?? ""
  );
  const [subjectSearchQuery, setSubjectSearchQuery] = useState("");

  // Ref for smooth scroll to syllabus when toggled
  const syllabusSectionRef = useRef<HTMLDivElement | null>(null);

  // Demands state
  const [requestCounts, setRequestCounts] = useState<Record<string, number>>(() => {
    const map: Record<string, number> = {};
    for (const r of initialRequests) {
      map[`${r.trackSlug}:${r.subjectName.toLowerCase()}`] = r.requestCount;
    }
    return map;
  });

  const [hasRequestedSet, setHasRequestedSet] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Close modal on ESC
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && showSyllabusModal) {
        setShowSyllabusModal(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showSyllabusModal]);

  // Active track object
  const activeTrack = useMemo(() => {
    return tracks.find((t) => t.slug === activeTrackSlug) || tracks[0];
  }, [tracks, activeTrackSlug]);

  // Active subject object
  const activeSubject = useMemo(() => {
    return (
      activeTrack?.subjects.find(
        (s) => s.name.toLowerCase() === activeSubjectName.toLowerCase()
      ) || activeTrack?.subjects[0]
    );
  }, [activeTrack, activeSubjectName]);

  // Helper to find tests for a track & subject
  function getTestsFor(trackSlug: string, subjectName: string) {
    return initialTests.filter(
      (t) =>
        t.trackSlug === trackSlug &&
        t.subjectName.toLowerCase() === subjectName.toLowerCase() &&
        t.status === "Published"
    );
  }

  // Active tests for currently selected subject
  const activeTests = activeTrack && activeSubject
    ? getTestsFor(activeTrack.slug, activeSubject.name)
    : [];

  // Demand count for currently selected subject
  const requestKey = `${activeTrackSlug}:${activeSubjectName.toLowerCase()}`;
  const currentDemandCount = requestCounts[requestKey] || 0;
  const alreadyRequested = hasRequestedSet.has(requestKey);

  // Handle raising a request
  async function handleRaiseRequest() {
    if (alreadyRequested || isSubmitting) return;
    setIsSubmitting(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          examSlug,
          trackSlug: activeTrackSlug,
          subjectName: activeSubjectName,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setRequestCounts((prev) => ({
          ...prev,
          [requestKey]: data.requestCount ?? (prev[requestKey] || 0) + 1,
        }));
        setHasRequestedSet((prev) => new Set([...prev, requestKey]));
        setFeedback(
          `Request registered! Your vote for ${activeSubjectName} has been prioritized in the admin queue.`
        );
      }
    } catch {
      setFeedback("Unable to submit request right now. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleSelectTrack(track: ExamTrack) {
    setActiveTrackSlug(track.slug);
    if (track.subjects.length > 0) {
      setActiveSubjectName(track.subjects[0].name);
    }
    setFeedback(null);
  }

  function handleSelectSubject(subjectName: string) {
    setActiveSubjectName(subjectName);
    setFeedback(null);
  }

  function toggleSyllabusInline() {
    setShowSyllabusInline((prev) => {
      const next = !prev;
      if (next) {
        setTimeout(() => {
          syllabusSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100);
      }
      return next;
    });
  }

  // Filtered published tests for top catalog
  const filteredPublishedTests = useMemo(() => {
    let list = initialTests.filter((t) => t.status === "Published");
    if (catalogFilter === "free") list = list.filter((t) => t.access === "Free");
    if (catalogFilter === "vip") list = list.filter((t) => t.access === "Premium");
    if (testSearchQuery.trim()) {
      const q = testSearchQuery.toLowerCase();
      list = list.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.subjectName.toLowerCase().includes(q) ||
          t.trackSlug.toLowerCase().includes(q) ||
          (t.description && t.description.toLowerCase().includes(q))
      );
    }
    return list;
  }, [initialTests, catalogFilter, testSearchQuery]);

  // Filtered subjects inside active track
  const filteredSubjects = useMemo(() => {
    if (!activeTrack) return [];
    if (!subjectSearchQuery.trim()) return activeTrack.subjects;
    const q = subjectSearchQuery.toLowerCase();
    return activeTrack.subjects.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.topics.some((t) => t.toLowerCase().includes(q))
    );
  }, [activeTrack, subjectSearchQuery]);

  // Render Syllabus Explorer Core (Shared between inline & pop-up modal)
  const renderSyllabusExplorerCore = () => (
    <div className="syllabus-core-wrapper">
      {/* 1. Track Selector Navigation (Horizontal Segmented Cards) */}
      <div className="track-tabs-container">
        <div className="track-tabs-header">
          <span className="track-tabs-kicker">STEP 1: SELECT YOUR TARGET LEVEL</span>
          <span className="track-tabs-count">{tracks.length} Tracks Configured</span>
        </div>

        <div className="track-cards-segmented-row" role="tablist" aria-label="Class Levels">
          {tracks.map((track, idx) => {
            const isSelected = track.slug === activeTrackSlug;
            const trackTestsCount = initialTests.filter(
              (t) => t.trackSlug === track.slug && t.status === "Published"
            ).length;

            return (
              <button
                key={track.slug}
                type="button"
                role="tab"
                aria-selected={isSelected}
                className={`track-segment-card ${isSelected ? "selected" : ""}`}
                onClick={() => handleSelectTrack(track)}
              >
                <div className="track-segment-top">
                  <span className="track-segment-icon">{getTrackIcon(track.slug, idx)}</span>
                  <span className="track-segment-badge">
                    {trackTestsCount > 0 ? (
                      <span className="badge-live-tests">● {trackTestsCount} Live</span>
                    ) : (
                      <span className="badge-subject-count">{track.subjects.length} Subjects</span>
                    )}
                  </span>
                </div>

                <h3 className="track-segment-title">{track.name}</h3>
                <p className="track-segment-sub">{track.audience}</p>

                {isSelected && <div className="track-segment-active-bar" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Active Track Workspace Box */}
      {activeTrack && (
        <div className="track-workspace-card">
          {/* Workspace Header */}
          <div className="workspace-header-row">
            <div className="workspace-title-block">
              <span className="workspace-kicker">{activeTrack.audience.toUpperCase()}</span>
              <h3 className="workspace-title">
                {activeTrack.name} <em>Subject Directory</em>
              </h3>
              <p className="workspace-desc">
                Choose a subject group below to inspect verified syllabus topics, attempt published mock tests, or vote for high-priority publishing.
              </p>
            </div>

            {/* Quick search input */}
            <div className="workspace-search-wrap">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                className="workspace-search-input"
                placeholder="Filter subjects or topics..."
                value={subjectSearchQuery}
                onChange={(e) => setSubjectSearchQuery(e.target.value)}
              />
              {subjectSearchQuery && (
                <button
                  type="button"
                  className="search-clear-btn"
                  onClick={() => setSubjectSearchQuery("")}
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Subject Cards Grid */}
          <div className="subjects-interactive-grid">
            {filteredSubjects.map((subject) => {
              const isSelected = subject.name.toLowerCase() === activeSubjectName.toLowerCase();
              const subTests = getTestsFor(activeTrack.slug, subject.name);
              const hasTests = subTests.length > 0;
              const key = `${activeTrack.slug}:${subject.name.toLowerCase()}`;
              const votes = requestCounts[key] || 0;
              const icon = getSubjectIcon(subject.name);

              return (
                <button
                  key={subject.name}
                  type="button"
                  className={`modern-subject-card ${isSelected ? "active" : ""} ${hasTests ? "has-live-tests" : ""}`}
                  onClick={() => handleSelectSubject(subject.name)}
                >
                  <div className="subject-card-header">
                    <div className="subject-icon-box">{icon}</div>
                    <div className="subject-status-pill">
                      {hasTests ? (
                        <span className="pill-live">● {subTests.length} Mock Test{subTests.length > 1 ? "s" : ""}</span>
                      ) : votes > 0 ? (
                        <span className="pill-demand">🔥 {votes} Requests</span>
                      ) : (
                        <span className="pill-curation">⚡ In Drafting</span>
                      )}
                    </div>
                  </div>

                  <h4 className="subject-card-name">{subject.name}</h4>
                  <p className="subject-card-desc">{subject.description}</p>

                  <div className="subject-topics-preview">
                    {subject.topics.slice(0, 3).map((topic, i) => (
                      <span key={i} className="topic-tag-chip">
                        {topic}
                      </span>
                    ))}
                    {subject.topics.length > 3 && (
                      <span className="topic-tag-more">+{subject.topics.length - 3} more</span>
                    )}
                  </div>

                  {isSelected && (
                    <div className="subject-selected-check">
                      <span>✓ Selected</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* 3. Subject Focus & Test Center Spotlight */}
          {activeSubject && (
            <div className="subject-studio-spotlight">
              <div className="studio-topbar">
                <div className="studio-meta">
                  <span className="studio-icon">{getSubjectIcon(activeSubject.name)}</span>
                  <div>
                    <span className="studio-kicker">
                      {activeTrack.name} · {activeTrack.audience}
                    </span>
                    <h4 className="studio-title">
                      {activeSubject.name} <em>Practice Tests & Syllabus</em>
                    </h4>
                  </div>
                </div>

                <div className="studio-status-wrap">
                  {activeTests.length > 0 ? (
                    <span className="studio-badge ready">
                      ✓ {activeTests.length} Ready to Attempt
                    </span>
                  ) : (
                    <span className="studio-badge curation">
                      ⏳ Content Curation Studio
                    </span>
                  )}
                </div>
              </div>

              {/* CASE A: Mock Tests are Ready! */}
              {activeTests.length > 0 ? (
                <div className="studio-tests-container">
                  <div className="studio-tests-grid">
                    {activeTests.map((test) => {
                      const accessInfo = checkTestAccess(test);
                      return (
                        <article className="studio-test-card" key={test.slug}>
                          {test.bannerImageUrl ? (
                            <div className="test-card-custom-banner-wrap" style={{ margin: "-20px -20px 14px -20px" }}>
                              <img src={test.bannerImageUrl} alt={test.name} className="test-card-custom-banner-img" />
                              <div className="test-card-custom-banner-overlay">
                                <span className="test-type-pill-overlay">{test.testType.toUpperCase()}</span>
                                <span
                                  className={test.access === "Free" ? "test-free-tag-overlay" : "test-vip-tag-overlay"}
                                  title={test.access === "Free" ? "Free Mock Test" : "VIP Pass"}
                                >
                                  {test.access === "Free" ? "Free" : "👑"}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div className="test-card-type-row">
                              <span className="test-type-pill">{test.testType.toUpperCase()}</span>
                              <span
                                className={test.access === "Free" ? "test-free-tag" : "test-vip-tag"}
                                title={test.access === "Free" ? "Free Mock Test" : "VIP Pass"}
                              >
                                {test.access === "Free" ? "Free" : "👑"}
                              </span>
                            </div>
                          )}

                          <h5 className="test-card-heading">{test.name}</h5>
                          {test.description && <p className="test-card-info">{test.description}</p>}

                          <div className="test-card-stats-row">
                            <span>⏱️ {test.durationMinutes} Mins</span>
                            <span>📝 {test.questionCount} Questions</span>
                            <span>🎯 {test.totalMarks} Marks</span>
                          </div>

                          <div className="test-card-actions-row">
                            <Link className="btn-test-instructions" href={`/tests/${test.slug}`}>
                              Instructions →
                            </Link>
                            {accessInfo.hasAccess ? (
                              <Link
                                className={`btn-test-start-direct ${!accessInfo.isFree ? "btn-test-unlocked" : ""}`}
                                href={`/attempt/${test.slug}`}
                              >
                                {!accessInfo.isFree ? "🔓 Start Practice →" : "Start Test ⚡"}
                              </Link>
                            ) : (
                              <Link
                                className="btn-test-start-direct btn-test-locked"
                                href={`/checkout?plan=sprint&exam=${examSlug}`}
                              >
                                🔒 Unlock Test
                              </Link>
                            )}
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </div>
              ) : (
                /* CASE B: In Curation - High End Demand & Syllabus Inspector */
                <div className="studio-curation-layout">
                  <div className="curation-content-col">
                    <div className="curation-kicker-row">
                      <span className="curation-pulse-dot" />
                      <span className="curation-kicker-text">MOCK TEST IN ACTIVE PRODUCTION</span>
                    </div>

                    <h5 className="curation-heading">
                      Verified CBT Mock Tests for {activeSubject.name} are coming very soon.
                    </h5>
                    <p className="curation-summary">
                      Our editorial subject experts are currently authoring and reviewing high-yield question banks with detailed bilingual solutions strictly matching the <strong>{examTitle}</strong> pattern for <strong>{activeSubject.name}</strong>.
                    </p>

                    {/* Official Syllabus Topics Checklist */}
                    <div className="curation-syllabus-box">
                      <div className="syllabus-box-title">
                        <span>📚 Official Topics Included in this Subject Paper:</span>
                      </div>
                      <div className="syllabus-topics-grid">
                        {activeSubject.topics.map((topic, i) => (
                          <div key={i} className="syllabus-topic-item">
                            <span className="topic-check">✓</span>
                            <span>{topic}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Upvote & Demand Action Card */}
                  <div className="curation-demand-card">
                    <div className="demand-card-header">
                      <span className="demand-card-fire">🔥</span>
                      <div>
                        <h6>Learner Priority Meter</h6>
                        <small>Help us decide which test series to publish next</small>
                      </div>
                    </div>

                    <div className="demand-counter-display">
                      <span className="demand-big-number">{currentDemandCount}</span>
                      <span className="demand-label">
                        {currentDemandCount === 1 ? "Learner requested" : "Learners requested this subject"}
                      </span>
                    </div>

                    {feedback && (
                      <div className="demand-success-banner">
                        <span>✓</span> {feedback}
                      </div>
                    )}

                    <div className="demand-action-wrap">
                      {alreadyRequested ? (
                        <div className="demand-registered-pill">
                          <span>✓</span> Request Registered! (#{currentDemandCount} in Queue)
                        </div>
                      ) : (
                        <button
                          type="button"
                          className="btn-submit-demand"
                          disabled={isSubmitting}
                          onClick={handleRaiseRequest}
                        >
                          {isSubmitting ? "Submitting Request..." : "🙋‍♂️ Upvote / Request This Mock Test"}
                        </button>
                      )}
                    </div>

                    <p className="demand-footnote">
                      💡 Admin editorial team reviews request velocity daily to release the most demanded mock test papers first.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="modern-track-explorer">
      {/* =========================================================================
          1. PRIMARY VIEW: ALL AVAILABLE PRACTICE TESTS (Shown directly after top details)
          ========================================================================= */}
      <div className="available-practice-tests-section" id="all-tests">
        <div className="practice-tests-header-row">
          <div>
            <span className="section-kicker">OFFICIAL PRACTICE CATALOG</span>
            <h2 className="practice-section-title">
              All Available Practice Tests <em>ready for your attempt</em>
            </h2>
            <p className="practice-section-subtext">
              Curated full-length and topic-wise CBT mock tests mapped directly to the latest exam syllabus.
            </p>
          </div>

          <div className="practice-header-controls">
            {/* Filter pills */}
            <div className="catalog-filter-tabs">
              <button
                type="button"
                className={`catalog-filter-btn ${catalogFilter === "all" ? "active" : ""}`}
                onClick={() => setCatalogFilter("all")}
              >
                All ({initialTests.filter((t) => t.status === "Published").length})
              </button>
              <button
                type="button"
                className={`catalog-filter-btn ${catalogFilter === "free" ? "active" : ""}`}
                onClick={() => setCatalogFilter("free")}
              >
                Free Mocks ({initialTests.filter((t) => t.status === "Published" && t.access === "Free").length})
              </button>
              <button
                type="button"
                className={`catalog-filter-btn ${catalogFilter === "vip" ? "active" : ""}`}
                onClick={() => setCatalogFilter("vip")}
              >
                VIP Pass ({initialTests.filter((t) => t.status === "Published" && t.access === "Premium").length})
              </button>
            </div>

            {/* Quick search input */}
            <div className="test-catalog-search-wrap">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                className="test-catalog-search-input"
                placeholder="Search mock tests..."
                value={testSearchQuery}
                onChange={(e) => setTestSearchQuery(e.target.value)}
              />
              {testSearchQuery && (
                <button
                  type="button"
                  className="search-clear-btn"
                  onClick={() => setTestSearchQuery("")}
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Practice Test Cards Grid */}
        {filteredPublishedTests.length === 0 ? (
          <div className="catalog-empty-notice">
            <span className="empty-icon">📂</span>
            <h4>No published tests match this filter</h4>
            <p>
              Try clearing your search query or explore the subject tracks below to request tests for upcoming subjects.
            </p>
          </div>
        ) : (
          <div className="catalog-tests-grid">
            {filteredPublishedTests.map((test) => {
              const accessInfo = checkTestAccess(test);
              return (
                <article className="catalog-test-card" key={test.slug}>
                  {test.bannerImageUrl ? (
                    <div className="test-card-custom-banner-wrap">
                      <img src={test.bannerImageUrl} alt={test.name} className="test-card-custom-banner-img" />
                      <div className="test-card-custom-banner-overlay">
                        <span className="catalog-subject-tag-overlay">{test.subjectName}</span>
                        <span
                          className={test.access === "Free" ? "test-free-tag-overlay" : "test-vip-tag-overlay"}
                          title={test.access === "Free" ? "Free Mock Test" : "VIP Pass"}
                        >
                          {test.access === "Free" ? "Free" : "👑"}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="catalog-card-top default-css-banner">
                      <span className="catalog-subject-tag">{test.subjectName}</span>
                      <span
                        className={test.access === "Free" ? "test-free-tag" : "test-vip-tag"}
                        title={test.access === "Free" ? "Free Mock Test" : "VIP Pass"}
                      >
                        {test.access === "Free" ? "Free" : "👑"}
                      </span>
                    </div>
                  )}

                  <div className="catalog-card-body-content">
                    <h4 className="catalog-test-title">{test.name}</h4>
                    <p className="catalog-test-track">
                      Track: <strong>{test.trackSlug.replace(/-/g, " ").toUpperCase()}</strong>
                    </p>

                    {test.description && (
                      <p className="catalog-test-desc">{test.description}</p>
                    )}

                    <div className="catalog-metrics-row">
                      <span>⏱️ {test.durationMinutes} min</span>
                      <span>📝 {test.questionCount} Qs</span>
                      <span>🎯 {test.totalMarks} Marks</span>
                    </div>

                    <div className="catalog-btn-row">
                      <Link className="btn-catalog-secondary" href={`/tests/${test.slug}`}>
                        Instructions
                      </Link>
                      {accessInfo.hasAccess ? (
                        <Link
                          className={`btn-catalog-primary ${!accessInfo.isFree ? "btn-catalog-unlocked" : ""}`}
                          href={`/attempt/${test.slug}`}
                        >
                          {!accessInfo.isFree ? "🔓 Start Practice →" : "Start Test ⚡"}
                        </Link>
                      ) : (
                        <Link
                          className="btn-catalog-primary btn-catalog-locked"
                          href={`/checkout?plan=sprint&exam=${examSlug}`}
                        >
                          🔒 Unlock Test
                        </Link>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* =========================================================================
          2. CALL TO ACTION: EXPLORE SYLLABUS & LEARNING TRACKS BUTTONS
          ========================================================================= */}
      <div className="syllabus-toggle-banner" id="syllabus-section" ref={syllabusSectionRef}>
        <div className="syllabus-toggle-content">
          <div className="syllabus-toggle-icon">📚</div>
          <div>
            <span className="syllabus-toggle-kicker">LOOKING FOR SUBJECT-WISE TOPICS OR SPECIFIC CLASSES?</span>
            <h3 className="syllabus-toggle-title">Explore Official Syllabus, Class Tracks & Learning Series</h3>
            <p className="syllabus-toggle-desc">
              Inspect topic-by-topic curriculum breakdowns for {tracks.length} teaching levels ({tracks.map((t) => t.name).join(", ")}), request upcoming subject mock tests, or view curation status.
            </p>
          </div>
        </div>

        <div className="syllabus-toggle-actions">
          <button
            type="button"
            className={`btn-explore-syllabus-toggle ${showSyllabusInline ? "active" : ""}`}
            onClick={toggleSyllabusInline}
          >
            <span>{showSyllabusInline ? "▲ Hide Syllabus & Tracks" : "📖 Explore Syllabus & Series (Inline)"}</span>
          </button>

          <button
            type="button"
            className="btn-open-syllabus-modal"
            onClick={() => setShowSyllabusModal(true)}
          >
            <span>🔍 View in Pop-up Modal</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          3. EXPANDABLE INLINE SYLLABUS & TRACKS EXPLORER (Revealed when clicked)
          ========================================================================= */}
      {showSyllabusInline && (
        <div className="inline-syllabus-container animate-fade-in">
          <div className="inline-syllabus-header">
            <div>
              <span className="section-kicker">INTERACTIVE CURRICULUM EXPLORER</span>
              <h3 className="inline-syllabus-title">Syllabus Breakdown & Subject Groups</h3>
            </div>
            <button
              type="button"
              className="btn-close-inline-syllabus"
              onClick={() => setShowSyllabusInline(false)}
            >
              ✕ Collapse View
            </button>
          </div>

          {renderSyllabusExplorerCore()}
        </div>
      )}

      {/* =========================================================================
          4. FULLSCREEN POP-UP MODAL (If user prefers viewing in a popup)
          ========================================================================= */}
      {showSyllabusModal && (
        <div
          className="syllabus-modal-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowSyllabusModal(false);
          }}
        >
          <div className="syllabus-modal-window" role="dialog" aria-modal="true">
            <div className="syllabus-modal-header">
              <div>
                <span className="modal-kicker">OFFICIAL SYLLABUS & TRACK EXPLORER</span>
                <h3 className="modal-title">
                  {examTitle} <em>Complete Curriculum</em>
                </h3>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setShowSyllabusModal(false)}
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            <div className="syllabus-modal-body">
              {renderSyllabusExplorerCore()}
            </div>

            <div className="syllabus-modal-footer">
              <p>Select any subject group to inspect topic lists or upvote for high-priority test release.</p>
              <button
                type="button"
                className="btn-modal-done"
                onClick={() => setShowSyllabusModal(false)}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
