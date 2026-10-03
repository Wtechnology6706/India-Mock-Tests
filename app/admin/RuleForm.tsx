"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function RuleForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [saving, setSaving] = useState(false);

  // Form states
  const [exam, setExam] = useState("BPSC TRE 4.0");
  const [name, setName] = useState("Standard Marking Scheme");
  const [options, setOptions] = useState("5");
  const [correctMarks, setCorrectMarks] = useState("1");
  const [wrongMarks, setWrongMarks] = useState("0.25");
  const [unansweredMarks, setUnansweredMarks] = useState("0");
  const [source, setSource] = useState("");
  const [effectiveFrom, setEffectiveFrom] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch("/api/admin/rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exam,
          name,
          options: Number(options),
          correctMarks: Number(correctMarks),
          wrongMarks: Number(wrongMarks),
          unansweredMarks: Number(unansweredMarks),
          source: source.trim() || undefined,
          effectiveFrom: effectiveFrom || undefined,
        }),
      });
      const payload = await response.json();
      setSaving(false);
      if (!response.ok) {
        setMessage({ type: "error", text: payload.error ?? "Unable to save rule profile." });
        return;
      }
      setMessage({ type: "success", text: `Scoring rule profile "${name}" successfully saved!` });
      setTimeout(() => {
        setOpen(false);
        setMessage(null);
        router.refresh();
      }, 1200);
    } catch {
      setSaving(false);
      setMessage({ type: "error", text: "Network error saving rule profile." });
    }
  }

  return (
    <>
      <button
        type="button"
        className="admin-btn-primary"
        onClick={() => {
          setOpen(true);
          setMessage(null);
        }}
      >
        <span>＋</span> Configure Rule Profile
      </button>

      {open && (
        <div className="admin-modal-overlay" onClick={() => setOpen(false)}>
          <div
            className="admin-modal-card rule-form-modal"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "620px" }}
          >
            <div className="modal-header">
              <div>
                <span className="card-kicker">SCORING & NEGATIVE MARKING</span>
                <h3 style={{ margin: "4px 0 0" }}>Configure Rule Profile</h3>
              </div>
              <button type="button" className="modal-close" onClick={() => setOpen(false)}>
                ✕
              </button>
            </div>

            <form onSubmit={submit} className="rule-modal-form">
              {message && (
                <div className={`admin-alert ${message.type === "success" ? "alert-success" : "alert-error"}`}>
                  <span>{message.type === "success" ? "✓" : "⚠️"}</span>
                  <span>{message.text}</span>
                </div>
              )}

              <div className="rule-form-grid-2">
                <div className="form-field">
                  <label>Target Examination *</label>
                  <select
                    className="admin-input"
                    value={exam}
                    onChange={(e) => setExam(e.target.value)}
                    required
                  >
                    <option value="BPSC TRE 4.0">BPSC TRE 4.0 (Bihar Teacher Recruitment)</option>
                    <option value="Bihar STET">Bihar STET (Secondary Teacher Eligibility)</option>
                    <option value="BTET">BTET (Bihar Teacher Eligibility Test)</option>
                    <option value="CTET">CTET (Central Teacher Eligibility Test)</option>
                    <option value="UGC NET">UGC NET (Teaching & Research)</option>
                  </select>
                </div>

                <div className="form-field">
                  <label>Rule Profile Name *</label>
                  <input
                    type="text"
                    className="admin-input"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., 2026 Official Pattern (5 options, 0.25 negative)"
                  />
                </div>
              </div>

              <div className="rule-form-grid-3">
                <div className="form-field">
                  <label>Answer Options *</label>
                  <select
                    className="admin-input"
                    value={options}
                    onChange={(e) => setOptions(e.target.value)}
                  >
                    <option value="5">5 Options (A, B, C, D, E)</option>
                    <option value="4">4 Options (A, B, C, D)</option>
                  </select>
                  <small className="field-hint">e.g., BPSC uses 5 options with E as multi/none</small>
                </div>

                <div className="form-field">
                  <label>Marks per Correct *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="admin-input"
                    required
                    value={correctMarks}
                    onChange={(e) => setCorrectMarks(e.target.value)}
                    placeholder="1.00"
                  />
                  <small className="field-hint">Added for correct answer</small>
                </div>

                <div className="form-field">
                  <label>Penalty per Wrong *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="admin-input"
                    required
                    value={wrongMarks}
                    onChange={(e) => setWrongMarks(e.target.value)}
                    placeholder="0.25"
                  />
                  <small className="field-hint">Subtracted for wrong choice</small>
                </div>
              </div>

              <div className="rule-form-grid-2">
                <div className="form-field">
                  <label>Penalty for Unanswered / Omitted</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="admin-input"
                    value={unansweredMarks}
                    onChange={(e) => setUnansweredMarks(e.target.value)}
                    placeholder="0.00"
                  />
                  <small className="field-hint">Usually 0 for skipped questions</small>
                </div>

                <div className="form-field">
                  <label>Effective Release / Exam Date</label>
                  <input
                    type="date"
                    className="admin-input"
                    value={effectiveFrom}
                    onChange={(e) => setEffectiveFrom(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-field">
                <label>Official Reference / Notification URL</label>
                <input
                  type="url"
                  className="admin-input"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  placeholder="https://bpsc.bih.nic.in/notices/marking-scheme.pdf"
                />
              </div>

              {/* Formula Preview Box */}
              <div className="rule-preview-box">
                <span className="rule-preview-label">💡 Live Scoring Formula Preview:</span>
                <p className="rule-preview-formula">
                  <code>Score = (Correct × +{correctMarks || "1"}) − (Incorrect × {wrongMarks || "0"})</code>
                </p>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="admin-btn-primary"
                  disabled={saving}
                >
                  {saving ? "Saving Rule..." : "Save Rule Profile →"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
