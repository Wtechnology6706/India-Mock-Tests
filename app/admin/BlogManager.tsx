"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import type { BlogPost, BlogCategory } from "@/lib/blog-store";
import { analyzeBlogSeo, SeoAnalysisResult } from "@/lib/blog-seo-checker";

const BLOG_CATEGORIES: BlogCategory[] = [
  "Preparation Strategy",
  "Eligibility & Syllabus",
  "Exam Guides",
  "Notification Updates",
  "Admit Card & Results",
  "Topper Interviews",
];

export default function BlogManager() {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingBlog, setEditingBlog] = useState<BlogPost | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [activeEditorTab, setActiveEditorTab] = useState<"edit" | "preview">("edit");
  const [saving, setSaving] = useState(false);
  const [toastMsg, setToastMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Form Fields
  const [formTitle, setFormTitle] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formSubtitle, setFormSubtitle] = useState("");
  const [formExcerpt, setFormExcerpt] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formCategory, setFormCategory] = useState<BlogCategory>("Preparation Strategy");
  const [formTags, setFormTags] = useState("");
  const [formFocusKeyword, setFormFocusKeyword] = useState("");
  const [formFeaturedImage, setFormFeaturedImage] = useState("");
  const [formVideoUrl, setFormVideoUrl] = useState("");
  const [formAuthorName, setFormAuthorName] = useState("Editorial Team");
  const [formAuthorRole, setFormAuthorRole] = useState("Senior Education Analyst");
  const [formAuthorAvatar, setFormAuthorAvatar] = useState("https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80");
  const [formIsFeatured, setFormIsFeatured] = useState(false);
  const [formStatus, setFormStatus] = useState<"Published" | "Draft">("Published");
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 4000);
  };

  const loadBlogs = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/blog");
      const data = await res.json();
      if (data?.success && Array.isArray(data.blogs)) {
        setBlogs(data.blogs);
      }
    } catch {
      showToast("Failed to load blog posts", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBlogs();
  }, []);

  // Auto-generate slug when title changes unless manually edited
  const handleTitleChange = (val: string) => {
    setFormTitle(val);
    if (!isSlugManuallyEdited) {
      const generated = val
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setFormSlug(generated);
    }
  };

  // Real-time SEO analysis
  const seoResult: SeoAnalysisResult = useMemo(() => {
    return analyzeBlogSeo({
      title: formTitle,
      slug: formSlug,
      excerpt: formExcerpt,
      content: formContent,
      focusKeyword: formFocusKeyword,
      featuredImage: formFeaturedImage,
      videoUrl: formVideoUrl,
    });
  }, [formTitle, formSlug, formExcerpt, formContent, formFocusKeyword, formFeaturedImage, formVideoUrl]);

  // Insert markdown/HTML snippet at cursor
  const insertSnippet = (snippet: string) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      setFormContent((prev) => prev + "\n" + snippet);
      return;
    }
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const current = textarea.value;
    const before = current.substring(0, start);
    const after = current.substring(end);
    const updated = before + snippet + after;
    setFormContent(updated);
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = textarea.selectionEnd = start + snippet.length;
    }, 10);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/admin/blog/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data?.success && data.fileUrl) {
        setFormFeaturedImage(data.fileUrl);
        showToast("Featured image uploaded successfully!");
      } else {
        showToast(data.error || "Image upload failed", "error");
      }
    } catch {
      showToast("Error uploading image", "error");
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const startCreate = () => {
    setEditingBlog(null);
    setFormTitle("");
    setFormSlug("");
    setFormSubtitle("");
    setFormExcerpt("");
    setFormContent("");
    setFormCategory("Preparation Strategy");
    setFormTags("BPSC TRE 4.0, Preparation Strategy, Mock Test, Syllabus");
    setFormFocusKeyword("");
    setFormFeaturedImage("");
    setFormVideoUrl("");
    setFormAuthorName("Editorial Team");
    setFormAuthorRole("Senior Education Analyst");
    setFormAuthorAvatar("https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80");
    setFormIsFeatured(false);
    setFormStatus("Published");
    setIsSlugManuallyEdited(false);
    setIsCreating(true);
    setActiveEditorTab("edit");
  };

  const startEdit = (blog: BlogPost) => {
    setEditingBlog(blog);
    setFormTitle(blog.title);
    setFormSlug(blog.slug);
    setFormSubtitle(blog.subtitle || "");
    setFormExcerpt(blog.excerpt);
    setFormContent(blog.content);
    setFormCategory(blog.category);
    setFormTags(blog.tags.join(", "));
    setFormFocusKeyword(blog.focusKeyword || "");
    setFormFeaturedImage(blog.featuredImage || "");
    setFormVideoUrl(blog.videoUrl || "");
    setFormAuthorName(blog.authorName);
    setFormAuthorRole(blog.authorRole);
    setFormAuthorAvatar(blog.authorAvatar);
    setFormIsFeatured(blog.isFeatured);
    setFormStatus(blog.status);
    setIsSlugManuallyEdited(true);
    setIsCreating(true);
    setActiveEditorTab("edit");
  };

  const handleSave = async () => {
    if (!formTitle.trim()) {
      showToast("Article title is required", "error");
      return;
    }
    if (!formExcerpt.trim()) {
      showToast("Meta description / excerpt is required", "error");
      return;
    }
    if (!formContent.trim()) {
      showToast("Article content cannot be empty", "error");
      return;
    }

    setSaving(true);
    const payload = {
      title: formTitle,
      slug: formSlug,
      subtitle: formSubtitle,
      excerpt: formExcerpt,
      content: formContent,
      category: formCategory,
      tags: formTags,
      focusKeyword: formFocusKeyword,
      featuredImage: formFeaturedImage,
      videoUrl: formVideoUrl,
      authorName: formAuthorName,
      authorRole: formAuthorRole,
      authorAvatar: formAuthorAvatar,
      isFeatured: formIsFeatured,
      status: formStatus,
    };

    try {
      const url = editingBlog ? `/api/admin/blog/${editingBlog.id}` : "/api/admin/blog";
      const method = editingBlog ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data?.success) {
        showToast(editingBlog ? "Article updated successfully!" : "Article published successfully!");
        setIsCreating(false);
        setEditingBlog(null);
        loadBlogs();
      } else {
        showToast(data.error || "Failed to save article", "error");
      }
    } catch {
      showToast("Network error saving article", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This cannot be undone.`)) return;

    try {
      const res = await fetch(`/api/admin/blog/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data?.success) {
        showToast("Article deleted successfully");
        setBlogs((prev) => prev.filter((b) => b.id !== id));
      } else {
        showToast(data.error || "Failed to delete article", "error");
      }
    } catch {
      showToast("Error deleting article", "error");
    }
  };

  const filteredBlogs = blogs.filter((b) => {
    const matchCat = filterCategory === "all" || b.category === filterCategory;
    const matchSearch =
      !searchQuery.trim() ||
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchCat && matchSearch;
  });

  return (
    <div style={{ padding: "28px", maxWidth: "1400px", margin: "0 auto" }}>
      {toastMsg && (
        <div
          style={{
            position: "fixed",
            top: "24px",
            right: "24px",
            padding: "12px 20px",
            borderRadius: "8px",
            background: toastMsg.type === "success" ? "#059669" : "#dc2626",
            color: "#ffffff",
            fontWeight: 700,
            fontSize: "14px",
            zIndex: 99999,
            boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
          }}
        >
          {toastMsg.text}
        </div>
      )}

      {/* VIEW: CREATE / EDIT ARTICLE STUDIO */}
      {isCreating ? (
        <div style={{ background: "#ffffff", borderRadius: "14px", border: "1px solid #e2e8f0", padding: "28px", boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
          {/* Header Row */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", paddingBottom: "16px", borderBottom: "1px solid #f1f5f9" }}>
            <div>
              <button
                type="button"
                onClick={() => {
                  if (confirm("Discard unsaved changes and return to article list?")) {
                    setIsCreating(false);
                    setEditingBlog(null);
                  }
                }}
                style={{
                  background: "none",
                  border: "none",
                  color: "#64748b",
                  fontSize: "13px",
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  marginBottom: "6px",
                }}
              >
                ← Back to Articles List
              </button>
              <h2 style={{ margin: 0, fontSize: "1.45rem", fontWeight: 800, color: "#0f172a" }}>
                {editingBlog ? "✏️ Edit Blog Article" : "✍️ Write High-Ranking Blog Article"}
              </h2>
            </div>

            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <select
                value={formStatus}
                onChange={(e) => setFormStatus(e.target.value as any)}
                style={{
                  padding: "8px 14px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontWeight: 700,
                  fontSize: "13px",
                  background: formStatus === "Published" ? "#ecfdf5" : "#f1f5f9",
                  color: formStatus === "Published" ? "#065f46" : "#475569",
                }}
              >
                <option value="Published">🟢 Published</option>
                <option value="Draft">🟡 Save as Draft</option>
              </select>

              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                style={{
                  padding: "10px 24px",
                  borderRadius: "8px",
                  background: "#059669",
                  color: "#ffffff",
                  fontWeight: 800,
                  fontSize: "13.5px",
                  border: "none",
                  cursor: saving ? "not-allowed" : "pointer",
                  boxShadow: "0 4px 12px rgba(5,150,105,0.25)",
                }}
              >
                {saving ? "Saving..." : editingBlog ? "Update Article" : "Publish Article"}
              </button>
            </div>
          </div>

          {/* 2-Column Grid: Form on Left (65%), Real-time Google SEO Score on Right (35%) */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "28px" }}>
            {/* Main Editing Column */}
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {/* Title & Slug */}
              <div>
                <label style={{ display: "block", fontSize: "12.5px", fontWeight: 700, color: "#334155", marginBottom: "6px" }}>
                  Article Headline / Title <span style={{ color: "#ef4444" }}>*</span>
                  <span style={{ float: "right", color: formTitle.length >= 35 && formTitle.length <= 70 ? "#059669" : "#64748b" }}>
                    {formTitle.length}/65 chars
                  </span>
                </label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="e.g. BPSC TRE 4.0 Preparation Strategy: 90-Day Roadmap for Primary & Secondary"
                  style={{ width: "100%", padding: "12px 14px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "15px", fontWeight: 700 }}
                />
              </div>

              {/* Slug & Subtitle */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "6px" }}>
                    URL Slug (Google Search Address)
                  </label>
                  <input
                    type="text"
                    value={formSlug}
                    onChange={(e) => {
                      setFormSlug(e.target.value);
                      setIsSlugManuallyEdited(true);
                    }}
                    placeholder="bpsc-tre-4-preparation-strategy"
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px", fontFamily: "monospace" }}
                  />
                  <span style={{ fontSize: "11px", color: "#64748b" }}>sarkaripractice.com/blog/{formSlug || "url-slug"}</span>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "6px" }}>
                    Category
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px", background: "#ffffff" }}
                  >
                    {BLOG_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Subtitle */}
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "6px" }}>
                  Subtitle / Deck Line (Optional)
                </label>
                <input
                  type="text"
                  value={formSubtitle}
                  onChange={(e) => setFormSubtitle(e.target.value)}
                  placeholder="A pragmatic, classroom-tested blueprint covering the 5-option puzzle, NCERT books, and syllabus..."
                  style={{ width: "100%", padding: "9px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px" }}
                />
              </div>

              {/* Focus Keyword & Meta Description (Crucial for Google Ranking) */}
              <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <label style={{ fontSize: "12.5px", fontWeight: 800, color: "#1e293b", margin: 0 }}>
                    🎯 Primary Focus Keyword (Target Search Query)
                  </label>
                  <span style={{ fontSize: "11px", color: "#64748b" }}>e.g. &quot;BPSC TRE 4.0 Preparation Strategy&quot;</span>
                </div>
                <input
                  type="text"
                  value={formFocusKeyword}
                  onChange={(e) => setFormFocusKeyword(e.target.value)}
                  placeholder="Enter the exact search term you want to rank #1 on Google for"
                  style={{ width: "100%", padding: "9px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px", marginBottom: "14px" }}
                />

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                  <label style={{ fontSize: "12.5px", fontWeight: 800, color: "#1e293b", margin: 0 }}>
                    📄 Meta Description / Search Snippet
                  </label>
                  <span style={{ fontSize: "11px", color: formExcerpt.length >= 110 && formExcerpt.length <= 165 ? "#059669" : "#b45309", fontWeight: 700 }}>
                    {formExcerpt.length}/160 chars (Ideal: 120-160)
                  </span>
                </div>
                <textarea
                  rows={2}
                  value={formExcerpt}
                  onChange={(e) => setFormExcerpt(e.target.value)}
                  placeholder="Write a compelling 120-160 character description that will appear on Google search results and entice aspirants to click..."
                  style={{ width: "100%", padding: "9px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px", resize: "vertical" }}
                />
              </div>

              {/* Media Studio: Featured Image & Video Embed */}
              <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                <span style={{ display: "block", fontSize: "12.5px", fontWeight: 800, color: "#1e293b", marginBottom: "12px" }}>
                  🖼️ Media Studio (Featured Cover & Video Embed)
                </span>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  {/* Featured Image */}
                  <div>
                    <label style={{ display: "block", fontSize: "11.5px", fontWeight: 700, color: "#475569", marginBottom: "6px" }}>
                      Featured Cover Image URL or Upload
                    </label>
                    <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
                      <input
                        type="text"
                        value={formFeaturedImage}
                        onChange={(e) => setFormFeaturedImage(e.target.value)}
                        placeholder="https://... or /uploads/blog/..."
                        style={{ flex: 1, padding: "8px 10px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "12px" }}
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingImage}
                        style={{
                          padding: "8px 12px",
                          borderRadius: "6px",
                          background: "#3b82f6",
                          color: "#fff",
                          border: "none",
                          fontSize: "12px",
                          fontWeight: 700,
                          cursor: "pointer",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {uploadingImage ? "Uploading..." : "📁 Upload"}
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        style={{ display: "none" }}
                      />
                    </div>
                    {formFeaturedImage && (
                      <div style={{ position: "relative", height: "90px", borderRadius: "6px", overflow: "hidden", border: "1px solid #cbd5e1" }}>
                        <img src={formFeaturedImage} alt="Cover Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        <button
                          type="button"
                          onClick={() => setFormFeaturedImage("")}
                          style={{
                            position: "absolute",
                            top: "4px",
                            right: "4px",
                            background: "rgba(0,0,0,0.6)",
                            color: "#fff",
                            border: "none",
                            borderRadius: "50%",
                            width: "20px",
                            height: "20px",
                            cursor: "pointer",
                            fontSize: "10px",
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Video URL */}
                  <div>
                    <label style={{ display: "block", fontSize: "11.5px", fontWeight: 700, color: "#475569", marginBottom: "6px" }}>
                      YouTube Video Embed or MP4 Link (Optional)
                    </label>
                    <input
                      type="text"
                      value={formVideoUrl}
                      onChange={(e) => setFormVideoUrl(e.target.value)}
                      placeholder="https://www.youtube.com/watch?v=..."
                      style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "12px", marginBottom: "8px" }}
                    />
                    {formVideoUrl && (
                      <span style={{ fontSize: "11px", color: "#059669" }}>✓ Video embedded in top media preview</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Rich Content Editor Toolbar */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <div style={{ display: "flex", gap: "6px" }}>
                    <button
                      type="button"
                      onClick={() => setActiveEditorTab("edit")}
                      style={{
                        padding: "6px 14px",
                        borderRadius: "6px",
                        fontSize: "12.5px",
                        fontWeight: 700,
                        border: "1px solid #cbd5e1",
                        background: activeEditorTab === "edit" ? "#1e293b" : "#ffffff",
                        color: activeEditorTab === "edit" ? "#ffffff" : "#475569",
                        cursor: "pointer",
                      }}
                    >
                      ✍️ Editor
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveEditorTab("preview")}
                      style={{
                        padding: "6px 14px",
                        borderRadius: "6px",
                        fontSize: "12.5px",
                        fontWeight: 700,
                        border: "1px solid #cbd5e1",
                        background: activeEditorTab === "preview" ? "#1e293b" : "#ffffff",
                        color: activeEditorTab === "preview" ? "#ffffff" : "#475569",
                        cursor: "pointer",
                      }}
                    >
                      👁️ Live Reader Preview
                    </button>
                  </div>

                  <span style={{ fontSize: "12px", color: "#64748b" }}>
                    Words: <strong>{seoResult.wordCount}</strong> · Est. Read: <strong>{seoResult.readingTimeMinutes} min</strong>
                  </span>
                </div>

                {/* Toolbar */}
                {activeEditorTab === "edit" && (
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "6px",
                      padding: "8px",
                      background: "#f1f5f9",
                      borderRadius: "8px 8px 0 0",
                      border: "1px solid #cbd5e1",
                      borderBottom: "none",
                    }}
                  >
                    {[
                      { label: "H2", action: () => insertSnippet("\n<h2>Section Subheading</h2>\n<p>Your paragraph text here...</p>\n") },
                      { label: "H3", action: () => insertSnippet("\n<h3>Detailed Sub-Topic</h3>\n") },
                      { label: "Bold", action: () => insertSnippet("<strong>key term</strong>") },
                      { label: "Italic", action: () => insertSnippet("<em>emphasis</em>") },
                      { label: "• Bullets", action: () => insertSnippet("\n<ul>\n  <li>Key point 1</li>\n  <li>Key point 2</li>\n</ul>\n") },
                      { label: "1. Numbers", action: () => insertSnippet("\n<ol>\n  <li>Step 1</li>\n  <li>Step 2</li>\n</ol>\n") },
                      { label: "💡 Tip Box", action: () => insertSnippet('\n<div class="blog-callout-box tip">\n  <strong>💡 Pro Tip:</strong> Add actionable advice here.\n</div>\n') },
                      { label: "⚠️ Alert Box", action: () => insertSnippet('\n<div class="blog-callout-box warning">\n  <strong>⚠️ Important Note:</strong> Key eligibility or cutoff caution.\n</div>\n') },
                      {
                        label: "📊 Table",
                        action: () =>
                          insertSnippet(
                            '\n<div class="blog-table-wrapper">\n  <table class="blog-styled-table">\n    <thead>\n      <tr><th>Exam Cadre</th><th>Qualifying Marks</th><th>Eligibility</th></tr>\n    </thead>\n    <tbody>\n      <tr><td>General</td><td>75/150</td><td>B.Ed Mandatory</td></tr>\n      <tr><td>Reserved</td><td>60/150</td><td>45% Relaxation</td></tr>\n    </tbody>\n  </table>\n</div>\n'
                          ),
                      },
                      { label: "🖼️ Image", action: () => insertSnippet('<img src="/uploads/blog/sample.jpg" alt="Explanatory chart" style="max-width:100%; border-radius:8px; margin:20px 0;" />\n') },
                      { label: "🔗 Link", action: () => insertSnippet('<a href="/exams/bpsc-tre-4">Practice Free Mock Test</a>') },
                    ].map((tool, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={tool.action}
                        style={{
                          padding: "4px 8px",
                          borderRadius: "4px",
                          border: "1px solid #cbd5e1",
                          background: "#ffffff",
                          color: "#1e293b",
                          fontSize: "11.5px",
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        {tool.label}
                      </button>
                    ))}
                  </div>
                )}

                {activeEditorTab === "edit" ? (
                  <textarea
                    ref={textareaRef}
                    rows={20}
                    value={formContent}
                    onChange={(e) => setFormContent(e.target.value)}
                    placeholder="Write your in-depth article in HTML/Markdown. Use H2, H3, styled tables, tip boxes, and lists..."
                    style={{
                      width: "100%",
                      padding: "14px",
                      borderRadius: "0 0 8px 8px",
                      border: "1px solid #cbd5e1",
                      fontSize: "14px",
                      fontFamily: "Consolas, Monaco, monospace",
                      lineHeight: "1.6",
                      resize: "vertical",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      padding: "24px",
                      borderRadius: "8px",
                      border: "1px solid #cbd5e1",
                      background: "#ffffff",
                      minHeight: "400px",
                    }}
                  >
                    <div
                      className="blog-prose"
                      dangerouslySetInnerHTML={{ __html: formContent || "<p>Nothing to preview yet. Start typing...</p>" }}
                    />
                  </div>
                )}
              </div>

              {/* Tags, Author & Featured */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", background: "#f8fafc", padding: "16px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "6px" }}>
                    Tags (Comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formTags}
                    onChange={(e) => setFormTags(e.target.value)}
                    placeholder="BPSC TRE 4.0, Preparation Strategy, Bihar STET"
                    style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "12.5px" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "6px" }}>
                    Author Name &amp; Title
                  </label>
                  <input
                    type="text"
                    value={formAuthorName}
                    onChange={(e) => setFormAuthorName(e.target.value)}
                    placeholder="Er. Amitesh Ranjan"
                    style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "12.5px" }}
                  />
                </div>

                <div style={{ gridColumn: "1 / -1", display: "flex", alignItems: "center", gap: "10px" }}>
                  <input
                    type="checkbox"
                    id="featToggle"
                    checked={formIsFeatured}
                    onChange={(e) => setFormIsFeatured(e.target.checked)}
                    style={{ width: "16px", height: "16px", cursor: "pointer" }}
                  />
                  <label htmlFor="featToggle" style={{ fontSize: "13px", fontWeight: 700, color: "#1e293b", cursor: "pointer" }}>
                    🌟 Feature this article on the blog homepage hero spotlight
                  </label>
                </div>
              </div>
            </div>

            {/* Right Column: REAL-TIME GOOGLE SEO RANKING SCORECARD */}
            <div style={{ position: "sticky", top: "20px", height: "fit-content" }}>
              <div
                style={{
                  background: "#f8fafc",
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                  padding: "20px",
                  boxShadow: "0 2px 10px rgba(0,0,0,0.02)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                  <h3 style={{ margin: 0, fontSize: "14px", fontWeight: 800, color: "#0f172a" }}>
                    ⚡ Google SEO Quality Checker
                  </h3>
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 800,
                      padding: "2px 8px",
                      borderRadius: "4px",
                      background: seoResult.overallScore >= 80 ? "#ecfdf5" : "#fffbeb",
                      color: seoResult.gradeColor,
                    }}
                  >
                    {seoResult.grade}
                  </span>
                </div>

                {/* Big Score Gauge */}
                <div style={{ textAlign: "center", padding: "16px 0", borderBottom: "1px solid #e2e8f0", marginBottom: "16px" }}>
                  <div style={{ fontSize: "3rem", fontWeight: 900, color: seoResult.gradeColor, lineHeight: 1 }}>
                    {seoResult.overallScore}%
                  </div>
                  <span style={{ fontSize: "12px", color: "#64748b", fontWeight: 700 }}>
                    Google Ranking Readiness
                  </span>

                  <div style={{ background: "#e2e8f0", height: "8px", borderRadius: "999px", overflow: "hidden", marginTop: "12px" }}>
                    <div
                      style={{
                        background: seoResult.gradeColor,
                        width: `${seoResult.overallScore}%`,
                        height: "100%",
                        transition: "width 0.3s ease",
                      }}
                    />
                  </div>
                </div>

                {/* Live Stats */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "16px" }}>
                  <div style={{ background: "#ffffff", padding: "10px", borderRadius: "8px", border: "1px solid #e2e8f0", textAlign: "center" }}>
                    <span style={{ display: "block", fontSize: "11px", color: "#64748b" }}>Word Count</span>
                    <strong style={{ fontSize: "16px", color: seoResult.wordCount >= 800 ? "#059669" : "#b45309" }}>
                      {seoResult.wordCount}
                    </strong>
                  </div>
                  <div style={{ background: "#ffffff", padding: "10px", borderRadius: "8px", border: "1px solid #e2e8f0", textAlign: "center" }}>
                    <span style={{ display: "block", fontSize: "11px", color: "#64748b" }}>Keyword Density</span>
                    <strong style={{ fontSize: "16px", color: seoResult.keywordDensityPercent > 0 ? "#059669" : "#64748b" }}>
                      {seoResult.keywordDensityPercent}%
                    </strong>
                  </div>
                </div>

                {/* Granular Checklist */}
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "420px", overflowY: "auto" }}>
                  {seoResult.checks.map((chk) => (
                    <div
                      key={chk.id}
                      style={{
                        background: chk.passed ? "#f0fdf4" : "#ffffff",
                        border: chk.passed ? "1px solid #bbf7d0" : "1px solid #e2e8f0",
                        padding: "10px 12px",
                        borderRadius: "8px",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                        <span style={{ fontSize: "14px", color: chk.passed ? "#16a34a" : "#dc2626" }}>
                          {chk.passed ? "✓" : "✗"}
                        </span>
                        <strong style={{ fontSize: "12px", color: chk.passed ? "#15803d" : "#1e293b", flex: 1 }}>
                          {chk.label}
                        </strong>
                        <span style={{ fontSize: "11px", color: chk.passed ? "#16a34a" : "#64748b", fontWeight: 700 }}>
                          +{chk.score}/{chk.maxScore}
                        </span>
                      </div>
                      <p style={{ margin: 0, fontSize: "11px", color: "#64748b", lineHeight: 1.4 }}>
                        {chk.recommendation}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* VIEW: ARTICLES DIRECTORY & CATALOG */
        <div>
          {/* Top Control Bar */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "16px" }}>
            <div>
              <span style={{ fontSize: "11.5px", fontWeight: 800, color: "#2563eb", background: "#eff6ff", padding: "3px 10px", borderRadius: "999px", letterSpacing: "0.5px" }}>
                CONTENT MARKETING &amp; SEO ENGINE
              </span>
              <h1 style={{ margin: "6px 0 2px", fontSize: "1.7rem", fontWeight: 800, color: "#0f172a" }}>
                Blog &amp; Knowledge Articles
              </h1>
              <p style={{ margin: 0, fontSize: "0.9rem", color: "#64748b" }}>
                Manage authoritative exam preparation guides, eligibility analysis, and organic search traffic articles.
              </p>
            </div>

            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <a
                href="/blog"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: "9px 16px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  background: "#ffffff",
                  color: "#334155",
                  fontWeight: 700,
                  fontSize: "13px",
                  textDecoration: "none",
                }}
              >
                🌐 View Public Blog ↗
              </a>

              <button
                type="button"
                onClick={startCreate}
                style={{
                  padding: "10px 20px",
                  borderRadius: "8px",
                  background: "#059669",
                  color: "#ffffff",
                  fontWeight: 800,
                  fontSize: "13.5px",
                  border: "none",
                  cursor: "pointer",
                  boxShadow: "0 4px 12px rgba(5,150,105,0.25)",
                }}
              >
                + Write New Article
              </button>
            </div>
          </div>

          {/* Filters & Search */}
          <div style={{ display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap", alignItems: "center" }}>
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              {["all", ...BLOG_CATEGORIES].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setFilterCategory(cat)}
                  style={{
                    padding: "6px 14px",
                    borderRadius: "20px",
                    fontSize: "12px",
                    fontWeight: 700,
                    border: filterCategory === cat ? "2px solid #059669" : "1px solid #cbd5e1",
                    background: filterCategory === cat ? "#ecfdf5" : "#ffffff",
                    color: filterCategory === cat ? "#065f46" : "#475569",
                    cursor: "pointer",
                  }}
                >
                  {cat === "all" ? "All Categories" : cat}
                </button>
              ))}
            </div>

            <input
              type="text"
              placeholder="Search articles by title or tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                marginLeft: "auto",
                padding: "8px 14px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                fontSize: "13px",
                minWidth: "260px",
              }}
            />
          </div>

          {/* Articles Table */}
          {loading ? (
            <div style={{ padding: "60px", textAlign: "center", color: "#64748b" }}>
              ⏳ Loading articles catalog...
            </div>
          ) : filteredBlogs.length === 0 ? (
            <div style={{ background: "#ffffff", padding: "60px 20px", textAlign: "center", borderRadius: "12px", border: "1px dashed #cbd5e1" }}>
              <span style={{ fontSize: "2.5rem" }}>📰</span>
              <h3 style={{ margin: "12px 0 6px", color: "#1e293b" }}>No Articles Found</h3>
              <p style={{ color: "#64748b", margin: "0 0 16px", fontSize: "0.9rem" }}>
                Write your first educational article or adjust your search filter.
              </p>
              <button
                type="button"
                onClick={startCreate}
                style={{
                  padding: "9px 20px",
                  borderRadius: "8px",
                  background: "#059669",
                  color: "#ffffff",
                  fontWeight: 700,
                  fontSize: "13px",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                + Write New Article
              </button>
            </div>
          ) : (
            <div style={{ background: "#ffffff", borderRadius: "12px", border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13.5px" }}>
                <thead>
                  <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", color: "#475569" }}>
                    <th style={{ padding: "14px 18px", fontWeight: 800 }}>Article</th>
                    <th style={{ padding: "14px 18px", fontWeight: 800 }}>Category</th>
                    <th style={{ padding: "14px 18px", fontWeight: 800 }}>Status</th>
                    <th style={{ padding: "14px 18px", fontWeight: 800 }}>Views</th>
                    <th style={{ padding: "14px 18px", fontWeight: 800 }}>Published</th>
                    <th style={{ padding: "14px 18px", fontWeight: 800, textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBlogs.map((b) => (
                    <tr key={b.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "14px 18px", maxWidth: "420px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          {b.featuredImage ? (
                            <img
                              src={b.featuredImage}
                              alt=""
                              style={{ width: "52px", height: "42px", borderRadius: "6px", objectFit: "cover", flexShrink: 0 }}
                            />
                          ) : (
                            <div style={{ width: "52px", height: "42px", borderRadius: "6px", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", flexShrink: 0 }}>
                              📰
                            </div>
                          )}
                          <div>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              <strong style={{ color: "#0f172a", fontSize: "14px", lineHeight: 1.3 }}>
                                {b.title}
                              </strong>
                              {b.isFeatured && (
                                <span style={{ fontSize: "10px", background: "#fef3c7", color: "#92400e", padding: "1px 6px", borderRadius: "4px", fontWeight: 800 }}>
                                  FEATURED
                                </span>
                              )}
                            </div>
                            <span style={{ fontSize: "11.5px", color: "#64748b", display: "block", marginTop: "2px" }}>
                              /{b.slug} · {b.readingTime} min read · By {b.authorName}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "14px 18px" }}>
                        <span style={{ fontSize: "11.5px", fontWeight: 700, background: "#f1f5f9", color: "#334155", padding: "3px 8px", borderRadius: "4px" }}>
                          {b.category}
                        </span>
                      </td>
                      <td style={{ padding: "14px 18px" }}>
                        <span
                          style={{
                            fontSize: "11.5px",
                            fontWeight: 800,
                            padding: "3px 8px",
                            borderRadius: "4px",
                            background: b.status === "Published" ? "#ecfdf5" : "#fef3c7",
                            color: b.status === "Published" ? "#065f46" : "#92400e",
                          }}
                        >
                          {b.status}
                        </span>
                      </td>
                      <td style={{ padding: "14px 18px", fontWeight: 700, color: "#334155" }}>
                        👁️ {b.views.toLocaleString()}
                      </td>
                      <td style={{ padding: "14px 18px", color: "#64748b", fontSize: "12.5px" }}>
                        {new Date(b.publishedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </td>
                      <td style={{ padding: "14px 18px", textAlign: "right" }}>
                        <div style={{ display: "inline-flex", gap: "8px" }}>
                          <a
                            href={`/blog/${b.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              padding: "5px 10px",
                              borderRadius: "6px",
                              border: "1px solid #cbd5e1",
                              background: "#ffffff",
                              color: "#334155",
                              fontSize: "12px",
                              fontWeight: 700,
                              textDecoration: "none",
                            }}
                          >
                            View Live ↗
                          </a>
                          <button
                            type="button"
                            onClick={() => startEdit(b)}
                            style={{
                              padding: "5px 12px",
                              borderRadius: "6px",
                              border: "1px solid #059669",
                              background: "#ecfdf5",
                              color: "#065f46",
                              fontSize: "12px",
                              fontWeight: 700,
                              cursor: "pointer",
                            }}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(b.id, b.title)}
                            style={{
                              padding: "5px 10px",
                              borderRadius: "6px",
                              border: "1px solid #fca5a5",
                              background: "#fef2f2",
                              color: "#dc2626",
                              fontSize: "12px",
                              fontWeight: 700,
                              cursor: "pointer",
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
