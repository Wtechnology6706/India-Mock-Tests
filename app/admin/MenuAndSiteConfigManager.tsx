"use client";

import { useState, useEffect, useRef } from "react";
import type {
  SiteConfiguration,
  SubMenuLayer2,
  SubMenuItem3,
  TestimonialItem,
  CustomNavItem,
  CustomNavSubItem,
} from "../../lib/site-config-defaults";
import {
  defaultMockTestMenu,
  defaultTutorialMenu,
  defaultSiteConfig,
  defaultTestimonials,
} from "../../lib/site-config-defaults";

export default function MenuAndSiteConfigManager() {
  const [config, setConfig] = useState<SiteConfiguration>(defaultSiteConfig);
  const [activeMenuTab, setActiveMenuTab] = useState<
    "general" | "mock-test" | "tutorial" | "custom-nav" | "testimonials" | "payment" | "ai"
  >("general");
  const [selectedLayer2Id, setSelectedLayer2Id] = useState<string>("bpsc-tre-4");
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [isTestingAi, setIsTestingAi] = useState(false);
  const [aiTestResult, setAiTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Logo file upload & live preview state
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [logoSourceTab, setLogoSourceTab] = useState<"upload" | "url">("upload");
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isSavingLogo, setIsSavingLogo] = useState(false);
  const [logoUploadError, setLogoUploadError] = useState<string | null>(null);
  const [logoUploadSuccess, setLogoUploadSuccess] = useState<string | null>(null);
  const [logoSaveFeedback, setLogoSaveFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [previewTheme, setPreviewTheme] = useState<"light" | "dark">("light");
  const [showGuides, setShowGuides] = useState(true);

  async function handleSaveLogoSettings(overrideConfig?: Partial<SiteConfiguration>) {
    setIsSavingLogo(true);
    setLogoSaveFeedback(null);
    const targetConfig = {
      ...config,
      ...(overrideConfig || {}),
    };
    try {
      const res = await fetch("/api/admin/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(targetConfig),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save logo configuration");
      setConfig((prev) => ({
        ...prev,
        ...data.config,
      }));
      setLogoSaveFeedback({
        type: "success",
        message: "✓ Logo configuration saved & published live to the website!",
      });

      // Broadcast update to all components and open browser tabs
      try {
        localStorage.setItem("site_config_updated_at", String(Date.now()));
        window.dispatchEvent(new Event("site_config_updated"));
      } catch {}

      setTimeout(() => setLogoSaveFeedback(null), 5000);
    } catch (err: any) {
      setLogoSaveFeedback({
        type: "error",
        message: err.message || "Failed to save logo settings.",
      });
    } finally {
      setIsSavingLogo(false);
    }
  }

  async function handleLogoFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingLogo(true);
    setLogoUploadError(null);
    setLogoUploadSuccess(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/admin/upload-logo", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setConfig((prev) => ({
          ...prev,
          logoImageUrl: data.url,
        }));
        setLogoUploadSuccess(`Logo "${file.name}" uploaded successfully!`);
        // Immediately persist to DB and broadcast live
        await handleSaveLogoSettings({ logoImageUrl: data.url });
        setTimeout(() => setLogoUploadSuccess(null), 4000);
      } else {
        setLogoUploadError(data.error || "Failed to upload logo image.");
      }
    } catch (err: any) {
      setLogoUploadError(err.message || "Network error while uploading logo.");
    } finally {
      setIsUploadingLogo(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  async function handleTestAiConnection() {
    setIsTestingAi(true);
    setAiTestResult(null);
    try {
      const res = await fetch("/api/ai/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: "Sample commission test connection check.",
          options: ["A", "B", "C", "D"],
          correctAnswer: "A",
          userPrompt: "Ping test",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAiTestResult({
          success: true,
          message: data.source === "gemini"
            ? `✓ Connected to Google Gemini (${config.aiModel || "gemini-2.5-flash"}) successfully!`
            : "✓ AI Simulation Engine active and ready for bilingual doubt solving & question generation.",
        });
      } else {
        setAiTestResult({
          success: false,
          message: data.error || "Failed to connect to AI engine.",
        });
      }
    } catch (err: any) {
      setAiTestResult({
        success: false,
        message: err.message || "Network error testing AI connection.",
      });
    } finally {
      setIsTestingAi(false);
    }
  }

  useEffect(() => {
    fetch(`/api/admin/config?t=${Date.now()}`, { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (data?.config) {
          setConfig({
            ...defaultSiteConfig,
            ...data.config,
            logoHeight: data.config.logoHeight !== undefined ? Number(data.config.logoHeight) : (defaultSiteConfig.logoHeight ?? 48),
            logoOffsetX: data.config.logoOffsetX !== undefined ? Number(data.config.logoOffsetX) : 0,
            logoOffsetY: data.config.logoOffsetY !== undefined ? Number(data.config.logoOffsetY) : 0,
            testimonials: data.config.testimonials?.length ? data.config.testimonials : defaultTestimonials,
            customNavMenu: data.config.customNavMenu || [],
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

  // Custom Navigation Menu (Shopify-Style Customizer)
  function addCustomNavItem() {
    const newItem: CustomNavItem = {
      id: `nav-${Date.now()}`,
      label: "New Navigation Menu",
      linkType: "page",
      targetUrl: "/about",
      badgeText: "",
      subItems: [],
    };
    setConfig((prev) => ({
      ...prev,
      customNavMenu: [...(prev.customNavMenu || []), newItem],
    }));
  }

  function updateCustomNavItem(id: string, field: keyof CustomNavItem, value: any) {
    setConfig((prev) => ({
      ...prev,
      customNavMenu: (prev.customNavMenu || []).map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    }));
  }

  function removeCustomNavItem(id: string) {
    if (!window.confirm("Delete this navigation menu item?")) return;
    setConfig((prev) => ({
      ...prev,
      customNavMenu: (prev.customNavMenu || []).filter((item) => item.id !== id),
    }));
  }

  function addCustomNavSubItem(parentId: string) {
    const newSubItem: CustomNavSubItem = {
      id: `sub-${Date.now()}`,
      label: "Sub-menu Link",
      targetUrl: "/exams",
      audience: "Quick link",
    };
    setConfig((prev) => ({
      ...prev,
      customNavMenu: (prev.customNavMenu || []).map((item) =>
        item.id === parentId
          ? { ...item, subItems: [...(item.subItems || []), newSubItem] }
          : item
      ),
    }));
  }

  function updateCustomNavSubItem(parentId: string, subId: string, field: keyof CustomNavSubItem, value: any) {
    setConfig((prev) => ({
      ...prev,
      customNavMenu: (prev.customNavMenu || []).map((item) => {
        if (item.id !== parentId) return item;
        return {
          ...item,
          subItems: (item.subItems || []).map((sub) =>
            sub.id === subId ? { ...sub, [field]: value } : sub
          ),
        };
      }),
    }));
  }

  function removeCustomNavSubItem(parentId: string, subId: string) {
    setConfig((prev) => ({
      ...prev,
      customNavMenu: (prev.customNavMenu || []).map((item) => {
        if (item.id !== parentId) return item;
        return {
          ...item,
          subItems: (item.subItems || []).filter((sub) => sub.id !== subId),
        };
      }),
    }));
  }

  return (
    <div className="site-config-manager">
      {/* Header */}
      <div className="studio-top-header">
        <div>
          <span className="studio-kicker">PORTAL BRANDING, MENUS & TESTIMONIALS</span>
          <h2>Website Configuration Studio</h2>
          <p>
            Update portal branding, Google AdSense setup, mega menu layers, custom navigation menus, and manage payment gateway credentials.
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
          className={`config-tab-btn ${activeMenuTab === "custom-nav" ? "active" : ""}`}
          onClick={() => setActiveMenuTab("custom-nav")}
        >
          🧭 4. Custom Navigation Menus ({config.customNavMenu?.length || 0})
        </button>

        <button
          type="button"
          className={`config-tab-btn ${activeMenuTab === "testimonials" ? "active" : ""}`}
          onClick={() => setActiveMenuTab("testimonials")}
        >
          ⭐ 5. Testimonials ({config.testimonials?.length || 0})
        </button>

        <button
          type="button"
          className={`config-tab-btn ${activeMenuTab === "payment" ? "active" : ""}`}
          onClick={() => setActiveMenuTab("payment")}
        >
          💳 6. Payment Gateway (Razorpay)
        </button>

        <button
          type="button"
          className={`config-tab-btn ${activeMenuTab === "ai" ? "active" : ""}`}
          onClick={() => setActiveMenuTab("ai")}
          style={activeMenuTab === "ai" ? { background: "#4338ca", color: "#fff" } : { borderLeft: "3px solid #6366f1" }}
        >
          🤖 7. AI Engine (Gemini)
        </button>
      </div>

      {/* TAB 1: GENERAL BRANDING & PORTAL NAME */}
      {activeMenuTab === "general" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Card 1: Basic Portal Details */}
          <div className="config-panel" style={{ padding: "24px", borderRadius: "10px" }}>
            <div className="panel-section-title">
              <h3>Global Branding & Portal Identity</h3>
              <p>
                Configure the core portal name, tagline, communication contacts, and advertising integration.
              </p>
            </div>

            <div className="config-form-grid-2">
              <div className="config-field">
                <label>Portal Name (Website Name) *</label>
                <input
                  type="text"
                  value={config.portalName}
                  onChange={(e) => setConfig({ ...config, portalName: e.target.value })}
                  placeholder="e.g. Sarkari Practice"
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
                  placeholder="support@sarkaripractice.com"
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

              <div className="config-field" style={{ gridColumn: "1 / -1" }}>
                <label>Google AdSense Client ID</label>
                <input
                  type="text"
                  value={config.adsenseClientId || ""}
                  onChange={(e) => setConfig({ ...config, adsenseClientId: e.target.value })}
                  placeholder="ca-pub-XXXXXXXXXXXXXXXX"
                />
                <small>Your approved AdSense publisher ID to dynamically inject ad units.</small>
              </div>
            </div>
          </div>

          {/* Card 2: DEDICATED FULL-WIDTH LOGO & PRECISION ALIGNMENT STUDIO */}
          <div
            className="config-panel"
            style={{
              padding: "26px",
              background: "#ffffff",
              border: "1px solid #cbd5e1",
              borderRadius: "12px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
            }}
          >
            {/* Studio Header Bar */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "16px",
                marginBottom: "20px",
                paddingBottom: "16px",
                borderBottom: "1px solid #e2e8f0",
              }}
            >
              <div>
                <h3
                  style={{
                    margin: "0 0 4px",
                    fontSize: "1.25rem",
                    fontWeight: 700,
                    color: "#0f172a",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  <span>🎨</span> Site Logo &amp; Precision Alignment Studio
                </h3>
                <p style={{ margin: 0, fontSize: "0.86rem", color: "#64748b" }}>
                  Upload from your computer or provide an image link. Adjust scale and alignment in real-time with side-by-side live navbar simulation.
                </p>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                {config.logoImageUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      setConfig({ ...config, logoImageUrl: "" });
                      handleSaveLogoSettings({ logoImageUrl: "" });
                    }}
                    style={{
                      background: "#fee2e2",
                      color: "#b91c1c",
                      border: "1px solid #fecaca",
                      padding: "8px 14px",
                      borderRadius: "6px",
                      fontSize: "0.82rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <span>🗑️</span> Remove Logo
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setConfig({ ...config, logoHeight: 48, logoOffsetX: 0, logoOffsetY: 0 })}
                  style={{
                    background: "#f1f5f9",
                    color: "#475569",
                    border: "1px solid #cbd5e1",
                    padding: "8px 14px",
                    borderRadius: "6px",
                    fontSize: "0.82rem",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  ↺ Reset Sliders
                </button>

                <button
                  type="button"
                  onClick={() => handleSaveLogoSettings()}
                  disabled={isSavingLogo}
                  style={{
                    background: isSavingLogo
                      ? "#6366f1"
                      : "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                    color: "#ffffff",
                    border: "none",
                    padding: "8px 20px",
                    borderRadius: "6px",
                    fontSize: "0.86rem",
                    fontWeight: 700,
                    cursor: isSavingLogo ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    boxShadow: "0 2px 8px rgba(16, 185, 129, 0.25)",
                  }}
                >
                  <span>{isSavingLogo ? "⏳" : "💾"}</span>
                  <span>{isSavingLogo ? "Saving Logo..." : "Save & Apply Logo Live"}</span>
                </button>
              </div>
            </div>

            {/* Notification alert banner */}
            {logoSaveFeedback && (
              <div
                style={{
                  marginBottom: "18px",
                  padding: "12px 18px",
                  borderRadius: "8px",
                  fontSize: "0.88rem",
                  fontWeight: 600,
                  background: logoSaveFeedback.type === "success" ? "#f0fdf4" : "#fef2f2",
                  color: logoSaveFeedback.type === "success" ? "#15803d" : "#991b1b",
                  border: `1px solid ${logoSaveFeedback.type === "success" ? "#bbf7d0" : "#fecaca"}`,
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <span>{logoSaveFeedback.type === "success" ? "✓" : "⚠️"}</span>
                <span>{logoSaveFeedback.message}</span>
              </div>
            )}

            {logoUploadError && (
              <div
                style={{
                  marginBottom: "18px",
                  padding: "10px 16px",
                  borderRadius: "8px",
                  background: "#fef2f2",
                  color: "#991b1b",
                  border: "1px solid #fecaca",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                }}
              >
                ⚠️ {logoUploadError}
              </div>
            )}

            {logoUploadSuccess && (
              <div
                style={{
                  marginBottom: "18px",
                  padding: "10px 16px",
                  borderRadius: "8px",
                  background: "#f0fdf4",
                  color: "#166534",
                  border: "1px solid #bbf7d0",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                }}
              >
                ✓ {logoUploadSuccess}
              </div>
            )}

            {/* SINGLE VIEW SPLIT LAYOUT (CONTROLS ON LEFT, MAXIMUM PREVIEW ON RIGHT) */}
            <div className="logo-studio-single-view">
              {/* LEFT COLUMN: SOURCE SELECTION & PRECISION SLIDERS */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "18px",
                  background: "#f8fafc",
                  padding: "20px",
                  borderRadius: "10px",
                  border: "1px solid #e2e8f0",
                }}
              >
                {/* 1. Source Selection Tabs */}
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontWeight: 700,
                      fontSize: "0.85rem",
                      color: "#1e293b",
                    }}
                  >
                    Logo Image Source:
                  </label>
                  <div
                    style={{
                      display: "flex",
                      background: "#e2e8f0",
                      padding: "3px",
                      borderRadius: "8px",
                      gap: "4px",
                      marginBottom: "12px",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setLogoSourceTab("upload")}
                      style={{
                        flex: 1,
                        padding: "7px 12px",
                        borderRadius: "6px",
                        fontSize: "0.82rem",
                        fontWeight: 700,
                        border: "none",
                        cursor: "pointer",
                        background: logoSourceTab === "upload" ? "#ffffff" : "transparent",
                        color: logoSourceTab === "upload" ? "#4338ca" : "#64748b",
                        boxShadow: logoSourceTab === "upload" ? "0 2px 4px rgba(0,0,0,0.06)" : "none",
                        transition: "all 0.15s ease",
                      }}
                    >
                      📁 Upload from Device
                    </button>
                    <button
                      type="button"
                      onClick={() => setLogoSourceTab("url")}
                      style={{
                        flex: 1,
                        padding: "7px 12px",
                        borderRadius: "6px",
                        fontSize: "0.82rem",
                        fontWeight: 700,
                        border: "none",
                        cursor: "pointer",
                        background: logoSourceTab === "url" ? "#ffffff" : "transparent",
                        color: logoSourceTab === "url" ? "#4338ca" : "#64748b",
                        boxShadow: logoSourceTab === "url" ? "0 2px 4px rgba(0,0,0,0.06)" : "none",
                        transition: "all 0.15s ease",
                      }}
                    >
                      🔗 Image URL / Path
                    </button>
                  </div>

                  {logoSourceTab === "upload" ? (
                    <div>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleLogoFileUpload}
                        accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif"
                        style={{ display: "none" }}
                      />
                      <div
                        onClick={() => !isUploadingLogo && fileInputRef.current?.click()}
                        style={{
                          border: "2px dashed #cbd5e1",
                          borderRadius: "8px",
                          padding: "18px 20px",
                          textAlign: "center",
                          cursor: isUploadingLogo ? "not-allowed" : "pointer",
                          background: isUploadingLogo ? "#f1f5f9" : "#ffffff",
                          transition: "all 0.2s ease",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          minHeight: "96px",
                        }}
                        onMouseEnter={(e) => {
                          if (!isUploadingLogo) e.currentTarget.style.borderColor = "#4338ca";
                        }}
                        onMouseLeave={(e) => {
                          if (!isUploadingLogo) e.currentTarget.style.borderColor = "#cbd5e1";
                        }}
                      >
                        {isUploadingLogo ? (
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                              color: "#4338ca",
                              fontWeight: 600,
                              fontSize: "0.88rem",
                            }}
                          >
                            <span>⏳</span>
                            <span>Uploading logo to server &amp; publishing...</span>
                          </div>
                        ) : (
                          <>
                            <div style={{ fontSize: "1.6rem", marginBottom: "4px" }}>📁</div>
                            <div
                              style={{
                                fontWeight: 700,
                                fontSize: "0.9rem",
                                color: "#1e293b",
                              }}
                            >
                              Choose Logo from Computer
                            </div>
                            <div style={{ fontSize: "0.76rem", color: "#64748b", marginTop: "2px" }}>
                              PNG, JPG, SVG, WebP (Max 10MB) · Auto-saved on upload
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <input
                        type="text"
                        value={config.logoImageUrl || ""}
                        onChange={(e) => setConfig({ ...config, logoImageUrl: e.target.value })}
                        placeholder="https://example.com/logo.png or /uploads/logo/..."
                        style={{
                          width: "100%",
                          padding: "10px 12px",
                          borderRadius: "6px",
                          border: "1px solid #cbd5e1",
                          fontSize: "0.88rem",
                          background: "#ffffff",
                          boxSizing: "border-box",
                        }}
                      />
                      <small
                        style={{
                          color: "#64748b",
                          fontSize: "0.76rem",
                          display: "block",
                          marginTop: "4px",
                        }}
                      >
                        Direct image path or external URL. Click &ldquo;Save &amp; Apply Logo Live&rdquo; to publish.
                      </small>
                    </div>
                  )}
                </div>

                {/* 2. Precision Alignment Sliders Box */}
                <div
                  style={{
                    paddingTop: "16px",
                    borderTop: "1px solid #e2e8f0",
                    display: "flex",
                    flexDirection: "column",
                    gap: "16px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span style={{ fontWeight: 700, fontSize: "0.88rem", color: "#1e293b" }}>
                      🎛️ Precision Sliders
                    </span>
                    <button
                      type="button"
                      onClick={() => setConfig({ ...config, logoHeight: 48, logoOffsetX: 0, logoOffsetY: 0 })}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#4338ca",
                        fontSize: "0.78rem",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      ↺ Reset Dimensions
                    </button>
                  </div>

                  {/* Slider 1: Logo Size (Height) */}
                  <div
                    style={{
                      background: "#ffffff",
                      padding: "12px 14px",
                      borderRadius: "8px",
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "6px",
                      }}
                    >
                      <label
                        style={{
                          fontWeight: 700,
                          fontSize: "0.82rem",
                          color: "#1e293b",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <span>📐</span> Logo Size (Height)
                      </label>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span
                          style={{
                            background: "#4338ca",
                            color: "#fff",
                            padding: "2px 8px",
                            borderRadius: "12px",
                            fontSize: "0.76rem",
                            fontWeight: 800,
                          }}
                        >
                          {config.logoHeight ?? 48} px
                        </span>
                        <button
                          type="button"
                          onClick={() => setConfig({ ...config, logoHeight: 48 })}
                          title="Reset to 48px"
                          style={{
                            background: "none",
                            border: "none",
                            color: "#94a3b8",
                            cursor: "pointer",
                            fontSize: "0.85rem",
                          }}
                        >
                          ↺
                        </button>
                      </div>
                    </div>
                    <input
                      type="range"
                      min={20}
                      max={110}
                      step={1}
                      value={config.logoHeight ?? 48}
                      onChange={(e) => setConfig({ ...config, logoHeight: Number(e.target.value) })}
                      style={{ width: "100%", accentColor: "#4338ca", cursor: "pointer" }}
                    />
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: "0.7rem",
                        color: "#94a3b8",
                        marginTop: "2px",
                      }}
                    >
                      <span>Compact (20px)</span>
                      <span>Default (48px)</span>
                      <span>Large (110px)</span>
                    </div>
                    <small
                      style={{
                        display: "block",
                        color: "#64748b",
                        fontSize: "0.73rem",
                        marginTop: "4px",
                      }}
                    >
                      🔒 Aspect ratio is locked: Width adjusts automatically with zero distortion.
                    </small>
                  </div>

                  {/* Slider 2: Vertical Position (Move Up / Down) */}
                  <div
                    style={{
                      background: "#ffffff",
                      padding: "12px 14px",
                      borderRadius: "8px",
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "6px",
                      }}
                    >
                      <label
                        style={{
                          fontWeight: 700,
                          fontSize: "0.82rem",
                          color: "#1e293b",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <span>↕️</span> Vertical Position (Up / Down)
                      </label>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span
                          style={{
                            background:
                              (config.logoOffsetY ?? 0) === 0
                                ? "#64748b"
                                : (config.logoOffsetY ?? 0) < 0
                                ? "#0284c7"
                                : "#0d9488",
                            color: "#fff",
                            padding: "2px 8px",
                            borderRadius: "12px",
                            fontSize: "0.76rem",
                            fontWeight: 800,
                          }}
                        >
                          {(config.logoOffsetY ?? 0) === 0
                            ? "0 px (Center)"
                            : (config.logoOffsetY ?? 0) < 0
                            ? `${Math.abs(config.logoOffsetY ?? 0)}px Up ↑`
                            : `${config.logoOffsetY}px Down ↓`}
                        </span>
                        <button
                          type="button"
                          onClick={() => setConfig({ ...config, logoOffsetY: 0 })}
                          title="Reset to 0px"
                          style={{
                            background: "none",
                            border: "none",
                            color: "#94a3b8",
                            cursor: "pointer",
                            fontSize: "0.85rem",
                          }}
                        >
                          ↺
                        </button>
                      </div>
                    </div>
                    <input
                      type="range"
                      min={-40}
                      max={40}
                      step={1}
                      value={config.logoOffsetY ?? 0}
                      onChange={(e) => setConfig({ ...config, logoOffsetY: Number(e.target.value) })}
                      style={{ width: "100%", accentColor: "#0284c7", cursor: "pointer" }}
                    />
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: "0.7rem",
                        color: "#94a3b8",
                        marginTop: "2px",
                      }}
                    >
                      <span>-40px (Up ↑)</span>
                      <span>0px (Centered)</span>
                      <span>+40px (Down ↓)</span>
                    </div>
                  </div>

                  {/* Slider 3: Horizontal Position (Move Left / Right) */}
                  <div
                    style={{
                      background: "#ffffff",
                      padding: "12px 14px",
                      borderRadius: "8px",
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "6px",
                      }}
                    >
                      <label
                        style={{
                          fontWeight: 700,
                          fontSize: "0.82rem",
                          color: "#1e293b",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <span>↔️</span> Horizontal Position (Left / Right)
                      </label>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span
                          style={{
                            background:
                              (config.logoOffsetX ?? 0) === 0
                                ? "#64748b"
                                : (config.logoOffsetX ?? 0) < 0
                                ? "#e11d48"
                                : "#d97706",
                            color: "#fff",
                            padding: "2px 8px",
                            borderRadius: "12px",
                            fontSize: "0.76rem",
                            fontWeight: 800,
                          }}
                        >
                          {(config.logoOffsetX ?? 0) === 0
                            ? "0 px (Center)"
                            : (config.logoOffsetX ?? 0) < 0
                            ? `${Math.abs(config.logoOffsetX ?? 0)}px Left ←`
                            : `${config.logoOffsetX}px Right →`}
                        </span>
                        <button
                          type="button"
                          onClick={() => setConfig({ ...config, logoOffsetX: 0 })}
                          title="Reset to 0px"
                          style={{
                            background: "none",
                            border: "none",
                            color: "#94a3b8",
                            cursor: "pointer",
                            fontSize: "0.85rem",
                          }}
                        >
                          ↺
                        </button>
                      </div>
                    </div>
                    <input
                      type="range"
                      min={-60}
                      max={60}
                      step={1}
                      value={config.logoOffsetX ?? 0}
                      onChange={(e) => setConfig({ ...config, logoOffsetX: Number(e.target.value) })}
                      style={{ width: "100%", accentColor: "#d97706", cursor: "pointer" }}
                    />
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: "0.7rem",
                        color: "#94a3b8",
                        marginTop: "2px",
                      }}
                    >
                      <span>-60px (Left ←)</span>
                      <span>0px (Normal)</span>
                      <span>+60px (Right →)</span>
                    </div>
                  </div>
                </div>

                {/* Left Column Bottom Action Button */}
                <button
                  type="button"
                  onClick={() => handleSaveLogoSettings()}
                  disabled={isSavingLogo}
                  style={{
                    marginTop: "6px",
                    width: "100%",
                    background: isSavingLogo
                      ? "#6366f1"
                      : "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                    color: "#ffffff",
                    border: "none",
                    padding: "12px 18px",
                    borderRadius: "8px",
                    fontSize: "0.92rem",
                    fontWeight: 700,
                    cursor: isSavingLogo ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    boxShadow: "0 2px 10px rgba(16, 185, 129, 0.3)",
                    transition: "all 0.15s ease",
                  }}
                >
                  <span>{isSavingLogo ? "⏳" : "💾"}</span>
                  <span>{isSavingLogo ? "Saving Logo..." : "Save & Apply Logo Live"}</span>
                </button>
              </div>

              {/* RIGHT COLUMN: MAXIMUM PREVIEW (REAL-TIME LIVE NAVBAR SIMULATION) */}
              <div
                style={{
                  background: "#f8fafc",
                  border: "1px solid #cbd5e1",
                  borderRadius: "10px",
                  padding: "18px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px",
                }}
              >
                {/* Preview Toolbar */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "10px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "1.1rem" }}>👁️</span>
                    <strong style={{ fontSize: "0.92rem", color: "#0f172a" }}>
                      Live Navbar Header Preview
                    </strong>
                    <span
                      style={{
                        fontSize: "0.7rem",
                        background: "#dcfce7",
                        color: "#15803d",
                        padding: "2px 7px",
                        borderRadius: "999px",
                        fontWeight: 800,
                        letterSpacing: "0.5px",
                      }}
                    >
                      ● LIVE
                    </span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        fontSize: "0.76rem",
                        color: "#475569",
                        cursor: "pointer",
                        marginRight: "6px",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={showGuides}
                        onChange={(e) => setShowGuides(e.target.checked)}
                      />
                      <span>Crosshairs</span>
                    </label>

                    {/* Desktop / Mobile toggle */}
                    <div
                      style={{
                        display: "inline-flex",
                        background: "#e2e8f0",
                        padding: "2px",
                        borderRadius: "6px",
                        gap: "2px",
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => setPreviewDevice("desktop")}
                        style={{
                          padding: "3px 8px",
                          borderRadius: "4px",
                          fontSize: "0.74rem",
                          fontWeight: 700,
                          border: "none",
                          cursor: "pointer",
                          background: previewDevice === "desktop" ? "#ffffff" : "transparent",
                          color: previewDevice === "desktop" ? "#0f172a" : "#64748b",
                        }}
                      >
                        🖥️ Desktop
                      </button>
                      <button
                        type="button"
                        onClick={() => setPreviewDevice("mobile")}
                        style={{
                          padding: "3px 8px",
                          borderRadius: "4px",
                          fontSize: "0.74rem",
                          fontWeight: 700,
                          border: "none",
                          cursor: "pointer",
                          background: previewDevice === "mobile" ? "#ffffff" : "transparent",
                          color: previewDevice === "mobile" ? "#0f172a" : "#64748b",
                        }}
                      >
                        📱 Mobile
                      </button>
                    </div>

                    {/* Light / Dark Header toggle */}
                    <div
                      style={{
                        display: "inline-flex",
                        background: "#e2e8f0",
                        padding: "2px",
                        borderRadius: "6px",
                        gap: "2px",
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => setPreviewTheme("light")}
                        style={{
                          padding: "3px 8px",
                          borderRadius: "4px",
                          fontSize: "0.74rem",
                          fontWeight: 700,
                          border: "none",
                          cursor: "pointer",
                          background: previewTheme === "light" ? "#ffffff" : "transparent",
                          color: previewTheme === "light" ? "#0f172a" : "#64748b",
                        }}
                      >
                        ☀️ Light
                      </button>
                      <button
                        type="button"
                        onClick={() => setPreviewTheme("dark")}
                        style={{
                          padding: "3px 8px",
                          borderRadius: "4px",
                          fontSize: "0.74rem",
                          fontWeight: 700,
                          border: "none",
                          cursor: "pointer",
                          background: previewTheme === "dark" ? "#0f172a" : "transparent",
                          color: previewTheme === "dark" ? "#ffffff" : "#64748b",
                        }}
                      >
                        🌙 Dark
                      </button>
                    </div>
                  </div>
                </div>

                {/* Simulated Browser Frame */}
                <div
                  style={{
                    background: previewTheme === "light" ? "#ffffff" : "#020617",
                    borderRadius: "10px",
                    border: previewTheme === "light" ? "1px solid #cbd5e1" : "1px solid #1e293b",
                    overflow: "hidden",
                    boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
                  }}
                >
                  {/* Browser Window Titlebar */}
                  <div
                    style={{
                      height: "32px",
                      background: previewTheme === "light" ? "#f1f5f9" : "#0f172a",
                      borderBottom:
                        previewTheme === "light" ? "1px solid #e2e8f0" : "1px solid #1e293b",
                      display: "flex",
                      alignItems: "center",
                      padding: "0 12px",
                      gap: "8px",
                    }}
                  >
                    <div style={{ display: "flex", gap: "5px" }}>
                      <span
                        style={{
                          width: "9px",
                          height: "9px",
                          borderRadius: "50%",
                          background: "#ef4444",
                          display: "inline-block",
                        }}
                      />
                      <span
                        style={{
                          width: "9px",
                          height: "9px",
                          borderRadius: "50%",
                          background: "#f59e0b",
                          display: "inline-block",
                        }}
                      />
                      <span
                        style={{
                          width: "9px",
                          height: "9px",
                          borderRadius: "50%",
                          background: "#10b981",
                          display: "inline-block",
                        }}
                      />
                    </div>
                    <div
                      style={{
                        margin: "0 auto",
                        background: previewTheme === "light" ? "#ffffff" : "#1e293b",
                        padding: "2px 14px",
                        borderRadius: "12px",
                        fontSize: "0.7rem",
                        color: previewTheme === "light" ? "#64748b" : "#94a3b8",
                        border: previewTheme === "light" ? "1px solid #e2e8f0" : "1px solid #334155",
                      }}
                    >
                      🔒 https://{config.portalName.toLowerCase().replace(/[^a-z0-9]/g, "") || "sarkaripractice"}.com
                    </div>
                  </div>

                  {/* Header Navbar Simulation Area */}
                  {previewDevice === "desktop" ? (
                    <div
                      style={{
                        minHeight: "78px",
                        background: previewTheme === "light" ? "#f7f8f4" : "#0f172a",
                        borderBottom:
                          previewTheme === "light" ? "1px solid #dfe5e1" : "1px solid #1e293b",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "0 22px",
                        position: "relative",
                        overflow: "hidden",
                      }}
                    >
                      {/* Left: Logo Slot */}
                      <div
                        style={{
                          position: "relative",
                          display: "inline-flex",
                          alignItems: "center",
                          zIndex: 2,
                        }}
                      >
                        {showGuides && (
                          <div
                            style={{
                              position: "absolute",
                              left: "-30px",
                              right: "-30px",
                              top: "50%",
                              borderTop: "1px dashed rgba(239, 68, 68, 0.45)",
                              pointerEvents: "none",
                              zIndex: 1,
                            }}
                          />
                        )}
                        {config.logoImageUrl ? (
                          <img
                            src={config.logoImageUrl}
                            alt={config.portalName}
                            style={{
                              height: `${config.logoHeight ?? 48}px`,
                              maxHeight: `${config.logoHeight ?? 48}px`,
                              maxWidth: "340px",
                              width: "auto",
                              objectFit: "contain",
                              display: "block",
                              position: "relative",
                              top: `${config.logoOffsetY ?? 0}px`,
                              left: `${config.logoOffsetX ?? 0}px`,
                              transition: "none",
                              zIndex: 2,
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                              fontFamily: "'Space Grotesk', sans-serif",
                              fontWeight: 700,
                              fontSize: "18px",
                              color: previewTheme === "light" ? "#213033" : "#f8fafc",
                              position: "relative",
                              top: `${config.logoOffsetY ?? 0}px`,
                              left: `${config.logoOffsetX ?? 0}px`,
                              zIndex: 2,
                            }}
                          >
                            <span
                              style={{
                                width: "28px",
                                height: "28px",
                                borderRadius: "7px",
                                background: previewTheme === "light" ? "#213033" : "#3b82f6",
                                color: "#fff",
                                display: "grid",
                                placeItems: "center",
                                fontSize: "15px",
                              }}
                            >
                              {config.portalName.slice(0, 1).toUpperCase()}
                            </span>
                            <span>
                              {config.portalName}
                              <span style={{ color: "#df795f" }}>.</span>
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Middle: Simulated Nav Links */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "16px",
                          fontSize: "0.8rem",
                          fontWeight: 600,
                          color: previewTheme === "light" ? "#4a5f58" : "#94a3b8",
                        }}
                      >
                        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                          Mock Tests <small>▾</small>
                        </span>
                        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                          Tutorials <small>▾</small>
                        </span>
                        <span>PYQ Papers</span>
                        <span>Plans &amp; Pricing</span>
                      </div>

                      {/* Right: Simulated Actions */}
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <span
                          style={{
                            fontSize: "0.78rem",
                            fontWeight: 600,
                            color: previewTheme === "light" ? "#63706e" : "#cbd5e1",
                          }}
                        >
                          Log in
                        </span>
                        <span
                          style={{
                            background: previewTheme === "light" ? "#213033" : "#3b82f6",
                            color: "#fff",
                            padding: "7px 12px",
                            borderRadius: "5px",
                            fontSize: "0.76rem",
                            fontWeight: 700,
                          }}
                        >
                          Start Free →
                        </span>
                      </div>
                    </div>
                  ) : (
                    /* Mobile Header Simulation */
                    <div
                      style={{
                        minHeight: "64px",
                        maxWidth: "380px",
                        margin: "0 auto",
                        background: previewTheme === "light" ? "#f7f8f4" : "#0f172a",
                        borderLeft:
                          previewTheme === "light" ? "1px solid #dfe5e1" : "1px solid #1e293b",
                        borderRight:
                          previewTheme === "light" ? "1px solid #dfe5e1" : "1px solid #1e293b",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "0 16px",
                        position: "relative",
                      }}
                    >
                      <span style={{ fontSize: "1.2rem", cursor: "pointer" }}>☰</span>
                      <div style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
                        {config.logoImageUrl ? (
                          <img
                            src={config.logoImageUrl}
                            alt={config.portalName}
                            style={{
                              height: `${Math.min(config.logoHeight ?? 38, 44)}px`,
                              maxHeight: "44px",
                              maxWidth: "180px",
                              width: "auto",
                              objectFit: "contain",
                              display: "block",
                              position: "relative",
                              top: `${config.logoOffsetY ?? 0}px`,
                              left: `${config.logoOffsetX ?? 0}px`,
                            }}
                          />
                        ) : (
                          <span style={{ fontWeight: 800, fontSize: "0.95rem" }}>
                            {config.portalName}
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: "1rem" }}>🔍</span>
                    </div>
                  )}

                  {/* Simulated Content Body Mockup */}
                  <div
                    style={{
                      padding: "20px",
                      background: previewTheme === "light" ? "#ffffff" : "#0f172a",
                      display: "flex",
                      flexDirection: "column",
                      gap: "10px",
                    }}
                  >
                    <div
                      style={{
                        height: "12px",
                        width: "35%",
                        background: previewTheme === "light" ? "#e2e8f0" : "#1e293b",
                        borderRadius: "4px",
                      }}
                    />
                    <div
                      style={{
                        height: "8px",
                        width: "60%",
                        background: previewTheme === "light" ? "#f1f5f9" : "#1e293b",
                        borderRadius: "4px",
                      }}
                    />
                  </div>
                </div>

                {/* Specs and Metrics Footer */}
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "8px",
                    paddingTop: "4px",
                    fontSize: "0.76rem",
                  }}
                >
                  <span
                    style={{
                      background: "#e0e7ff",
                      color: "#3730a3",
                      padding: "4px 10px",
                      borderRadius: "6px",
                      fontWeight: 700,
                    }}
                  >
                    📏 Height: {config.logoHeight ?? 48}px
                  </span>
                  <span
                    style={{
                      background: "#e0f2fe",
                      color: "#0369a1",
                      padding: "4px 10px",
                      borderRadius: "6px",
                      fontWeight: 700,
                    }}
                  >
                    ↕️ Y-Offset:{" "}
                    {(config.logoOffsetY ?? 0) === 0
                      ? "0px (Center)"
                      : (config.logoOffsetY ?? 0) > 0
                      ? `+${config.logoOffsetY}px Down ↓`
                      : `${config.logoOffsetY}px Up ↑`}
                  </span>
                  <span
                    style={{
                      background: "#fef3c7",
                      color: "#92400e",
                      padding: "4px 10px",
                      borderRadius: "6px",
                      fontWeight: 700,
                    }}
                  >
                    ↔️ X-Offset:{" "}
                    {(config.logoOffsetX ?? 0) === 0
                      ? "0px (Center)"
                      : (config.logoOffsetX ?? 0) > 0
                      ? `+${config.logoOffsetX}px Right →`
                      : `${config.logoOffsetX}px Left ←`}
                  </span>
                  <span
                    style={{
                      background: "#dcfce7",
                      color: "#15803d",
                      padding: "4px 10px",
                      borderRadius: "6px",
                      fontWeight: 700,
                    }}
                  >
                    ✓ Aspect Ratio: Preserved
                  </span>
                </div>

                <div
                  style={{
                    fontSize: "0.73rem",
                    color: "#64748b",
                    wordBreak: "break-all",
                    background: "#ffffff",
                    padding: "8px 12px",
                    borderRadius: "6px",
                    border: "1px solid #e2e8f0",
                  }}
                >
                  <strong>Active Logo Path:</strong>{" "}
                  <code>{config.logoImageUrl || "(Default Clean Typography Logo with Orange Mark)"}</code>
                </div>
              </div>
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

      {/* TAB 4: CUSTOM TOP NAVIGATION MENUS (SHOPIFY-STYLE) */}
      {activeMenuTab === "custom-nav" && (
        <div className="config-panel">
          <div className="panel-section-title" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
            <div>
              <h3>Dynamic Top Navigation Customizer</h3>
              <p>
                Manage, add, and reorder header menu items, dropdown sub-menus, and links pointing dynamically to mock test series, syllabus pages, tutorials, or external resources (Shopify-style menu management).
              </p>
            </div>
            <button
              type="button"
              onClick={addCustomNavItem}
              className="admin-btn-secondary"
              style={{ padding: "8px 18px", fontSize: "0.88rem", fontWeight: 700 }}
            >
              + Add Main Menu Item
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "18px", marginTop: "16px" }}>
            {(!config.customNavMenu || config.customNavMenu.length === 0) && (
              <div style={{ padding: "30px", background: "#f8fafc", border: "1px dashed #cbd5e1", borderRadius: "10px", textAlign: "center", color: "#64748b" }}>
                <p style={{ margin: 0, fontWeight: 600 }}>No custom navigation menu items created yet.</p>
                <small style={{ display: "block", marginTop: "4px" }}>Click &quot;+ Add Main Menu Item&quot; to add custom links like &quot;Syllabus&quot;, &quot;Results&quot;, &quot;Current Affairs&quot;, or nested dropdowns.</small>
              </div>
            )}

            {(config.customNavMenu || []).map((navItem, index) => (
              <div
                key={navItem.id}
                style={{
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "12px",
                  padding: "18px 20px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", flexWrap: "wrap", gap: "10px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "12px", fontWeight: 800, background: "#f1f5f9", color: "#475569", padding: "3px 8px", borderRadius: "6px" }}>
                      #{index + 1}
                    </span>
                    <strong style={{ fontSize: "1.05rem", color: "#0f172a" }}>{navItem.label || "Untitled Menu"}</strong>
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      type="button"
                      onClick={() => addCustomNavSubItem(navItem.id)}
                      style={{
                        background: "rgba(16, 185, 129, 0.1)",
                        color: "#059669",
                        border: "1px solid rgba(16, 185, 129, 0.3)",
                        borderRadius: "6px",
                        padding: "4px 12px",
                        fontSize: "0.82rem",
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      + Add Dropdown Sub-item
                    </button>
                    <button
                      type="button"
                      onClick={() => removeCustomNavItem(navItem.id)}
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
                      🗑️ Delete
                    </button>
                  </div>
                </div>

                {/* Item fields */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px", marginBottom: "12px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#64748b", marginBottom: "4px" }}>
                      Menu Label *
                    </label>
                    <input
                      type="text"
                      value={navItem.label}
                      onChange={(e) => updateCustomNavItem(navItem.id, "label", e.target.value)}
                      placeholder="e.g. About, Contact Us, Syllabus"
                      style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.88rem" }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#64748b", marginBottom: "4px" }}>
                      Target Destination URL *
                    </label>
                    <input
                      type="text"
                      value={navItem.targetUrl}
                      onChange={(e) => updateCustomNavItem(navItem.id, "targetUrl", e.target.value)}
                      placeholder="e.g. /about, /contact, /exams/bpsc-tre-4"
                      style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.88rem" }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#64748b", marginBottom: "4px" }}>
                      Highlight Badge (Optional)
                    </label>
                    <input
                      type="text"
                      value={navItem.badgeText || ""}
                      onChange={(e) => updateCustomNavItem(navItem.id, "badgeText", e.target.value)}
                      placeholder="e.g. NEW, HOT, FREE"
                      style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.88rem" }}
                    />
                  </div>
                </div>

                {/* Sub items list */}
                {navItem.subItems && navItem.subItems.length > 0 && (
                  <div style={{ marginTop: "12px", padding: "12px 14px", background: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                    <span style={{ fontSize: "12px", fontWeight: 700, color: "#475569", display: "block", marginBottom: "8px" }}>
                      Dropdown Sub-menu Items ({navItem.subItems.length})
                    </span>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      {navItem.subItems.map((sub) => (
                        <div key={sub.id} style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr auto", gap: "10px", alignItems: "center" }}>
                          <input
                            type="text"
                            value={sub.label}
                            onChange={(e) => updateCustomNavSubItem(navItem.id, sub.id, "label", e.target.value)}
                            placeholder="Sub-item label"
                            style={{ padding: "6px 10px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.82rem" }}
                          />
                          <input
                            type="text"
                            value={sub.targetUrl}
                            onChange={(e) => updateCustomNavSubItem(navItem.id, sub.id, "targetUrl", e.target.value)}
                            placeholder="Target link (/... or https://...)"
                            style={{ padding: "6px 10px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.82rem" }}
                          />
                          <button
                            type="button"
                            onClick={() => removeCustomNavSubItem(navItem.id, sub.id)}
                            style={{ background: "#fee2e2", color: "#dc2626", border: "none", borderRadius: "6px", padding: "6px 10px", fontSize: "0.8rem", cursor: "pointer" }}
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: PAYMENT GATEWAY (RAZORPAY) CONFIGURATION */}
      {activeMenuTab === "payment" && (
        <div className="config-panel">
          <div className="panel-section-title">
            <h3>Payment Gateway Integration (Razorpay)</h3>
            <p>
              Configure your Razorpay API credentials for student checkouts. You can configure both Test (Sandbox) and Live (Production) keys and toggle between them seamlessly.
            </p>
          </div>

          {/* Master Mode Switch Toggle Card */}
          <div
            style={{
              background: config.razorpayTestMode !== false ? "#fffbeb" : "#f0fdf4",
              border: `1.5px solid ${config.razorpayTestMode !== false ? "#fde68a" : "#bbf7d0"}`,
              borderRadius: "14px",
              padding: "20px 24px",
              marginBottom: "24px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "16px",
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                <span
                  style={{
                    display: "inline-block",
                    padding: "4px 10px",
                    borderRadius: "999px",
                    fontWeight: 800,
                    fontSize: "12px",
                    background: config.razorpayTestMode !== false ? "#f59e0b" : "#10b981",
                    color: "#fff",
                  }}
                >
                  {config.razorpayTestMode !== false ? "🧪 TEST / SANDBOX MODE ACTIVE" : "⚡ LIVE PRODUCTION MODE ACTIVE"}
                </span>
                <span style={{ fontSize: "14px", fontWeight: 700, color: "#1e293b" }}>
                  {config.razorpayTestMode !== false ? "Simulated Payments Mode" : "Real Money Deductions Active"}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: "13px", color: "#475569" }}>
                {config.razorpayTestMode !== false
                  ? "Checkouts will automatically use Test API Keys. You can test purchases with Razorpay test UPI IDs / test cards without actual money deductions."
                  : "Checkouts will automatically use Live Production API Keys. Payments will be collected and deposited into your merchant bank account."}
              </p>
            </div>

            {/* Toggle Switch Button */}
            <button
              type="button"
              onClick={() =>
                setConfig({
                  ...config,
                  razorpayTestMode: !(config.razorpayTestMode !== false),
                })
              }
              style={{
                padding: "10px 22px",
                background: config.razorpayTestMode !== false ? "#10b981" : "#f59e0b",
                color: "#fff",
                border: "none",
                borderRadius: "10px",
                fontSize: "14px",
                fontWeight: 800,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                boxShadow: "0 2px 6px rgba(0,0,0,0.12)",
                transition: "all 0.15s ease",
              }}
            >
              <span>{config.razorpayTestMode !== false ? "⚡ Switch to Live Mode" : "🧪 Switch to Test Mode"}</span>
            </button>
          </div>

          <div className="config-form-grid-2">
            <div className="config-field full-width">
              <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={config.razorpayEnabled ?? true}
                  onChange={(e) => setConfig({ ...config, razorpayEnabled: e.target.checked })}
                  style={{ width: 18, height: 18, accentColor: "#e65100" }}
                />
                <strong style={{ fontSize: "0.95rem" }}>Enable Razorpay Gateway for Student Checkouts</strong>
              </label>
              <small>When enabled, students clicking &quot;Upgrade to VIP&quot; or purchasing mock tests will pay through this Razorpay account.</small>
            </div>

            {/* TEST MODE SECTION */}
            <div
              style={{
                gridColumn: "1 / -1",
                background: "#fefce8",
                border: "1px solid #fef08a",
                borderRadius: "12px",
                padding: "18px 20px",
                marginTop: "8px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
                <span style={{ fontSize: "16px" }}>🧪</span>
                <strong style={{ fontSize: "15px", color: "#854d0e" }}>Test Mode (Sandbox) Credentials</strong>
                {config.razorpayTestMode !== false && (
                  <span style={{ fontSize: "11px", fontWeight: 800, background: "#fef08a", color: "#a16207", padding: "2px 8px", borderRadius: "999px" }}>
                    ACTIVE IN CHECKOUT
                  </span>
                )}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#713f12", marginBottom: "4px" }}>
                    Test Key ID (rzp_test_...)
                  </label>
                  <input
                    type="text"
                    value={config.razorpayTestKeyId || ""}
                    onChange={(e) => setConfig({ ...config, razorpayTestKeyId: e.target.value.trim() })}
                    placeholder="rzp_test_xxxxxxxxxxxxxxxx"
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "6px", border: "1px solid #ca8a04", fontSize: "0.88rem" }}
                  />
                  <small style={{ color: "#a16207", display: "block", marginTop: "4px" }}>
                    Leave empty to fallback to <code>RAZORPAY_TEST_KEY_ID</code> or <code>RAZORPAY_KEY_ID</code> in .env.
                  </small>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#713f12", marginBottom: "4px" }}>
                    Test Key Secret
                  </label>
                  <input
                    type="password"
                    value={config.razorpayTestKeySecret || ""}
                    onChange={(e) => setConfig({ ...config, razorpayTestKeySecret: e.target.value.trim() })}
                    placeholder="Enter Test Key Secret..."
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "6px", border: "1px solid #ca8a04", fontSize: "0.88rem" }}
                  />
                  <small style={{ color: "#a16207", display: "block", marginTop: "4px" }}>
                    Leave empty to fallback to <code>RAZORPAY_TEST_KEY_SECRET</code> in .env.
                  </small>
                </div>
              </div>
            </div>

            {/* LIVE PRODUCTION SECTION */}
            <div
              style={{
                gridColumn: "1 / -1",
                background: "#f0fdf4",
                border: "1px solid #bbf7d0",
                borderRadius: "12px",
                padding: "18px 20px",
                marginTop: "8px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
                <span style={{ fontSize: "16px" }}>⚡</span>
                <strong style={{ fontSize: "15px", color: "#166534" }}>Live Production Credentials</strong>
                {config.razorpayTestMode === false && (
                  <span style={{ fontSize: "11px", fontWeight: 800, background: "#bbf7d0", color: "#15803d", padding: "2px 8px", borderRadius: "999px" }}>
                    ACTIVE IN CHECKOUT
                  </span>
                )}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#14532d", marginBottom: "4px" }}>
                    Live Key ID (rzp_live_...)
                  </label>
                  <input
                    type="text"
                    value={config.razorpayLiveKeyId || ""}
                    onChange={(e) => setConfig({ ...config, razorpayLiveKeyId: e.target.value.trim() })}
                    placeholder="rzp_live_xxxxxxxxxxxxxxxx"
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "6px", border: "1px solid #16a34a", fontSize: "0.88rem" }}
                  />
                  <small style={{ color: "#15803d", display: "block", marginTop: "4px" }}>
                    Leave empty to fallback to <code>RAZORPAY_LIVE_KEY_ID</code> in .env.
                  </small>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#14532d", marginBottom: "4px" }}>
                    Live Key Secret
                  </label>
                  <input
                    type="password"
                    value={config.razorpayLiveKeySecret || ""}
                    onChange={(e) => setConfig({ ...config, razorpayLiveKeySecret: e.target.value.trim() })}
                    placeholder="Enter Live Key Secret..."
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "6px", border: "1px solid #16a34a", fontSize: "0.88rem" }}
                  />
                  <small style={{ color: "#15803d", display: "block", marginTop: "4px" }}>
                    Confidential production secret key from your Razorpay Dashboard.
                  </small>
                </div>
              </div>
            </div>

            <div className="config-field full-width" style={{ marginTop: "12px" }}>
              <label>Razorpay Webhook Secret (Optional)</label>
              <input
                type="password"
                value={config.razorpayWebhookSecret || ""}
                onChange={(e) => setConfig({ ...config, razorpayWebhookSecret: e.target.value.trim() })}
                placeholder="Enter webhook secret if you configured webhooks..."
              />
              <small>
                Webhook endpoint to configure in Razorpay: <code>https://sarkaripractice.com/api/razorpay/webhook</code> (Events: <code>payment.captured</code>, <code>order.paid</code>)
              </small>
            </div>
          </div>

          <div className="payment-guide-box" style={{ marginTop: "20px" }}>
            <h4>📌 Supported Payment Methods & Multi-Domain Association</h4>
            <p>
              Your Razorpay integration automatically activates <strong>UPI (GPay, PhonePe, Paytm, BHIM)</strong>, <strong>Debit / Credit Cards (RuPay, Visa, Mastercard)</strong>, <strong>Net Banking (50+ Indian banks)</strong>, and <strong>Wallets</strong>. This configuration is stored centrally in the database and applied dynamically across all portal subdomains.
            </p>
          </div>
        </div>
      )}

      {/* TAB 7: AI ENGINE & GEMINI API CONFIGURATION */}
      {activeMenuTab === "ai" && (
        <div className="config-panel">
          <div className="panel-section-title">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
              <div>
                <h3>🤖 Artificial Intelligence & Generative Engine</h3>
                <p>
                  Configure your Google Gemini API key to activate real-time bilingual student doubt resolution and 1-click bulk mock question generation.
                </p>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span
                  style={{
                    padding: "4px 10px",
                    borderRadius: "14px",
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    background: config.aiEnabled ? "#dcfce7" : "#fee2e2",
                    color: config.aiEnabled ? "#15803d" : "#b91c1c",
                  }}
                >
                  {config.aiEnabled ? "● AI ENGINE ACTIVE" : "○ AI DISABLED"}
                </span>

                <button
                  type="button"
                  onClick={handleTestAiConnection}
                  disabled={isTestingAi}
                  style={{
                    background: "#4338ca",
                    color: "#fff",
                    border: "none",
                    padding: "8px 16px",
                    borderRadius: "6px",
                    fontWeight: 600,
                    fontSize: "0.84rem",
                    cursor: "pointer",
                  }}
                >
                  {isTestingAi ? "Testing..." : "⚡ Test Connection"}
                </button>
              </div>
            </div>
          </div>

          {aiTestResult && (
            <div
              style={{
                marginBottom: "20px",
                padding: "12px 16px",
                borderRadius: "8px",
                fontSize: "0.88rem",
                fontWeight: 600,
                background: aiTestResult.success ? "#f0fdf4" : "#fef2f2",
                color: aiTestResult.success ? "#166534" : "#991b1b",
                border: `1px solid ${aiTestResult.success ? "#bbf7d0" : "#fecaca"}`,
              }}
            >
              {aiTestResult.message}
            </div>
          )}

          <div className="config-form-grid-2">
            <div className="config-field full-width">
              <label>Master AI Toggle</label>
              <div style={{ display: "flex", gap: "16px", alignItems: "center", marginTop: "6px" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontWeight: 600 }}>
                  <input
                    type="radio"
                    name="aiEnabled"
                    checked={config.aiEnabled !== false}
                    onChange={() => setConfig({ ...config, aiEnabled: true })}
                  />
                  <span>Enable AI Everywhere (Student Doubt Solver + Admin Generator)</span>
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontWeight: 600, color: "#64748b" }}>
                  <input
                    type="radio"
                    name="aiEnabled"
                    checked={config.aiEnabled === false}
                    onChange={() => setConfig({ ...config, aiEnabled: false })}
                  />
                  <span>Disable AI Features</span>
                </label>
              </div>
            </div>

            <div className="config-field full-width">
              <label>Google Gemini API Key</label>
              <input
                type="password"
                value={config.geminiApiKey || ""}
                onChange={(e) => setConfig({ ...config, geminiApiKey: e.target.value.trim() })}
                placeholder="AIzaSy..."
              />
              <small style={{ display: "block", marginTop: "4px" }}>
                Get a free API key at <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" style={{ color: "#4338ca", fontWeight: 600 }}>Google AI Studio</a>. If left blank, the platform automatically utilizes its high-yield simulation fallback engine with zero downtime.
              </small>
            </div>

            <div className="config-field">
              <label>AI Model</label>
              <select
                value={config.aiModel || "gemini-2.5-flash"}
                onChange={(e) => setConfig({ ...config, aiModel: e.target.value })}
              >
                <option value="gemini-2.5-flash">Gemini 2.5 Flash (Recommended: Ultra-fast, official 2026 commission model)</option>
                <option value="gemini-2.5-pro">Gemini 2.5 Pro (Deep pedagogical reasoning for high-difficulty UPSC/PSC)</option>
                <option value="gemini-flash-latest">Gemini Flash Latest (Auto-updating production build)</option>
                <option value="gemini-2.5-flash-lite">Gemini 2.5 Flash Lite (Low latency, high throughput)</option>
              </select>
              <small>Optimized for bilingual Hindi &amp; English question papers with automatic fallback.</small>
            </div>
          </div>

          <div style={{ marginTop: "24px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
            <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "18px" }}>
              <div style={{ fontSize: "1.2rem", marginBottom: "8px" }}>💡</div>
              <h4 style={{ margin: "0 0 6px", fontSize: "0.95rem" }}>Student AI Doubt Tutor</h4>
              <p style={{ margin: 0, fontSize: "0.82rem", color: "#64748b", lineHeight: 1.5 }}>
                Active on every student result scorecard (<code>/results/[id]</code>). Allows aspirants to ask why options are wrong and receive bilingual memory tricks.
              </p>
            </div>

            <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "18px" }}>
              <div style={{ fontSize: "1.2rem", marginBottom: "8px" }}>⚡</div>
              <h4 style={{ margin: "0 0 6px", fontSize: "0.95rem" }}>Admin Bulk Question Generator</h4>
              <p style={{ margin: 0, fontSize: "0.82rem", color: "#64748b", lineHeight: 1.5 }}>
                Active inside <strong>Mock Test Manager</strong>. Admin can enter syllabus topics to generate 5-option BPSC pattern MCQs and import them directly to tests.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
