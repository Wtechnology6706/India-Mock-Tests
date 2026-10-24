"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import MegaMenu from "../components/MegaMenu";
import Footer from "../components/Footer";
import { featuredExams } from "../../lib/catalog";
import { syllabusTracks } from "../../lib/syllabus";
import { defaultExamGroups, type ExamGroup } from "../../lib/exam-group-types";

export default function ExamsDirectoryPage() {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [examGroups, setExamGroups] = useState<ExamGroup[]>(defaultExamGroups);

  useEffect(() => {
    fetch("/api/exam-groups")
      .then((res) => res.json())
      .then((data) => {
        if (data?.success && Array.isArray(data.groups) && data.groups.length > 0) {
          setExamGroups(data.groups);
        }
      })
      .catch(() => {});

    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const q = params.get("q") || params.get("search");
      const cat = params.get("category") || params.get("cat");
      if (q) setSearchQuery(q);
      if (cat && ["all", "teaching", "state", "central"].includes(cat)) {
        setActiveCategory(cat);
      }
    }
  }, []);

  const categories = [
    { id: "all", label: "🌟 All Examinations" },
    { id: "teaching", label: "📚 Teaching & TET" },
    { id: "state", label: "🏛️ Bihar & State PSC" },
    { id: "central", label: "🇮🇳 Central Board (CTET)" },
  ];

  const examsData = [
    {
      slug: "bpsc-tre-4",
      title: "BPSC TRE 4.0",
      authority: "Bihar Public Service Commission (BPSC)",
      category: "teaching",
      meta: "Teacher Recruitment Examination 2026",
      badge: "🔥 Trending",
      totalTests: "128 Full & Subject Mocks",
      freeTests: "1 Full Mock + 2 Subject Tests",
      questionsCount: "150 Questions",
      duration: "150 Minutes",
      marking: "+1 / -0.25 (5 Options)",
      language: "Bilingual (Hindi & English)",
      levels: ["Primary (1-5)", "Middle (6-8)", "Secondary TGT (9-10)", "Higher Secondary PGT (11-12)"],
      tone: "saffron",
      freeSlug: "bpsc-tre-4-general-studies",
    },
    {
      slug: "bihar-stet",
      title: "Bihar STET 2026",
      authority: "Bihar School Examination Board (BSEB)",
      category: "teaching",
      meta: "State Teacher Eligibility Test",
      badge: "⚡ Popular",
      totalTests: "86 Mocks & PYQ Papers",
      freeTests: "1 Full Mock Free",
      questionsCount: "150 Questions",
      duration: "150 Minutes",
      marking: "+1 (No Negative Marking)",
      language: "Hindi & English",
      levels: ["Paper I (Secondary)", "Paper II (Higher Secondary)"],
      tone: "blue",
      freeSlug: "bihar-stet-paper-1",
    },
    {
      slug: "ctet",
      title: "CTET July 2026",
      authority: "Central Board of Secondary Education (CBSE)",
      category: "central",
      meta: "Central Teacher Eligibility Test",
      badge: "✨ New Edition",
      totalTests: "214 Mocks & Chapter Tests",
      freeTests: "Paper I Mock Free",
      questionsCount: "150 Questions",
      duration: "150 Minutes",
      marking: "+1 (No Negative Marking)",
      language: "Bilingual (Hindi & English)",
      levels: ["Paper I (Classes 1-5)", "Paper II (Classes 6-8)"],
      tone: "mint",
      freeSlug: "ctet-paper-1",
    },
  ];

  const filteredExams = examsData.filter((exam) => {
    const matchesCat = activeCategory === "all" || exam.category === activeCategory || (activeCategory === "state" && (exam.slug.includes("bpsc") || exam.slug.includes("bihar")));
    const matchesSearch = !searchQuery.trim() || exam.title.toLowerCase().includes(searchQuery.toLowerCase()) || exam.meta.toLowerCase().includes(searchQuery.toLowerCase()) || exam.authority.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <main className="directory-page-standard">
      <MegaMenu />

      {/* Hero Header Section */}
      <section className="directory-header-banner">
        <div className="directory-banner-container">
          <div className="directory-badge-kicker">
            <span className="live-dot" /> NATIONWIDE TEST SERIES & PRACTICE HUB
          </div>
          <h1>
            India&apos;s Focused Examination Series
            <br />
            <em>Curated for Maximum Selection Score.</em>
          </h1>
          <p>
            Experience actual exam-day simulation with time-tested question banks, official syllabus mapping, and comprehensive performance analytics.
          </p>

          {/* Search Box */}
          <div className="directory-search-wrapper">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search exam name, syllabus or board (e.g. BPSC TRE, STET, CTET)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="directory-search-field"
            />
            {searchQuery && (
              <button
                type="button"
                className="clear-search-btn"
                onClick={() => setSearchQuery("")}
              >
                ✕
              </button>
            )}
          </div>

          {/* Key Stats Strip */}
          <div className="directory-stats-row">
            <div className="stat-pill">
              <strong>50,000+</strong>
              <span>Curated MCQs</span>
            </div>
            <div className="stat-pill">
              <strong>100%</strong>
              <span>Syllabus Aligned</span>
            </div>
            <div className="stat-pill">
              <strong>Instant</strong>
              <span>Rank & Analytics</span>
            </div>
            <div className="stat-pill">
              <strong>Real CBT</strong>
              <span>Exam Simulation</span>
            </div>
          </div>
        </div>
      </section>

      {/* Category Tabs */}
      <section className="directory-content-wrapper">
        <div className="directory-category-tabs">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={`category-pill-btn ${activeCategory === cat.id ? "active" : ""}`}
              onClick={() => setActiveCategory(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Section Heading */}
        <div className="directory-listing-heading">
          <div>
            <h2>Available Test Series ({filteredExams.length})</h2>
            <p>Select your target examination to view full mock test schedule, pattern & free demos</p>
          </div>
          <Link href="/pricing" className="vip-pass-link">
            👑 Get All-Access VIP Pass →
          </Link>
        </div>

        {/* Exams Grid */}
        <div className="standard-exams-grid">
          {filteredExams.map((exam) => (
            <article key={exam.slug} className={`standard-exam-card ${exam.tone}`}>
              {/* Card Top */}
              <div className="exam-card-header">
                <div className="exam-authority-tag">
                  <span className="authority-name">{exam.authority}</span>
                  <span className="exam-badge-pill">{exam.badge}</span>
                </div>
                <h3 className="exam-card-title">{exam.title}</h3>
                <p className="exam-meta-text">{exam.meta}</p>
              </div>

              {/* Key Specs Table */}
              <div className="exam-specs-grid">
                <div className="spec-item">
                  <small>TOTAL TESTS</small>
                  <strong>{exam.totalTests}</strong>
                </div>
                <div className="spec-item">
                  <small>QUESTION FORMAT</small>
                  <strong>{exam.questionsCount} ({exam.duration})</strong>
                </div>
                <div className="spec-item">
                  <small>MARKING RULES</small>
                  <strong>{exam.marking}</strong>
                </div>
                <div className="spec-item">
                  <small>LANGUAGE</small>
                  <strong>{exam.language}</strong>
                </div>
              </div>

              {/* Levels / Class Tracks */}
              <div className="exam-levels-wrap">
                <span className="levels-title">Available Tracks & Levels:</span>
                <div className="levels-badges">
                  {exam.levels.map((lvl) => (
                    <span key={lvl} className="level-chip">
                      {lvl}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="exam-card-actions">
                <Link
                  href={`/exams/${exam.slug}`}
                  className="btn-view-series"
                >
                  Explore All Tests & Details →
                </Link>
                <Link
                  href={`/attempt/${exam.freeSlug}`}
                  className="btn-start-free-mock"
                >
                  ⚡ Free Mock Demo
                </Link>
              </div>
            </article>
          ))}
        </div>

        {/* Featured Clubbed Exam Series & Subject Bundles */}
        <div className="directory-listing-heading" style={{ marginTop: "50px" }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "#f5f3ff", color: "#6d28d9", padding: "4px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: 700, marginBottom: "8px" }}>
              <span>🔗</span> BUNDLED TEST SERIES PACKAGES
            </div>
            <h2>Clubbed Exam Series &amp; Subject Combos ({examGroups.filter((g) => g.active).length})</h2>
            <p>Admin-curated test series bundling core domain subjects with qualifying Language, General Studies &amp; GK papers.</p>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "20px", margin: "20px 0 50px" }}>
          {examGroups
            .filter((g) => g.active)
            .map((group) => (
              <div
                key={group.id}
                style={{
                  background: "#fff",
                  borderRadius: "16px",
                  border: "1px solid #e2e8f0",
                  padding: "22px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
                  transition: "transform 0.15s ease, box-shadow 0.15s ease",
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px", marginBottom: "10px" }}>
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: 700,
                        padding: "3px 8px",
                        borderRadius: "6px",
                        background: group.type === "group" ? "#ecfdf5" : "#f5f3ff",
                        color: group.type === "group" ? "#047857" : "#6d28d9",
                        border: `1px solid ${group.type === "group" ? "#a7f3d0" : "#ddd6fe"}`,
                      }}
                    >
                      {group.type === "group" ? "🏢 FULL EXAM BUNDLE" : "🎯 INDIVIDUAL SERIES"}
                    </span>
                    {group.badge && (
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: 700,
                          padding: "3px 8px",
                          borderRadius: "6px",
                          background: "#fffbeb",
                          color: "#b45309",
                          border: "1px solid #fde68a",
                        }}
                      >
                        {group.badge}
                      </span>
                    )}
                  </div>

                  <h3 style={{ margin: "0 0 6px", fontSize: "17px", fontWeight: 800, color: "#0f172a" }}>
                    {group.title}
                  </h3>
                  <span style={{ fontSize: "12px", color: "#64748b", display: "block", marginBottom: "12px" }}>
                    Exam: <strong>{group.examName}</strong>
                  </span>

                  <p style={{ margin: "0 0 14px", fontSize: "13px", color: "#475569", lineHeight: "1.5" }}>
                    {group.description}
                  </p>

                  {/* Clubbed subjects pills */}
                  <div style={{ background: "#f8fafc", borderRadius: "10px", padding: "12px", border: "1px solid #f1f5f9", marginBottom: "16px" }}>
                    <span style={{ fontSize: "11px", fontWeight: 700, color: "#475569", display: "block", marginBottom: "6px" }}>
                      🔗 Clubbed Subjects Included:
                    </span>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                      {group.clubbedSubjects.slice(0, 5).map((sub, i) => (
                        <span
                          key={i}
                          style={{
                            fontSize: "11px",
                            padding: "2px 7px",
                            borderRadius: "4px",
                            background: "#fff",
                            border: "1px solid #e2e8f0",
                            color: "#334155",
                            fontWeight: 600,
                          }}
                        >
                          ✓ {sub}
                        </span>
                      ))}
                      {group.clubbedSubjects.length > 5 && (
                        <span style={{ fontSize: "11px", padding: "2px 6px", color: "#6d28d9", fontWeight: 700 }}>
                          +{group.clubbedSubjects.length - 5} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "14px", borderTop: "1px solid #f1f5f9" }}>
                  <div>
                    <span style={{ fontSize: "20px", fontWeight: 800, color: "#0f172a" }}>₹{group.price}</span>
                    <span style={{ display: "block", fontSize: "11px", color: "#64748b" }}>/ {group.validityDays} Days Pass</span>
                  </div>
                  <Link
                    href={`/checkout?plan=sprint&option=${group.type}&group=${group.slug}&amount=${group.price}`}
                    style={{
                      background: group.type === "group" ? "#0f766e" : "#7c3aed",
                      color: "#fff",
                      padding: "8px 16px",
                      borderRadius: "8px",
                      fontSize: "13px",
                      fontWeight: 700,
                      textDecoration: "none",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    Unlock Series →
                  </Link>
                </div>
              </div>
            ))}
        </div>

        {/* Learning Tracks & Class Levels Grid */}
        <div className="tracks-directory-section">
          <div className="tracks-header">
            <h3>Class-Wise &amp; Paper-Wise Direct Syllabus Tracks</h3>
            <p>Directly jump to your target teaching grade or paper level:</p>
          </div>

          <div className="standard-track-cards-grid">
            {featuredExams
              .filter((exam) => syllabusTracks[exam.slug])
              .flatMap((exam) =>
                syllabusTracks[exam.slug].map((track) => (
                  <Link
                    key={`${exam.slug}-${track.slug}`}
                    href={`/exams/${exam.slug}#${track.slug}`}
                    className="standard-track-card"
                  >
                    <div className="track-card-top">
                      <span className="track-parent-tag">{exam.title}</span>
                      <span className="track-audience-tag">{track.audience}</span>
                    </div>
                    <h4>{track.name}</h4>
                    <p>
                      Includes {track.subjects.length} subject papers with complete chapter-wise practice tests.
                    </p>
                    <span className="track-link-arrow">Start Practice →</span>
                  </Link>
                ))
              )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </main>
  );
}
