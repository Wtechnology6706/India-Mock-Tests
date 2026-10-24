"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import type { BlogPost, BlogCategory } from "@/lib/blog-store";

const CATEGORIES: { slug: string; label: string }[] = [
  { slug: "all", label: "🌟 All Topics" },
  { slug: "Preparation Strategy", label: "🎯 Preparation Strategy" },
  { slug: "Eligibility & Syllabus", label: "📖 Eligibility & Syllabus" },
  { slug: "Exam Guides", label: "📝 Exam Guides" },
  { slug: "Notification Updates", label: "📢 Notification Updates" },
];

export default function BlogCatalogClient({ initialBlogs }: { initialBlogs: BlogPost[] }) {
  const [blogs] = useState<BlogPost[]>(initialBlogs);
  const [selectedCat, setSelectedCat] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredBlogs = useMemo(() => {
    return blogs.filter((b) => {
      const matchCat = selectedCat === "all" || b.category === selectedCat;
      const matchSearch =
        !searchQuery.trim() ||
        b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCat && matchSearch;
    });
  }, [blogs, selectedCat, searchQuery]);

  const featuredBlog = useMemo(() => {
    return blogs.find((b) => b.isFeatured) || blogs[0];
  }, [blogs]);

  const regularBlogs = useMemo(() => {
    return filteredBlogs.filter((b) => b.id !== featuredBlog?.id);
  }, [filteredBlogs, featuredBlog]);

  return (
    <div className="blog-root-container">
      {/* Hero Section */}
      <section className="blog-hero">
        <div className="blog-hero-inner">
          <div className="blog-kicker">
            <span>📰</span>
            <span>EXPERT EXAM GUIDES &amp; SYLLABUS GAZETTE</span>
          </div>

          <h1 className="blog-hero-title">
            Crack Indian Competitive Exams with <span>Expert Strategy</span>
          </h1>

          <p className="blog-hero-desc">
            In-depth eligibility breakdowns, syllabus roadmaps, and classroom-tested scoring techniques for BPSC TRE 4.0, Bihar STET, CTET, and State Teacher recruitments written by senior education faculty.
          </p>

          {/* Search Box */}
          <div className="blog-search-wrap">
            <span className="blog-search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search exam strategies, eligibility, syllabus guides..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="blog-search-input"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="blog-filters-bar">
            {CATEGORIES.map((c) => (
              <button
                key={c.slug}
                type="button"
                onClick={() => setSelectedCat(c.slug)}
                className={`blog-filter-pill ${selectedCat === c.slug ? "active" : ""}`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="blog-content-section">
        {/* Featured Article Banner (Only on "All Topics" and without active search query) */}
        {selectedCat === "all" && !searchQuery.trim() && featuredBlog && (
          <Link href={`/blog/${featuredBlog.slug}`} className="blog-featured-card" style={{ textDecoration: "none", color: "inherit" }}>
            <div className="blog-featured-img-wrap">
              <img
                src={featuredBlog.featuredImage || "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1200&auto=format&fit=crop&q=80"}
                alt={featuredBlog.title}
                className="blog-featured-img"
              />
              <span className="blog-featured-badge">🌟 FEATURED ARTICLE</span>
            </div>

            <div className="blog-featured-body">
              <div className="blog-meta-row">
                <span className="blog-cat-badge">{featuredBlog.category}</span>
                <span>•</span>
                <span>⏱️ {featuredBlog.readingTime} min read</span>
                <span>•</span>
                <span>📅 {new Date(featuredBlog.publishedAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}</span>
              </div>

              <h2 className="blog-featured-title">{featuredBlog.title}</h2>
              <p className="blog-featured-desc">{featuredBlog.excerpt}</p>

              <div className="blog-author-row">
                <img
                  src={featuredBlog.authorAvatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"}
                  alt={featuredBlog.authorName}
                  className="blog-author-avatar"
                />
                <div>
                  <span className="blog-author-name">{featuredBlog.authorName}</span>
                  <span className="blog-author-role">{featuredBlog.authorRole}</span>
                </div>
              </div>
            </div>
          </Link>
        )}

        {/* Section Title */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <div>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>
              {selectedCat === "all" ? "All Educational Guides & Roadmaps" : `${selectedCat} Articles`}
            </h2>
            <span style={{ fontSize: "13px", color: "#64748b" }}>
              Showing {filteredBlogs.length} comprehensive articles
            </span>
          </div>
        </div>

        {/* Grid of Articles */}
        {filteredBlogs.length === 0 ? (
          <div style={{ background: "#ffffff", padding: "60px 20px", textAlign: "center", borderRadius: "14px", border: "1px dashed #cbd5e1" }}>
            <span style={{ fontSize: "3rem" }}>🔍</span>
            <h3 style={{ margin: "14px 0 6px", color: "#0f172a" }}>No Articles Matched</h3>
            <p style={{ color: "#64748b", margin: "0 0 16px" }}>
              Try searching with different keywords or switch back to All Topics.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedCat("all");
                setSearchQuery("");
              }}
              style={{
                padding: "8px 20px",
                borderRadius: "8px",
                background: "#059669",
                color: "#fff",
                border: "none",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="blog-grid">
            {(selectedCat === "all" && !searchQuery.trim() ? regularBlogs : filteredBlogs).map((blog) => (
              <Link key={blog.id} href={`/blog/${blog.slug}`} className="blog-card">
                <div className="blog-card-img-wrap">
                  <img
                    src={blog.featuredImage || "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&auto=format&fit=crop&q=80"}
                    alt={blog.title}
                    className="blog-card-img"
                    loading="lazy"
                  />
                  <div style={{ position: "absolute", top: "12px", left: "12px" }}>
                    <span className="blog-cat-badge">{blog.category}</span>
                  </div>
                </div>

                <div className="blog-card-body">
                  <div className="blog-meta-row" style={{ marginBottom: "8px", fontSize: "11.5px" }}>
                    <span>⏱️ {blog.readingTime} min read</span>
                    <span>•</span>
                    <span>👁️ {blog.views.toLocaleString()} views</span>
                    <span>•</span>
                    <span>{new Date(blog.publishedAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}</span>
                  </div>

                  <h3 className="blog-card-title">{blog.title}</h3>
                  <p className="blog-card-desc">{blog.excerpt}</p>

                  <div className="blog-author-row" style={{ marginTop: "auto", paddingTop: "12px", borderTop: "1px solid #f1f5f9" }}>
                    <img
                      src={blog.authorAvatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"}
                      alt={blog.authorName}
                      className="blog-author-avatar"
                      style={{ width: "32px", height: "32px" }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span className="blog-author-name" style={{ fontSize: "12.5px" }}>{blog.authorName}</span>
                      <span className="blog-author-role" style={{ fontSize: "10.5px" }}>{blog.authorRole}</span>
                    </div>
                    <span style={{ fontSize: "12px", fontWeight: 800, color: "#059669" }}>Read →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Telegram / Community Study Group Banner */}
        <div
          style={{
            marginTop: "64px",
            background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
            color: "#ffffff",
            borderRadius: "16px",
            padding: "40px 32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "24px",
            boxShadow: "0 12px 32px rgba(0,0,0,0.08)",
          }}
        >
          <div style={{ maxWidth: "620px" }}>
            <span style={{ fontSize: "11px", fontWeight: 800, color: "#34d399", background: "rgba(16,185,129,0.2)", padding: "3px 10px", borderRadius: "999px" }}>
              COMMUNITY OF 100,000+ ASPIRANTS
            </span>
            <h3 style={{ fontSize: "1.6rem", fontWeight: 800, margin: "10px 0 6px", color: "#ffffff" }}>
              Get Instant Exam Alerts, Syllabus PDFs &amp; Daily MCQs
            </h3>
            <p style={{ margin: 0, color: "#cbd5e1", fontSize: "0.95rem", lineHeight: 1.55 }}>
              Join our active educator and candidate network for real-time exam notifications, official BPSC answer key debates, and free daily mock questions.
            </p>
          </div>

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <Link
              href="/exams"
              style={{
                padding: "12px 24px",
                borderRadius: "8px",
                background: "#059669",
                color: "#ffffff",
                fontWeight: 800,
                fontSize: "14px",
                textDecoration: "none",
                boxShadow: "0 4px 14px rgba(5,150,105,0.3)",
              }}
            >
              Browse All Mock Tests →
            </Link>
            <Link
              href="/pyq"
              style={{
                padding: "12px 24px",
                borderRadius: "8px",
                background: "rgba(255,255,255,0.1)",
                color: "#ffffff",
                border: "1px solid rgba(255,255,255,0.2)",
                fontWeight: 800,
                fontSize: "14px",
                textDecoration: "none",
              }}
            >
              Download PYQ Papers 📄
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
