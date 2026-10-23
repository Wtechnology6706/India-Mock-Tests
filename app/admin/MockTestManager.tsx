"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import type { MockTest, SubjectDemandRequest } from "../../lib/admin-content";
import type { AdminQuestion } from "../../lib/phase1";
import { syllabusTracks, formatTestType } from "../../lib/syllabus";

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
  const [subTab, setSubTab] = useState<"catalog" | "create" | "demands" | "ai-generator">("catalog");

  // AI Question Generator State
  const [aiExam, setAiExam] = useState("BPSC TRE 4.0");
  const [aiSubject, setAiSubject] = useState("General Studies");
  const [aiTopic, setAiTopic] = useState("Modern Indian History & Bihar 1857 Revolt");
  const [aiCount, setAiCount] = useState("5");
  const [aiOptionCount, setAiOptionCount] = useState<"4" | "5">("5");
  const [aiDifficulty, setAiDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [aiLanguage, setAiLanguage] = useState<"bilingual" | "english" | "hindi">("bilingual");
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [generatedAiQuestions, setGeneratedAiQuestions] = useState<any[]>([]);
  const [selectedAiIndices, setSelectedAiIndices] = useState<Set<number>>(new Set());
  const [aiTargetTestSlug, setAiTargetTestSlug] = useState("");
  const [isImportingAi, setIsImportingAi] = useState(false);
  const [aiImportFeedback, setAiImportFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

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
  const [createBannerPreviewUrl, setCreateBannerPreviewUrl] = useState("");
  const [isUploadingCreateBanner, setIsUploadingCreateBanner] = useState(false);
  const [createUploadFeedback, setCreateUploadFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const createFileInputRef = useRef<HTMLInputElement>(null);

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
  const [editBannerPreviewUrl, setEditBannerPreviewUrl] = useState("");
  const [isUploadingEditBanner, setIsUploadingEditBanner] = useState(false);
  const [editUploadFeedback, setEditUploadFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

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
  const currentExamSlug = (createExam || "").toLowerCase().includes("bpsc") || (createExam || "").toLowerCase().includes("tre")
    ? "bpsc-tre-4"
    : (createExam || "").toLowerCase().includes("stet") || (createExam || "").toLowerCase().includes("bihar")
    ? "bihar-stet"
    : "ctet";
  const tracksForSelectedExam = syllabusTracks[currentExamSlug] ?? [];
  const activeTrackObj = tracksForSelectedExam.find((t) => t.slug === createTrack) || tracksForSelectedExam[0];
  const subjectsForActiveTrack = activeTrackObj?.subjects ?? [];

  // Tracks for edit exam
  const editExamSlug = (editExam || "").toLowerCase().includes("bpsc") || (editExam || "").toLowerCase().includes("tre")
    ? "bpsc-tre-4"
    : (editExam || "").toLowerCase().includes("stet") || (editExam || "").toLowerCase().includes("bihar")
    ? "bihar-stet"
    : "ctet";
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
    setEditTitle(test.name || "");
    const rawExam = test.examName || "BPSC TRE 4.0";
    const normExam = rawExam.toLowerCase().includes("bpsc") || rawExam.toLowerCase().includes("tre")
      ? "BPSC TRE 4.0"
      : rawExam.toLowerCase().includes("stet") || rawExam.toLowerCase().includes("bihar")
      ? "Bihar STET"
      : rawExam.toLowerCase().includes("ctet")
      ? "CTET"
      : rawExam;
    setEditExam(normExam);
    setEditTrack(test.trackSlug || "primary-1-5");
    setEditSubject(test.subjectName || "General Studies");
    setEditCustomSubject("");
    setEditType(formatTestType(test.testType));
    setEditDuration(String(test.durationMinutes || 150));
    setEditQuestionsCount(String(test.questionCount || 150));
    setEditTotalMarks(String(test.totalMarks ?? test.questionCount ?? 150));
    setEditAccess(test.access === "Premium" ? "Premium" : "Free");
    setEditStatus(test.status === "Published" ? "Published" : test.status === "Archived" ? "Archived" : "Draft");
    setEditDescription(test.description || "");
    setEditBannerImageUrl(test.bannerImageUrl || "");
    setEditBannerPreviewUrl("");
    setEditFeedback(null);
    setEditUploadFeedback(null);

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

  // Handle Banner Image File Upload
  async function handleBannerUpload(file: File, isEdit: boolean) {
    const testName = isEdit ? (editTitle.trim() || editingTest?.name || "mock-test") : (createTitle.trim() || "mock-test");

    // Create instant local blob preview
    try {
      const localBlob = URL.createObjectURL(file);
      if (isEdit) {
        setEditBannerPreviewUrl(localBlob);
      } else {
        setCreateBannerPreviewUrl(localBlob);
      }
    } catch { }

    if (isEdit) {
      setIsUploadingEditBanner(true);
      setEditUploadFeedback(null);
    } else {
      setIsUploadingCreateBanner(true);
      setCreateUploadFeedback(null);
    }

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("testName", testName);

      const res = await fetch("/api/admin/upload-banner", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to upload banner image.");
      }

      if (isEdit) {
        setEditBannerImageUrl(data.url);
        setEditUploadFeedback({ type: "success", message: `Uploaded and saved as: ${data.filename}` });
      } else {
        setCreateBannerImageUrl(data.url);
        setCreateUploadFeedback({ type: "success", message: `Uploaded and saved as: ${data.filename}` });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error uploading file";
      if (isEdit) {
        setEditUploadFeedback({ type: "error", message: msg });
      } else {
        setCreateUploadFeedback({ type: "error", message: msg });
      }
    } finally {
      if (isEdit) {
        setIsUploadingEditBanner(false);
      } else {
        setIsUploadingCreateBanner(false);
      }
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
        const qRes = await fetch(`/api/admin/mock-tests/${editingTest.id}/questions`);
        const qData = await qRes.json();
        const updatedList = qData.questions || [];
        setLinkedQuestions(updatedList);
        setTests((prev) =>
          prev.map((t) =>
            t.id === editingTest.id
              ? { ...t, linkedQuestionsCount: updatedList.length }
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
        const qRes = await fetch(`/api/admin/mock-tests/${editingTest.id}/questions`);
        const qData = await qRes.json();
        const updatedList = qData.questions || [];
        setLinkedQuestions(updatedList);
        setTests((prev) =>
          prev.map((t) =>
            t.id === editingTest.id
              ? { ...t, linkedQuestionsCount: updatedList.length }
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
        const qRes = await fetch(`/api/admin/mock-tests/${editingTest.id}/questions`);
        const qData = await qRes.json();
        const updatedList = qData.questions || [];
        setLinkedQuestions(updatedList);
        setTests((prev) =>
          prev.map((t) =>
            t.id === editingTest.id
              ? { ...t, linkedQuestionsCount: updatedList.length }
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

  // Handle AI Question Generation
  async function handleGenerateAiQuestions(e: React.FormEvent) {
    e.preventDefault();
    setIsGeneratingAi(true);
    setAiImportFeedback(null);
    try {
      const res = await fetch("/api/ai/generate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exam: aiExam,
          subject: aiSubject,
          topic: aiTopic,
          count: Number(aiCount) || 5,
          optionCount: Number(aiOptionCount) || 5,
          difficulty: aiDifficulty,
          language: aiLanguage,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to generate questions with AI.");
      }

      const questions = data.questions || [];
      if (questions.length === 0) {
        throw new Error("No questions returned by AI. Please adjust the topic or try again.");
      }

      setGeneratedAiQuestions(questions);
      setSelectedAiIndices(new Set(questions.map((_: any, idx: number) => idx)));
      setAiImportFeedback({
        type: "success",
        message: `Successfully generated ${questions.length} authentic questions using Google Gemini AI for ${aiExam} (${aiSubject})! Review and import below.`,
      });
    } catch (err) {
      setAiImportFeedback({
        type: "error",
        message: err instanceof Error ? err.message : "Failed to generate AI questions.",
      });
    } finally {
      setIsGeneratingAi(false);
    }
  }

  // Handle AI Questions Bulk Import into Question Bank and optionally a Mock Test
  async function handleImportAiQuestions() {
    if (selectedAiIndices.size === 0) {
      alert("Please select at least one question to import.");
      return;
    }
    setIsImportingAi(true);
    setAiImportFeedback(null);
    try {
      const toImport = generatedAiQuestions.filter((_, idx) => selectedAiIndices.has(idx));
      const res = await fetch("/api/admin/questions/ai-import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questions: toImport,
          targetTestSlug: aiTargetTestSlug || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to import questions.");
      }

      setAiImportFeedback({
        type: "success",
        message: data.message || `Successfully imported ${data.importedCount} questions into the question bank!`,
      });
      // Clear imported questions
      setGeneratedAiQuestions([]);
      setSelectedAiIndices(new Set());
    } catch (err) {
      setAiImportFeedback({
        type: "error",
        message: err instanceof Error ? err.message : "Failed to import questions.",
      });
    } finally {
      setIsImportingAi(false);
    }
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

        <button
          type="button"
          className={`test-mgr-tab ${subTab === "ai-generator" ? "active" : ""}`}
          onClick={() => setSubTab("ai-generator")}
          style={
            subTab === "ai-generator"
              ? {
                  background: "linear-gradient(135deg, #4338ca 0%, #6366f1 100%)",
                  color: "#ffffff",
                  borderColor: "#4f46e5",
                }
              : {
                  borderColor: "#c7d2fe",
                  color: "#4338ca",
                }
          }
        >
          <span>🤖 AI Bulk Question Generator</span>
          <span
            className="test-mgr-badge"
            style={{
              background: subTab === "ai-generator" ? "rgba(255,255,255,0.25)" : "#e0e7ff",
              color: subTab === "ai-generator" ? "#ffffff" : "#4338ca",
              fontWeight: 700,
            }}
          >
            Gemini
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
                        <span className="type-pill">{test.testType}</span>
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
                        🗑️
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
                  const ex = e.target.value.toLowerCase();
                  const newExamSlug = ex.includes("bpsc") || ex.includes("tre") ? "bpsc-tre-4" : ex.includes("stet") || ex.includes("bihar") ? "bihar-stet" : "ctet";
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
                <option value="Previous Year Paper">Previous Year Paper</option>
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

          {/* Banner Image Upload & Live Preview Section */}
          <div className="banner-config-section">
            <div className="banner-config-inputs">
              <label className="banner-setting-title">🖼️ Card Banner Image</label>
              <p className="field-hint">
                Upload a high-quality banner from your device or specify an image URL. Images are automatically named per mock test title and stored in uploads.
              </p>

              {/* Upload Dropzone */}
              <input
                type="file"
                ref={createFileInputRef}
                style={{ display: "none" }}
                accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml,image/avif"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleBannerUpload(file, false);
                    e.target.value = "";
                  }
                }}
              />

              <div
                className={`banner-upload-dropzone ${isUploadingCreateBanner ? "is-uploading" : ""}`}
                onClick={() => !isUploadingCreateBanner && createFileInputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const file = e.dataTransfer.files?.[0];
                  if (file && file.type.startsWith("image/")) {
                    handleBannerUpload(file, false);
                  }
                }}
              >
                <div className="banner-upload-icon">{isUploadingCreateBanner ? "⏳" : "📁"}</div>
                <div className="banner-upload-label">
                  {isUploadingCreateBanner ? "Uploading banner image..." : "Click to Browse or Drag Image from Local Device"}
                </div>
                <div className="banner-upload-subtext">Supports PNG, JPG, WEBP, SVG, GIF (Max 10MB)</div>
              </div>

              {createUploadFeedback && (
                <div className={`banner-upload-status ${createUploadFeedback.type}`}>
                  {createUploadFeedback.type === "success" ? "✓" : "⚠️"} {createUploadFeedback.message}
                </div>
              )}

              <div className="banner-or-divider">OR SPECIFY DIRECT URL / PATH</div>

              <div className="banner-input-row">
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/... or /uploads/banners/image.jpg"
                  value={createBannerImageUrl}
                  onChange={(e) => {
                    setCreateBannerImageUrl(e.target.value);
                    setCreateBannerPreviewUrl("");
                  }}
                  className="admin-form-input"
                  style={{ flex: 1 }}
                />
                {(createBannerImageUrl || createBannerPreviewUrl) && (
                  <button
                    type="button"
                    className="btn-clear-banner"
                    onClick={() => {
                      setCreateBannerImageUrl("");
                      setCreateBannerPreviewUrl("");
                      setCreateUploadFeedback(null);
                    }}
                  >
                    ✕ Remove
                  </button>
                )}
              </div>
            </div>

            {/* Live Banner Preview */}
            <div className="banner-live-preview-box">
              <span className="preview-label">LIVE BANNER PREVIEW (ON CARDS & TEST EXPLORER)</span>
              {(createBannerPreviewUrl || createBannerImageUrl) ? (
                <div className="preview-banner-custom">
                  <img
                    src={createBannerPreviewUrl || createBannerImageUrl}
                    alt="Banner Preview"
                    className="preview-custom-img"
                  />
                  <div className="preview-overlay">
                    <span className="preview-subject-pill">{createSubject}</span>
                    <span className="preview-access-pill">{createAccess === "Free" ? "FREE" : "👑 VIP PASS"}</span>
                  </div>
                </div>
              ) : (
                <div className="preview-banner-default">
                  <div className="preview-default-top">
                    <span className="preview-subject-pill">{createSubject}</span>
                    <span className="preview-access-pill">{createAccess === "Free" ? "FREE" : "👑 VIP PASS"}</span>
                  </div>
                  <div className="preview-default-center">
                    <span className="preview-default-icon">🎨</span>
                    <small>Default theme banner active (Upload image above to customize)</small>
                  </div>
                </div>
              )}
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

      {/* SUB-TAB 4: AI BULK QUESTION GENERATOR */}
      {subTab === "ai-generator" && (
        <div className="test-ai-generator-view" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Header Banner */}
          <div
            style={{
              background: "linear-gradient(135deg, #312e81 0%, #4338ca 50%, #6366f1 100%)",
              borderRadius: "16px",
              padding: "24px 28px",
              color: "#ffffff",
              boxShadow: "0 10px 25px -5px rgba(67, 56, 202, 0.3)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "16px",
            }}
          >
            <div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(255,255,255,0.15)", padding: "4px 12px", borderRadius: "999px", fontSize: "0.8rem", fontWeight: 700, marginBottom: "8px" }}>
                <span>✨ GEMINI AI POWERED</span>
                <span>•</span>
                <span>BILINGUAL MCQ ENGINE</span>
              </div>
              <h2 style={{ fontSize: "1.5rem", fontWeight: 800, margin: "0 0 6px 0", letterSpacing: "-0.02em" }}>
                AI Bulk Question Generator Studio
              </h2>
              <p style={{ margin: 0, opacity: 0.9, fontSize: "0.95rem", maxWidth: "680px" }}>
                Generate official syllabus-aligned 4-option or 5-option (BPSC pattern) MCQs with deep bilingual explanations, distractor analysis, and memory mnemonics. Import directly into any mock test or question bank in 1 click.
              </p>
            </div>
            <div style={{ textAlign: "right" }}>
              <span style={{ fontSize: "0.8rem", opacity: 0.8 }}>Configured via:</span>
              <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>Admin &gt; Menu &amp; Site Config &gt; AI Engine</div>
            </div>
          </div>

          {/* Generator Controls Card */}
          <div
            style={{
              background: "#ffffff",
              borderRadius: "16px",
              padding: "24px",
              border: "1px solid #e2e8f0",
              boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
            }}
          >
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: "0 0 16px 0", color: "#0f172a", display: "flex", alignItems: "center", gap: "8px" }}>
              <span>⚙️ Question Generation Parameters</span>
            </h3>

            <form onSubmit={handleGenerateAiQuestions}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginBottom: "20px" }}>
                {/* Target Exam */}
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>
                    Target Exam *
                  </label>
                  <select
                    value={aiExam}
                    onChange={(e) => setAiExam(e.target.value)}
                    className="admin-form-select"
                    style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                  >
                    <option value="BPSC TRE 4.0">BPSC TRE 4.0 (Bihar Teacher)</option>
                    <option value="Bihar STET">Bihar STET (Eligibility Test)</option>
                    <option value="CTET">CTET (Central Teacher Eligibility)</option>
                    <option value="70th BPSC CCE">70th / 71st BPSC CCE Prelims</option>
                    <option value="SSC CGL">SSC CGL / CHSL</option>
                    <option value="Railway RRB">Railway RRB NTPC</option>
                  </select>
                </div>

                {/* Subject */}
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>
                    Subject *
                  </label>
                  <select
                    value={aiSubject}
                    onChange={(e) => setAiSubject(e.target.value)}
                    className="admin-form-select"
                    style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                  >
                    <option value="General Studies">General Studies (सामान्य अध्ययन)</option>
                    <option value="Modern Indian History">Modern Indian History &amp; Bihar</option>
                    <option value="Indian Polity & Constitution">Indian Polity &amp; Constitution</option>
                    <option value="Geography & Environment">Geography &amp; Environment</option>
                    <option value="General Science">General Science (Physics, Chem, Bio)</option>
                    <option value="Mathematics & Mental Ability">Mathematics &amp; Mental Ability</option>
                    <option value="Child Development & Pedagogy">Child Development &amp; Pedagogy (CDP)</option>
                    <option value="Hindi Language">Hindi Language (हिंदी भाषा)</option>
                    <option value="English Language">English Language</option>
                    <option value="Bihar Special GK">Bihar Special GK &amp; Current Affairs</option>
                  </select>
                </div>

                {/* Topic / Subtopic */}
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>
                    Topic / Chapter Focus *
                  </label>
                  <input
                    type="text"
                    value={aiTopic}
                    onChange={(e) => setAiTopic(e.target.value)}
                    placeholder="e.g. 1857 Revolt in Bihar & Kunwar Singh"
                    required
                    style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.9rem" }}
                  />
                </div>

                {/* Number of Questions */}
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>
                    Questions to Generate
                  </label>
                  <select
                    value={aiCount}
                    onChange={(e) => setAiCount(e.target.value)}
                    className="admin-form-select"
                    style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                  >
                    <option value="1">1 Question (Quick Sample)</option>
                    <option value="3">3 Questions</option>
                    <option value="5">5 Questions (Standard Batch)</option>
                    <option value="10">10 Questions (Speed Test)</option>
                    <option value="15">15 Questions (High-Yield Set)</option>
                  </select>
                </div>

                {/* Options Pattern */}
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>
                    Options Pattern *
                  </label>
                  <select
                    value={aiOptionCount}
                    onChange={(e) => setAiOptionCount(e.target.value as "4" | "5")}
                    className="admin-form-select"
                    style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                  >
                    <option value="5">5 Options (BPSC Style with E: None / More than one)</option>
                    <option value="4">4 Options (Standard CTET / STET / SSC)</option>
                  </select>
                </div>

                {/* Difficulty */}
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>
                    Difficulty Level
                  </label>
                  <select
                    value={aiDifficulty}
                    onChange={(e) => setAiDifficulty(e.target.value as "easy" | "medium" | "hard")}
                    className="admin-form-select"
                    style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                  >
                    <option value="easy">Easy (Direct Concept / Fact)</option>
                    <option value="medium">Medium (Standard Exam Pattern)</option>
                    <option value="hard">Hard (Assertion-Reason / Analytical)</option>
                  </select>
                </div>

                {/* Language Format */}
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>
                    Language Format
                  </label>
                  <select
                    value={aiLanguage}
                    onChange={(e) => setAiLanguage(e.target.value as "bilingual" | "english" | "hindi")}
                    className="admin-form-select"
                    style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                  >
                    <option value="bilingual">Bilingual (Hindi + English) - Recommended</option>
                    <option value="hindi">Hindi Only (हिंदी माध्यम)</option>
                    <option value="english">English Only</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button
                  type="submit"
                  disabled={isGeneratingAi}
                  style={{
                    padding: "12px 28px",
                    background: "linear-gradient(135deg, #4338ca 0%, #6366f1 100%)",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "10px",
                    fontWeight: 700,
                    fontSize: "0.95rem",
                    cursor: isGeneratingAi ? "not-allowed" : "pointer",
                    boxShadow: "0 4px 14px rgba(67, 56, 202, 0.35)",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    opacity: isGeneratingAi ? 0.7 : 1,
                  }}
                >
                  {isGeneratingAi ? (
                    <>
                      <span className="spinner" style={{ width: "16px", height: "16px", border: "2px solid #fff", borderTopColor: "transparent", borderRadius: "50%", display: "inline-block", animation: "spin 1s linear infinite" }} />
                      <span>Gemini Generating Questions...</span>
                    </>
                  ) : (
                    <>
                      <span>✨</span>
                      <span>Generate {aiCount} Questions with Gemini AI</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Feedback Box */}
          {aiImportFeedback && (
            <div
              style={{
                padding: "14px 18px",
                borderRadius: "10px",
                fontSize: "0.9rem",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: "10px",
                background: aiImportFeedback.type === "success" ? "#ecfdf5" : "#fef2f2",
                color: aiImportFeedback.type === "success" ? "#065f46" : "#991b1b",
                border: `1px solid ${aiImportFeedback.type === "success" ? "#a7f3d0" : "#fecaca"}`,
              }}
            >
              <span>{aiImportFeedback.type === "success" ? "✓" : "⚠️"}</span>
              <span>{aiImportFeedback.message}</span>
            </div>
          )}

          {/* Review & Import Section */}
          {generatedAiQuestions.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Batch Action Toolbar */}
              <div
                style={{
                  background: "#ffffff",
                  padding: "16px 20px",
                  borderRadius: "12px",
                  border: "1px solid #cbd5e1",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "16px",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedAiIndices.size === generatedAiQuestions.length) {
                        setSelectedAiIndices(new Set());
                      } else {
                        setSelectedAiIndices(new Set(generatedAiQuestions.map((_, i) => i)));
                      }
                    }}
                    style={{
                      padding: "6px 14px",
                      background: "#f1f5f9",
                      border: "1px solid #cbd5e1",
                      borderRadius: "6px",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    {selectedAiIndices.size === generatedAiQuestions.length ? "Deselect All" : "Select All"}
                  </button>
                  <span style={{ fontSize: "0.9rem", fontWeight: 600, color: "#334155" }}>
                    Selected: <strong>{selectedAiIndices.size}</strong> of {generatedAiQuestions.length}
                  </span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#475569" }}>
                      Link to Mock Test:
                    </label>
                    <select
                      value={aiTargetTestSlug}
                      onChange={(e) => setAiTargetTestSlug(e.target.value)}
                      style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.85rem", maxWidth: "260px" }}
                    >
                      <option value="">(Question Bank Only - No Test Link)</option>
                      {tests.map((t) => (
                        <option value={t.slug} key={t.id}>
                          {t.name} ({t.examName})
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={handleImportAiQuestions}
                    disabled={isImportingAi || selectedAiIndices.size === 0}
                    style={{
                      padding: "10px 22px",
                      background: selectedAiIndices.size > 0 ? "#059669" : "#94a3b8",
                      color: "#ffffff",
                      border: "none",
                      borderRadius: "8px",
                      fontWeight: 700,
                      fontSize: "0.9rem",
                      cursor: selectedAiIndices.size > 0 && !isImportingAi ? "pointer" : "not-allowed",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                      boxShadow: selectedAiIndices.size > 0 ? "0 4px 12px rgba(5, 150, 105, 0.3)" : "none",
                    }}
                  >
                    {isImportingAi ? "Importing to Database..." : `📥 Import Selected (${selectedAiIndices.size})`}
                  </button>
                </div>
              </div>

              {/* Generated Question Cards */}
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {generatedAiQuestions.map((q, idx) => {
                  const isSelected = selectedAiIndices.has(idx);
                  return (
                    <div
                      key={idx}
                      style={{
                        background: "#ffffff",
                        borderRadius: "14px",
                        border: isSelected ? "2px solid #6366f1" : "1px solid #e2e8f0",
                        padding: "20px 24px",
                        boxShadow: isSelected ? "0 4px 18px rgba(99, 102, 241, 0.12)" : "0 2px 6px rgba(0,0,0,0.03)",
                        transition: "all 0.15s ease",
                      }}
                    >
                      {/* Card Header */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px", gap: "12px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {
                              setSelectedAiIndices((prev) => {
                                const next = new Set(prev);
                                if (next.has(idx)) next.delete(idx);
                                else next.add(idx);
                                return next;
                              });
                            }}
                            style={{ width: "18px", height: "18px", cursor: "pointer", accentColor: "#4f46e5" }}
                          />
                          <span
                            style={{
                              background: "#e0e7ff",
                              color: "#3730a3",
                              padding: "4px 10px",
                              borderRadius: "6px",
                              fontWeight: 700,
                              fontSize: "0.85rem",
                            }}
                          >
                            Q{idx + 1}
                          </span>
                          <span style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: 600 }}>
                            {q.exam} • {q.subject}
                          </span>
                        </div>

                        <div style={{ display: "flex", gap: "6px" }}>
                          <span style={{ fontSize: "0.75rem", background: "#f1f5f9", color: "#475569", padding: "3px 8px", borderRadius: "4px", fontWeight: 600 }}>
                            {q.options?.length || 4} Options
                          </span>
                          <span
                            style={{
                              fontSize: "0.75rem",
                              background: q.difficulty === "easy" ? "#dcfce7" : q.difficulty === "hard" ? "#fee2e2" : "#fef3c7",
                              color: q.difficulty === "easy" ? "#166534" : q.difficulty === "hard" ? "#991b1b" : "#92400e",
                              padding: "3px 8px",
                              borderRadius: "4px",
                              fontWeight: 600,
                              textTransform: "capitalize",
                            }}
                          >
                            {q.difficulty || "medium"}
                          </span>
                        </div>
                      </div>

                      {/* Question Stem */}
                      <div
                        style={{
                          fontSize: "1rem",
                          fontWeight: 600,
                          color: "#0f172a",
                          lineHeight: "1.6",
                          marginBottom: "16px",
                          whiteSpace: "pre-line",
                        }}
                      >
                        {q.stem}
                      </div>

                      {/* Options Grid */}
                      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "8px", marginBottom: "16px" }}>
                        {q.options?.map((opt: any) => (
                          <div
                            key={opt.key}
                            style={{
                              display: "flex",
                              alignItems: "flex-start",
                              gap: "10px",
                              padding: "10px 14px",
                              borderRadius: "8px",
                              background: opt.correct ? "#ecfdf5" : "#f8fafc",
                              border: opt.correct ? "1.5px solid #10b981" : "1px solid #e2e8f0",
                            }}
                          >
                            <span
                              style={{
                                width: "24px",
                                height: "24px",
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                borderRadius: "50%",
                                background: opt.correct ? "#059669" : "#e2e8f0",
                                color: opt.correct ? "#ffffff" : "#475569",
                                fontWeight: 700,
                                fontSize: "0.8rem",
                                flexShrink: 0,
                              }}
                            >
                              {opt.key}
                            </span>
                            <div style={{ flex: 1, fontSize: "0.9rem", color: opt.correct ? "#065f46" : "#334155", fontWeight: opt.correct ? 600 : 400 }}>
                              {opt.text}
                            </div>
                            {opt.correct && (
                              <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#059669", background: "#d1fae5", padding: "2px 8px", borderRadius: "999px" }}>
                                ✓ Correct Answer
                              </span>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Explanation Card */}
                      {q.explanation && (
                        <div
                          style={{
                            background: "#f0fdf4",
                            border: "1px dashed #86efac",
                            borderRadius: "10px",
                            padding: "14px 16px",
                            fontSize: "0.88rem",
                            color: "#166534",
                            lineHeight: "1.6",
                            whiteSpace: "pre-line",
                          }}
                        >
                          <div style={{ fontWeight: 700, marginBottom: "4px", display: "flex", alignItems: "center", gap: "6px" }}>
                            <span>💡 Comprehensive Bilingual Explanation:</span>
                          </div>
                          <div>{q.explanation}</div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
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
                          const ex = e.target.value.toLowerCase();
                          const newSlug = ex.includes("bpsc") || ex.includes("tre") ? "bpsc-tre-4" : ex.includes("stet") || ex.includes("bihar") ? "bihar-stet" : "ctet";
                          const tracks = syllabusTracks[newSlug] ?? [];
                          if (tracks[0]) setEditTrack(tracks[0].slug);
                        }}
                      >
                        <option value="BPSC TRE 4.0">BPSC TRE 4.0</option>
                        <option value="Bihar STET">Bihar STET</option>
                        <option value="CTET">CTET</option>
                        {editExam && !["BPSC TRE 4.0", "Bihar STET", "CTET"].includes(editExam) && (
                          <option value={editExam}>{editExam}</option>
                        )}
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
                        {editTrack && !tracksForEditExam.some((t) => t.slug === editTrack) && (
                          <option value={editTrack}>{editTrack}</option>
                        )}
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
                        {editSubject && editSubject !== "__custom__" && !subjectsForEditTrack.some((s) => s.name === editSubject) && (
                          <option value={editSubject}>{editSubject}</option>
                        )}
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
                        <option value="Previous Year Paper">Previous Year Paper</option>
                        {editType && !["Full mock", "Subject test", "Sectional drill", "Chapter test", "Previous Year Paper"].includes(editType) && (
                          <option value={editType}>{editType}</option>
                        )}
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

                  {/* Banner Image Setting & Local Upload & Live Preview Box */}
                  <div className="banner-config-section">
                    <div className="banner-config-inputs">
                      <label className="banner-setting-title">🖼️ Card Banner Image</label>
                      <p className="field-hint">
                        Upload a banner from your local device or provide an image URL. Uploaded images are cleanly named according to this mock test name.
                      </p>

                      {/* Hidden File Input & Device Upload Dropzone */}
                      <input
                        type="file"
                        ref={editFileInputRef}
                        style={{ display: "none" }}
                        accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml,image/avif"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleBannerUpload(file, true);
                            e.target.value = "";
                          }
                        }}
                      />

                      <div
                        className={`banner-upload-dropzone ${isUploadingEditBanner ? "is-uploading" : ""}`}
                        onClick={() => !isUploadingEditBanner && editFileInputRef.current?.click()}
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          const file = e.dataTransfer.files?.[0];
                          if (file && file.type.startsWith("image/")) {
                            handleBannerUpload(file, true);
                          }
                        }}
                      >
                        <div className="banner-upload-icon">{isUploadingEditBanner ? "⏳" : "📁"}</div>
                        <div className="banner-upload-label">
                          {isUploadingEditBanner
                            ? `Uploading image for "${editTitle || editingTest.name}"...`
                            : "Click to Browse or Drag Banner from Local Device"}
                        </div>
                        <div className="banner-upload-subtext">Supports PNG, JPG, WEBP, SVG, GIF (Max 10MB)</div>
                      </div>

                      {editUploadFeedback && (
                        <div className={`banner-upload-status ${editUploadFeedback.type}`}>
                          {editUploadFeedback.type === "success" ? "✓" : "⚠️"} {editUploadFeedback.message}
                        </div>
                      )}

                      <div className="banner-or-divider">OR EDIT IMAGE URL / PATH DIRECTLY</div>

                      <div className="banner-input-row">
                        <input
                          type="text"
                          placeholder="https://images.unsplash.com/... or /uploads/banners/image.jpg"
                          value={editBannerImageUrl}
                          onChange={(e) => {
                            setEditBannerImageUrl(e.target.value);
                            setEditBannerPreviewUrl("");
                          }}
                          className="admin-form-input"
                          style={{ flex: 1 }}
                        />
                        {(editBannerImageUrl || editBannerPreviewUrl) && (
                          <button
                            type="button"
                            className="btn-clear-banner"
                            onClick={() => {
                              setEditBannerImageUrl("");
                              setEditBannerPreviewUrl("");
                              setEditUploadFeedback(null);
                            }}
                          >
                            ✕ Remove
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Live Banner Preview */}
                    <div className="banner-live-preview-box">
                      <span className="preview-label">LIVE BANNER PREVIEW (ON CARDS & TEST EXPLORER)</span>
                      {(editBannerPreviewUrl || editBannerImageUrl) ? (
                        <div className="preview-banner-custom">
                          <img
                            src={editBannerPreviewUrl || editBannerImageUrl}
                            alt="Banner Preview"
                            className="preview-custom-img"
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
                            <small>Default theme banner design active (Upload an image above to customize)</small>
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
