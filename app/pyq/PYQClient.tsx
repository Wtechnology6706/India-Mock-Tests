"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { PYQDocument } from "@/lib/pyq-store";

type Props = {
  initialPYQs: PYQDocument[];
};

export default function PYQClient({ initialPYQs }: Props) {
  const [pyqs, setPyqs] = useState<PYQDocument[]>(initialPYQs);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedExam, setSelectedExam] = useState<string>("all");
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [activePdf, setActivePdf] = useState<PYQDocument | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // Extract unique exams & years
  const examsList = useMemo(() => {
    const map = new Map<string, string>();
    initialPYQs.forEach((p) => map.set(p.examSlug, p.examName));
    return Array.from(map.entries()).map(([slug, name]) => ({ slug, name }));
  }, [initialPYQs]);

  const yearsList = useMemo(() => {
    const set = new Set<number>();
    initialPYQs.forEach((p) => set.add(p.year));
    return Array.from(set).sort((a, b) => b - a);
  }, [initialPYQs]);

  const filteredPYQs = useMemo(() => {
    return pyqs.filter((p) => {
      const matchExam = selectedExam === "all" || p.examSlug === selectedExam;
      const matchYear = selectedYear === "all" || String(p.year) === selectedYear;
      const matchSearch =
        !searchQuery.trim() ||
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.paperName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.subjectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.examName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchExam && matchYear && matchSearch;
    });
  }, [pyqs, selectedExam, selectedYear, searchQuery]);

  async function handleDownload(pyq: PYQDocument) {
    setDownloadingId(pyq.id);
    try {
      const res = await fetch(`/api/pyq/${pyq.id}/download`, { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setPyqs((prev) =>
          prev.map((item) =>
            item.id === pyq.id ? { ...item, downloadCount: item.downloadCount + 1 } : item
          )
        );
      }
    } catch {
      // Continue download even if tracking has network hiccup
    } finally {
      setDownloadingId(null);
      // Trigger browser download
      const link = document.createElement("a");
      link.href = pyq.fileUrl;
      link.download = `${pyq.slug || "official_pyq"}.pdf`;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  function openPreview(pyq: PYQDocument) {
    setActivePdf(pyq);
    setIsFullscreen(false);
  }

  function toggleFullscreen() {
    setIsFullscreen((prev) => !prev);
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", paddingBottom: "80px" }}>
      {/* Hero Banner */}
      <section
        style={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f766e 100%)",
          color: "#fff",
          padding: "60px 20px 50px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto", position: "relative", zIndex: 2 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(16, 185, 129, 0.2)", border: "1px solid rgba(16, 185, 129, 0.4)", borderRadius: "999px", padding: "4px 14px", marginBottom: "16px" }}>
            <span style={{ fontSize: "14px" }}>📑</span>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "#34d399", letterSpacing: "0.5px" }}>OFFICIAL PREVIOUS PAPERS & CBT ARCHIVES</span>
          </div>

          <h1 style={{ fontSize: "clamp(26px, 4vw, 42px)", fontWeight: 900, lineHeight: 1.2, margin: "0 0 14px", letterSpacing: "-0.5px" }}>
            Previous Year Question Papers (PYQ)
          </h1>
          <p style={{ fontSize: "clamp(14px, 1.8vw, 17px)", color: "#cbd5e1", maxWidth: "750px", lineHeight: 1.6, margin: "0 0 28px" }}>
            Direct access to official examination question papers with answer keys, detailed explanations, and syllabus-wise breakdown for BPSC TRE, Bihar STET, CTET, and State PSCs.
          </p>

          {/* Search & Filters Card */}
          <div
            style={{
              background: "rgba(255, 255, 255, 0.08)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              borderRadius: "16px",
              padding: "18px 20px",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "14px",
              alignItems: "center",
            }}
          >
            {/* Search */}
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", fontSize: "15px", color: "#94a3b8" }}>🔍</span>
              <input
                type="text"
                placeholder="Search subject, year, or paper name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 14px 12px 38px",
                  background: "rgba(15, 23, 42, 0.6)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  borderRadius: "10px",
                  color: "#fff",
                  fontSize: "14px",
                  outline: "none",
                }}
              />
            </div>

            {/* Exam Select */}
            <div>
              <select
                value={selectedExam}
                onChange={(e) => setSelectedExam(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  background: "rgba(15, 23, 42, 0.6)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  borderRadius: "10px",
                  color: "#fff",
                  fontSize: "14px",
                  outline: "none",
                  cursor: "pointer",
                }}
              >
                <option value="all" style={{ background: "#1e293b", color: "#fff" }}>All Examination Series</option>
                {examsList.map((ex) => (
                  <option key={ex.slug} value={ex.slug} style={{ background: "#1e293b", color: "#fff" }}>
                    {ex.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Year Select */}
            <div>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  background: "rgba(15, 23, 42, 0.6)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  borderRadius: "10px",
                  color: "#fff",
                  fontSize: "14px",
                  outline: "none",
                  cursor: "pointer",
                }}
              >
                <option value="all" style={{ background: "#1e293b", color: "#fff" }}>All Exam Years</option>
                {yearsList.map((yr) => (
                  <option key={yr} value={String(yr)} style={{ background: "#1e293b", color: "#fff" }}>
                    Year {yr}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Main PYQ Cards Grid */}
      <main style={{ maxWidth: "1200px", margin: "40px auto 0", padding: "0 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#0f172a", margin: 0 }}>
              Available Question Papers ({filteredPYQs.length})
            </h2>
            <p style={{ fontSize: "14px", color: "#64748b", margin: "4px 0 0" }}>
              Click &quot;Preview PDF&quot; to inspect questions directly or download for offline revision.
            </p>
          </div>

          {(selectedExam !== "all" || selectedYear !== "all" || searchQuery) && (
            <button
              type="button"
              onClick={() => {
                setSelectedExam("all");
                setSelectedYear("all");
                setSearchQuery("");
              }}
              style={{
                padding: "6px 14px",
                fontSize: "13px",
                fontWeight: 600,
                background: "#e2e8f0",
                color: "#475569",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
              }}
            >
              Reset Filters ✕
            </button>
          )}
        </div>

        {filteredPYQs.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "60px 20px",
              background: "#fff",
              borderRadius: "16px",
              border: "1px dashed #cbd5e1",
            }}
          >
            <span style={{ fontSize: "42px", display: "block", marginBottom: "12px" }}>📂</span>
            <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#1e293b", margin: "0 0 6px" }}>
              No question papers found
            </h3>
            <p style={{ fontSize: "14px", color: "#64748b", maxWidth: "400px", margin: "0 auto" }}>
              Try searching with a different subject keyword or reset your exam series filter.
            </p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
              gap: "22px",
            }}
          >
            {filteredPYQs.map((pyq) => (
              <div
                key={pyq.id}
                style={{
                  background: "#fff",
                  borderRadius: "16px",
                  border: "1px solid #e2e8f0",
                  padding: "24px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)",
                  transition: "all 0.2s ease",
                }}
              >
                <div>
                  {/* Tags */}
                  <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "14px", flexWrap: "wrap" }}>
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: 800,
                        padding: "3px 10px",
                        borderRadius: "999px",
                        background: "rgba(37, 99, 235, 0.1)",
                        color: "#1d4ed8",
                        textTransform: "uppercase",
                      }}
                    >
                      {pyq.examName}
                    </span>
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: 700,
                        padding: "3px 10px",
                        borderRadius: "999px",
                        background: "#f1f5f9",
                        color: "#475569",
                      }}
                    >
                      Year {pyq.year}
                    </span>
                    {pyq.accessTier === "Premium" ? (
                      <span
                        style={{
                          fontSize: "10px",
                          fontWeight: 800,
                          padding: "3px 8px",
                          borderRadius: "999px",
                          background: "#fef3c7",
                          color: "#92400e",
                        }}
                      >
                        ⭐ VIP Pass
                      </span>
                    ) : (
                      <span
                        style={{
                          fontSize: "10px",
                          fontWeight: 800,
                          padding: "3px 8px",
                          borderRadius: "999px",
                          background: "#ecfdf5",
                          color: "#065f46",
                        }}
                      >
                        FREE
                      </span>
                    )}
                  </div>

                  {/* Title & Subject */}
                  <div style={{ fontSize: "12px", fontWeight: 700, color: "#0d9488", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "4px" }}>
                    {pyq.subjectName} · {pyq.paperName}
                  </div>
                  <h3 style={{ fontSize: "17px", fontWeight: 800, color: "#0f172a", lineHeight: 1.4, margin: "0 0 10px" }}>
                    {pyq.title}
                  </h3>
                  <p style={{ fontSize: "13px", color: "#64748b", lineHeight: 1.5, margin: "0 0 18px" }}>
                    {pyq.description}
                  </p>
                </div>

                <div>
                  {/* Meta Bar */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "10px 14px",
                      background: "#f8fafc",
                      borderRadius: "10px",
                      marginBottom: "16px",
                      fontSize: "12px",
                      color: "#64748b",
                    }}
                  >
                    <span>📄 {pyq.pageCount || 24} Pages</span>
                    <span>💾 {pyq.fileSize || "4.5 MB"}</span>
                    <span>📥 {pyq.downloadCount} Downloads</span>
                  </div>

                  {/* Action Buttons */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                    <button
                      type="button"
                      onClick={() => openPreview(pyq)}
                      style={{
                        padding: "11px",
                        background: "#f1f5f9",
                        color: "#0f172a",
                        border: "1px solid #cbd5e1",
                        borderRadius: "10px",
                        fontSize: "13px",
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px",
                        transition: "all 0.15s ease",
                      }}
                    >
                      <span>👁️</span> Preview PDF
                    </button>

                    <button
                      type="button"
                      disabled={downloadingId === pyq.id}
                      onClick={() => handleDownload(pyq)}
                      style={{
                        padding: "11px",
                        background: "linear-gradient(135deg, #059669, #047857)",
                        color: "#fff",
                        border: "none",
                        borderRadius: "10px",
                        fontSize: "13px",
                        fontWeight: 700,
                        cursor: downloadingId === pyq.id ? "not-allowed" : "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px",
                        boxShadow: "0 2px 6px rgba(5, 150, 105, 0.25)",
                      }}
                    >
                      <span>📥</span> {downloadingId === pyq.id ? "Downloading..." : "Download"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* PDF Modal Reader (Preview + Full-Screen Toggle) */}
      {activePdf && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 999999,
            background: "rgba(15, 23, 42, 0.92)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: isFullscreen ? 0 : "20px",
          }}
          onClick={() => setActivePdf(null)}
        >
          <div
            style={{
              background: "#1e293b",
              width: isFullscreen ? "100vw" : "92vw",
              maxWidth: isFullscreen ? "100vw" : "1200px",
              height: isFullscreen ? "100vh" : "90vh",
              borderRadius: isFullscreen ? "0" : "16px",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              boxShadow: "0 25px 60px -15px rgba(0, 0, 0, 0.5)",
              border: isFullscreen ? "none" : "1px solid rgba(255, 255, 255, 0.12)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "14px 20px",
                background: "#0f172a",
                color: "#fff",
                borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                flexShrink: 0,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px", overflow: "hidden" }}>
                <span style={{ fontSize: "20px" }}>📑</span>
                <div style={{ overflow: "hidden" }}>
                  <h3
                    style={{
                      margin: 0,
                      fontSize: "14.5px",
                      fontWeight: 800,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      maxWidth: "520px",
                    }}
                  >
                    {activePdf.title}
                  </h3>
                  <span style={{ fontSize: "11.5px", color: "#94a3b8" }}>
                    {activePdf.examName} · {activePdf.subjectName} ({activePdf.year})
                  </span>
                </div>
              </div>

              {/* Controls */}
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                {/* Fullscreen toggle */}
                <button
                  type="button"
                  onClick={toggleFullscreen}
                  title={isFullscreen ? "Exit Fullscreen" : "View in Fullscreen"}
                  style={{
                    padding: "7px 13px",
                    background: isFullscreen ? "#0284c7" : "rgba(255, 255, 255, 0.1)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    borderRadius: "8px",
                    color: "#fff",
                    fontSize: "12.5px",
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <span>{isFullscreen ? "🗗" : "⛶"}</span>
                  <span>{isFullscreen ? "Exit Fullscreen" : "Full Screen"}</span>
                </button>

                {/* Download in Reader */}
                <button
                  type="button"
                  onClick={() => handleDownload(activePdf)}
                  style={{
                    padding: "7px 14px",
                    background: "#059669",
                    border: "none",
                    borderRadius: "8px",
                    color: "#fff",
                    fontSize: "12.5px",
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <span>📥</span>
                  <span>Download</span>
                </button>

                {/* Close */}
                <button
                  type="button"
                  onClick={() => setActivePdf(null)}
                  style={{
                    padding: "6px 12px",
                    background: "rgba(239, 68, 68, 0.2)",
                    border: "1px solid rgba(239, 68, 68, 0.4)",
                    borderRadius: "8px",
                    color: "#f87171",
                    fontSize: "14px",
                    fontWeight: 800,
                    cursor: "pointer",
                  }}
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Embedded PDF Viewer */}
            <div style={{ flex: 1, background: "#1e293b", position: "relative", width: "100%", height: "100%" }}>
              {(() => {
                const pdfUrl = activePdf.fileUrl.startsWith("http") || activePdf.fileUrl.startsWith("/")
                  ? activePdf.fileUrl
                  : `/${activePdf.fileUrl}`;
                return (
                  <object
                    data={`${pdfUrl}#toolbar=1&navpanes=0`}
                    type="application/pdf"
                    style={{ width: "100%", height: "100%", border: "none", display: "block" }}
                  >
                    <iframe
                      src={`${pdfUrl}#toolbar=1&navpanes=0`}
                      title={activePdf.title}
                      style={{ width: "100%", height: "100%", border: "none" }}
                    >
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          height: "100%",
                          color: "#cbd5e1",
                          padding: "30px",
                          textAlign: "center",
                        }}
                      >
                        <p style={{ fontSize: "16px", marginBottom: "16px" }}>
                          Previewing: <strong>{activePdf.title}</strong>
                        </p>
                        <a
                          href={pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            padding: "10px 20px",
                            background: "#059669",
                            color: "#fff",
                            borderRadius: "8px",
                            textDecoration: "none",
                            fontWeight: 700,
                          }}
                        >
                          📄 Open PDF in New Tab
                        </a>
                      </div>
                    </iframe>
                  </object>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
