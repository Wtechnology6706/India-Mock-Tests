"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { BlogPost } from "@/lib/blog-store";

function extractYouTubeId(url?: string): string | null {
  if (!url) return null;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  return match ? match[1] : null;
}

export default function BlogPostClient({
  blog,
  relatedBlogs = [],
}: {
  blog: BlogPost;
  relatedBlogs: BlogPost[];
}) {
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setShareUrl(window.location.href);
    }
  }, []);

  const handleCopyLink = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl || window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const youtubeId = extractYouTubeId(blog.videoUrl);

  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${blog.title}\n\nRead full guide here:\n${shareUrl}`)}`;
  const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(blog.title)}`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(blog.title)}&url=${encodeURIComponent(shareUrl)}`;

  return (
    <div style={{ background: "#ffffff", minHeight: "100vh" }}>
      {/* Header Banner */}
      <header className="blog-article-header">
        <div className="blog-article-header-inner">
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", marginBottom: "12px" }}>
            <Link
              href="/blog"
              style={{
                color: "#94a3b8",
                textDecoration: "none",
                fontSize: "12.5px",
                fontWeight: 700,
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              ← All Articles
            </Link>
            <span style={{ color: "#475569" }}>/</span>
            <span className="blog-cat-badge">{blog.category}</span>
          </div>

          <h1 className="blog-article-h1">{blog.title}</h1>

          {blog.subtitle && <p className="blog-article-subtitle">{blog.subtitle}</p>}

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
            {/* Author Card */}
            <div className="blog-author-row" style={{ margin: 0 }}>
              <img
                src={blog.authorAvatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"}
                alt={blog.authorName}
                className="blog-author-avatar"
                style={{ width: "46px", height: "46px" }}
              />
              <div>
                <span className="blog-author-name" style={{ color: "#ffffff", fontSize: "14.5px" }}>
                  {blog.authorName}
                </span>
                <span className="blog-author-role" style={{ color: "#94a3b8" }}>
                  {blog.authorRole} · {new Date(blog.publishedAt).toLocaleDateString("en-IN", { month: "long", day: "numeric", year: "numeric" })}
                </span>
              </div>
            </div>

            {/* Reading stats */}
            <div style={{ display: "flex", gap: "16px", color: "#cbd5e1", fontSize: "12.5px", fontWeight: 700 }}>
              <span>⏱️ {blog.readingTime} min read</span>
              <span>👁️ {blog.views.toLocaleString()} views</span>
            </div>
          </div>

          {/* Social Share Bar */}
          <div className="blog-share-bar">
            <span style={{ fontSize: "12.5px", color: "#94a3b8", fontWeight: 700 }}>Share this guide:</span>
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="blog-share-btn whatsapp">
              <span>💬 WhatsApp</span>
            </a>
            <a href={telegramUrl} target="_blank" rel="noopener noreferrer" className="blog-share-btn telegram">
              <span>✈️ Telegram</span>
            </a>
            <a href={twitterUrl} target="_blank" rel="noopener noreferrer" className="blog-share-btn">
              <span>𝕏 Twitter</span>
            </a>
            <button type="button" onClick={handleCopyLink} className="blog-share-btn">
              <span>{copied ? "✓ Copied!" : "🔗 Copy Link"}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <article className="blog-article-container">
        {/* Featured Video Embed (if provided) */}
        {youtubeId ? (
          <div className="blog-video-container">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${youtubeId}?rel=0`}
              title={blog.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : (
          blog.featuredImage && (
            <div style={{ borderRadius: "14px", overflow: "hidden", marginBottom: "40px", border: "1px solid #e2e8f0", boxShadow: "0 8px 30px rgba(0,0,0,0.06)" }}>
              <img
                src={blog.featuredImage}
                alt={blog.title}
                style={{ width: "100%", maxHeight: "480px", objectFit: "cover", display: "block" }}
              />
            </div>
          )
        )}

        {/* Prose Body */}
        <div
          className="blog-prose"
          dangerouslySetInnerHTML={{ __html: blog.content }}
        />

        {/* In-Article Action CTA */}
        <div className="blog-article-cta">
          <span style={{ fontSize: "11px", fontWeight: 800, background: "rgba(255,255,255,0.2)", padding: "3px 10px", borderRadius: "999px", letterSpacing: "0.5px" }}>
            EXAM PREPARATION WORKSPACE
          </span>
          <h3>Put This Strategy Into Practice Today</h3>
          <p>
            Solve authentic full-length CBT tests with real rank analytics, negative marking, and bilingual explanations for BPSC TRE, Bihar STET, and CTET.
          </p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/exams" className="blog-cta-btn">
              Start Free Mock Test ↗
            </Link>
            <Link
              href="/pyq"
              className="blog-cta-btn"
              style={{ background: "transparent", color: "#ffffff", border: "2px solid #ffffff" }}
            >
              Download Previous Year Papers 📄
            </Link>
          </div>
        </div>

        {/* Tags */}
        {blog.tags && blog.tags.length > 0 && (
          <div style={{ margin: "32px 0 24px", display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "13px", fontWeight: 700, color: "#64748b" }}>Tagged in:</span>
            {blog.tags.map((tag) => (
              <span
                key={tag}
                style={{
                  background: "#f1f5f9",
                  color: "#334155",
                  fontSize: "12px",
                  fontWeight: 700,
                  padding: "4px 10px",
                  borderRadius: "6px",
                  border: "1px solid #e2e8f0",
                }}
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Author Bio Box */}
        <div
          style={{
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            borderRadius: "14px",
            padding: "24px",
            display: "flex",
            alignItems: "center",
            gap: "20px",
            marginTop: "40px",
          }}
        >
          <img
            src={blog.authorAvatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"}
            alt={blog.authorName}
            style={{ width: "64px", height: "64px", borderRadius: "50%", objectFit: "cover", border: "2px solid #cbd5e1", flexShrink: 0 }}
          />
          <div>
            <span style={{ fontSize: "11px", fontWeight: 800, color: "#059669", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Written by
            </span>
            <h4 style={{ margin: "2px 0 4px", fontSize: "1.1rem", fontWeight: 800, color: "#0f172a" }}>
              {blog.authorName}
            </h4>
            <p style={{ margin: 0, fontSize: "13px", color: "#64748b", lineHeight: 1.5 }}>
              {blog.authorRole} at Sarkari Practice. Specializes in teacher recruitment examinations, curriculum analysis, and high-yield question pattern modeling.
            </p>
          </div>
        </div>

        {/* Related Articles */}
        {relatedBlogs && relatedBlogs.length > 0 && (
          <div style={{ marginTop: "60px", paddingTop: "40px", borderTop: "2px solid #f1f5f9" }}>
            <h3 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#0f172a", marginBottom: "20px" }}>
              Recommended Reading for Serious Aspirants
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "20px" }}>
              {relatedBlogs.map((rel) => (
                <Link
                  key={rel.id}
                  href={`/blog/${rel.slug}`}
                  style={{
                    textDecoration: "none",
                    color: "inherit",
                    background: "#ffffff",
                    borderRadius: "10px",
                    border: "1px solid #e2e8f0",
                    padding: "16px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.02)",
                  }}
                >
                  <span style={{ fontSize: "11px", fontWeight: 800, color: "#059669" }}>
                    {rel.category}
                  </span>
                  <strong style={{ fontSize: "14px", color: "#0f172a", lineHeight: 1.35 }}>
                    {rel.title}
                  </strong>
                  <span style={{ fontSize: "12px", color: "#64748b", marginTop: "auto" }}>
                    ⏱️ {rel.readingTime} min read →
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>
    </div>
  );
}
