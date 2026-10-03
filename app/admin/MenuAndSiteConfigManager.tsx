"use client";

import { useState, useEffect } from "react";
import type { SiteConfiguration, SubMenuLayer2, SubMenuItem3 } from "../../lib/site-config-defaults";
import { defaultMockTestMenu, defaultTutorialMenu, defaultSiteConfig } from "../../lib/site-config-defaults";

export default function MenuAndSiteConfigManager() {
  const [config, setConfig] = useState<SiteConfiguration>(defaultSiteConfig);
  const [activeMenuTab, setActiveMenuTab] = useState<"general" | "mock-test" | "tutorial">("general");
  const [selectedLayer2Id, setSelectedLayer2Id] = useState<string>("bpsc-tre-4");
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    fetch("/api/admin/config")
      .then((res) => res.json())
      .then((data) => {
        if (data?.config) {
          setConfig(data.config);
          if (data.config.mockTestMenu?.[0]) {
            setSelectedLayer2Id(data.config.mockTestMenu[0].id);
          }
        }
      })
      .catch(() => {});
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
        message: "Portal branding and dynamic menu navigation saved successfully! Changes are live across the portal.",
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

  return (
    <div className="site-config-manager">
      {/* Header */}
      <div className="studio-top-header">
        <div>
          <span className="studio-kicker">PORTAL BRANDING & MENU STUDIO</span>
          <h2>Website Configuration & Mega Menu Manager</h2>
          <p>
            Update portal name branding, Google AdSense setup, and dynamically configure every 2nd and 3rd layer menu item and link.
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
              <label>Portal Tagline / Slogan</label>
              <input
                type="text"
                value={config.portalTagline}
                onChange={(e) => setConfig({ ...config, portalTagline: e.target.value })}
                placeholder="e.g. India's Premier Examination & Mock Test Practice Platform"
              />
            </div>

            {/* Logo Configuration & Live Preview */}
            <div className="config-field" style={{ gridColumn: "1 / -1" }}>
              <div className="logo-config-box" style={{ background: "#f8faf9", border: "1.5px solid #d4dfda", borderRadius: "10px", padding: "16px 20px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "20px", alignItems: "center" }}>
                  <div>
                    <label style={{ font: "700 13px 'Space Grotesk', sans-serif", color: "#172824", display: "block", marginBottom: "4px" }}>
                      🖼️ Custom Header Logo Image URL
                    </label>
                    <p style={{ fontSize: "12px", color: "#637770", margin: "0 0 10px", lineHeight: "1.4" }}>
                      Provide a direct image URL for your brand logo (PNG, SVG, or JPG with transparent/light background). If left blank, the portal will automatically display the sleek dynamic text logo.
                    </p>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <input
                        type="url"
                        value={config.logoImageUrl || ""}
                        onChange={(e) => setConfig({ ...config, logoImageUrl: e.target.value })}
                        placeholder="https://.../logo.png or /images/logo.svg"
                        style={{ flex: 1, padding: "8px 12px", borderRadius: "6px", border: "1px solid #c7d8d0", fontSize: "12.5px" }}
                      />
                      {config.logoImageUrl && (
                        <button
                          type="button"
                          onClick={() => setConfig({ ...config, logoImageUrl: "" })}
                          style={{ background: "#faeae6", border: "1px solid #f2c7bd", color: "#a83f2a", borderRadius: "6px", padding: "8px 12px", fontSize: "11px", fontWeight: "700", cursor: "pointer" }}
                        >
                          ✕ Remove Logo
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Real-time Live Logo Preview */}
                  <div style={{ background: "#ffffff", border: "1px solid #d4dfda", borderRadius: "8px", padding: "12px 16px", textAlign: "center" }}>
                    <span style={{ font: "700 9.5px 'Space Grotesk', sans-serif", color: "#7a8e87", textTransform: "uppercase", letterSpacing: "0.8px", display: "block", marginBottom: "10px" }}>
                      LIVE HEADER LOGO PREVIEW
                    </span>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "44px", padding: "4px" }}>
                      {config.logoImageUrl ? (
                        <img
                          src={config.logoImageUrl}
                          alt={config.portalName}
                          style={{ maxHeight: "38px", maxWidth: "180px", objectFit: "contain" }}
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none";
                          }}
                        />
                      ) : (
                        <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", font: "700 17px 'Space Grotesk', sans-serif", color: "#172824" }}>
                          <span style={{ display: "grid", placeItems: "center", width: "30px", height: "30px", borderRadius: "6px", background: "#e8623b", color: "#ffffff", fontWeight: "800", fontSize: "15px" }}>
                            {config.portalName ? config.portalName.slice(0, 1).toUpperCase() : "I"}
                          </span>
                          <span>
                            {config.portalName ? config.portalName : "India Mock Tests"}
                            <span style={{ color: "#e8623b" }}>.</span>
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="config-field">
              <label>Support / Contact Email</label>
              <input
                type="email"
                value={config.contactEmail}
                onChange={(e) => setConfig({ ...config, contactEmail: e.target.value })}
                placeholder="support@indiamocktests.com"
              />
            </div>

            <div className="config-field">
              <label>Support Helpline Number</label>
              <input
                type="text"
                value={config.supportPhone}
                onChange={(e) => setConfig({ ...config, supportPhone: e.target.value })}
                placeholder="+91 98765 43210"
              />
            </div>

            <div className="config-field" style={{ gridColumn: "1 / -1" }}>
              <label>Google AdSense Publisher Client ID</label>
              <input
                type="text"
                value={config.adsenseClientId}
                onChange={(e) => setConfig({ ...config, adsenseClientId: e.target.value })}
                placeholder="ca-pub-XXXXXXXXXXXXXXXX"
              />
              <small>
                Once approved by Google AdSense, paste your Publisher ID here. AdSense scripts and ad units will render automatically.
              </small>
            </div>

            {/* Razorpay Gateway Configuration */}
            <div className="config-field">
              <label>Razorpay Key ID</label>
              <input
                type="text"
                value={config.razorpayKeyId || ""}
                onChange={(e) => setConfig({ ...config, razorpayKeyId: e.target.value })}
                placeholder="rzp_live_... or rzp_test_..."
              />
              <small>Your public Razorpay Key ID from the Razorpay Dashboard API Keys section.</small>
            </div>

            <div className="config-field">
              <label>Razorpay Key Secret</label>
              <input
                type="password"
                value={config.razorpayKeySecret || ""}
                onChange={(e) => setConfig({ ...config, razorpayKeySecret: e.target.value })}
                placeholder="Key Secret from Razorpay Dashboard"
              />
              <small>Used on server to authenticate order creation and verify HMAC-SHA256 signatures.</small>
            </div>

            <div className="config-field" style={{ gridColumn: "1 / -1" }}>
              <label>Razorpay Webhook Secret (Optional)</label>
              <input
                type="password"
                value={config.razorpayWebhookSecret || ""}
                onChange={(e) => setConfig({ ...config, razorpayWebhookSecret: e.target.value })}
                placeholder="Secret configured in Razorpay Webhooks tab"
              />
              <small>Webhook URL for your domain: <code>https://yourdomain.com/api/razorpay/webhook</code></small>
            </div>
          </div>

          {/* Live Branding Preview */}
          <div className="branding-preview-box">
            <span className="preview-heading">LIVE HEADER LOGO PREVIEW</span>
            <div className="preview-logo-render">
              <span className="preview-mark">{config.portalName.slice(0, 1).toUpperCase()}</span>
              <span className="preview-text">
                {config.portalName.toLowerCase()}
                <span className="preview-dot">.</span>
              </span>
            </div>
            <small style={{ color: "#778581" }}>Tagline: {config.portalTagline}</small>
          </div>
        </div>
      )}

      {/* TAB 2: MOCK TEST MEGA MENU (3-LAYERS) */}
      {activeMenuTab === "mock-test" && (
        <div className="config-panel">
          <div className="panel-section-title">
            <h3>Mock Test Menu Architecture (3-Layer Hierarchy)</h3>
            <p>
              Configure Layer 2 Exam columns and customize every 3rd Layer link (e.g. link "Class 11-12" to <code>/exams/bpsc-tre-4</code>).
              If a link is set to empty or unconfigured, it will be <strong>disabled / non-clickable</strong> on the user website.
            </p>
          </div>

          {/* Layer 2 Category selector buttons */}
          <div className="layer2-selector-bar">
            <span className="layer2-bar-label">Layer 2 Categories:</span>
            {config.mockTestMenu.map((cat) => (
              <button
                type="button"
                key={cat.id}
                className={`layer2-cat-chip ${selectedLayer2Id === cat.id ? "active" : ""}`}
                onClick={() => setSelectedLayer2Id(cat.id)}
              >
                {cat.label} ({cat.items.length} links)
              </button>
            ))}
          </div>

          {currentMockLayer2 && (
            <div className="layer2-edit-card">
              <div className="layer2-header-edit">
                <div className="config-field" style={{ flex: 1 }}>
                  <label>2nd Layer Category Label *</label>
                  <input
                    type="text"
                    value={currentMockLayer2.label}
                    onChange={(e) => updateMockLayer2Label(currentMockLayer2.id, e.target.value)}
                  />
                </div>
                <button
                  type="button"
                  className="btn-add-layer3"
                  onClick={() => addMockLayer3Item(currentMockLayer2.id)}
                >
                  + Add 3rd Layer Submenu Link
                </button>
              </div>

              {/* 3rd Layer Submenu Items Table */}
              <div className="layer3-items-list">
                <div className="layer3-table-head">
                  <span>3rd Layer Label</span>
                  <span>Subtitle / Audience</span>
                  <span>Destination Target Link</span>
                  <span>Status</span>
                  <span>Action</span>
                </div>

                {currentMockLayer2.items.map((item) => (
                  <div className="layer3-row-card" key={item.id}>
                    <input
                      type="text"
                      className="layer3-input"
                      value={item.name}
                      placeholder="e.g. Class 11–12"
                      onChange={(e) =>
                        updateMockLayer3Item(currentMockLayer2.id, item.id, "name", e.target.value)
                      }
                    />

                    <input
                      type="text"
                      className="layer3-input"
                      value={item.audience || ""}
                      placeholder="e.g. Higher Secondary (PGT)"
                      onChange={(e) =>
                        updateMockLayer3Item(currentMockLayer2.id, item.id, "audience", e.target.value)
                      }
                    />

                    <div className="url-select-wrap">
                      <input
                        type="text"
                        className="layer3-input"
                        value={item.targetUrl}
                        placeholder="e.g. /exams/bpsc-tre-4 or /attempt/..."
                        onChange={(e) =>
                          updateMockLayer3Item(currentMockLayer2.id, item.id, "targetUrl", e.target.value)
                        }
                      />
                      <div className="url-quick-presets">
                        <small>Quick Link Presets:</small>
                        <button
                          type="button"
                          className="preset-btn"
                          onClick={() =>
                            updateMockLayer3Item(
                              currentMockLayer2.id,
                              item.id,
                              "targetUrl",
                              `/exams/${currentMockLayer2.slug}`
                            )
                          }
                        >
                          Exam Page
                        </button>
                        <button
                          type="button"
                          className="preset-btn"
                          onClick={() =>
                            updateMockLayer3Item(
                              currentMockLayer2.id,
                              item.id,
                              "targetUrl",
                              `/tracks/${currentMockLayer2.slug}/${item.slug}`
                            )
                          }
                        >
                          Under Development
                        </button>
                        <button
                          type="button"
                          className="preset-btn danger"
                          onClick={() =>
                            updateMockLayer3Item(currentMockLayer2.id, item.id, "targetUrl", "")
                          }
                        >
                          Unlink (Disabled)
                        </button>
                      </div>
                    </div>

                    <div className="layer3-status-col">
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
                      🗑
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
    </div>
  );
}
