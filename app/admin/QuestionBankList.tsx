"use client";

import { useState, useMemo } from "react";
import type { AdminQuestion, ContentStatus } from "../../lib/phase1";

interface QuestionBankListProps {
  initialQuestions: AdminQuestion[];
  onOpenSingleForm: () => void;
  onOpenBulkForm: () => void;
}

export default function QuestionBankList({
  initialQuestions,
  onOpenSingleForm,
  onOpenBulkForm,
}: QuestionBankListProps) {
  const [questions, setQuestions] = useState<AdminQuestion[]>(initialQuestions);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedExam, setSelectedExam] = useState("All");
  const [selectedSubject, setSelectedSubject] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");
  const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Bulk Selection states
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);

  // Actions & feedback states
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Extract unique exams for filter
  const examList = useMemo(
    () => Array.from(new Set(questions.map((q) => q.exam).filter(Boolean))),
    [questions]
  );

  // Extract unique subjects for filter (cascaded when an exam is selected)
  const subjectList = useMemo(() => {
    const pool = selectedExam === "All" ? questions : questions.filter((q) => q.exam === selectedExam);
    return Array.from(new Set(pool.map((q) => q.subject).filter(Boolean))).sort();
  }, [questions, selectedExam]);

  // Filtered questions
  const filtered = useMemo(() => {
    return questions.filter((q) => {
      if (selectedExam !== "All" && q.exam !== selectedExam) return false;
      if (selectedSubject !== "All" && q.subject !== selectedSubject) return false;
      if (selectedStatus !== "All" && q.status !== selectedStatus) return false;
      if (selectedDifficulty !== "All" && (q.difficulty || "medium") !== selectedDifficulty)
        return false;

      if (searchQuery.trim()) {
        const term = searchQuery.toLowerCase();
        const inStem = q.stem.toLowerCase().includes(term);
        const inTopic = q.topic.toLowerCase().includes(term);
        const inSubject = q.subject.toLowerCase().includes(term);
        const inExp = q.explanation ? q.explanation.toLowerCase().includes(term) : false;
        if (!inStem && !inTopic && !inSubject && !inExp) return false;
      }

      return true;
    });
  }, [questions, selectedExam, selectedSubject, selectedStatus, selectedDifficulty, searchQuery]);

  // Total pages and Paginated Slice
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const validCurrentPage = Math.min(currentPage, totalPages);

  const paginatedQuestions = useMemo(() => {
    const startIndex = (validCurrentPage - 1) * pageSize;
    return filtered.slice(startIndex, startIndex + pageSize);
  }, [filtered, validCurrentPage, pageSize]);

  // Page selection helpers
  const currentPageIds = useMemo(() => paginatedQuestions.map((q) => q.id), [paginatedQuestions]);
  const isAllCurrentPageSelected =
    currentPageIds.length > 0 && currentPageIds.every((id) => selectedIds.has(id));
  const isSomeCurrentPageSelected =
    currentPageIds.some((id) => selectedIds.has(id)) && !isAllCurrentPageSelected;

  function toggleSelectAllCurrentPage() {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (isAllCurrentPageSelected) {
        currentPageIds.forEach((id) => next.delete(id));
      } else {
        currentPageIds.forEach((id) => next.add(id));
      }
      return next;
    });
  }

  function selectAllFiltered() {
    setSelectedIds(new Set(filtered.map((q) => q.id)));
  }

  function clearSelection() {
    setSelectedIds(new Set());
  }

  function toggleSelectOne(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  // Filter change handlers (resets page to 1)
  function handleFilterExamChange(exam: string) {
    setSelectedExam(exam);
    setSelectedSubject("All");
    setCurrentPage(1);
  }

  function handleFilterSubjectChange(subject: string) {
    setSelectedSubject(subject);
    setCurrentPage(1);
  }

  function handleFilterStatusChange(status: string) {
    setSelectedStatus(status);
    setCurrentPage(1);
  }

  function handleFilterDifficultyChange(diff: string) {
    setSelectedDifficulty(diff);
    setCurrentPage(1);
  }

  function handleSearchChange(query: string) {
    setSearchQuery(query);
    setCurrentPage(1);
  }

  function handlePageSizeChange(newSize: number) {
    setPageSize(newSize);
    setCurrentPage(1);
  }

  // Single Question Status Change
  async function handleStatusChange(id: string, newStatus: ContentStatus) {
    setUpdatingId(id);
    setActionMessage(null);

    // Optimistic update
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, status: newStatus } : q))
    );

    try {
      const res = await fetch(`/api/admin/questions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      setUpdatingId(null);

      if (!res.ok) {
        const payload = await res.json();
        setActionMessage(payload.error || "Failed to update status.");
      } else {
        setActionMessage(`Question #${id} status updated to ${newStatus}.`);
        setTimeout(() => setActionMessage(null), 3000);
      }
    } catch {
      setUpdatingId(null);
      setActionMessage("Network error updating question status.");
    }
  }

  // Single Question Delete
  async function handleDelete(id: string, stem: string) {
    const preview = stem.length > 40 ? stem.slice(0, 40) + "..." : stem;
    if (!window.confirm(`Are you sure you want to delete question "${preview}"? This cannot be undone.`)) {
      return;
    }

    setUpdatingId(id);
    try {
      const res = await fetch(`/api/admin/questions/${id}`, { method: "DELETE" });
      setUpdatingId(null);

      if (res.ok) {
        setQuestions((prev) => prev.filter((q) => q.id !== id));
        setSelectedIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
        setActionMessage(`Question #${id} deleted successfully.`);
        setTimeout(() => setActionMessage(null), 3000);
      } else {
        const payload = await res.json();
        alert(payload.error || "Unable to delete question.");
      }
    } catch {
      setUpdatingId(null);
      alert("Network error deleting question.");
    }
  }

  // Bulk Status Update Handler
  async function handleBulkStatusChange(newStatus: ContentStatus) {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;

    setIsBulkProcessing(true);
    setActionMessage(null);

    // Optimistic local update
    const idSet = new Set(ids);
    setQuestions((prev) =>
      prev.map((q) => (idSet.has(q.id) ? { ...q, status: newStatus } : q))
    );

    try {
      const res = await fetch("/api/admin/questions/bulk", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids, status: newStatus }),
      });

      const data = await res.json();
      setIsBulkProcessing(false);

      if (res.ok) {
        setActionMessage(`✓ Successfully updated ${data.updatedCount || ids.length} question(s) to "${newStatus}".`);
        clearSelection();
        setTimeout(() => setActionMessage(null), 4000);
      } else {
        setActionMessage(data.error || "Failed to update questions in bulk.");
      }
    } catch {
      setIsBulkProcessing(false);
      setActionMessage("Network error executing bulk status update.");
    }
  }

  // Bulk Delete Handler
  async function handleBulkDelete() {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;

    if (
      !window.confirm(
        `Are you sure you want to permanently delete ALL ${ids.length} selected question(s)? This action cannot be undone.`
      )
    ) {
      return;
    }

    setIsBulkProcessing(true);
    setActionMessage(null);

    // Optimistic local deletion
    const idSet = new Set(ids);
    setQuestions((prev) => prev.filter((q) => !idSet.has(q.id)));
    clearSelection();

    try {
      const res = await fetch("/api/admin/questions/bulk", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });

      const data = await res.json();
      setIsBulkProcessing(false);

      if (res.ok) {
        setActionMessage(`✓ Successfully deleted ${data.deletedCount || ids.length} question(s).`);
        setTimeout(() => setActionMessage(null), 4000);
      } else {
        setActionMessage(data.error || "Failed to delete questions in bulk.");
      }
    } catch {
      setIsBulkProcessing(false);
      setActionMessage("Network error executing bulk deletion.");
    }
  }

  // Helper for generating pagination number range
  const paginationRange = useMemo(() => {
    const delta = 2;
    const range: (number | string)[] = [];
    const left = Math.max(2, validCurrentPage - delta);
    const right = Math.min(totalPages - 1, validCurrentPage + delta);

    range.push(1);
    if (left > 2) range.push("...");
    for (let i = left; i <= right; i++) {
      range.push(i);
    }
    if (right < totalPages - 1) range.push("...");
    if (totalPages > 1) range.push(totalPages);

    return range;
  }, [validCurrentPage, totalPages]);

  const startIndex = (validCurrentPage - 1) * pageSize + 1;
  const endIndex = Math.min(validCurrentPage * pageSize, filtered.length);

  return (
    <div className="qb-container">
      {/* Top Action Header */}
      <div className="qb-header">
        <div>
          <span className="kicker">QUESTION BANK MANAGEMENT</span>
          <h2>Central Question Repository</h2>
          <p>
            Search, filter, paginate, bulk-manage workflow statuses, or author new questions for CBT exams.
          </p>
        </div>

        <div className="qb-header-actions">
          <button type="button" className="btn-secondary" onClick={onOpenBulkForm}>
            ↑ Bulk Import (CSV / TSV / JSON)
          </button>
          <button type="button" className="btn-primary" onClick={onOpenSingleForm}>
            + Add Question (One by One)
          </button>
        </div>
      </div>

      {actionMessage && <div className="qb-toast-message">{actionMessage}</div>}

      {/* Filter and Search Bar */}
      <div className="qb-controls-bar">
        <div className="qb-search-box">
          <span>🔍</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search questions by text, subject, topic, or solution..."
          />
          {searchQuery && (
            <button
              type="button"
              className="qb-clear-search"
              onClick={() => handleSearchChange("")}
            >
              ✕
            </button>
          )}
        </div>

        <div className="qb-filter-group">
          {/* Subject Filter */}
          <select value={selectedSubject} onChange={(e) => handleFilterSubjectChange(e.target.value)}>
            <option value="All">All Subjects ({subjectList.length})</option>
            {subjectList.map((subject) => (
              <option key={subject} value={subject}>
                {subject}
              </option>
            ))}
          </select>

          {/* Exam Filter */}
          <select value={selectedExam} onChange={(e) => handleFilterExamChange(e.target.value)}>
            <option value="All">All Exams ({questions.length})</option>
            {examList.map((exam) => (
              <option key={exam} value={exam}>
                {exam}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select value={selectedStatus} onChange={(e) => handleFilterStatusChange(e.target.value)}>
            <option value="All">All Statuses</option>
            <option value="Draft">Draft</option>
            <option value="In review">In review</option>
            <option value="Approved">Approved</option>
            <option value="Published">Published</option>
            <option value="Archived">Archived</option>
          </select>

          {/* Difficulty Filter */}
          <select
            value={selectedDifficulty}
            onChange={(e) => handleFilterDifficultyChange(e.target.value)}
          >
            <option value="All">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
      </div>

      {/* Results Count & Page Size Toolbar */}
      <div className="qb-count-strip">
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <span>
            Showing <strong>{filtered.length > 0 ? `${startIndex}–${endIndex}` : "0"}</strong> of{" "}
            <strong>{filtered.length}</strong> questions {filtered.length !== questions.length && `(filtered from ${questions.length})`}
          </span>

          {(searchQuery ||
            selectedExam !== "All" ||
            selectedSubject !== "All" ||
            selectedStatus !== "All" ||
            selectedDifficulty !== "All") && (
            <button
              type="button"
              className="qb-reset-filters-btn"
              onClick={() => {
                setSearchQuery("");
                setSelectedExam("All");
                setSelectedSubject("All");
                setSelectedStatus("All");
                setSelectedDifficulty("All");
                setCurrentPage(1);
              }}
            >
              Reset filters
            </button>
          )}
        </div>

        <div className="qb-page-size-selector">
          <label htmlFor="page-size-select">Per page:</label>
          <select
            id="page-size-select"
            value={pageSize}
            onChange={(e) => handlePageSizeChange(Number(e.target.value))}
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={200}>200</option>
          </select>
        </div>
      </div>

      {/* Selection Header Bar */}
      {filtered.length > 0 && (
        <div className="qb-selection-header-bar">
          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
            <label className="qb-select-all-label">
              <input
                type="checkbox"
                className="qb-checkbox"
                checked={isAllCurrentPageSelected}
                ref={(el) => {
                  if (el) el.indeterminate = isSomeCurrentPageSelected;
                }}
                onChange={toggleSelectAllCurrentPage}
              />
              <span>Select all on page {validCurrentPage} ({paginatedQuestions.length})</span>
            </label>

            {isAllCurrentPageSelected && filtered.length > paginatedQuestions.length && (
              <span style={{ fontSize: "12px", color: "#0369a1" }}>
                {selectedIds.size === filtered.length ? (
                  <strong>All {filtered.length} questions matching filter selected.</strong>
                ) : (
                  <>
                    All {paginatedQuestions.length} on this page selected.{" "}
                    <button
                      type="button"
                      onClick={selectAllFiltered}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#0284c7",
                        fontWeight: 700,
                        textDecoration: "underline",
                        cursor: "pointer",
                        padding: 0,
                      }}
                    >
                      Select all {filtered.length} matching questions
                    </button>
                  </>
                )}
              </span>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {selectedIds.size > 0 && (
              <button
                type="button"
                onClick={clearSelection}
                style={{
                  background: "#f1f5f9",
                  border: "1px solid #cbd5e1",
                  borderRadius: "4px",
                  padding: "4px 10px",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "#475569",
                  cursor: "pointer",
                }}
              >
                ✕ Deselect all ({selectedIds.size})
              </button>
            )}
          </div>
        </div>
      )}

      {/* Questions List */}
      {filtered.length === 0 ? (
        <div className="qb-empty-state">
          <div className="qb-empty-icon">📂</div>
          <h3>No matching questions found</h3>
          <p>
            Try adjusting your search query or filters, or add your first question using the single or
            bulk authoring tools above.
          </p>
          <div className="qb-empty-actions">
            <button type="button" className="btn-secondary" onClick={onOpenBulkForm}>
              Import Questions in Bulk
            </button>
            <button type="button" className="btn-primary" onClick={onOpenSingleForm}>
              + Add First Question
            </button>
          </div>
        </div>
      ) : (
        <div className="qb-list-stack">
          {paginatedQuestions.map((question) => {
            const isExpanded = expandedQuestionId === question.id;
            const isSelected = selectedIds.has(question.id);
            const statusClass = question.status.toLowerCase().replace(/\s+/g, "-");
            const difficultyClass = (question.difficulty || "medium").toLowerCase();

            return (
              <div
                key={question.id}
                className={`qb-item-card ${isExpanded ? "is-expanded" : ""} ${
                  isSelected ? "is-selected" : ""
                }`}
              >
                {/* Card Header Strip */}
                <div className="qb-card-top-row">
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div className="qb-card-checkbox-wrap">
                      <input
                        type="checkbox"
                        className="qb-checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectOne(question.id)}
                        aria-label={`Select question ${question.id}`}
                      />
                    </div>
                    <div className="qb-meta-badges">
                      <span className="badge-exam">{question.exam}</span>
                      <span className="badge-subject">{question.subject}</span>
                      {question.topic && question.topic !== "Unassigned" && (
                        <span className="badge-topic">{question.topic}</span>
                      )}
                      <span className={`badge-difficulty ${difficultyClass}`}>
                        {(question.difficulty || "medium").toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div className="qb-status-wrapper">
                    <span className={`status-dot ${statusClass}`} />
                    <select
                      className={`status-select ${statusClass}`}
                      value={question.status}
                      disabled={updatingId === question.id || isBulkProcessing}
                      onChange={(e) =>
                        handleStatusChange(question.id, e.target.value as ContentStatus)
                      }
                    >
                      <option value="Draft">Draft</option>
                      <option value="In review">In review</option>
                      <option value="Approved">Approved</option>
                      <option value="Published">Published</option>
                      <option value="Archived">Archived</option>
                    </select>
                  </div>
                </div>

                {/* Question Stem */}
                <div
                  className="qb-stem-wrapper"
                  onClick={() => setExpandedQuestionId(isExpanded ? null : question.id)}
                >
                  <p className="qb-question-stem">{question.stem}</p>
                </div>

                {/* Option Count Preview and Quick Actions */}
                <div className="qb-card-footer-row">
                  <button
                    type="button"
                    className="qb-expand-toggle-btn"
                    onClick={() => setExpandedQuestionId(isExpanded ? null : question.id)}
                  >
                    <span>{isExpanded ? "▼ Hide Details" : "▶ View Options & Explanation"}</span>
                    <small>
                      ({question.options?.length ?? 0} options
                      {question.explanation ? " · Includes explanation" : ""})
                    </small>
                  </button>

                  <div className="qb-card-actions">
                    <span className="question-id-tag">ID: {question.id}</span>
                    <button
                      type="button"
                      className="qb-delete-btn"
                      title="Delete question"
                      disabled={updatingId === question.id || isBulkProcessing}
                      onClick={() => handleDelete(question.id, question.stem)}
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {/* Expandable Options & Explanation Drawer */}
                {isExpanded && (
                  <div className="qb-expanded-drawer">
                    <div className="qb-drawer-section">
                      <strong className="drawer-title">Answer Options</strong>
                      <div className="qb-options-grid">
                        {(question.options ?? []).map((opt) => (
                          <div
                            key={opt.key}
                            className={`qb-option-box ${opt.correct ? "is-correct-box" : ""}`}
                          >
                            <span className="opt-key-badge">{opt.key}</span>
                            <span className="opt-text">{opt.text}</span>
                            {opt.correct && (
                              <span className="opt-correct-indicator">✓ Correct Key</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {question.explanation && (
                      <div className="qb-drawer-section">
                        <strong className="drawer-title">💡 Explanation & Solution</strong>
                        <div className="qb-explanation-content">
                          <p>{question.explanation}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {filtered.length > pageSize && (
        <div className="qb-pagination-bar">
          <div className="qb-pagination-info">
            Page <strong>{validCurrentPage}</strong> of <strong>{totalPages}</strong> (
            <strong>{filtered.length}</strong> items total)
          </div>

          <div className="qb-pagination-controls">
            <button
              type="button"
              className="qb-page-btn"
              disabled={validCurrentPage === 1}
              onClick={() => setCurrentPage(1)}
              title="First Page"
            >
              ⏮
            </button>
            <button
              type="button"
              className="qb-page-btn"
              disabled={validCurrentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              title="Previous Page"
            >
              ◀ Prev
            </button>

            {paginationRange.map((page, idx) => {
              if (page === "...") {
                return (
                  <span key={`ellipsis-${idx}`} className="qb-page-ellipsis">
                    ...
                  </span>
                );
              }
              const pageNum = page as number;
              return (
                <button
                  key={pageNum}
                  type="button"
                  className={`qb-page-btn ${validCurrentPage === pageNum ? "is-active" : ""}`}
                  onClick={() => setCurrentPage(pageNum)}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              type="button"
              className="qb-page-btn"
              disabled={validCurrentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              title="Next Page"
            >
              Next ▶
            </button>
            <button
              type="button"
              className="qb-page-btn"
              disabled={validCurrentPage === totalPages}
              onClick={() => setCurrentPage(totalPages)}
              title="Last Page"
            >
              ⏭
            </button>
          </div>
        </div>
      )}

      {/* Floating / Sticky Bulk Action Bar */}
      {selectedIds.size > 0 && (
        <div className="qb-floating-bulk-bar">
          <div className="qb-bulk-info">
            <span className="qb-bulk-count-badge">
              {selectedIds.size} Selected
            </span>
            <span style={{ fontSize: "12px", color: "#e2e8f0" }}>
              Choose action to apply in bulk:
            </span>
          </div>

          <div className="qb-bulk-actions-group">
            <button
              type="button"
              className="qb-bulk-btn btn-publish"
              disabled={isBulkProcessing}
              onClick={() => handleBulkStatusChange("Published")}
              title="Publish all selected questions"
            >
              🟢 Publish
            </button>

            <button
              type="button"
              className="qb-bulk-btn btn-draft"
              disabled={isBulkProcessing}
              onClick={() => handleBulkStatusChange("Draft")}
              title="Move selected questions to Draft"
            >
              📝 Draft
            </button>

            <button
              type="button"
              className="qb-bulk-btn btn-review"
              disabled={isBulkProcessing}
              onClick={() => handleBulkStatusChange("In review")}
              title="Move selected questions to In Review"
            >
              🔍 In Review
            </button>

            <button
              type="button"
              className="qb-bulk-btn btn-approve"
              disabled={isBulkProcessing}
              onClick={() => handleBulkStatusChange("Approved")}
              title="Approve selected questions"
            >
              ✅ Approve
            </button>

            <button
              type="button"
              className="qb-bulk-btn btn-archive"
              disabled={isBulkProcessing}
              onClick={() => handleBulkStatusChange("Archived")}
              title="Archive selected questions"
            >
              📦 Archive
            </button>

            <button
              type="button"
              className="qb-bulk-btn btn-delete"
              disabled={isBulkProcessing}
              onClick={handleBulkDelete}
              title="Delete selected questions"
            >
              🗑️ Delete ({selectedIds.size})
            </button>

            <button
              type="button"
              className="qb-bulk-btn btn-clear"
              disabled={isBulkProcessing}
              onClick={clearSelection}
              title="Cancel and deselect all"
            >
              ✕ Deselect
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

