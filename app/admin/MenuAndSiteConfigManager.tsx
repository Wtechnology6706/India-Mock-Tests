"use client";

import { useState, useEffect } from "react";
import type { SiteConfiguration, SubMenuLayer2, SubMenuItem3, TestimonialItem } from "../../lib/site-config-defaults";
import { defaultMockTestMenu, defaultTutorialMenu, defaultSiteConfig, defaultTestimonials } from "../../lib/site-config-defaults";

export default function MenuAndSiteConfigManager() {
  const [config, setConfig] = useState<SiteConfiguration>(defaultSiteConfig);
  const [activeMenuTab, setActiveMenuTab] = useState<"general" | "mock-test" | "tutorial" | "testimonials">("general");
  const [selectedLayer2Id, setSelectedLayer2Id] = useState<string>("bpsc-tre-4");
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    fetch("/api/admin/config")
      .then((res) => res.json())
      .then((data) => {
        if (data?.config) {
          setConfig({
            ...defaultSiteConfig,
            ...data.config,
            testimonials: data.config.testimonials?.length ? data.config.testimonials : defaultTestimonials,
          });
          if (data.config.mockTestMenu?.[0]) {
            setSelectedLayer2Id(data.config.mockTestMenu[0].id);
          }
        }
      })
      .catch(() => { });
  }, []);

  async function handleSave() {
    setIsSaving(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/admin/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save configuration");
      setConfig(data.config);
      setFeedback({
        type: "success",
        message: "Portal branding, dynamic navigation, and testimonials saved successfully! Changes are live across the portal.",
      });
    } catch (err) {
      setFeedback({
        type: "error",
        message: err instanceof Error ? err.message : "Failed to update settings.",
      });
    } finally {
      setIsSaving(false);
    }
  }

  // Layer 2 management for Mock Test Menu
  const currentMockLayer2 = config.mockTestMenu.find((m) => m.id === selectedLayer2Id) || config.mockTestMenu[0];

  function updateMockLayer2Label(id: string, newLabel: string) {
    setConfig((prev) => ({
      ...prev,
      mockTestMenu: prev.mockTestMenu.map((cat) => (cat.id === id ? { ...cat, label: newLabel } : cat)),
    }));
  }

  function updateMockLayer3Item(catId: string, itemId: string, field: keyof SubMenuItem3, value: string | boolean) {
    setConfig((prev) => ({
      ...prev,
      mockTestMenu: prev.mockTestMenu.map((cat) => {
        if (cat.id !== catId) return cat;
        return {
          ...cat,
          items: cat.items.map((it) => {
            if (it.id !== itemId) return it;
            const updated = { ...it, [field]: value };
            if (field === "targetUrl") {
              updated.isConfigured = Boolean(String(value).trim());
            }
            return updated;
          }),
        };
      }),
    }));
  }

  function addMockLayer3Item(catId: string) {
    const newItem: SubMenuItem3 = {
      id: `item-${Date.now()}`,
      name: "New Class Level / Paper",
      slug: `custom-${Date.now()}`,
      audience: "Target Audience / Prep",
      targetUrl: "/exams",
      isConfigured: true,
    };

    setConfig((prev) => ({
      ...prev,
      mockTestMenu: prev.mockTestMenu.map((cat) => {
        if (cat.id !== catId) return cat;
        return { ...cat, items: [...cat.items, newItem] };
      }),
    }));
  }

  function removeMockLayer3Item(catId: string, itemId: string) {
    setConfig((prev) => ({
      ...prev,
      mockTestMenu: prev.mockTestMenu.map((cat) => {
        if (cat.id !== catId) return cat;
        return { ...cat, items: cat.items.filter((it) => it.id !== itemId) };
      }),
    }));
  }

  // Tutorial menu management
  function updateTutLayer3Item(catId: string, itemId: string, field: keyof SubMenuItem3, value: string | boolean) {
    setConfig((prev) => ({
      ...prev,
      tutorialMenu: prev.tutorialMenu.map((cat) => {
        if (cat.id !== catId) return cat;
        return {
          ...cat,
          items: cat.items.map((it) => {
            if (it.id !== itemId) return it;
            const updated = { ...it, [field]: value };
            if (field === "targetUrl") {
              updated.isConfigured = Boolean(String(value).trim());
            }
            return updated;
          }),
        };
      }),
    }));
  }

  // Testimonials management
  function addTestimonial() {
    const newTestimonial: TestimonialItem = {
      id: `testi-${Date.now()}`,
      name: "New Student / Parent",
      role: "Aspirant / Selected Candidate",
      type: "student",
      rating: 5,
      content: "Write student or parent review feedback here. India Mock Tests helped me clear the examination with confidence.",
      examBadge: "BPSC TRE 4.0",
      verified: true,
      date: new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }),
    };

    setConfig((prev) => ({
      ...prev,
      testimonials: [newTestimonial, ...(prev.testimonials || [])],
    }));
  }

  function updateTestimonial(id: string, field: keyof TestimonialItem, value: any) {
    setConfig((prev) => ({
      ...prev,
      testimonials: (prev.testimonials || []).map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    }));
  }

  function removeTestimonial(id: string) {
    if (!window.confirm("Are you sure you want to delete this testimonial?")) return;
    setConfig((prev) => ({
      ...prev,
      testimonials: (prev.testimonials || []).filter((item) => item.id !== id),
    }));
  }

  function moveTestimonial(index: number, direction: "up" | "down") {
    const list = [...(config.testimonials || [])];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= list.length) return;
    const temp = list[index];
    list[index] = list[targetIndex];
    list[targetIndex] = temp;
    setConfig((prev) => ({ ...prev, testimonials: list }));
  }

  return (
    <div className="site-config-manager">
      {/* Header */}
      <div className="studio-top-header">
        <div>
          <span className="studio-kicker">PORTAL BRANDING, MENUS & TESTIMONIALS</span>
          <h2>Website Configuration Studio</h2>
          <p>
            Update portal branding, Google AdSense setup, mega menu layers, and manage student & parent testimonials displayed on the home page.
          </p>
        </div>

        <button
          type="button"
          className="btn-save-master"
          disabled={isSaving}
          onClick={handleSave}
        >
          {isSaving ? "Saving Live Changes..." : "💾 Save & Publish Configuration"}
        </button>
      </div>

      {feedback && (
        <div className={`config-alert ${feedback.type}`}>
          <span>{feedback.type === "success" ? "✓" : "⚠"}</span>
          <div>{feedback.message}</div>
        </div>
      )}

      {/* Sub Navigation */}
      <div className="config-tabs-nav">
        <button
          type="button"
          className={`config-tab-btn ${activeMenuTab === "general" ? "active" : ""}`}
          onClick={() => setActiveMenuTab("general")}
        >
          ⚙ 1. Portal Branding & Name
        </button>

        <button
          type="button"
          className={`config-tab-btn ${activeMenuTab === "mock-test" ? "active" : ""}`}
          onClick={() => setActiveMenuTab("mock-test")}
        >
          📚 2. Mock Test Mega Menu (3-Layers)
        </button>

        <button
          type="button"
          className={`config-tab-btn ${activeMenuTab === "tutorial" ? "active" : ""}`}
          onClick={() => setActiveMenuTab("tutorial")}
        >
          🎓 3. Tutorial Menu Configuration
        </button>

        <button
          type="button"
          className={`config-tab-btn ${activeMenuTab === "testimonials" ? "active" : ""}`}
          onClick={() => setActiveMenuTab("testimonials")}
        >
          ⭐ 4. Testimonials ({config.testimonials?.length || 0})
        </button>
      </div>

      {/* TAB 1: GENERAL BRANDING & PORTAL NAME */}
      {activeMenuTab === "general" && (
        <div className="config-panel">
          <div className="panel-section-title">
            <h3>Global Branding & Portal Identity</h3>
            <p>
              Changing the portal name here updates the header logo, titles, footer, and branding across the entire website.
            </p>
          </div>

          <div className="config-form-grid-2">
            <div className="config-field">
              <label>Portal Name (Website Name) *</label>
              <input
                type="text"
                value={config.portalName}
                onChange={(e) => setConfig({ ...config, portalName: e.target.value })}
                placeholder="e.g. India Mock Tests"
                required
              />
              <small>Displays on top header logo, favicon title, metadata, and emails.</small>
            </div>

            <div className="config-field">
              <label>Portal Tagline</label>
              <input
                type="text"
                value={config.portalTagline}
                onChange={(e) => setConfig({ ...config, portalTagline: e.target.value })}
                placeholder="e.g. India's Premier Examination & Mock Test Practice Platform"
              />
              <small>Hero subheader and SEO description metadata.</small>
            </div>

            <div className="config-field">
              <label>Support Email Address</label>
              <input
                type="email"
                value={config.contactEmail}
                onChange={(e) => setConfig({ ...config, contactEmail: e.target.value })}
                placeholder="support@indiamocktests.com"
              />
            </div>

            <div className="config-field">
              <label>Support Phone / WhatsApp</label>
              <input
                type="text"
                value={config.supportPhone}
                onChange={(e) => setConfig({ ...config, supportPhone: e.target.value })}
                placeholder="+91 98765 43210"
              />
            </div>

            <div className="config-field full-width">
              <label>Google AdSense Client ID</label>
              <input
                type="text"
                value={config.adsenseClientId || ""}
                onChange={(e) => setConfig({ ...config, adsenseClientId: e.target.value })}
                placeholder="ca-pub-XXXXXXXXXXXXXXXX"
              />
              <small>Your approved AdSense publisher ID to dynamically inject ad units.</small>
            </div>

            <div className="config-field full-width">
              <label>Custom Header Logo Image URL (Optional)</label>
              <input
                type="text"
                value={config.logoImageUrl || ""}
                onChange={(e) => setConfig({ ...config, logoImageUrl: e.target.value })}
                placeholder="https://.../logo.png"
              />
              <small>If empty, the clean typography logo with orange accent mark is shown.</small>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MOCK TEST MEGA MENU (3-LAYERS) */}
      {activeMenuTab === "mock-test" && (
        <div className="config-panel">
          <div className="panel-section-title">
            <h3>Mock Test Mega Menu Structure (Layer 1, 2 & 3)</h3>
            <p>
              Configure the secondary categories (Layer 2) and tertiary examination level links (Layer 3) with custom names and destination URLs.
            </p>
          </div>

          <div className="layer2-tabs-selector">
            {config.mockTestMenu.map((cat) => (
              <button
                type="button"
                key={cat.id}
                className={`layer2-pill ${selectedLayer2Id === cat.id ? "active" : ""}`}
                onClick={() => setSelectedLayer2Id(cat.id)}
              >
                <span>{cat.label}</span>
                <small>({cat.items.length} links)</small>
              </button>
            ))}
          </div>

          {currentMockLayer2 && (
            <div className="layer2-editor-box">
              <div className="layer2-header-edit">
                <div>
                  <label>Layer 2 Category Display Name:</label>
                  <input
                    type="text"
                    className="layer2-title-input"
                    value={currentMockLayer2.label}
                    onChange={(e) => updateMockLayer2Label(currentMockLayer2.id, e.target.value)}
                  />
                </div>

                <button
                  type="button"
                  className="btn-add-layer3"
                  onClick={() => addMockLayer3Item(currentMockLayer2.id)}
                >
                  + Add Layer 3 Exam/Class Link
                </button>
              </div>

              <div className="layer3-items-list">
                <div className="layer3-table-header">
                  <span>Class / Exam Name</span>
                  <span>Audience / Subtext</span>
                  <span>Target Destination URL</span>
                  <span>Clickable Status</span>
                  <span>Action</span>
                </div>

                {currentMockLayer2.items.map((item) => (
                  <div className="layer3-row-card" key={item.id}>
                    <input
                      type="text"
                      className="layer3-input"
                      value={item.name}
                      placeholder="e.g. Class 1–5"
                      onChange={(e) =>
                        updateMockLayer3Item(currentMockLayer2.id, item.id, "name", e.target.value)
                      }
                    />

                    <input
                      type="text"
                      className="layer3-input"
                      value={item.audience || ""}
                      placeholder="e.g. Primary Teacher"
                      onChange={(e) =>
                        updateMockLayer3Item(currentMockLayer2.id, item.id, "audience", e.target.value)
                      }
                    />

                    <input
                      type="text"
                      className="layer3-input"
                      value={item.targetUrl}
                      placeholder="/exams/..."
                      onChange={(e) =>
                        updateMockLayer3Item(currentMockLayer2.id, item.id, "targetUrl", e.target.value)
                      }
                    />

                    <div className="layer3-toggle-wrap">
                      <label className="toggle-label">
                        <input
                          type="checkbox"
                          checked={item.isConfigured && Boolean(item.targetUrl.trim())}
                          onChange={(e) =>
                            updateMockLayer3Item(currentMockLayer2.id, item.id, "isConfigured", e.target.checked)
                          }
                        />
                        <span>{item.isConfigured && item.targetUrl.trim() ? "Clickable" : "Disabled"}</span>
                      </label>
                    </div>

                    <button
                      type="button"
                      className="btn-delete-layer3"
                      title="Delete this link"
                      onClick={() => removeMockLayer3Item(currentMockLayer2.id, item.id)}
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: TUTORIAL MENU */}
      {activeMenuTab === "tutorial" && (
        <div className="config-panel">
          <div className="panel-section-title">
            <h3>Tutorial & Curriculum Menu</h3>
            <p>Configure links for concept videos, syllabus explanations, and technical tutorial tracks.</p>
          </div>

          <div className="tut-categories-grid">
            {config.tutorialMenu.map((cat) => (
              <div className="tut-cat-card" key={cat.id}>
                <h4>{cat.label}</h4>
                <div className="layer3-items-list" style={{ marginTop: "12px" }}>
                  {cat.items.map((item) => (
                    <div className="layer3-row-card tut-row" key={item.id}>
                      <input
                        type="text"
                        className="layer3-input"
                        value={item.name}
                        onChange={(e) =>
                          updateTutLayer3Item(cat.id, item.id, "name", e.target.value)
                        }
                      />
                      <input
                        type="text"
                        className="layer3-input"
                        value={item.targetUrl}
                        placeholder="/tutorials/..."
                        onChange={(e) =>
                          updateTutLayer3Item(cat.id, item.id, "targetUrl", e.target.value)
                        }
                      />
                      <label className="toggle-label">
                        <input
                          type="checkbox"
                          checked={item.isConfigured && Boolean(item.targetUrl.trim())}
                          onChange={(e) =>
                            updateTutLayer3Item(cat.id, item.id, "isConfigured", e.target.checked)
                          }
                        />
                        <span>{item.isConfigured && item.targetUrl.trim() ? "Active" : "Disabled"}</span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: TESTIMONIALS (STUDENTS & PARENTS) */}
      {activeMenuTab === "testimonials" && (
        <div className="config-panel">
          <div className="panel-section-title" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
            <div>
              <h3>Student & Parent Testimonials Manager</h3>
              <p>
                Manage verified reviews, ratings, and success stories shown in the Testimonials section of the home page.
              </p>
            </div>

            <button
              type="button"
              className="btn-add-layer3"
              style={{ background: "#1e3a34", color: "#fff", padding: "10px 18px", borderRadius: "6px", fontWeight: 700, border: "none", cursor: "pointer" }}
              onClick={addTestimonial}
            >
              + Add New Testimonial
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "18px", marginTop: "20px" }}>
            {(config.testimonials || []).map((item, idx) => (
              <div
                key={item.id}
                style={{
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "10px",
                  padding: "20px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
                }}
              >
                {/* Top Row: Reorder, Type Badge, Delete */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", flexWrap: "wrap", gap: "10px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ fontWeight: 800, color: "#94a3b8", fontSize: "0.85rem" }}>
                      #{idx + 1}
                    </span>
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => moveTestimonial(idx, "up")}
                      style={{ background: "#f1f5f9", border: "1px solid #cbd5e1", borderRadius: "4px", padding: "2px 8px", cursor: idx === 0 ? "not-allowed" : "pointer" }}
                      title="Move Up"
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      disabled={idx === (config.testimonials?.length || 1) - 1}
                      onClick={() => moveTestimonial(idx, "down")}
                      style={{ background: "#f1f5f9", border: "1px solid #cbd5e1", borderRadius: "4px", padding: "2px 8px", cursor: idx === (config.testimonials?.length || 1) - 1 ? "not-allowed" : "pointer" }}
                      title="Move Down"
                    >
                      ▼
                    </button>

                    {/* Type Selector */}
                    <select
                      value={item.type}
                      onChange={(e) => updateTestimonial(item.id, "type", e.target.value as "student" | "parent")}
                      style={{
                        padding: "4px 10px",
                        borderRadius: "6px",
                        fontWeight: 700,
                        fontSize: "0.82rem",
                        border: "1px solid #cbd5e1",
                        background: item.type === "parent" ? "#fef3c7" : "#dbeafe",
                        color: item.type === "parent" ? "#92400e" : "#1e40af",
                      }}
                    >
                      <option value="student">🎓 Student Review</option>
                      <option value="parent">👨‍👩‍👧 Parent Review</option>
                    </select>

                    {/* Rating Selector */}
                    <select
                      value={item.rating}
                      onChange={(e) => updateTestimonial(item.id, "rating", Number(e.target.value))}
                      style={{
                        padding: "4px 10px",
                        borderRadius: "6px",
                        fontWeight: 700,
                        fontSize: "0.82rem",
                        border: "1px solid #cbd5e1",
                        background: "#fff",
                        color: "#f59e0b",
                      }}
                    >
                      <option value={5}>⭐⭐⭐⭐⭐ (5/5)</option>
                      <option value={4}>⭐⭐⭐⭐ (4/5)</option>
                      <option value={3}>⭐⭐⭐ (3/5)</option>
                    </select>

                    <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.82rem", fontWeight: 600, color: "#475569", cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={item.verified ?? true}
                        onChange={(e) => updateTestimonial(item.id, "verified", e.target.checked)}
                      />
                      <span>✓ Verified Badge</span>
                    </label>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeTestimonial(item.id)}
                    style={{
                      background: "#fee2e2",
                      color: "#991b1b",
                      border: "1px solid #fca5a5",
                      borderRadius: "6px",
                      padding: "4px 12px",
                      fontSize: "0.82rem",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    🗑️ Delete Review
                  </button>
                </div>

                {/* Form Fields Grid */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "12px", marginBottom: "12px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#64748b", marginBottom: "4px" }}>
                      Name *
                    </label>
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => updateTestimonial(item.id, "name", e.target.value)}
                      placeholder="e.g. Pooja Kumari"
                      style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.88rem" }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#64748b", marginBottom: "4px" }}>
                      Role / Selection Title *
                    </label>
                    <input
                      type="text"
                      value={item.role}
                      onChange={(e) => updateTestimonial(item.id, "role", e.target.value)}
                      placeholder="e.g. Selected Secondary Teacher (Class 9-10) or Parent of Aspirant"
                      style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.88rem" }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#64748b", marginBottom: "4px" }}>
                      Exam / Category Badge
                    </label>
                    <input
                      type="text"
                      value={item.examBadge || ""}
                      onChange={(e) => updateTestimonial(item.id, "examBadge", e.target.value)}
                      placeholder="e.g. BPSC TRE 3.0 Qualified / Parent Review"
                      style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.88rem" }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#64748b", marginBottom: "4px" }}>
                      Date
                    </label>
                    <input
                      type="text"
                      value={item.date || ""}
                      onChange={(e) => updateTestimonial(item.id, "date", e.target.value)}
                      placeholder="e.g. August 2026"
                      style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.88rem" }}
                    />
                  </div>
                </div>

                {/* Content Area */}
                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#64748b", marginBottom: "4px" }}>
                    Testimonial / Review Quote *
                  </label>
                  <textarea
                    rows={3}
                    value={item.content}
                    onChange={(e) => updateTestimonial(item.id, "content", e.target.value)}
                    placeholder="Enter student or parent review story..."
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: "6px",
                      border: "1px solid #cbd5e1",
                      fontSize: "0.88rem",
                      fontFamily: "inherit",
                      lineHeight: "1.5",
                      resize: "vertical",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
