"use client";

import { useState, useEffect } from "react";
import type { PYQDocument } from "@/lib/pyq-store";

export default function PYQManager() {
  const [pyqs, setPyqs] = useState<PYQDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPyq, setEditingPyq] = useState<PYQDocument | null>(null);
  const [previewPdf, setPreviewPdf] = useState<PYQDocument | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    examName: "BPSC TRE 4.0",
    examSlug: "bpsc-tre-4",
    subjectName: "General Studies",
    year: 2024,
    paperName: "Paper 1",
    description: "",
    fileUrl: "",
    fileSize: "4.5 MB",
    pageCount: 30,
    accessTier: "Free" as "Free" | "Premium",
    status: "Published" as "Published" | "Draft",
  });

  useEffect(() => {
    fetchPYQs();
  }, []);

  async function fetchPYQs() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/pyq");
      const data = await res.json();
      if (data.success) {
        setPyqs(data.pyqs || []);
      }
    } catch {
      setError("Failed to load PYQs");
    } finally {
      setLoading(false);
    }
  }

  function handleOpenCreate() {
    setEditingPyq(null);
    setFormData({
      title: "",
      examName: "BPSC TRE 4.0",
      examSlug: "bpsc-tre-4",
      subjectName: "General Studies",
      year: new Date().getFullYear(),
      paperName: "Paper 1",
      description: "",
      fileUrl: "",
      fileSize: "4.5 MB",
      pageCount: 30,
      accessTier: "Free",
      status: "Published",
    });
    setModalOpen(true);
    setError("");
    setSuccess("");
  }

  function handleOpenEdit(pyq: PYQDocument) {
    setEditingPyq(pyq);
    setFormData({
      title: pyq.title,
      examName: pyq.examName,
      examSlug: pyq.examSlug,
      subjectName: pyq.subjectName,
      year: pyq.year,
      paperName: pyq.paperName,
      description: pyq.description || "",
      fileUrl: pyq.fileUrl,
      fileSize: pyq.fileSize || "4.5 MB",
      pageCount: pyq.pageCount || 30,
      accessTier: pyq.accessTier,
      status: pyq.status,
    });
    setModalOpen(true);
    setError("");
    setSuccess("");
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");
    try {
      const data = new FormData();
      data.append("file", file);

      const res = await fetch("/api/admin/pyq/upload", {
        method: "POST",
        body: data,
      });

      const resJson = await res.json();
      if (resJson.success) {
        setFormData((prev) => ({
          ...prev,
          fileUrl: resJson.fileUrl,
          fileSize: resJson.fileSize || prev.fileSize,
          title: prev.title || file.name.replace(/\.pdf$/i, "").replace(/[_-]/g, " "),
        }));
        setSuccess("PDF uploaded successfully!");
      } else {
        setError(resJson.error || "File upload failed.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to upload file.");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.title || !formData.fileUrl) {
      setError("Please provide a title and PDF document.");
      return;
    }

    try {
      if (editingPyq) {
        const res = await fetch(`/api/admin/pyq/${editingPyq.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        if (data.success) {
          setSuccess("PYQ updated successfully!");
          fetchPYQs();
          setTimeout(() => setModalOpen(false), 1200);
        } else {
          setError(data.error || "Update failed.");
        }
      } else {
        const res = await fetch("/api/admin/pyq", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        if (data.success) {
          setSuccess("PYQ added successfully!");
          fetchPYQs();
          setTimeout(() => setModalOpen(false), 1200);
        } else {
          setError(data.error || "Creation failed.");
        }
      }
    } catch (err: any) {
      setError(err.message || "Operation failed.");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this PYQ paper?")) return;
    try {
      const res = await fetch(`/api/admin/pyq/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setPyqs((prev) => prev.filter((p) => p.id !== id));
      } else {
        alert(data.error || "Delete failed");
      }
    } catch {
      alert("Delete failed");
    }
  }

  return (
    <div className="admin-module-container" style={{ padding: "24px" }}>
      {/* Module Heading */}
      <div className="module-header-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <span className="kicker" style={{ color: "#059669", fontWeight: 800 }}>PREVIOUS YEAR QUESTIONS (PYQ) HUB</span>
          <h2 className="module-title" style={{ fontSize: "24px", fontWeight: 800, margin: "4px 0" }}>
            Official PYQ Papers & Solved PDFs
          </h2>
          <p className="module-desc" style={{ color: "#64748b", margin: 0, fontSize: "14px" }}>
            Upload, categorize, and publish previous year question papers with answer keys for student download and full-screen preview.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          style={{
            padding: "10px 20px",
            background: "linear-gradient(135deg, #059669, #047857)",
            color: "#fff",
            borderRadius: "10px",
            fontWeight: 700,
            fontSize: "14px",
            border: "none",
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(5, 150, 105, 0.3)",
          }}
        >
          + Upload New PYQ PDF
        </button>
      </div>

      {/* Metrics Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "24px" }}>
        <div style={{ background: "#fff", padding: "16px 20px", borderRadius: "12px", border: "1px solid #e2e8f0", borderLeft: "4px solid #059669" }}>
          <small style={{ color: "#64748b", fontWeight: 700, fontSize: "11px" }}>TOTAL PUBLISHED PYQs</small>
          <div style={{ fontSize: "24px", fontWeight: 800, color: "#065f46", margin: "4px 0" }}>{pyqs.length}</div>
          <span style={{ fontSize: "12px", color: "#64748b" }}>Official documents live</span>
        </div>

        <div style={{ background: "#fff", padding: "16px 20px", borderRadius: "12px", border: "1px solid #e2e8f0", borderLeft: "4px solid #2563eb" }}>
          <small style={{ color: "#64748b", fontWeight: 700, fontSize: "11px" }}>TOTAL STUDENT DOWNLOADS</small>
          <div style={{ fontSize: "24px", fontWeight: 800, color: "#1d4ed8", margin: "4px 0" }}>
            {pyqs.reduce((acc, p) => acc + (p.downloadCount || 0), 0).toLocaleString()}
          </div>
          <span style={{ fontSize: "12px", color: "#64748b" }}>Direct PDF downloads</span>
        </div>

        <div style={{ background: "#fff", padding: "16px 20px", borderRadius: "12px", border: "1px solid #e2e8f0", borderLeft: "4px solid #d97706" }}>
          <small style={{ color: "#64748b", fontWeight: 700, fontSize: "11px" }}>FREE TIER ACCESSIBLE</small>
          <div style={{ fontSize: "24px", fontWeight: 800, color: "#b45309", margin: "4px 0" }}>
            {pyqs.filter((p) => p.accessTier === "Free").length}
          </div>
          <span style={{ fontSize: "12px", color: "#64748b" }}>Open to all candidates</span>
        </div>
      </div>

      {/* Table of PYQ Papers */}
      {loading ? (
        <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>Loading PYQ papers...</div>
      ) : (
        <div style={{ background: "#fff", borderRadius: "14px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
            <thead>
              <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", color: "#475569" }}>
                <th style={{ padding: "14px 18px" }}>Exam & Year</th>
                <th style={{ padding: "14px 18px" }}>Paper / Title</th>
                <th style={{ padding: "14px 18px" }}>Subject</th>
                <th style={{ padding: "14px 18px" }}>Tier</th>
                <th style={{ padding: "14px 18px" }}>Downloads</th>
                <th style={{ padding: "14px 18px" }}>Status</th>
                <th style={{ padding: "14px 18px", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pyqs.map((pyq) => (
                <tr key={pyq.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "14px 18px" }}>
                    <div style={{ fontWeight: 700, color: "#0f172a" }}>{pyq.examName}</div>
                    <small style={{ color: "#64748b" }}>Year {pyq.year}</small>
                  </td>
                  <td style={{ padding: "14px 18px", maxWidth: "300px" }}>
                    <div style={{ fontWeight: 600, color: "#1e293b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {pyq.title}
                    </div>
                    <small style={{ color: "#64748b" }}>{pyq.paperName}</small>
                  </td>
                  <td style={{ padding: "14px 18px", color: "#0d9488", fontWeight: 700 }}>
                    {pyq.subjectName}
                  </td>
                  <td style={{ padding: "14px 18px" }}>
                    <span
                      style={{
                        padding: "3px 8px",
                        borderRadius: "999px",
                        fontSize: "11px",
                        fontWeight: 800,
                        background: pyq.accessTier === "Premium" ? "#fef3c7" : "#ecfdf5",
                        color: pyq.accessTier === "Premium" ? "#92400e" : "#065f46",
                      }}
                    >
                      {pyq.accessTier}
                    </span>
                  </td>
                  <td style={{ padding: "14px 18px", fontWeight: 700, color: "#334155" }}>
                    📥 {pyq.downloadCount}
                  </td>
                  <td style={{ padding: "14px 18px" }}>
                    <span
                      style={{
                        padding: "3px 8px",
                        borderRadius: "999px",
                        fontSize: "11px",
                        fontWeight: 700,
                        background: pyq.status === "Published" ? "#dbeafe" : "#f1f5f9",
                        color: pyq.status === "Published" ? "#1e40af" : "#64748b",
                      }}
                    >
                      {pyq.status}
                    </span>
                  </td>
                  <td style={{ padding: "14px 18px", textAlign: "right" }}>
                    <div style={{ display: "inline-flex", gap: "8px" }}>
                      <button
                        type="button"
                        onClick={() => setPreviewPdf(pyq)}
                        style={{
                          padding: "6px 10px",
                          background: "#f1f5f9",
                          border: "1px solid #cbd5e1",
                          borderRadius: "6px",
                          cursor: "pointer",
                          fontSize: "12px",
                        }}
                        title="Preview PDF"
                      >
                        👁️
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(pyq)}
                        style={{
                          padding: "6px 10px",
                          background: "#e0f2fe",
                          color: "#0369a1",
                          border: "1px solid #bae6fd",
                          borderRadius: "6px",
                          cursor: "pointer",
                          fontSize: "12px",
                          fontWeight: 700,
                        }}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(pyq.id)}
                        style={{
                          padding: "6px 10px",
                          background: "#fee2e2",
                          color: "#b91c1c",
                          border: "1px solid #fecaca",
                          borderRadius: "6px",
                          cursor: "pointer",
                          fontSize: "12px",
                          fontWeight: 700,
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

      {/* Upload/Edit Modal */}
      {modalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "rgba(15, 23, 42, 0.75)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
          onClick={() => setModalOpen(false)}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "16px",
              width: "100%",
              maxWidth: "650px",
              maxHeight: "90vh",
              overflowY: "auto",
              padding: "28px",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 800, color: "#0f172a" }}>
                {editingPyq ? "Edit Previous Year Paper" : "Upload Official PYQ Document"}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                style={{ background: "transparent", border: "none", fontSize: "18px", cursor: "pointer", color: "#64748b" }}
              >
                ✕
              </button>
            </div>

            {error && (
              <div style={{ padding: "10px 14px", background: "#fef2f2", color: "#991b1b", borderRadius: "8px", marginBottom: "14px", fontSize: "13px" }}>
                {error}
              </div>
            )}
            {success && (
              <div style={{ padding: "10px 14px", background: "#ecfdf5", color: "#065f46", borderRadius: "8px", marginBottom: "14px", fontSize: "13px" }}>
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* File Upload / URL */}
              <div style={{ padding: "16px", background: "#f8fafc", borderRadius: "12px", border: "1px dashed #cbd5e1" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "#334155", marginBottom: "6px" }}>
                  Upload PDF from Device:
                </label>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileUpload}
                  style={{ fontSize: "13px" }}
                />
                {uploading && <span style={{ fontSize: "12px", color: "#0284c7", marginLeft: "10px" }}>Uploading PDF...</span>}

                <div style={{ marginTop: "10px" }}>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "#64748b", marginBottom: "4px" }}>
                    Or Public File URL / Path:
                  </label>
                  <input
                    type="text"
                    value={formData.fileUrl}
                    onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
                    placeholder="/uploads/pyq/my_paper.pdf"
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px" }}
                  />
                </div>
              </div>

              {/* Title */}
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "#334155", marginBottom: "4px" }}>
                  Document Title:
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. BPSC TRE 3.0 Computer Science Official Question Paper"
                  required
                  style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "14px" }}
                />
              </div>

              {/* Exam & Subject */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "4px" }}>
                    Exam Series:
                  </label>
                  <select
                    value={formData.examSlug}
                    onChange={(e) => {
                      const name = e.target.options[e.target.selectedIndex].text;
                      setFormData({ ...formData, examSlug: e.target.value, examName: name });
                    }}
                    style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px" }}
                  >
                    <option value="bpsc-tre-4">BPSC TRE 4.0</option>
                    <option value="bihar-stet">Bihar STET</option>
                    <option value="ctet">CTET</option>
                    <option value="btet">BTET</option>
                    <option value="uppsc-ro-aro">UPPSC RO / ARO</option>
                    <option value="mppsc">MPPSC</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "4px" }}>
                    Subject / Branch:
                  </label>
                  <input
                    type="text"
                    value={formData.subjectName}
                    onChange={(e) => setFormData({ ...formData, subjectName: e.target.value })}
                    placeholder="e.g. Computer Science, Hindi, Math"
                    style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px" }}
                  />
                </div>
              </div>

              {/* Year & Paper Name */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "4px" }}>
                    Exam Year:
                  </label>
                  <input
                    type="number"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
                    style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "4px" }}>
                    Paper Name / Shift:
                  </label>
                  <input
                    type="text"
                    value={formData.paperName}
                    onChange={(e) => setFormData({ ...formData, paperName: e.target.value })}
                    placeholder="e.g. Paper III (Classes 11-12)"
                    style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px" }}
                  />
                </div>
              </div>

              {/* Tier & Status */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "4px" }}>
                    Access Tier:
                  </label>
                  <select
                    value={formData.accessTier}
                    onChange={(e) => setFormData({ ...formData, accessTier: e.target.value as any })}
                    style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px" }}
                  >
                    <option value="Free">Free (All Candidates)</option>
                    <option value="Premium">Premium (VIP Subscribers Only)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "4px" }}>
                    Publication Status:
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px" }}
                  >
                    <option value="Published">Published (Live)</option>
                    <option value="Draft">Draft (Hidden)</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "4px" }}>
                  Brief Description & Answer Key Notes:
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Official 80-question paper with verified answer keys..."
                  style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px" }}
                />
              </div>

              {/* Submit Buttons */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  style={{ padding: "10px 18px", background: "#f1f5f9", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "13px", fontWeight: 700, cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: "10px 24px", background: "#059669", color: "#fff", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: 700, cursor: "pointer" }}
                >
                  {editingPyq ? "Save Changes" : "Publish Document"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PDF Quick Preview Modal */}
      {previewPdf && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "rgba(15, 23, 42, 0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
          onClick={() => setPreviewPdf(null)}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "16px",
              width: "90vw",
              maxWidth: "1000px",
              height: "85vh",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ padding: "14px 20px", background: "#0f172a", color: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <strong>{previewPdf.title}</strong>
              <button
                type="button"
                onClick={() => setPreviewPdf(null)}
                style={{ background: "transparent", border: "none", color: "#fff", fontSize: "16px", cursor: "pointer" }}
              >
                ✕
              </button>
            </div>
            <div style={{ flex: 1, background: "#334155" }}>
              <iframe src={previewPdf.fileUrl} title={previewPdf.title} style={{ width: "100%", height: "100%", border: "none" }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
