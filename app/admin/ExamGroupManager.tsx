"use client";

import { useState, useEffect, useMemo } from "react";
import type { ExamGroup, ExamGroupType } from "../../lib/exam-group-types";

const COMMON_EXAMS = [
  { slug: "bpsc-tre-4", name: "BPSC TRE 4.0 (Teaching Recruitment Exam)" },
  { slug: "bihar-stet", name: "Bihar STET 2026 (Secondary Teacher Eligibility)" },
  { slug: "ctet", name: "CTET July 2026 (Central Teacher Eligibility)" },
  { slug: "railway", name: "Railway RRB (NTPC & Group D)" },
  { slug: "btet", name: "Bihar Teacher Eligibility Test (BTET)" },
  { slug: "uppsc-ro-aro", name: "UPPSC Review Officer & ARO" },
];

const SUGGESTED_SUBJECTS_BY_EXAM: Record<string, string[]> = {
  "bpsc-tre-4": [
    "Language (Qualifying)",
    "General Studies & Language",
    "General Studies",
    "Elementary Mathematics",
    "General Science",
    "Computer Science",
    "Mathematics",
    "Physics",
    "Chemistry",
    "Botany",
    "Zoology",
    "History",
    "Geography",
    "Political Science",
    "Economics",
    "Hindi",
    "English",
    "Accountancy",
  ],
  "bihar-stet": [
    "Art of Teaching & Other Skills",
    "Paper I (Secondary)",
    "Paper II (Higher Secondary)",
    "Mathematics",
    "Science",
    "Social Science",
    "Computer Science",
    "Hindi",
    "English",
    "Physics",
    "Chemistry",
    "Biology",
  ],
  ctet: [
    "Child Development & Pedagogy",
    "Mathematics",
    "Environmental Studies",
    "Science",
    "Social Studies",
    "Language I",
    "Language II",
    "Paper I (Classes 1-5)",
    "Paper II (Classes 6-8)",
  ],
  railway: [
    "Mathematics",
    "General Intelligence & Reasoning",
    "General Awareness",
    "General Science",
  ],
};

export default function ExamGroupManager() {
  const [groups, setGroups] = useState<ExamGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Filters
  const [filterType, setFilterType] = useState<string>("all");
  const [filterExam, setFilterExam] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<ExamGroup | null>(null);

  const [formTitle, setFormTitle] = useState("");
  const [formType, setFormType] = useState<ExamGroupType>("individual");
  const [formExamSlug, setFormExamSlug] = useState("bpsc-tre-4");
  const [formExamName, setFormExamName] = useState("BPSC TRE 4.0");
  const [formTargetSubject, setFormTargetSubject] = useState("");
  const [formClubbedSubjects, setFormClubbedSubjects] = useState<string[]>([]);
  const [customSubjectInput, setCustomSubjectInput] = useState("");
  const [formPrice, setFormPrice] = useState("299");
  const [formValidityDays, setFormValidityDays] = useState("90");
  const [formDescription, setFormDescription] = useState("");
  const [formBadge, setFormBadge] = useState("");
  const [formActive, setFormActive] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch groups
  async function fetchGroups() {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/exam-groups");
      const data = await res.json();
      if (data.success && Array.isArray(data.groups)) {
        setGroups(data.groups);
      } else {
        setErrorMsg(data.error || "Failed to load exam groups");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to load exam groups");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchGroups();
  }, []);

  // Filtered groups
  const filteredGroups = useMemo(() => {
    return groups.filter((g) => {
      const matchesType = filterType === "all" || g.type === filterType;
      const matchesExam = filterExam === "all" || g.examSlug === filterExam;
      const matchesSearch =
        !searchQuery.trim() ||
        g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.examName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.clubbedSubjects.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesType && matchesExam && matchesSearch;
    });
  }, [groups, filterType, filterExam, searchQuery]);

  // Open modal for Create
  function handleOpenCreate() {
    setEditingGroup(null);
    setFormTitle("");
    setFormType("individual");
    setFormExamSlug("bpsc-tre-4");
    setFormExamName("BPSC TRE 4.0");
    setFormTargetSubject("Computer Science");
    setFormClubbedSubjects([
      "Computer Science",
      "Language (Qualifying)",
      "General Studies & Language",
      "Elementary Mathematics",
    ]);
    setCustomSubjectInput("");
    setFormPrice("299");
    setFormValidityDays("90");
    setFormDescription("Includes Part-I Qualifying Language + Part-II General Studies/GK + Part-III Core Subject mock tests.");
    setFormBadge("🔥 Popular");
    setFormActive(true);
    setIsModalOpen(true);
  }

  // Open modal for Edit
  function handleOpenEdit(group: ExamGroup) {
    setEditingGroup(group);
    setFormTitle(group.title);
    setFormType(group.type);
    setFormExamSlug(group.examSlug);
    setFormExamName(group.examName);
    setFormTargetSubject(group.targetSubject || "");
    setFormClubbedSubjects([...group.clubbedSubjects]);
    setCustomSubjectInput("");
    setFormPrice(String(group.price));
    setFormValidityDays(String(group.validityDays));
    setFormDescription(group.description);
    setFormBadge(group.badge || "");
    setFormActive(group.active);
    setIsModalOpen(true);
  }

  // Toggle clubbed subject
  function toggleClubbedSubject(sub: string) {
    const trimmed = sub.trim();
    if (!trimmed) return;
    if (formClubbedSubjects.includes(trimmed)) {
      setFormClubbedSubjects(formClubbedSubjects.filter((s) => s !== trimmed));
    } else {
      setFormClubbedSubjects([...formClubbedSubjects, trimmed]);
    }
  }

  // Add custom subject
  function handleAddCustomSubject() {
    const trimmed = customSubjectInput.trim();
    if (!trimmed) return;
    if (!formClubbedSubjects.includes(trimmed)) {
      setFormClubbedSubjects([...formClubbedSubjects, trimmed]);
    }
    setCustomSubjectInput("");
  }

  // Save / Update Group
  async function handleSaveGroup(e: React.FormEvent) {
    e.preventDefault();
    if (!formTitle.trim()) {
      alert("Please provide a Group / Series Title");
      return;
    }
    if (formClubbedSubjects.length === 0) {
      alert("Please club at least one subject into this series");
      return;
    }

    setIsSaving(true);
    setFeedback(null);

    try {
      const payload = {
        id: editingGroup ? editingGroup.id : undefined,
        title: formTitle.trim(),
        type: formType,
        examSlug: formExamSlug,
        examName: formExamName,
        targetSubject: formTargetSubject.trim() || undefined,
        clubbedSubjects: formClubbedSubjects,
        price: parseInt(formPrice, 10) || 299,
        validityDays: parseInt(formValidityDays, 10) || 90,
        description: formDescription.trim(),
        badge: formBadge.trim() || undefined,
        active: formActive,
      };

      const res = await fetch("/api/admin/exam-groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to save exam group");
      }

      setFeedback({
        type: "success",
        message: editingGroup
          ? `Exam group "${formTitle}" updated successfully!`
          : `New exam group "${formTitle}" clubbed and published!`,
      });
      setIsModalOpen(false);
      await fetchGroups();
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message || "Failed to save exam group" });
    } finally {
      setIsSaving(false);
    }
  }

  // Delete Group
  async function handleDeleteGroup(group: ExamGroup) {
    if (!confirm(`Are you sure you want to delete the exam series "${group.title}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/exam-groups?id=${group.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to delete exam group");
      }
      setFeedback({ type: "success", message: `Exam group "${group.title}" deleted.` });
      await fetchGroups();
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message || "Failed to delete group" });
    }
  }

  // Suggested subjects for the current selected exam
  const currentSuggestedSubjects =
    SUGGESTED_SUBJECTS_BY_EXAM[formExamSlug] ||
    SUGGESTED_SUBJECTS_BY_EXAM["bpsc-tre-4"];

  return (
    <div className="admin-module-container">
      {/* Header */}
      <div className="module-header-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <span className="kicker">EXAM &amp; SUBJECT BUNDLING SYSTEM</span>
          <h2 className="module-title">Exam Groups &amp; Clubbed Series Manager</h2>
          <p className="module-desc">
            Club multiple subjects and mock tests into unified test series packages. These appear on the Checkout page (Option 1 &amp; 2) and in the Exam Directory with granular access verification.
          </p>
        </div>
        <button
          type="button"
          className="admin-primary-btn"
          onClick={handleOpenCreate}
          style={{ background: "#7c3aed", color: "#fff", border: "none", padding: "10px 18px", borderRadius: "8px", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}
        >
          <span>➕</span>
          <span>Club New Exam Series</span>
        </button>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          style={{
            margin: "16px 0",
            padding: "12px 18px",
            borderRadius: "8px",
            background: feedback.type === "success" ? "#ecfdf5" : "#fef2f2",
            color: feedback.type === "success" ? "#065f46" : "#991b1b",
            border: `1px solid ${feedback.type === "success" ? "#a7f3d0" : "#fecaca"}`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>{feedback.message}</span>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            style={{ background: "none", border: "none", cursor: "pointer", fontWeight: 700, color: "inherit" }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Metrics Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", margin: "20px 0" }}>
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "16px" }}>
          <span style={{ fontSize: "12px", color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>Total Series</span>
          <div style={{ fontSize: "24px", fontWeight: 800, color: "#0f172a", marginTop: "4px" }}>{groups.length}</div>
        </div>
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "16px" }}>
          <span style={{ fontSize: "12px", color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>Option 1: Complete Bundles</span>
          <div style={{ fontSize: "24px", fontWeight: 800, color: "#059669", marginTop: "4px" }}>
            {groups.filter((g) => g.type === "group").length}
          </div>
        </div>
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "16px" }}>
          <span style={{ fontSize: "12px", color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>Option 2: Individual Series</span>
          <div style={{ fontSize: "24px", fontWeight: 800, color: "#7c3aed", marginTop: "4px" }}>
            {groups.filter((g) => g.type === "individual").length}
          </div>
        </div>
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "16px" }}>
          <span style={{ fontSize: "12px", color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>Active on Portal</span>
          <div style={{ fontSize: "24px", fontWeight: 800, color: "#0284c7", marginTop: "4px" }}>
            {groups.filter((g) => g.active).length}
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "16px", display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ flex: 1, minWidth: "220px" }}>
          <input
            type="text"
            placeholder="Search by series name, subject, or exam..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: "100%", padding: "9px 14px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "14px" }}
          />
        </div>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          style={{ padding: "9px 12px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "13px", background: "#f8fafc" }}
        >
          <option value="all">All Purchase Types</option>
          <option value="group">Option 1: Complete Exam Bundles</option>
          <option value="individual">Option 2: Individual Exam Series</option>
        </select>

        <select
          value={filterExam}
          onChange={(e) => setFilterExam(e.target.value)}
          style={{ padding: "9px 12px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "13px", background: "#f8fafc" }}
        >
          <option value="all">All Exam Categories</option>
          {COMMON_EXAMS.map((e) => (
            <option key={e.slug} value={e.slug}>
              {e.name}
            </option>
          ))}
        </select>
      </div>

      {/* Groups List */}
      <div style={{ marginTop: "20px", display: "grid", gridTemplateColumns: "1fr", gap: "14px" }}>
        {isLoading ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>Loading exam groups...</div>
        ) : filteredGroups.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px", background: "#fff", borderRadius: "10px", border: "1px dashed #cbd5e1", color: "#64748b" }}>
            No exam groups found matching your criteria.
          </div>
        ) : (
          filteredGroups.map((group) => (
            <div
              key={group.id}
              style={{
                background: "#fff",
                border: "1px solid #e2e8f0",
                borderRadius: "12px",
                padding: "20px",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
              }}
            >
              {/* Top row */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px", flexWrap: "wrap" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
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
                      {group.type === "group" ? "🏢 OPTION 1: COMPLETE EXAM BUNDLE" : "🎯 OPTION 2: INDIVIDUAL EXAM SERIES"}
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
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: 700,
                        padding: "3px 8px",
                        borderRadius: "6px",
                        background: group.active ? "#f0fdf4" : "#fef2f2",
                        color: group.active ? "#15803d" : "#b91c1c",
                      }}
                    >
                      {group.active ? "● ACTIVE" : "○ INACTIVE"}
                    </span>
                  </div>

                  <h3 style={{ margin: 0, fontSize: "17px", fontWeight: 800, color: "#0f172a" }}>
                    {group.title}
                  </h3>
                  <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#64748b" }}>
                    Exam: <strong>{group.examName}</strong> ({group.examSlug})
                    {group.targetSubject && <> • Target: <strong>{group.targetSubject}</strong></>}
                  </p>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ textAlign: "right" }}>
                    <span style={{ fontSize: "20px", fontWeight: 800, color: "#0f172a" }}>₹{group.price}</span>
                    <span style={{ display: "block", fontSize: "11px", color: "#64748b" }}>{group.validityDays} Days Validity</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(group)}
                    style={{
                      padding: "8px 14px",
                      borderRadius: "6px",
                      background: "#f1f5f9",
                      border: "1px solid #cbd5e1",
                      fontSize: "13px",
                      fontWeight: 600,
                      cursor: "pointer",
                      color: "#334155",
                    }}
                  >
                    ✏️ Edit / Club Subjects
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteGroup(group)}
                    style={{
                      padding: "8px 12px",
                      borderRadius: "6px",
                      background: "#fff",
                      border: "1px solid #fee2e2",
                      fontSize: "13px",
                      fontWeight: 600,
                      cursor: "pointer",
                      color: "#dc2626",
                    }}
                  >
                    🗑️
                  </button>
                </div>
              </div>

              {/* Description */}
              {group.description && (
                <p style={{ margin: 0, fontSize: "13px", color: "#475569", lineHeight: "1.5" }}>
                  {group.description}
                </p>
              )}

              {/* Clubbed Subjects Section */}
              <div style={{ background: "#f8fafc", borderRadius: "8px", padding: "12px 14px", border: "1px solid #f1f5f9" }}>
                <span style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "8px" }}>
                  🔗 Clubbed Subjects Included in This Series ({group.clubbedSubjects.length}):
                </span>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {group.clubbedSubjects.map((sub, idx) => (
                    <span
                      key={idx}
                      style={{
                        fontSize: "12px",
                        padding: "4px 9px",
                        borderRadius: "6px",
                        background: "#fff",
                        border: "1px solid #cbd5e1",
                        color: "#1e293b",
                        fontWeight: 600,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <span style={{ color: "#7c3aed" }}>✓</span> {sub}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.6)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "20px",
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "16px",
              maxWidth: "760px",
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
              padding: "28px",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", borderBottom: "1px solid #e2e8f0", paddingBottom: "14px" }}>
              <div>
                <h3 style={{ margin: 0, fontSize: "20px", fontWeight: 800, color: "#0f172a" }}>
                  {editingGroup ? "Edit Exam Series & Clubbed Subjects" : "Club New Exam Series"}
                </h3>
                <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#64748b" }}>
                  Define what subjects are clubbed together for user purchase and exam directory.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#64748b" }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveGroup} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              {/* Type Switcher */}
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "#1e293b", marginBottom: "8px" }}>
                  Package / Series Option Type:
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div
                    onClick={() => {
                      setFormType("group");
                      if (!formTitle || formTitle.includes(" - ")) {
                        setFormTitle(`${formExamName} All-Subject Mega Pass`);
                      }
                      setFormPrice("499");
                    }}
                    style={{
                      border: formType === "group" ? "2px solid #059669" : "1px solid #cbd5e1",
                      background: formType === "group" ? "#ecfdf5" : "#f8fafc",
                      borderRadius: "10px",
                      padding: "12px 14px",
                      cursor: "pointer",
                    }}
                  >
                    <strong style={{ fontSize: "14px", color: "#065f46", display: "block" }}>🏢 Option 1: Complete Exam Group</strong>
                    <span style={{ fontSize: "12px", color: "#475569" }}>Gives full access to ALL subjects and mocks connected to this entire exam.</span>
                  </div>

                  <div
                    onClick={() => {
                      setFormType("individual");
                      if (formTitle.includes("All-Subject")) {
                        setFormTitle(`${formExamName} - Computer Science`);
                      }
                      setFormPrice("299");
                    }}
                    style={{
                      border: formType === "individual" ? "2px solid #7c3aed" : "1px solid #cbd5e1",
                      background: formType === "individual" ? "#f5f3ff" : "#f8fafc",
                      borderRadius: "10px",
                      padding: "12px 14px",
                      cursor: "pointer",
                    }}
                  >
                    <strong style={{ fontSize: "14px", color: "#5b21b6", display: "block" }}>🎯 Option 2: Individual Exam Series</strong>
                    <span style={{ fontSize: "12px", color: "#475569" }}>Specific exam subject (e.g. CS, Hindi) with custom clubbed subjects (Language + GS + Core).</span>
                  </div>
                </div>
              </div>

              {/* Master Exam Category */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "#1e293b", marginBottom: "6px" }}>
                    Master Exam Category:
                  </label>
                  <select
                    value={formExamSlug}
                    onChange={(e) => {
                      const slug = e.target.value;
                      setFormExamSlug(slug);
                      const found = COMMON_EXAMS.find((x) => x.slug === slug);
                      if (found) {
                        setFormExamName(found.name.split(" (")[0]);
                      }
                    }}
                    style={{ width: "100%", padding: "9px 12px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "14px" }}
                  >
                    {COMMON_EXAMS.map((e) => (
                      <option key={e.slug} value={e.slug}>
                        {e.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "#1e293b", marginBottom: "6px" }}>
                    Primary Target Subject:
                  </label>
                  <input
                    type="text"
                    value={formTargetSubject}
                    onChange={(e) => setFormTargetSubject(e.target.value)}
                    placeholder="e.g. Computer Science or All Subjects"
                    style={{ width: "100%", padding: "9px 12px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "14px" }}
                  />
                </div>
              </div>

              {/* Series Title */}
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "#1e293b", marginBottom: "6px" }}>
                  Series Display Title:
                </label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. BPSC TRE 4.0 - Computer Science"
                  required
                  style={{ width: "100%", padding: "10px 14px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "15px", fontWeight: 600 }}
                />
              </div>

              {/* CLUBBING MECHANISM: MULTIPLE SUBJECT SELECTOR */}
              <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "16px" }}>
                <div style={{ marginBottom: "10px" }}>
                  <strong style={{ fontSize: "14px", color: "#0f172a", display: "block" }}>
                    🔗 Club Multiple Subjects in this Test Series:
                  </strong>
                  <span style={{ fontSize: "12px", color: "#64748b" }}>
                    Click pills to include/exclude subjects. Tests having ANY of these clubbed subjects will be unlocked when candidate purchases this series!
                  </span>
                </div>

                {/* Suggested pills */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "14px" }}>
                  {currentSuggestedSubjects.map((sub) => {
                    const isClubbed = formClubbedSubjects.includes(sub);
                    return (
                      <button
                        type="button"
                        key={sub}
                        onClick={() => toggleClubbedSubject(sub)}
                        style={{
                          padding: "6px 12px",
                          borderRadius: "20px",
                          fontSize: "12px",
                          fontWeight: 600,
                          cursor: "pointer",
                          border: isClubbed ? "1.5px solid #7c3aed" : "1px solid #cbd5e1",
                          background: isClubbed ? "#7c3aed" : "#fff",
                          color: isClubbed ? "#fff" : "#334155",
                          transition: "all 0.15s ease",
                        }}
                      >
                        {isClubbed ? "✓ " : "+ "} {sub}
                      </button>
                    );
                  })}
                </div>

                {/* Add Custom Subject Tag */}
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <input
                    type="text"
                    value={customSubjectInput}
                    onChange={(e) => setCustomSubjectInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddCustomSubject();
                      }
                    }}
                    placeholder="Add custom subject (e.g. General Science, GK/GS, Reasoning)..."
                    style={{ flex: 1, padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "13px" }}
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomSubject}
                    style={{
                      padding: "8px 14px",
                      background: "#0f766e",
                      color: "#fff",
                      border: "none",
                      borderRadius: "6px",
                      fontSize: "13px",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    + Club Subject
                  </button>
                </div>

                {/* Selected Clubbed Subjects Summary */}
                <div style={{ marginTop: "12px", paddingTop: "10px", borderTop: "1px solid #e2e8f0" }}>
                  <small style={{ fontWeight: 700, color: "#475569" }}>
                    Currently Clubbed ({formClubbedSubjects.length} subjects):
                  </small>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "6px" }}>
                    {formClubbedSubjects.map((sub) => (
                      <span
                        key={sub}
                        style={{
                          fontSize: "12px",
                          padding: "3px 8px",
                          borderRadius: "6px",
                          background: "#ede9fe",
                          color: "#5b21b6",
                          border: "1px solid #ddd6fe",
                          fontWeight: 600,
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        {sub}
                        <span
                          onClick={() => toggleClubbedSubject(sub)}
                          style={{ cursor: "pointer", fontWeight: 800, marginLeft: "4px", color: "#7c3aed" }}
                        >
                          ✕
                        </span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Pricing, Validity, Badge */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "#1e293b", marginBottom: "6px" }}>
                    Price (INR ₹):
                  </label>
                  <input
                    type="number"
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    required
                    style={{ width: "100%", padding: "9px 12px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "14px" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "#1e293b", marginBottom: "6px" }}>
                    Validity (Days):
                  </label>
                  <input
                    type="number"
                    value={formValidityDays}
                    onChange={(e) => setFormValidityDays(e.target.value)}
                    required
                    style={{ width: "100%", padding: "9px 12px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "14px" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "#1e293b", marginBottom: "6px" }}>
                    Promotional Ribbon Badge:
                  </label>
                  <input
                    type="text"
                    value={formBadge}
                    onChange={(e) => setFormBadge(e.target.value)}
                    placeholder="e.g. 🔥 Most Popular"
                    style={{ width: "100%", padding: "9px 12px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "14px" }}
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "#1e293b", marginBottom: "6px" }}>
                  Series Summary &amp; Inclusions Description:
                </label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="e.g. Complete 150-Q full mock tests with qualifying Language + GS + Core Computer Science questions."
                  style={{ width: "100%", padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "13px", resize: "vertical" }}
                />
              </div>

              {/* Active Toggle */}
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <input
                  type="checkbox"
                  id="group-active-check"
                  checked={formActive}
                  onChange={(e) => setFormActive(e.target.checked)}
                  style={{ width: "18px", height: "18px", accentColor: "#059669" }}
                />
                <label htmlFor="group-active-check" style={{ fontSize: "14px", fontWeight: 600, color: "#1e293b", cursor: "pointer" }}>
                  Active on Checkout Page and Exam Directory
                </label>
              </div>

              {/* Form buttons */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", paddingTop: "14px", borderTop: "1px solid #e2e8f0" }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    padding: "10px 18px",
                    borderRadius: "8px",
                    background: "#f1f5f9",
                    border: "1px solid #cbd5e1",
                    fontWeight: 600,
                    cursor: "pointer",
                    color: "#475569",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  style={{
                    padding: "10px 22px",
                    borderRadius: "8px",
                    background: "#7c3aed",
                    border: "none",
                    fontWeight: 700,
                    color: "#fff",
                    cursor: isSaving ? "not-allowed" : "pointer",
                  }}
                >
                  {isSaving ? "Saving..." : editingGroup ? "Update Exam Group" : "Publish Clubbed Series"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
