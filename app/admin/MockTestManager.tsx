"use client";

import { useState, useMemo, useEffect } from "react";
import type { MockTest, SubjectDemandRequest } from "../../lib/admin-content";
import type { AdminQuestion } from "../../lib/phase1";
import { syllabusTracks } from "../../lib/syllabus";

interface MockTestManagerProps {
  initialTests: MockTest[];
  initialRequests: SubjectDemandRequest[];
  questions: AdminQuestion[];
  onTestCreated?: (newTest: MockTest) => void;
}

export default function MockTestManager({
  initialTests,
  initialRequests,
  questions,
  onTestCreated,
}: MockTestManagerProps) {
  const [tests, setTests] = useState<MockTest[]>(initialTests);
  const [requests, setRequests] = useState<SubjectDemandRequest[]>(initialRequests);
  const [subTab, setSubTab] = useState<"catalog" | "create" | "demands">("catalog");

  // Filters for catalog
  const [examFilter, setExamFilter] = useState("All");
  const [trackFilter, setTrackFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchFilter, setSearchFilter] = useState("");

  // Create form state
  const [createExam, setCreateExam] = useState("BPSC TRE 4.0");
  const [createTrack, setCreateTrack] = useState("primary-1-5");
  const [createSubject, setCreateSubject] = useState("General Studies");
  const [customSubject, setCustomSubject] = useState("");
  const [createTitle, setCreateTitle] = useState("");
  const [createType, setCreateType] = useState("Full mock");
  const [createDuration, setCreateDuration] = useState("150");
  const [createQuestionsCount, setCreateQuestionsCount] = useState("150");
  const [createAccess, setCreateAccess] = useState<"Free" | "Premium">("Free");
  const [createStatus, setCreateStatus] = useState<"Draft" | "Published">("Published");
  const [createDescription, setCreateDescription] = useState("");
  const [createBannerImageUrl, setCreateBannerImageUrl] = useState("");
  const [selectedInitialQuestions, setSelectedInitialQuestions] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formFeedback, setFormFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // =========================================================================
  // EDIT MOCK TEST STATE (Unified with Questions & Banner Image)
  // =========================================================================
  const [editingTest, setEditingTest] = useState<MockTest | null>(null);
  const [editTab, setEditTab] = useState<"details" | "questions">("details");
  const [editTitle, setEditTitle] = useState("");
  const [editExam, setEditExam] = useState("BPSC TRE 4.0");
  const [editTrack, setEditTrack] = useState("primary-1-5");
  const [editSubject, setEditSubject] = useState("General Studies");
  const [editCustomSubject, setEditCustomSubject] = useState("");
  const [editType, setEditType] = useState("Full mock");
  const [editDuration, setEditDuration] = useState("150");
  const [editQuestionsCount, setEditQuestionsCount] = useState("150");
  const [editTotalMarks, setEditTotalMarks] = useState("150");
  const [editAccess, setEditAccess] = useState<"Free" | "Premium">("Free");
  const [editStatus, setEditStatus] = useState<"Draft" | "Published" | "Archived">("Published");
  const [editDescription, setEditDescription] = useState("");
  const [editBannerImageUrl, setEditBannerImageUrl] = useState("");
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editFeedback, setEditFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Questions state for Edit Modal
  const [linkedQuestions, setLinkedQuestions] = useState<AdminQuestion[]>([]);
  const [isLoadingLinked, setIsLoadingLinked] = useState(false);
  const [questionSearch, setQuestionSearch] = useState("");
  const [linkingQId, setLinkingQId] = useState<string | null>(null);
  const [isBatchLinking, setIsBatchLinking] = useState(false);

  // Dynamic Question Filters inside Edit Drawer / Modal
  const [drawerQExam, setDrawerQExam] = useState("All");
  const [drawerQSubject, setDrawerQSubject] = useState("All");
  const [drawerQTopic, setDrawerQTopic] = useState("All");

  // 3-Tier Dynamic Question Filters for Test Creation
  const [createQExam, setCreateQExam] = useState("All");
  const [createQSubject, setCreateQSubject] = useState("All");
  const [createQTopic, setCreateQTopic] = useState("All");
  const [createQSearch, setCreateQSearch] = useState("");

  // Tracks for create exam
  const currentExamSlug = createExam === "BPSC TRE 4.0" ? "bpsc-tre-4" : createExam === "Bihar STET" ? "bihar-stet" : "ctet";
  const tracksForSelectedExam = syllabusTracks[currentExamSlug] ?? [];
  const activeTrackObj = tracksForSelectedExam.find((t) => t.slug === createTrack) || tracksForSelectedExam[0];
  const subjectsForActiveTrack = activeTrackObj?.subjects ?? [];

  // Tracks for edit exam
  const editExamSlug = editExam === "BPSC TRE 4.0" ? "bpsc-tre-4" : editExam === "Bihar STET" ? "bihar-stet" : "ctet";
  const tracksForEditExam = syllabusTracks[editExamSlug] ?? [];
  const editTrackObj = tracksForEditExam.find((t) => t.slug === editTrack) || tracksForEditExam[0];
  const subjectsForEditTrack = editTrackObj?.subjects ?? [];

  // Dynamic Subjects for Create Test
  const dynamicCreateSubjects = useMemo(() => {
    const list = createQExam === "All" ? questions : questions.filter((q) => q.exam === createQExam);
    return Array.from(new Set(list.map((q) => q.subject).filter(Boolean))).sort();
  }, [questions, createQExam]);

  const dynamicCreateTopics = useMemo(() => {
    let list = createQExam === "All" ? questions : questions.filter((q) => q.exam === createQExam);
    if (createQSubject !== "All") {
      list = list.filter((q) => q.subject === createQSubject);
    }
    return Array.from(new Set(list.map((q) => q.topic).filter(Boolean))).sort();
  }, [questions, createQExam, createQSubject]);

  const filteredCreateQuestions = useMemo(() => {
    return questions.filter((q) => {
      if (createQExam !== "All" && q.exam !== createQExam) return false;
      if (createQSubject !== "All" && q.subject !== createQSubject) return false;
      if (createQTopic !== "All" && q.topic !== createQTopic) return false;
      if (createQSearch.trim()) {
        const query = createQSearch.toLowerCase();
        return (
          q.stem.toLowerCase().includes(query) ||
          q.explanation?.toLowerCase().includes(query) ||
          q.subject.toLowerCase().includes(query) ||
          q.topic?.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [questions, createQExam, createQSubject, createQTopic, createQSearch]);

  // Filtered tests for Catalog
  const filteredTests = useMemo(() => {
    return tests.filter((t) => {
      if (examFilter !== "All" && t.examName !== examFilter && t.examSlug !== examFilter) return false;
      if (trackFilter !== "All" && t.trackSlug !== trackFilter) return false;
      if (statusFilter !== "All" && t.status !== statusFilter) return false;
      if (searchFilter.trim()) {
        const q = searchFilter.toLowerCase();
        return (
          t.name.toLowerCase().includes(q) ||
          t.subjectName.toLowerCase().includes(q) ||
          t.examName.toLowerCase().includes(q) ||
          (t.description && t.description.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [tests, examFilter, trackFilter, statusFilter, searchFilter]);

  // Dynamic Subjects & Topics for Edit Questions tab
  const dynamicDrawerSubjects = useMemo(() => {
    const list = drawerQExam === "All" ? questions : questions.filter((q) => q.exam === drawerQExam);
    return Array.from(new Set(list.map((q) => q.subject).filter(Boolean))).sort();
  }, [questions, drawerQExam]);

  const dynamicDrawerTopics = useMemo(() => {
    let list = drawerQExam === "All" ? questions : questions.filter((q) => q.exam === drawerQExam);
    if (drawerQSubject !== "All") {
      list = list.filter((q) => q.subject === drawerQSubject);
    }
    return Array.from(new Set(list.map((q) => q.topic).filter(Boolean))).sort();
  }, [questions, drawerQExam, drawerQSubject]);

  const availableToLink = useMemo(() => {
    if (!editingTest) return [];
    const linkedIds = new Set(linkedQuestions.map((q) => q.id));
    return questions.filter((q) => {
      if (linkedIds.has(q.id)) return false;
      if (drawerQExam !== "All" && q.exam !== drawerQExam) return false;
      if (drawerQSubject !== "All" && q.subject !== drawerQSubject) return false;
      if (drawerQTopic !== "All" && q.topic !== drawerQTopic) return false;
      if (questionSearch.trim()) {
        const query = questionSearch.toLowerCase();
        return (
          q.stem.toLowerCase().includes(query) ||
          q.subject.toLowerCase().includes(query) ||
          q.topic?.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [editingTest, linkedQuestions, questions, drawerQExam, drawerQSubject, drawerQTopic, questionSearch]);

  // Open Edit Mock Test Studio
  async function handleOpenEdit(test: MockTest) {
    setEditingTest(test);
    setEditTab("details");
    setEditTitle(test.name);
    setEditExam(test.examName || "BPSC TRE 4.0");
    setEditTrack(test.trackSlug || "primary-1-5");
    setEditSubject(test.subjectName || "General Studies");
    setEditCustomSubject("");
    setEditType(test.testType || "Full mock");
    setEditDuration(String(test.durationMinutes || 150));
    setEditQuestionsCount(String(test.questionCount || 150));
    setEditTotalMarks(String(test.totalMarks || test.questionCount || 150));
    setEditAccess(test.access);
    setEditStatus(test.status);
    setEditDescription(test.description || "");
    setEditBannerImageUrl(test.bannerImageUrl || "");
    setEditFeedback(null);

    // Load linked questions
    setIsLoadingLinked(true);
    try {
      const res = await fetch(`/api/admin/mock-tests/${test.id}/questions`);
      const data = await res.json();
      setLinkedQuestions(data.questions || []);
    } catch {
      setLinkedQuestions([]);
    } finally {
      setIsLoadingLinked(false);
    }
  }

  // Handle Save Edited Test
  async function handleSaveEditTest(e: React.FormEvent) {
    e.preventDefault();
    if (!editingTest) return;
    setIsSavingEdit(true);
    setEditFeedback(null);

    const subjectToUse = editSubject === "__custom__" ? editCustomSubject.trim() : editSubject;
    if (!editTitle.trim() || !subjectToUse) {
      setEditFeedback({ type: "error", message: "Test title and subject are required." });
      setIsSavingEdit(false);
      return;
    }

    try {
      const res = await fetch(`/api/admin/mock-tests/${editingTest.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editTitle.trim(),
          examName: editExam,
          trackSlug: editTrack,
          subjectName: subjectToUse,
          testType: editType,
          questionCount: Number(editQuestionsCount) || 150,
          durationMinutes: Number(editDuration) || 150,
          totalMarks: Number(editTotalMarks) || Number(editQuestionsCount) || 150,
          access: editAccess,
          status: editStatus,
          description: editDescription.trim() || undefined,
          bannerImageUrl: editBannerImageUrl.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update mock test.");
      }

      const updated = data.test as MockTest;
      setTests((prev) =>
        prev.map((t) => (t.id === editingTest.id ? { ...t, ...updated, linkedQuestionsCount: linkedQuestions.length } : t))
      );
      setEditingTest((prev) => (prev ? { ...prev, ...updated, linkedQuestionsCount: linkedQuestions.length } : null));

      setEditFeedback({
        type: "success",
        message: `Changes saved successfully for "${updated.name}"!`,
      });
    } catch (err) {
      setEditFeedback({
        type: "error",
        message: err instanceof Error ? err.message : "An error occurred while saving the test.",
      });
    } finally {
      setIsSavingEdit(false);
    }
  }

  // Handle linking a question inside Edit
  async function handleLinkQuestion(qId: string) {
    if (!editingTest) return;
    setLinkingQId(qId);
    try {
      const res = await fetch(`/api/admin/mock-tests/${editingTest.id}/questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionIds: [qId] }),
      });
      if (res.ok) {
        const qToAdd = questions.find((q) => q.id === qId);
        if (qToAdd) {
          setLinkedQuestions((prev) => [...prev, qToAdd]);
        }
        setTests((prev) =>
          prev.map((t) =>
            t.id === editingTest.id
              ? { ...t, linkedQuestionsCount: t.linkedQuestionsCount + 1 }
              : t
          )
        );
      }
    } catch {
      // error handling
    } finally {
      setLinkingQId(null);
    }
  }

  // Handle linking all filtered questions
  async function handleLinkAllFiltered() {
    if (!editingTest || availableToLink.length === 0) return;
    setIsBatchLinking(true);
    const idsToLink = availableToLink.map((q) => q.id);
    try {
      const res = await fetch(`/api/admin/mock-tests/${editingTest.id}/questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionIds: idsToLink }),
      });
      if (res.ok) {
        setLinkedQuestions((prev) => [...prev, ...availableToLink]);
        setTests((prev) =>
          prev.map((t) =>
            t.id === editingTest.id
              ? { ...t, linkedQuestionsCount: t.linkedQuestionsCount + idsToLink.length }
              : t
          )
        );
      }
    } catch {
      // error handling
    } finally {
      setIsBatchLinking(false);
    }
  }

  // Handle unlinking a question
  async function handleUnlinkQuestion(qId: string) {
    if (!editingTest) return;
    try {
      const res = await fetch(`/api/admin/mock-tests/${editingTest.id}/questions`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId: qId }),
      });
      if (res.ok) {
        setLinkedQuestions((prev) => prev.filter((q) => q.id !== qId));
        setTests((prev) =>
          prev.map((t) =>
            t.id === editingTest.id
              ? { ...t, linkedQuestionsCount: Math.max(0, t.linkedQuestionsCount - 1) }
              : t
          )
        );
      }
    } catch {
      // error handling
    }
  }

  // Handle quick status toggle on card
  async function handleStatusToggle(testId: string, currentStatus: "Draft" | "Published" | "Archived") {
    const nextStatus = currentStatus === "Published" ? "Draft" : "Published";
    try {
      const res = await fetch(`/api/admin/mock-tests/${testId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) {
        setTests((prev) =>
          prev.map((t) => (t.id === testId ? { ...t, status: nextStatus } : t))
        );
      }
    } catch {
      // error handling
    }
  }

  // Handle delete test
  async function handleDeleteTest(testId: string) {
    if (!confirm("Are you sure you want to delete this mock test? This will remove it from learner view.")) return;
    try {
      const res = await fetch(`/api/admin/mock-tests/${testId}`, { method: "DELETE" });
      if (res.ok) {
        setTests((prev) => prev.filter((t) => t.id !== testId));
      }
    } catch {
      // error handling
    }
  }

  // Pre-fill create form from learner demand
  function handleFulfillDemand(req: SubjectDemandRequest) {
    const examMap: Record<string, string> = {
      "bpsc-tre-4": "BPSC TRE 4.0",
      "bihar-stet": "Bihar STET",
      ctet: "CTET",
    };
    setCreateExam(examMap[req.examSlug] || "BPSC TRE 4.0");
    setCreateTrack(req.trackSlug);
    setCreateSubject(req.subjectName);
    setCreateTitle(`${req.subjectName}: High-Yield Mock 01`);
    setSubTab("create");
    setFormFeedback({
      type: "success",
      message: `Form pre-filled for ${req.subjectName} (${req.requestCount} student requests awaiting test creation).`,
    });
  }

  // Handle Create Mock Test submission
  async function handleCreateTest(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setFormFeedback(null);

    const subjectToUse = createSubject === "__custom__" ? customSubject.trim() : createSubject;
    if (!createTitle.trim() || !subjectToUse) {
      setFormFeedback({ type: "error", message: "Test title and subject are required." });
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await fetch("/api/admin/mock-tests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: createTitle.trim(),
          examName: createExam,
          trackSlug: createTrack,
          subjectName: subjectToUse,
          testType: createType,
          questionCount: Number(createQuestionsCount) || 150,
          durationMinutes: Number(createDuration) || 150,
          totalMarks: Number(createQuestionsCount) || 150,
          access: createAccess,
          status: createStatus,
          description: createDescription.trim() || undefined,
          bannerImageUrl: createBannerImageUrl.trim() || undefined,
          questionIds: selectedInitialQuestions,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create mock test.");
      }

      const newTest = data.test as MockTest;
      setTests((prev) => [newTest, ...prev]);
      if (onTestCreated) onTestCreated(newTest);

      setFormFeedback({
        type: "success",
        message: `Successfully created "${newTest.name}"! It is now ${newTest.status.toLowerCase()} and visible on the frontend.`,
      });

      // Reset form
      setCreateTitle("");
      setCreateDescription("");
      setCreateBannerImageUrl("");
      setSelectedInitialQuestions([]);
      setSubTab("catalog");
    } catch (err) {
      setFormFeedback({
        type: "error",
        message: err instanceof Error ? err.message : "An error occurred while creating the test.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mock-test-manager">
      {/* Sub Navigation */}
      <div className="test-mgr-subnav">
        <button
          type="button"
          className={`test-mgr-tab ${subTab === "catalog" ? "active" : ""}`}
          onClick={() => setSubTab("catalog")}
        >
          <span>📚 All Mock Tests</span>
          <span className="test-mgr-badge">{tests.length}</span>
        </button>

        <button
          type="button"
          className={`test-mgr-tab ${subTab === "create" ? "active" : ""}`}
          onClick={() => setSubTab("create")}
        >
          <span>+ Create New Mock Test</span>
        </button>

        <button
          type="button"
          className={`test-mgr-tab ${subTab === "demands" ? "active" : ""}`}
          onClick={() => setSubTab("demands")}
        >
          <span>🔥 Learner Demands</span>
          <span className="test-mgr-badge highlight">
            {requests.reduce((acc, r) => acc + r.requestCount, 0)} votes
          </span>
        </button>
      </div>

      {/* SUB-TAB 1: CATALOG OF MOCK TESTS */}
      {subTab === "catalog" && (
        <div className="test-catalog-view">
          {/* Filter Bar */}
          <div className="test-filter-bar">
            <div className="filter-group">
              <label>Exam:</label>
              <select value={examFilter} onChange={(e) => setExamFilter(e.target.value)} className="admin-filter-select">
                <option value="All">All Exams</option>
                <option value="BPSC TRE 4.0">BPSC TRE 4.0</option>
                <option value="Bihar STET">Bihar STET</option>
                <option value="CTET">CTET</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Class Track:</label>
              <select value={trackFilter} onChange={(e) => setTrackFilter(e.target.value)} className="admin-filter-select">
                <option value="All">All Tracks</option>
                <option value="primary-1-5">Primary (1–5)</option>
                <option value="middle-6-8">Middle (6–8)</option>
                <option value="secondary-9-10">Secondary (9–10)</option>
                <option value="higher-secondary-11-12">Higher Sec (11–12)</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Status:</label>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="admin-filter-select">
                <option value="All">All Statuses</option>
                <option value="Published">Published (Live)</option>
                <option value="Draft">Draft</option>
              </select>
            </div>

            <div className="filter-group filter-search-group">
              <label>Search:</label>
              <div className="search-input-wrap">
                <span className="search-icon">🔍</span>
                <input
                  type="text"
                  placeholder="Search by test name, subject, or exam..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="filter-search-input"
                />
                {searchFilter && (
                  <button type="button" className="search-clear-btn" onClick={() => setSearchFilter("")}>
                    ✕
                  </button>
                )}
              </div>
            </div>

            <button
              type="button"
              className="btn-create-shortcut"
              onClick={() => setSubTab("create")}
            >
              + Create Mock Test
            </button>
          </div>

          {filteredTests.length === 0 ? (
            <div className="test-empty-state">
              <p>No mock tests match the selected filters.</p>
              <button
                type="button"
                className="btn-primary-small"
                onClick={() => setSubTab("create")}
              >
                Create the first mock test now
              </button>
            </div>
          ) : (
            <div className="test-cards-grid">
              {filteredTests.map((test) => (
                <div className="admin-test-card" key={test.id}>
                  {/* Banner Image Preview / Indicator */}
                  {test.bannerImageUrl ? (
                    <div className="admin-test-card-banner">
                      <img src={test.bannerImageUrl} alt={test.name} className="admin-banner-img" />
                      <div className="admin-banner-badge-overlay">
                        <span className="badge-custom-img">🖼 Custom Banner</span>
                      </div>
                    </div>
                  ) : (
                    <div className="admin-test-card-banner-placeholder">
                      <span>🎨 Default Theme Banner</span>
                    </div>
                  )}

                  <div className="admin-test-card-body">
                    <div className="admin-test-card-header">
                      <span className="admin-test-kicker">
                        {test.examName} · {test.trackSlug}
                      </span>
                      <div className="admin-test-pills">
                        <span className={`status-pill ${test.status.toLowerCase()}`}>
                          {test.status}
                        </span>
                        <span className={`access-pill ${test.access.toLowerCase()}`}>
                          {test.access === "Free" ? "Free" : "👑 VIP"}
                        </span>
                      </div>
                    </div>

                    <h3 className="admin-test-title">{test.name}</h3>
                    <div className="admin-test-subject">
                      <strong>Subject:</strong> {test.subjectName}
                    </div>

                    <div className="admin-test-specs">
                      <span>⏱ {test.durationMinutes} mins</span>
                      <span>📝 {test.questionCount} target Qs</span>
                      <span className="linked-count-chip">
                        🔗 <strong>{test.linkedQuestionsCount}</strong> linked in DB
                      </span>
                    </div>

                    {test.description && (
                      <p className="admin-test-desc">{test.description}</p>
                    )}

                    {/* UNIFIED ACTIONS: Edit Test & Questions + Status Toggle + Delete */}
                    <div className="admin-test-actions">
                      <button
                        type="button"
                        className="btn-edit-mock-test"
                        onClick={() => handleOpenEdit(test)}
                      >
                        ✏️ Edit Mock Test & Questions
                      </button>

                      <button
                        type="button"
                        className={`btn-toggle-status ${test.status === "Published" ? "live" : "draft"}`}
                        onClick={() => handleStatusToggle(test.id, test.status)}
                      >
                        {test.status === "Published" ? "Unpublish (Draft)" : "Publish (Make Live)"}
                      </button>

                      <button
                        type="button"
                        className="btn-delete-test"
                        onClick={() => handleDeleteTest(test.id)}
                        title="Delete test"
                      >
                        🗑
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 2: CREATE NEW MOCK TEST */}
      {subTab === "create" && (
        <form className="test-create-form" onSubmit={handleCreateTest}>
          <div className="form-section-title">
            <h3>Configure New Mock Test Details</h3>
            <p>Every mock test created here is dynamically published to the student syllabus tracks.</p>
          </div>

          <div className="form-grid-row">
            <div className="form-field">
              <label>Target Exam *</label>
              <select
                value={createExam}
                onChange={(e) => {
                  setCreateExam(e.target.value);
                  const newExamSlug = e.target.value === "BPSC TRE 4.0" ? "bpsc-tre-4" : e.target.value === "Bihar STET" ? "bihar-stet" : "ctet";
                  const tracks = syllabusTracks[newExamSlug] ?? [];
                  if (tracks[0]) setCreateTrack(tracks[0].slug);
                }}
              >
                <option value="BPSC TRE 4.0">BPSC TRE 4.0</option>
                <option value="Bihar STET">Bihar STET</option>
                <option value="CTET">CTET</option>
              </select>
            </div>

            <div className="form-field">
              <label>Class Level / Track *</label>
              <select
                value={createTrack}
                onChange={(e) => {
                  setCreateTrack(e.target.value);
                  const trackObj = tracksForSelectedExam.find((t) => t.slug === e.target.value);
                  if (trackObj?.subjects[0]) setCreateSubject(trackObj.subjects[0].name);
                }}
              >
                {tracksForSelectedExam.map((t) => (
                  <option value={t.slug} key={t.slug}>
                    {t.audience} - {t.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label>Subject *</label>
              <select
                value={createSubject}
                onChange={(e) => setCreateSubject(e.target.value)}
              >
                {subjectsForActiveTrack.map((s) => (
                  <option value={s.name} key={s.name}>
                    {s.name}
                  </option>
                ))}
                <option value="__custom__">+ Custom Subject Name...</option>
              </select>
            </div>

            {createSubject === "__custom__" && (
              <div className="form-field">
                <label>Custom Subject Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Sanskrit, Fine Arts, Music..."
                  value={customSubject}
                  onChange={(e) => setCustomSubject(e.target.value)}
                  required
                />
              </div>
            )}
          </div>

          <div className="form-grid-row">
            <div className="form-field form-field-wide">
              <label>Test Title *</label>
              <input
                type="text"
                placeholder="e.g. Language: Full Mock 01, Mathematics Special Drill..."
                value={createTitle}
                onChange={(e) => setCreateTitle(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-grid-row">
            <div className="form-field">
              <label>Test Type</label>
              <select value={createType} onChange={(e) => setCreateType(e.target.value)}>
                <option value="Full mock">Full Mock Test</option>
                <option value="Subject test">Subject Practice Test</option>
                <option value="Sectional drill">Sectional Drill</option>
                <option value="Chapter test">Chapter Test</option>
              </select>
            </div>

            <div className="form-field">
              <label>Duration (Minutes) *</label>
              <input
                type="number"
                value={createDuration}
                onChange={(e) => setCreateDuration(e.target.value)}
                min={5}
                max={300}
                required
              />
            </div>

            <div className="form-field">
              <label>Target Question Count *</label>
              <input
                type="number"
                value={createQuestionsCount}
                onChange={(e) => setCreateQuestionsCount(e.target.value)}
                min={5}
                max={300}
                required
              />
            </div>

            <div className="form-field">
              <label>Access Tier</label>
              <select value={createAccess} onChange={(e) => setCreateAccess(e.target.value as any)}>
                <option value="Free">Free for all learners</option>
                <option value="Premium">👑 VIP Pass required</option>
              </select>
            </div>

            <div className="form-field">
              <label>Initial Status</label>
              <select value={createStatus} onChange={(e) => setCreateStatus(e.target.value as any)}>
                <option value="Published">Published (Live to Students)</option>
                <option value="Draft">Draft (Admin Only)</option>
              </select>
            </div>
          </div>

          {/* Banner Image URL Option */}
          <div className="form-grid-row">
            <div className="form-field form-field-wide">
              <label>Banner Image URL (Optional)</label>
              <input
                type="url"
                placeholder="https://example.com/banner.jpg (Leave empty to use dynamic default theme banner)"
                value={createBannerImageUrl}
                onChange={(e) => setCreateBannerImageUrl(e.target.value)}
              />
              <small style={{ color: "#7a8e88", marginTop: "4px", display: "block" }}>
                💡 If left blank, the frontend will automatically display the aesthetic default theme banner design.
              </small>
            </div>
          </div>

          <div className="form-field form-field-wide">
            <label>Test Description / Instructions</label>
            <textarea
              rows={3}
              placeholder="Instructions for students taking this test series..."
              value={createDescription}
              onChange={(e) => setCreateDescription(e.target.value)}
            />
          </div>

          {formFeedback && (
            <div className={`form-feedback-box ${formFeedback.type}`}>
              {formFeedback.type === "success" ? "✓" : "⚠️"} {formFeedback.message}
            </div>
          )}

          <div className="form-actions-row">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setSubTab("catalog")}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating Mock Test..." : "✓ Create & Publish Mock Test"}
            </button>
          </div>
        </form>
      )}

      {/* SUB-TAB 3: LEARNER DEMANDS */}
      {subTab === "demands" && (
        <div className="test-demands-view">
          <div className="demands-header">
            <div>
              <h3>Student Demand & Mock Test Requests</h3>
              <p>Ranked live by the number of students who clicked "Raise a Request" on the exam syllabus page.</p>
            </div>
          </div>

          {requests.length === 0 ? (
            <div className="test-empty-state">
              <p>No student demand requests logged yet.</p>
            </div>
          ) : (
            <div className="demands-table-wrap">
              <table className="demands-table">
                <thead>
                  <tr>
                    <th>Exam Series</th>
                    <th>Class Track</th>
                    <th>Subject Requested</th>
                    <th>Student Votes</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {requests
                    .sort((a, b) => b.requestCount - a.requestCount)
                    .map((req) => (
                      <tr key={`${req.examSlug}-${req.trackSlug}-${req.subjectName}`}>
                        <td>
                          <strong>{req.examSlug.toUpperCase()}</strong>
                        </td>
                        <td>{req.trackSlug}</td>
                        <td>
                          <span className="demand-subject-chip">{req.subjectName}</span>
                        </td>
                        <td>
                          <strong className="demand-votes-count">🔥 {req.requestCount}</strong>
                        </td>
                        <td>
                          <button
                            type="button"
                            className="btn-fulfill-demand"
                            onClick={() => handleFulfillDemand(req)}
                          >
                            + Build Mock Test
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          UNIFIED EDIT MOCK TEST & QUESTIONS MODAL STUDIO
          ========================================================================= */}
      {editingTest && (
        <div
          className="admin-modal-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) setEditingTest(null);
          }}
        >
          <div className="admin-edit-test-modal" role="dialog" aria-modal="true">
            {/* Modal Header */}
            <div className="edit-modal-header">
              <div className="edit-modal-title-wrap">
                <span className="edit-modal-kicker">
                  EDIT MOCK TEST #{editingTest.id} · {editingTest.examName}
                </span>
                <h3 className="edit-modal-heading">{editTitle || editingTest.name}</h3>
              </div>

              <div className="edit-modal-tabs">
                <button
                  type="button"
                  className={`edit-tab-btn ${editTab === "details" ? "active" : ""}`}
                  onClick={() => setEditTab("details")}
                >
                  ⚙️ General Info & Banner
                </button>
                <button
                  type="button"
                  className={`edit-tab-btn ${editTab === "questions" ? "active" : ""}`}
                  onClick={() => setEditTab("questions")}
                >
                  📋 Manage Linked Questions ({linkedQuestions.length})
                </button>
              </div>

              <button
                type="button"
                className="edit-modal-close"
                onClick={() => setEditingTest(null)}
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="edit-modal-body">
              {editFeedback && (
                <div className={`form-feedback-box ${editFeedback.type}`} style={{ marginBottom: "16px" }}>
                  {editFeedback.type === "success" ? "✓" : "⚠️"} {editFeedback.message}
                </div>
              )}

              {/* TAB A: GENERAL DETAILS & BANNER IMAGE */}
              {editTab === "details" && (
                <form className="edit-test-details-form" onSubmit={handleSaveEditTest}>
                  <div className="form-field form-field-full">
                    <label>Mock Test Title *</label>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      placeholder="e.g. BPSC TRE 4.0 Mathematics (80 Marks)"
                      required
                      className="admin-form-input title-input"
                    />
                  </div>

                  <div className="form-grid-3col">
                    <div className="form-field">
                      <label>Target Exam *</label>
                      <select
                        value={editExam}
                        className="admin-form-select"
                        onChange={(e) => {
                          setEditExam(e.target.value);
                          const newSlug = e.target.value === "BPSC TRE 4.0" ? "bpsc-tre-4" : e.target.value === "Bihar STET" ? "bihar-stet" : "ctet";
                          const tracks = syllabusTracks[newSlug] ?? [];
                          if (tracks[0]) setEditTrack(tracks[0].slug);
                        }}
                      >
                        <option value="BPSC TRE 4.0">BPSC TRE 4.0</option>
                        <option value="Bihar STET">Bihar STET</option>
                        <option value="CTET">CTET</option>
                      </select>
                    </div>

                    <div className="form-field">
                      <label>Class Level / Track *</label>
                      <select
                        value={editTrack}
                        className="admin-form-select"
                        onChange={(e) => {
                          setEditTrack(e.target.value);
                          const trackObj = tracksForEditExam.find((t) => t.slug === e.target.value);
                          if (trackObj?.subjects[0]) setEditSubject(trackObj.subjects[0].name);
                        }}
                      >
                        {tracksForEditExam.map((t) => (
                          <option value={t.slug} key={t.slug}>
                            {t.audience} - {t.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-field">
                      <label>Subject *</label>
                      <select
                        value={editSubject}
                        className="admin-form-select"
                        onChange={(e) => setEditSubject(e.target.value)}
                      >
                        {subjectsForEditTrack.map((s) => (
                          <option value={s.name} key={s.name}>
                            {s.name}
                          </option>
                        ))}
                        <option value="__custom__">+ Custom Subject...</option>
                      </select>
                    </div>
                  </div>

                  {editSubject === "__custom__" && (
                    <div className="form-field form-field-full custom-subject-field">
                      <label>Custom Subject Name *</label>
                      <input
                        type="text"
                        value={editCustomSubject}
                        onChange={(e) => setEditCustomSubject(e.target.value)}
                        placeholder="Enter custom subject..."
                        required
                        className="admin-form-input"
                      />
                    </div>
                  )}

                  <div className="form-grid-3col">
                    <div className="form-field">
                      <label>Test Type</label>
                      <select value={editType} className="admin-form-select" onChange={(e) => setEditType(e.target.value)}>
                        <option value="Full mock">Full Mock Test</option>
                        <option value="Subject test">Subject Practice Test</option>
                        <option value="Sectional drill">Sectional Drill</option>
                        <option value="Chapter test">Chapter Test</option>
                      </select>
                    </div>

                    <div className="form-field">
                      <label>Duration (Minutes) *</label>
                      <input
                        type="number"
                        value={editDuration}
                        onChange={(e) => setEditDuration(e.target.value)}
                        min={5}
                        max={300}
                        required
                        className="admin-form-input"
                      />
                    </div>

                    <div className="form-field">
                      <label>Target Question Count *</label>
                      <input
                        type="number"
                        value={editQuestionsCount}
                        onChange={(e) => setEditQuestionsCount(e.target.value)}
                        min={5}
                        max={300}
                        required
                        className="admin-form-input"
                      />
                    </div>
                  </div>

                  <div className="form-grid-3col">
                    <div className="form-field">
                      <label>Total Marks *</label>
                      <input
                        type="number"
                        value={editTotalMarks}
                        onChange={(e) => setEditTotalMarks(e.target.value)}
                        min={1}
                        max={500}
                        required
                        className="admin-form-input"
                      />
                    </div>

                    <div className="form-field">
                      <label>Access Tier</label>
                      <select value={editAccess} className="admin-form-select" onChange={(e) => setEditAccess(e.target.value as any)}>
                        <option value="Free">Free for all learners</option>
                        <option value="Premium">👑 VIP Pass required</option>
                      </select>
                    </div>

                    <div className="form-field">
                      <label>Publish Status</label>
                      <select value={editStatus} className="admin-form-select" onChange={(e) => setEditStatus(e.target.value as any)}>
                        <option value="Published">Published (Live to Students)</option>
                        <option value="Draft">Draft (Admin Only)</option>
                        <option value="Archived">Archived</option>
                      </select>
                    </div>
                  </div>

                  {/* Banner Image Setting & Live Preview Box */}
                  <div className="banner-config-section">
                    <div className="banner-config-inputs">
                      <label className="banner-setting-title">🖼️ Card Banner Image</label>
                      <p className="field-hint">
                        Provide a direct image URL for the mock test banner. If left blank, the frontend will automatically render the sleek default theme banner.
                      </p>
                      <div className="banner-input-row">
                        <input
                          type="url"
                          placeholder="https://images.unsplash.com/... or /images/banner.jpg"
                          value={editBannerImageUrl}
                          onChange={(e) => setEditBannerImageUrl(e.target.value)}
                          className="admin-form-input"
                          style={{ flex: 1 }}
                        />
                        {editBannerImageUrl && (
                          <button
                            type="button"
                            className="btn-clear-banner"
                            onClick={() => setEditBannerImageUrl("")}
                          >
                            ✕ Remove
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Live Banner Preview */}
                    <div className="banner-live-preview-box">
                      <span className="preview-label">LIVE BANNER PREVIEW (ON CARDS & TEST EXPLORER)</span>
                      {editBannerImageUrl ? (
                        <div className="preview-banner-custom">
                          <img
                            src={editBannerImageUrl}
                            alt="Banner Preview"
                            className="preview-custom-img"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=80";
                            }}
                          />
                          <div className="preview-overlay">
                            <span className="preview-subject-pill">{editSubject}</span>
                            <span className="preview-access-pill">{editAccess === "Free" ? "FREE" : "👑 VIP PASS"}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="preview-banner-default">
                          <div className="preview-default-top">
                            <span className="preview-subject-pill">{editSubject}</span>
                            <span className="preview-access-pill">{editAccess === "Free" ? "FREE" : "👑 VIP PASS"}</span>
                          </div>
                          <div className="preview-default-center">
                            <span className="preview-default-icon">🎨</span>
                            <small>Default theme banner design active</small>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="form-field form-field-full" style={{ marginTop: "8px" }}>
                    <label>Description / Syllabus Coverage</label>
                    <textarea
                      rows={3}
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      placeholder="Enter coverage notes, exam pattern hints, or test instructions..."
                      className="admin-form-textarea"
                    />
                  </div>

                  <div className="edit-modal-actions-footer">
                    <button
                      type="button"
                      className="btn-modal-cancel"
                      onClick={() => setEditingTest(null)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn-modal-save"
                      disabled={isSavingEdit}
                    >
                      {isSavingEdit ? "Saving Changes..." : "💾 Save Test Details & Banner"}
                    </button>
                  </div>
                </form>
              )}

              {/* TAB B: MANAGE LINKED QUESTIONS (Moved inside Edit!) */}
              {editTab === "questions" && (
                <div className="edit-questions-workspace">
                  {/* Summary Bar */}
                  <div className="linked-questions-summary-bar">
                    <div>
                      <h4>Questions in "{editingTest.name}"</h4>
                      <p>
                        Currently <strong>{linkedQuestions.length}</strong> questions linked out of{" "}
                        <strong>{editingTest.questionCount}</strong> target questions.
                      </p>
                    </div>

                    <div className="questions-progress-pill">
                      <span>
                        {Math.round((linkedQuestions.length / (editingTest.questionCount || 1)) * 100)}% Complete
                      </span>
                    </div>
                  </div>

                  {/* Two Column Layout: Currently Linked vs Question Bank Linker */}
                  <div className="linked-questions-grid-layout">
                    {/* LEFT COL: CURRENTLY LINKED QUESTIONS */}
                    <div className="linked-col-current">
                      <div className="col-header-row">
                        <h5>Linked Questions ({linkedQuestions.length})</h5>
                      </div>

                      {isLoadingLinked ? (
                        <div className="loading-state-box">Loading linked questions...</div>
                      ) : linkedQuestions.length === 0 ? (
                        <div className="empty-state-box">
                          <p>No questions linked to this test yet.</p>
                          <small>Use the question explorer on the right to search and link questions.</small>
                        </div>
                      ) : (
                        <div className="linked-items-scrollable">
                          {linkedQuestions.map((q, idx) => (
                            <div className="linked-item-row" key={q.id}>
                              <span className="linked-item-idx">#{idx + 1}</span>
                              <div className="linked-item-body">
                                <p className="linked-item-stem">{q.stem}</p>
                                <div className="linked-item-meta">
                                  <span className="q-tag">{q.subject}</span>
                                  {q.topic && <span className="q-tag topic">{q.topic}</span>}
                                  <span className={`diff-tag ${q.difficulty}`}>{q.difficulty}</span>
                                </div>
                              </div>
                              <button
                                type="button"
                                className="btn-unlink-q"
                                onClick={() => handleUnlinkQuestion(q.id)}
                                title="Remove from this test"
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* RIGHT COL: QUESTION BANK EXPLORER & LINKER */}
                    <div className="linked-col-bank">
                      <div className="col-header-row">
                        <h5>Question Bank Explorer</h5>
                        {availableToLink.length > 0 && (
                          <button
                            type="button"
                            className="btn-batch-link"
                            disabled={isBatchLinking}
                            onClick={handleLinkAllFiltered}
                          >
                            {isBatchLinking ? "Linking..." : `+ Link All Filtered (${availableToLink.length})`}
                          </button>
                        )}
                      </div>

                      {/* 3-Tier Dynamic Filters */}
                      <div className="drawer-filters-row">
                        <select value={drawerQExam} onChange={(e) => setDrawerQExam(e.target.value)}>
                          <option value="All">All Exams</option>
                          <option value="BPSC TRE 4.0">BPSC TRE 4.0</option>
                          <option value="Bihar STET">Bihar STET</option>
                          <option value="CTET">CTET</option>
                        </select>

                        <select value={drawerQSubject} onChange={(e) => setDrawerQSubject(e.target.value)}>
                          <option value="All">All Subjects</option>
                          {dynamicDrawerSubjects.map((s) => (
                            <option value={s} key={s}>{s}</option>
                          ))}
                        </select>

                        <select value={drawerQTopic} onChange={(e) => setDrawerQTopic(e.target.value)}>
                          <option value="All">All Topics</option>
                          {dynamicDrawerTopics.map((t) => (
                            <option value={t} key={t}>{t}</option>
                          ))}
                        </select>
                      </div>

                      <div className="drawer-search-wrap">
                        <input
                          type="text"
                          placeholder="Search questions by keyword or topic..."
                          value={questionSearch}
                          onChange={(e) => setQuestionSearch(e.target.value)}
                        />
                      </div>

                      <div className="available-items-scrollable">
                        {availableToLink.length === 0 ? (
                          <div className="empty-state-box">
                            <p>No unlinked questions match the filter criteria.</p>
                          </div>
                        ) : (
                          availableToLink.map((q) => (
                            <div className="available-item-row" key={q.id}>
                              <div className="available-item-body">
                                <p className="available-item-stem">{q.stem}</p>
                                <div className="available-item-meta">
                                  <span className="q-tag">{q.subject}</span>
                                  {q.topic && <span className="q-tag topic">{q.topic}</span>}
                                  <span className={`diff-tag ${q.difficulty}`}>{q.difficulty}</span>
                                </div>
                              </div>
                              <button
                                type="button"
                                className="btn-link-q"
                                disabled={linkingQId === q.id}
                                onClick={() => handleLinkQuestion(q.id)}
                              >
                                {linkingQId === q.id ? "..." : "+ Link"}
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="edit-modal-actions-footer" style={{ marginTop: "20px" }}>
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => setEditingTest(null)}
                    >
                      Done / Close
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
