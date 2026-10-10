"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export type AdminTab =
  | "overview"
  | "questions"
  | "add-question"
  | "bulk-import"
  | "tests"
  | "pyq"
  | "rules"
  | "taxonomy"
  | "users"
  | "demands"
  | "commerce"
  | "coupons"
  | "wallets"
  | "notifications"
  | "audit"
  | "site-config"
  | "settings";

interface AdminSidebarProps {
  activeTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  currentUser: { email: string; displayName: string; role: string };
  counts: {
    questions: number;
    mockTests: number;
    rules: number;
    users: number;
    demands: number;
    audit: number;
  };
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export default function AdminSidebar({
  activeTab,
  onSelectTab,
  currentUser,
  counts,
  isMobileOpen,
  onCloseMobile,
}: AdminSidebarProps) {
  const router = useRouter();
  const [logoImageUrl, setLogoImageUrl] = useState("");
  const [portalName, setPortalName] = useState("India Mock Tests");

  useEffect(() => {
    fetch("/api/admin/config")
      .then((res) => res.json())
      .then((data) => {
        if (data?.config?.logoImageUrl) setLogoImageUrl(data.config.logoImageUrl);
        if (data?.config?.portalName) setPortalName(data.config.portalName);
      })
      .catch(() => {});
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  function handleTabClick(tab: AdminTab) {
    onSelectTab(tab);
    onCloseMobile();
  }

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && <div className="admin-sidebar-backdrop" onClick={onCloseMobile} />}

      <aside className={`admin-sidebar ${isMobileOpen ? "sidebar-mobile-open" : ""}`}>
        {/* Brand Header */}
        <div className="sidebar-brand-header">
          <Link className="logo admin-logo-link" href="/" onClick={onCloseMobile} style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
            {logoImageUrl ? (
              <img
                src={logoImageUrl}
                alt={portalName}
                style={{ height: "36px", maxHeight: "40px", maxWidth: "150px", width: "auto", objectFit: "contain", display: "block" }}
                onError={() => setLogoImageUrl("")}
              />
            ) : (
              <>
                <span className="logo-mark">{portalName.slice(0, 1).toUpperCase()}</span>
                <span>{portalName}<span className="logo-dot">.</span></span>
              </>
            )}
          </Link>
          <span className="admin-badge-tag">ADMIN</span>
          <button type="button" className="sidebar-close-btn" onClick={onCloseMobile}>
            ✕
          </button>
        </div>

        {/* Current Admin Card */}
        <div className="sidebar-user-card">
          <div className="sidebar-avatar">
            {currentUser.displayName.charAt(0).toUpperCase()}
          </div>
          <div className="sidebar-user-info">
            <span className="sidebar-user-name">{currentUser.displayName}</span>
            <span className="sidebar-user-role">{currentUser.email}</span>
          </div>
        </div>

        {/* Navigation Sections */}
        <nav className="sidebar-nav-scroll">
          {/* Main */}
          <div className="nav-section">
            <span className="nav-section-title">MAIN</span>
            <button
              type="button"
              className={`nav-link-btn ${activeTab === "overview" ? "active" : ""}`}
              onClick={() => handleTabClick("overview")}
            >
              <span className="nav-icon">📊</span>
              <span className="nav-label">Dashboard Overview</span>
            </button>
          </div>

          {/* Content & Curriculum */}
          <div className="nav-section">
            <span className="nav-section-title">CONTENT & QUESTIONS</span>
            <button
              type="button"
              className={`nav-link-btn ${activeTab === "questions" ? "active" : ""}`}
              onClick={() => handleTabClick("questions")}
            >
              <span className="nav-icon">📋</span>
              <span className="nav-label">Question Bank</span>
              <span className="nav-counter">{counts.questions}</span>
            </button>

            <button
              type="button"
              className={`nav-link-btn ${activeTab === "add-question" ? "active" : ""}`}
              onClick={() => handleTabClick("add-question")}
            >
              <span className="nav-icon">✍️</span>
              <span className="nav-label">Add Single Question</span>
            </button>

            <button
              type="button"
              className={`nav-link-btn ${activeTab === "bulk-import" ? "active" : ""}`}
              onClick={() => handleTabClick("bulk-import")}
            >
              <span className="nav-icon">📦</span>
              <span className="nav-label">Bulk Import (CSV/JSON)</span>
              <span className="nav-tag-batch">Batch</span>
            </button>

            <button
              type="button"
              className={`nav-link-btn ${activeTab === "tests" ? "active" : ""}`}
              onClick={() => handleTabClick("tests")}
            >
              <span className="nav-icon">🎯</span>
              <span className="nav-label">Mock Tests & Demands</span>
              <span className="nav-counter">{counts.mockTests}</span>
            </button>

            <button
              type="button"
              className={`nav-link-btn ${activeTab === "pyq" ? "active" : ""}`}
              onClick={() => handleTabClick("pyq")}
            >
              <span className="nav-icon">📑</span>
              <span className="nav-label">PYQ Papers Hub</span>
              <span className="nav-tag-batch" style={{ background: "#059669" }}>PDF</span>
            </button>

            <button
              type="button"
              className={`nav-link-btn ${activeTab === "rules" ? "active" : ""}`}
              onClick={() => handleTabClick("rules")}
            >
              <span className="nav-icon">⚖️</span>
              <span className="nav-label">Scoring Rules</span>
              <span className="nav-counter">{counts.rules}</span>
            </button>

            <button
              type="button"
              className={`nav-link-btn ${activeTab === "taxonomy" ? "active" : ""}`}
              onClick={() => handleTabClick("taxonomy")}
            >
              <span className="nav-icon">🏛️</span>
              <span className="nav-label">Exam Taxonomy</span>
            </button>
          </div>

          {/* Administration & Operations */}
          <div className="nav-section">
            <span className="nav-section-title">ADMINISTRATION</span>
            <button
              type="button"
              className={`nav-link-btn ${activeTab === "users" ? "active" : ""}`}
              onClick={() => handleTabClick("users")}
            >
              <span className="nav-icon">👥</span>
              <span className="nav-label">User Management</span>
              <span className="nav-counter" style={{ background: "#e8f0fe", color: "#1a73e8" }}>
                {counts.users}
              </span>
            </button>

            <button
              type="button"
              className={`nav-link-btn ${activeTab === "demands" ? "active" : ""}`}
              onClick={() => handleTabClick("demands")}
            >
              <span className="nav-icon">💡</span>
              <span className="nav-label">Learner Demands</span>
              {counts.demands > 0 && <span className="nav-counter">{counts.demands}</span>}
            </button>

            <button
              type="button"
              className={`nav-link-btn ${activeTab === "commerce" ? "active" : ""}`}
              onClick={() => handleTabClick("commerce")}
            >
              <span className="nav-icon">💳</span>
              <span className="nav-label">Pricing Plans & Orders</span>
            </button>

            <button
              type="button"
              className={`nav-link-btn ${activeTab === "coupons" ? "active" : ""}`}
              onClick={() => handleTabClick("coupons")}
            >
              <span className="nav-icon">🏷️</span>
              <span className="nav-label">Coupons & Discounts</span>
            </button>

            <button
              type="button"
              className={`nav-link-btn ${activeTab === "wallets" ? "active" : ""}`}
              onClick={() => handleTabClick("wallets")}
            >
              <span className="nav-icon">👛</span>
              <span className="nav-label">Student Wallets & Txns</span>
            </button>

            <button
              type="button"
              className={`nav-link-btn ${activeTab === "notifications" ? "active" : ""}`}
              onClick={() => handleTabClick("notifications")}
            >
              <span className="nav-icon">🔔</span>
              <span className="nav-label">Notifications</span>
            </button>

            <button
              type="button"
              className={`nav-link-btn ${activeTab === "site-config" ? "active" : ""}`}
              onClick={() => handleTabClick("site-config")}
            >
              <span className="nav-icon">🌐</span>
              <span className="nav-label">Website & Menu Studio</span>
            </button>
          </div>

          {/* System & Logs */}
          <div className="nav-section">
            <span className="nav-section-title">SYSTEM</span>
            <button
              type="button"
              className={`nav-link-btn ${activeTab === "audit" ? "active" : ""}`}
              onClick={() => handleTabClick("audit")}
            >
              <span className="nav-icon">📜</span>
              <span className="nav-label">Audit Logs</span>
              <span className="nav-counter">{counts.audit}</span>
            </button>

            <button
              type="button"
              className={`nav-link-btn ${activeTab === "settings" ? "active" : ""}`}
              onClick={() => handleTabClick("settings")}
            >
              <span className="nav-icon">⚙️</span>
              <span className="nav-label">Settings & Health</span>
            </button>
          </div>
        </nav>

        {/* Sidebar Footer */}
        <div className="sidebar-footer">
          <div className="database-status-indicator">
            <span className="db-dot-live" />
            <span>Database Live</span>
          </div>

          <div className="footer-action-links">
            <Link className="footer-learner-link" href="/dashboard">
              ← Learner view
            </Link>
            <button type="button" className="footer-logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
