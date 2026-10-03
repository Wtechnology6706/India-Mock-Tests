"use client";

import { useState } from "react";
import Link from "next/link";
import MegaMenu from "../components/MegaMenu";
import { featuredExams } from "../../lib/catalog";
import { syllabusTracks } from "../../lib/syllabus";

export default function ExamsDirectoryPage() {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

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

        {/* Learning Tracks & Class Levels Grid */}
        <div className="tracks-directory-section">
          <div className="tracks-header">
            <h3>Class-Wise & Paper-Wise Direct Syllabus Tracks</h3>
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
      <footer className="footer">
        <Link className="logo" href="/">
          <span className="logo-mark">I</span>
          <span>India Mock Tests<span className="logo-dot">.</span></span>
        </Link>
        <p>Find your exam. Find your focus. Find your way forward.</p>
        <div className="footer-links">
          <Link href="/exams">Exams</Link>
          <Link href="/pricing">Plans & VIP</Link>
          <Link href="/about">About</Link>
          <Link href="/contact">Support</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/privacy">Privacy</Link>
        </div>
        <small>© 2026 India Mock Tests · India</small>
      </footer>
    </main>
  );
}
