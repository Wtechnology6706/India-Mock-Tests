"use client";

import { useState, useEffect } from "react";

type Taxonomy = {
  exams: { id: string; name: string; slug: string }[];
  subjects: { id: string; examId: string; examName: string; name: string }[];
  topics: { id: string; subjectId: string; subjectName: string; name: string }[];
};

type ExamMetadata = {
  slug: string;
  title: string;
  badge?: string;
  tone?: string;
  symbol?: string;
  imageUrl?: string;
};

export default function ExamTaxonomyManager({ taxonomy }: { taxonomy: Taxonomy }) {
  const [selectedExamId, setSelectedExamId] = useState<string>(taxonomy.exams[0]?.id || "");
  const [search, setSearch] = useState("");
  const [examMeta, setExamMeta] = useState<Record<string, ExamMetadata>>({});
  const [activeImageUrl, setActiveImageUrl] = useState("");
  const [activeBadge, setActiveBadge] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const selectedExam = taxonomy.exams.find((e) => e.id === selectedExamId) || taxonomy.exams[0];
  const examSubjects = taxonomy.subjects.filter((s) => s.examId === selectedExamId || s.examName === selectedExam?.name);

  // Load existing exam metadata and images from API
  useEffect(() => {
    async function loadExams() {
      try {
        const res = await fetch("/api/admin/exams");
        if (res.ok) {
          const json = await res.json();
          const map: Record<string, ExamMetadata> = {};
          for (const e of json.exams || []) {
            map[e.slug] = e;
          }
          setExamMeta(map);
        }
      } catch {
        // ignore
      }
    }
    loadExams();
  }, []);

  // When selected exam changes, update the image form
  useEffect(() => {
    if (selectedExam) {
      const current = examMeta[selectedExam.slug];
      setActiveImageUrl(current?.imageUrl || "");
      setActiveBadge(current?.badge || "");
      setFeedback(null);
    }
  }, [selectedExam, examMeta]);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !selectedExam) return;
    setUploading(true);
    setFeedback(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("examSlug", selectedExam.slug);

      const res = await fetch("/api/admin/taxonomy/upload-cover", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to upload image.");
      setActiveImageUrl(data.url);
      setFeedback("Cover image uploaded from device successfully!");
    } catch (err) {
      setFeedback(err instanceof Error ? err.message : "Failed to upload image.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function handleSaveImage(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedExam) return;
    setSaving(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/admin/exams", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: selectedExam.slug,
          imageUrl: activeImageUrl.trim() || undefined,
          badge: activeBadge.trim() || undefined,
        }),
      });
      if (res.ok) {
        setExamMeta((prev) => ({
          ...prev,
          [selectedExam.slug]: {
            ...prev[selectedExam.slug],
            slug: selectedExam.slug,
            title: selectedExam.name,
            imageUrl: activeImageUrl.trim() || undefined,
            badge: activeBadge.trim() || undefined,
          },
        }));
        setFeedback("Exam card appearance saved successfully! Changes are reflected on Home and Search.");
      } else {
        setFeedback("Failed to update exam image.");
      }
    } catch {
      setFeedback("Network error updating exam image.");
    } finally {
      setSaving(false);
    }
  }

  const filteredExams = taxonomy.exams.filter((e) =>
    e.name.toLowerCase().includes(search.toLowerCase()) || e.slug.toLowerCase().includes(search.toLowerCase())
  );

  const currentMeta = selectedExam ? examMeta[selectedExam.slug] : undefined;
  const currentTone = currentMeta?.tone || "saffron";
  const currentSymbol = currentMeta?.symbol || "✦";

  return (
    <div className="admin-module-container">
      <div className="module-header-row">
        <div>
          <span className="kicker">CURRICULUM & METADATA</span>
          <h2 className="module-title">Exam Taxonomy & Card Image Studio</h2>
          <p className="module-desc">
            Manage examination card cover images, badges, curriculum tracks, subjects, and topic mapping.
          </p>
        </div>
      </div>

      <div className="admin-mini-metrics">
        <div className="mini-metric-card">
          <small>TOTAL EXAMS</small>
          <strong>{taxonomy.exams.length}</strong>
          <span>Published testing tracks</span>
        </div>
        <div className="mini-metric-card">
          <small>CATALOG SUBJECTS</small>
          <strong>{taxonomy.subjects.length}</strong>
          <span>Mapped across exams</span>
        </div>
        <div className="mini-metric-card">
          <small>GRANULAR TOPICS</small>
          <strong>{taxonomy.topics.length}</strong>
          <span>Subject-specific syllabus nodes</span>
        </div>
      </div>

      <div className="taxonomy-layout-grid">
        {/* Left Exams List */}
        <div className="taxonomy-col">
          <div className="taxonomy-col-header">
            <h3>Target Exams ({taxonomy.exams.length})</h3>
            <input
              type="text"
              placeholder="Filter exams..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="taxonomy-search-input"
            />
          </div>
          <div className="taxonomy-items-list">
            {filteredExams.map((exam) => {
              const count = taxonomy.subjects.filter((s) => s.examId === exam.id || s.examName === exam.name).length;
              const hasImg = Boolean(examMeta[exam.slug]?.imageUrl);
              return (
                <button
                  key={exam.id}
                  type="button"
                  className={`taxonomy-item-btn ${selectedExamId === exam.id ? "selected" : ""}`}
                  onClick={() => setSelectedExamId(exam.id)}
                >
                  <div>
                    <strong>{exam.name}</strong>
                    <code>{exam.slug} {hasImg ? "• 🖼️ custom image" : "• standard design"}</code>
                  </div>
                  <span className="tax-badge">{count} subjects</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Details Panel */}
        <div className="taxonomy-col subjects-topics-col">
          <div className="taxonomy-col-header">
            <h3>{selectedExam ? selectedExam.name : "Select an Exam"} — Visuals & Curriculum</h3>
          </div>

          <div className="subjects-tree-wrapper">
            {/* 1. Exam Card Image & Banner Configuration */}
            <div className="exam-image-studio-box" style={{ background: "#ffffff", border: "1px solid #dce6e2", borderRadius: "8px", padding: "20px" }}>
              <span className="card-kicker">EXAM CARD VISUAL & IMAGE CONFIGURATION</span>
              <h4 style={{ margin: "4px 0 12px", fontSize: "16px" }}>Frontend Card Preview</h4>

              <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: "24px", alignItems: "start" }}>
                {/* Live Card Preview */}
                <div className={`exam-card ${currentTone}`} style={{ margin: 0, pointerEvents: "none" }}>
                  <div className="exam-visual" style={{ height: "120px", position: "relative" }}>
                    {activeImageUrl.trim() ? (
                      <img
                        src={activeImageUrl.trim()}
                        alt={selectedExam?.name}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        onError={(e) => {
                          // fallback if image link is broken
                          (e.target as HTMLElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <>
                        <span className="exam-symbol" style={{ fontSize: "50px", top: "15px" }}>{currentSymbol}</span>
                        <div className="ring-shape" />
                      </>
                    )}
                    <span className="exam-badge" style={{ position: "absolute", top: "10px", right: "10px", background: "rgba(255,255,255,0.9)" }}>
                      {activeBadge || "Popular"}
                    </span>
                  </div>
                  <div className="exam-body" style={{ padding: "14px" }}>
                    <small>Official Series</small>
                    <h3 style={{ fontSize: "15px", margin: "4px 0" }}>{selectedExam?.name}</h3>
                    <p style={{ fontSize: "11px", margin: 0 }}>Free & premium tests</p>
                  </div>
                </div>

                {/* Form to update image & badge */}
                <form onSubmit={handleSaveImage} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <div className="form-field">
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, marginBottom: "6px" }}>
                      Upload Exam Card Cover Image from Device
                    </label>
                    <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
                      <label
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          padding: "8px 16px",
                          background: "#0f766e",
                          color: "#fff",
                          borderRadius: "8px",
                          fontSize: "0.85rem",
                          fontWeight: 700,
                          cursor: uploading ? "not-allowed" : "pointer",
                          boxShadow: "0 2px 4px rgba(15, 118, 110, 0.2)",
                        }}
                      >
                        <span>📁</span>
                        <span>{uploading ? "Uploading Image..." : "Choose Local Image"}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          disabled={uploading}
                          style={{ display: "none" }}
                        />
                      </label>
                      {activeImageUrl && (
                        <span style={{ fontSize: "12px", color: "#059669", fontWeight: 600 }}>
                          ✓ Custom image selected
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="form-field">
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, marginBottom: "6px" }}>
                      Or Enter Image URL (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="https://images.unsplash.com/... or /uploads/taxonomy/..."
                      value={activeImageUrl}
                      onChange={(e) => setActiveImageUrl(e.target.value)}
                      className="admin-input"
                    />
                    <small className="field-hint" style={{ marginTop: "4px", display: "block" }}>
                      When set, this image will replace the background on Home and Search result cards. Leave empty to display the default aesthetic gradient design.
                    </small>
                  </div>

                  <div className="form-field">
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, marginBottom: "6px" }}>
                      Status Badge Text
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Popular, Trending, New Series"
                      value={activeBadge}
                      onChange={(e) => setActiveBadge(e.target.value)}
                      className="admin-input"
                    />
                  </div>

                  {feedback && (
                    <div className="admin-alert alert-success" style={{ padding: "8px 12px", margin: 0 }}>
                      <span>✓</span>
                      <span>{feedback}</span>
                    </div>
                  )}

                  <div style={{ display: "flex", gap: "8px" }}>
                    <button type="submit" className="admin-btn-primary" disabled={saving}>
                      {saving ? "Saving..." : "Save Card Appearance"}
                    </button>
                    {activeImageUrl && (
                      <button
                        type="button"
                        className="btn-cancel"
                        onClick={() => setActiveImageUrl("")}
                      >
                        Reset to Default Design
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>

            {/* 2. Subjects & Topics Breakdown */}
            <h4 style={{ margin: "16px 0 8px", fontSize: "15px", color: "#31443e" }}>
              Mapped Subjects & Topics ({examSubjects.length} subjects)
            </h4>

            {examSubjects.length === 0 ? (
              <div className="empty-state-box">
                <p>No subjects mapped to this exam yet.</p>
              </div>
            ) : (
              examSubjects.map((subj) => {
                const subjTopics = taxonomy.topics.filter(
                  (t) => t.subjectId === subj.id || t.subjectName.toLowerCase() === subj.name.toLowerCase()
                );
                return (
                  <div key={subj.id} className="subject-tree-node">
                    <div className="subject-node-header">
                      <span className="node-icon">📚</span>
                      <strong>{subj.name}</strong>
                      <span className="tax-topic-count">{subjTopics.length} topics</span>
                    </div>
                    <div className="topics-pill-wrap">
                      {subjTopics.length === 0 ? (
                        <span className="no-topics-hint">General subject questions</span>
                      ) : (
                        subjTopics.map((top) => (
                          <span key={top.id} className="topic-tag-pill">
                            • {top.name}
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
