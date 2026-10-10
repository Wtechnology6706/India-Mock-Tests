"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import AdminSidebar, { type AdminTab } from "./AdminSidebar";
import QuestionBankList from "./QuestionBankList";
import SingleQuestionForm from "./SingleQuestionForm";
import BulkQuestionImport from "./BulkQuestionImport";
import MockTestManager from "./MockTestManager";
import RuleForm from "./RuleForm";
import TestForm from "./TestForm";
import UserManagement from "./UserManagement";
import ExamTaxonomyManager from "./ExamTaxonomyManager";
import CommerceManager from "./CommerceManager";
import PYQManager from "./PYQManager";
import CouponsManager from "./CouponsManager";
import WalletManager from "./WalletManager";
import NotificationsManager from "./NotificationsManager";
import AuditLogsViewer from "./AuditLogsViewer";
import MenuAndSiteConfigManager from "./MenuAndSiteConfigManager";
import AdminSettings from "./AdminSettings";

import type { AdminQuestion, RuleProfile, AdminTest, Plan, Notification } from "../../lib/phase1";
import type { MockTest, SubjectDemandRequest } from "../../lib/admin-content";
import type { AuditLogEntry } from "../../lib/audit";
import type { AdminUserRecord } from "../../lib/auth-store";

type Taxonomy = {
  exams: { id: string; name: string; slug: string }[];
  subjects: { id: string; examId: string; examName: string; name: string }[];
  topics: { id: string; subjectId: string; subjectName: string; name: string }[];
};

interface AdminShellClientProps {
  currentUser: { email: string; displayName: string; role: string };
  initialQuestions: AdminQuestion[];
  initialRules: RuleProfile[];
  initialTests: AdminTest[];
  initialAuditEvents: AuditLogEntry[];
  taxonomy: Taxonomy;
  initialMockTests: MockTest[];
  initialSubjectRequests: SubjectDemandRequest[];
  initialUsers: AdminUserRecord[];
  plans: Plan[];
  notifications: Notification[];
}

const VALID_TABS: Record<string, AdminTab> = {
  overview: "overview",
  questions: "questions",
  "question-bank": "questions",
  "add-question": "add-question",
  "bulk-import": "bulk-import",
  tests: "tests",
  "mock-tests": "tests",
  pyq: "pyq",
  rules: "rules",
  "scoring-rules": "rules",
  taxonomy: "taxonomy",
  users: "users",
  demands: "demands",
  commerce: "commerce",
  plans: "commerce",
  coupons: "coupons",
  coupon: "coupons",
  wallets: "wallets",
  wallet: "wallets",
  notifications: "notifications",
  "site-config": "site-config",
  audit: "audit",
  settings: "settings",
};

export default function AdminShellClient({
  currentUser,
  initialQuestions,
  initialRules,
  initialTests,
  initialAuditEvents,
  taxonomy,
  initialMockTests,
  initialSubjectRequests,
  initialUsers,
  plans,
  notifications,
}: AdminShellClientProps) {
  const [activeTab, setActiveTabState] = useState<AdminTab>(() => {
    if (typeof window !== "undefined") {
      const searchParam = new URLSearchParams(window.location.search).get("tab");
      const hashParam = window.location.hash.replace("#", "");
      const key = searchParam || hashParam;
      if (key && VALID_TABS[key]) {
        return VALID_TABS[key];
      }
    }
    return "overview";
  });
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // Synchronize activeTab on mount and on browser back/forward (popstate / hashchange)
  useEffect(() => {
    function handleLocationSync() {
      if (typeof window === "undefined") return;
      const searchParam = new URLSearchParams(window.location.search).get("tab");
      const hashParam = window.location.hash.replace("#", "");
      const key = searchParam || hashParam;
      if (key && VALID_TABS[key]) {
        setActiveTabState(VALID_TABS[key]);
      }
    }

    handleLocationSync();
    window.addEventListener("popstate", handleLocationSync);
    window.addEventListener("hashchange", handleLocationSync);
    return () => {
      window.removeEventListener("popstate", handleLocationSync);
      window.removeEventListener("hashchange", handleLocationSync);
    };
  }, []);

  // Update URL query parameter when switching tabs
  const setActiveTab = (tab: AdminTab) => {
    setActiveTabState(tab);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (tab === "overview") {
        url.searchParams.delete("tab");
      } else {
        url.searchParams.set("tab", tab);
      }
      window.history.pushState({ tab }, "", url.pathname + url.search + url.hash);
    }
  };

  const [questions, setQuestions] = useState<AdminQuestion[]>(initialQuestions);
  const [rules, setRules] = useState<RuleProfile[]>(initialRules);
  const [tests, setTests] = useState<AdminTest[]>(initialTests);
  const [mockTests, setMockTests] = useState<MockTest[]>(initialMockTests);
  const [subjectRequests, setSubjectRequests] = useState<SubjectDemandRequest[]>(initialSubjectRequests);
  const [auditEvents, setAuditEvents] = useState<AuditLogEntry[]>(initialAuditEvents);

  const draftQuestions = questions.filter((q) => q.status === "Draft").length;
  const inReviewQuestions = questions.filter((q) => q.status === "In review").length;
  const publishedQuestions = questions.filter((q) => q.status === "Published").length;
  const liveMockTests = mockTests.filter((t) => t.status === "Published").length;

  function handleQuestionCreated(newQuestion: AdminQuestion) {
    setQuestions((prev) => [newQuestion, ...prev]);
    setActiveTab("questions");
  }

  function handleBulkImported(importedList: AdminQuestion[]) {
    setQuestions((prev) => [...importedList, ...prev]);
    setActiveTab("questions");
  }

  const getBreadcrumbTitle = () => {
    switch (activeTab) {
      case "overview":
        return "Operations Overview & Platform Control";
      case "questions":
        return "Content / Central Question Repository";
      case "add-question":
        return "Content / Add Single Question";
      case "bulk-import":
        return "Content / Bulk Question Import";
      case "tests":
        return "Content / Mock Tests & Series Builder";
      case "rules":
        return "Content / Scoring & Negative Marking Rules";
      case "taxonomy":
        return "Curriculum / Exam & Topic Taxonomy";
      case "users":
        return "Identity / User & Role Management";
      case "demands":
        return "Community / Learner Demands & Feedback";
      case "commerce":
        return "Monetization / Subscription Plans & Pricing";
      case "notifications":
        return "Communication / Official Exam Alerts";
      case "audit":
        return "Security / Audit Trail & Compliance";
      case "site-config":
        return "Platform / Website Branding & Menu Studio";
      case "settings":
        return "Platform / System Health & Settings";
      default:
        return "Admin Operations Hub";
    }
  };

  return (
    <div className="admin-shell-layout">
      {/* Left Sidebar */}
      <AdminSidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        currentUser={currentUser}
        counts={{
          questions: questions.length,
          mockTests: mockTests.length,
          rules: rules.length,
          users: initialUsers.length,
          demands: subjectRequests.reduce((sum, r) => sum + r.requestCount, 0),
          audit: auditEvents.length,
        }}
        isMobileOpen={isMobileNavOpen}
        onCloseMobile={() => setIsMobileNavOpen(false)}
      />

      {/* Main Content Area */}
      <div className="admin-main-area">
        {/* Top Navbar */}
        <header className="admin-topbar">
          <button
            type="button"
            className="mobile-menu-toggle"
            onClick={() => setIsMobileNavOpen(true)}
            aria-label="Open Navigation Menu"
          >
            ☰
          </button>

          <div className="topbar-breadcrumb">
            <span className="breadcrumb-kicker">OPERATIONS</span>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current">{getBreadcrumbTitle()}</span>
          </div>

          <div className="topbar-right-controls">
            <div className="topbar-admin-badge">
              <span className="admin-status-dot" />
              <span className="admin-name-label">{currentUser.displayName}</span>
            </div>
            <Link className="learner-switch-btn" href="/dashboard">
              ← Learner View
            </Link>
          </div>
        </header>

        {/* Dynamic Body Content */}
        <div className="admin-content-scroll">
          {/* 1. OVERVIEW TAB */}
          {activeTab === "overview" && (
            <div className="admin-overview-view">
              <header className="admin-header" style={{ padding: "30px 0 24px" }}>
                <div>
                  <span className="kicker">PHASE 5 OPERATIONS & QUESTION BANK</span>
                  <h1>
                    Keep the practice<br />
                    <em>trustworthy.</em>
                  </h1>
                  <p>
                    Author questions individually or in bulk, review scoring rule profiles, configure full
                    and sectional mock tests, manage users, and track platform audit logs.
                  </p>
                </div>
              </header>

              <section className="admin-stats" style={{ maxWidth: "100%", margin: "0 0 28px" }}>
                <div onClick={() => setActiveTab("questions")} style={{ cursor: "pointer" }}>
                  <small>QUESTION BANK</small>
                  <strong>{questions.length}</strong>
                  <span>{publishedQuestions} published · {inReviewQuestions} in review · {draftQuestions} draft</span>
                </div>
                <div onClick={() => setActiveTab("tests")} style={{ cursor: "pointer" }}>
                  <small>TESTS IN CATALOG</small>
                  <strong>{mockTests.length}</strong>
                  <span>{liveMockTests} live on frontend · {mockTests.length - liveMockTests} draft</span>
                </div>
                <div onClick={() => setActiveTab("users")} style={{ cursor: "pointer" }}>
                  <small>REGISTERED USERS</small>
                  <strong>{initialUsers.length}</strong>
                  <span>Manage roles, permissions & status</span>
                </div>
                <div onClick={() => setActiveTab("demands")} style={{ cursor: "pointer" }}>
                  <small>LEARNER DEMANDS</small>
                  <strong>{subjectRequests.reduce((sum, r) => sum + r.requestCount, 0)}</strong>
                  <span>{subjectRequests.length} requested subjects</span>
                </div>
              </section>

              {/* Quick Launch Cards */}
              <div className="admin-quick-actions-bar">
                <span className="quick-actions-title">⚡ Quick Actions:</span>
                <button type="button" className="quick-action-pill" onClick={() => setActiveTab("add-question")}>
                  ✍️ Add Question
                </button>
                <button type="button" className="quick-action-pill" onClick={() => setActiveTab("bulk-import")}>
                  📦 Bulk CSV Import
                </button>
                <button type="button" className="quick-action-pill" onClick={() => setActiveTab("tests")}>
                  🎯 Create Mock Test
                </button>
                <button type="button" className="quick-action-pill" onClick={() => setActiveTab("users")}>
                  👥 Manage Users
                </button>
                <button type="button" className="quick-action-pill" onClick={() => setActiveTab("settings")}>
                  ⚙️ System Health
                </button>
              </div>

              {/* Secondary Grid Panels */}
              <section className="admin-grid" style={{ maxWidth: "100%", margin: "24px 0" }}>
                {/* Scoring Rules Panel */}
                <div className="admin-panel">
                  <div className="admin-panel-heading">
                    <div>
                      <span className="kicker">SCORING RULES</span>
                      <h2>Published profiles</h2>
                    </div>
                    <div>
                      <RuleForm />
                    </div>
                  </div>
                  {rules.slice(0, 4).map((rule) => (
                    <div className="rule-admin-row" key={rule.id}>
                      <div>
                        <strong>{rule.exam}</strong>
                        <small>Version {rule.version} · {rule.options} options · {rule.status}</small>
                      </div>
                      <span>{rule.correctMarks} / {rule.wrongMarks}</span>
                    </div>
                  ))}
                  <button type="button" className="view-all-sublink" onClick={() => setActiveTab("rules")}>
                    View all {rules.length} scoring rules →
                  </button>
                </div>

                {/* Test Builder Panel */}
                <div className="admin-panel">
                  <div className="admin-panel-heading">
                    <div>
                      <span className="kicker">TEST BUILDER</span>
                      <h2>Publishing queue</h2>
                    </div>
                    <div>
                      <TestForm rules={rules} />
                    </div>
                  </div>
                  {tests.slice(0, 4).map((test) => (
                    <div className="admin-row" key={test.id}>
                      <span className="test-admin-icon">▣</span>
                      <div>
                        <strong>{test.name}</strong>
                        <small>{test.exam} · {test.questions} questions · {test.access}</small>
                      </div>
                      <span className="status-label">{test.status}</span>
                    </div>
                  ))}
                  <button type="button" className="view-all-sublink" onClick={() => setActiveTab("tests")}>
                    Open Mock Test Manager →
                  </button>
                </div>

                {/* Operations & Discovery Links */}
                <div className="admin-panel">
                  <div className="admin-panel-heading">
                    <div>
                      <span className="kicker">OPERATIONAL CONTROLS</span>
                      <h2>Module Hubs</h2>
                    </div>
                  </div>
                  <div className="control-links">
                    <button type="button" className="control-link-row" onClick={() => setActiveTab("users")}>
                      <div>
                        <strong>User & Access Management ({initialUsers.length} accounts)</strong>
                        <small>Admins, editors, reviewers & learners</small>
                      </div>
                      <b>→</b>
                    </button>
                    <button type="button" className="control-link-row" onClick={() => setActiveTab("commerce")}>
                      <div>
                        <strong>Subscription & Pricing ({plans.length} plans)</strong>
                        <small>Entitlements & pricing packages</small>
                      </div>
                      <b>→</b>
                    </button>
                    <button type="button" className="control-link-row" onClick={() => setActiveTab("notifications")}>
                      <div>
                        <strong>Exam Notifications ({notifications.length} alerts)</strong>
                        <small>Official alerts & timeline updates</small>
                      </div>
                      <b>→</b>
                    </button>
                    <button type="button" className="control-link-row" onClick={() => setActiveTab("settings")}>
                      <div>
                        <strong>System Settings & Diagnostics</strong>
                        <small>Database pool health & server state</small>
                      </div>
                      <b>→</b>
                    </button>
                  </div>
                </div>

                {/* Audit Trail Panel */}
                <div className="admin-panel">
                  <div className="admin-panel-heading">
                    <div>
                      <span className="kicker">AUDIT TRAIL</span>
                      <h2>Recent operator actions</h2>
                    </div>
                    <button type="button" className="view-all-sublink" onClick={() => setActiveTab("audit")}>
                      All logs →
                    </button>
                  </div>
                  {auditEvents.slice(0, 5).map((event, idx) => (
                    <div className="admin-row" key={idx}>
                      <span className="status-dot published" />
                      <div>
                        <strong>{event.action}</strong>
                        <small>{event.actor} · {event.entityType} ({event.entityId})</small>
                      </div>
                      <span className="status-label" suppressHydrationWarning>
                        {new Date(event.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}

          {/* 2. QUESTION BANK */}
          {activeTab === "questions" && (
            <div className="admin-module-view">
              <QuestionBankList
                initialQuestions={questions}
                onOpenSingleForm={() => setActiveTab("add-question")}
                onOpenBulkForm={() => setActiveTab("bulk-import")}
              />
            </div>
          )}

          {/* 3. ADD SINGLE QUESTION */}
          {activeTab === "add-question" && (
            <div className="admin-module-view">
              <SingleQuestionForm
                taxonomy={taxonomy}
                onQuestionCreated={handleQuestionCreated}
                onCancel={() => setActiveTab("questions")}
              />
            </div>
          )}

          {/* 4. BULK IMPORT */}
          {activeTab === "bulk-import" && (
            <div className="admin-module-view">
              <BulkQuestionImport
                onImportComplete={handleBulkImported}
                onCancel={() => setActiveTab("questions")}
              />
            </div>
          )}

          {/* 5. MOCK TESTS */}
          {activeTab === "tests" && (
            <div className="admin-module-view">
              <MockTestManager
                initialTests={mockTests}
                initialRequests={subjectRequests}
                questions={questions}
                onTestCreated={(newTest) => setMockTests((prev) => [newTest, ...prev])}
              />
            </div>
          )}

          {/* 5B. PREVIOUS YEAR PAPERS (PYQ) */}
          {activeTab === "pyq" && (
            <div className="admin-module-view">
              <PYQManager />
            </div>
          )}

          {/* 6. SCORING RULES */}
          {activeTab === "rules" && (
            <div className="admin-module-container">
              <div className="module-header-row">
                <div>
                  <span className="kicker">SCORING & PENALTY PROFILES</span>
                  <h2 className="module-title">Rule Profiles</h2>
                  <p className="module-desc">
                    Configure marking scheme (+1, +2, -0.25, -0.33), options count, and official instructions.
                  </p>
                </div>
                <RuleForm />
              </div>

              <div className="rules-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "16px", marginTop: "20px" }}>
                {rules.map((rule) => (
                  <div className="rule-card-admin" key={rule.id} style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: "8px", padding: "20px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                      <div>
                        <span className="kicker">VERSION {rule.version}</span>
                        <h3 style={{ margin: "4px 0", fontSize: "17px" }}>{rule.exam}</h3>
                      </div>
                      <span className="role-badge role-editor">{rule.status}</span>
                    </div>
                    <div style={{ display: "flex", gap: "16px", margin: "16px 0", padding: "12px", background: "#f8faf8", borderRadius: "6px" }}>
                      <div>
                        <small style={{ color: "#8d9a95", display: "block", fontSize: "10px" }}>CORRECT</small>
                        <strong style={{ color: "#3a7d65", fontSize: "16px" }}>{rule.correctMarks}</strong>
                      </div>
                      <div>
                        <small style={{ color: "#8d9a95", display: "block", fontSize: "10px" }}>NEGATIVE</small>
                        <strong style={{ color: "#d96548", fontSize: "16px" }}>{rule.wrongMarks}</strong>
                      </div>
                      <div>
                        <small style={{ color: "#8d9a95", display: "block", fontSize: "10px" }}>OPTIONS</small>
                        <strong style={{ fontSize: "16px" }}>{rule.options}</strong>
                      </div>
                    </div>
                    <small style={{ color: "#95a29c", fontSize: "11px" }}>Source: {rule.source}</small>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 7. TAXONOMY */}
          {activeTab === "taxonomy" && (
            <div className="admin-module-view">
              <ExamTaxonomyManager taxonomy={taxonomy} />
            </div>
          )}

          {/* 8. USER MANAGEMENT */}
          {activeTab === "users" && (
            <div className="admin-module-view">
              <UserManagement
                initialUsers={initialUsers}
                currentUserEmail={currentUser.email}
              />
            </div>
          )}

          {/* 9. LEARNER DEMANDS */}
          {activeTab === "demands" && (
            <div className="admin-module-container">
              <div className="module-header-row">
                <div>
                  <span className="kicker">DEMAND & SYLLABUS INTELLIGENCE</span>
                  <h2 className="module-title">Learner Demands & Requested Subjects</h2>
                  <p className="module-desc">
                    Aggregated requests from learners asking for unreleased test subjects or curriculum sections.
                  </p>
                </div>
              </div>

              <div className="admin-table-wrapper" style={{ marginTop: "20px" }}>
                <table className="admin-data-table">
                  <thead>
                    <tr>
                      <th>Subject Name</th>
                      <th>Exam Track</th>
                      <th>Track Slug</th>
                      <th>Demand Count</th>
                      <th>Last Requested</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subjectRequests.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="empty-table-cell">
                          <div className="empty-state-box">
                            <p>No subject requests recorded yet.</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      subjectRequests.map((req) => (
                        <tr key={req.id}>
                          <td><strong>{req.subjectName}</strong></td>
                          <td><code>{req.examSlug}</code></td>
                          <td>{req.trackSlug}</td>
                          <td>
                            <span className="role-badge role-admin">
                              {req.requestCount} requests
                            </span>
                          </td>
                          <td className="date-cell" suppressHydrationWarning>{new Date(req.lastRequestedAt).toLocaleDateString()}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 10. COMMERCE & PRICING */}
          {activeTab === "commerce" && (
            <div className="admin-module-view">
              <CommerceManager />
            </div>
          )}

          {/* 10B. COUPONS */}
          {activeTab === "coupons" && (
            <div className="admin-module-view">
              <CouponsManager />
            </div>
          )}

          {/* 10C. WALLETS */}
          {activeTab === "wallets" && (
            <div className="admin-module-view">
              <WalletManager />
            </div>
          )}

          {/* 11. NOTIFICATIONS */}
          {activeTab === "notifications" && (
            <div className="admin-module-view">
              <NotificationsManager notifications={notifications} />
            </div>
          )}

          {/* 12. AUDIT */}
          {activeTab === "audit" && (
            <div className="admin-module-view">
              <AuditLogsViewer initialEvents={auditEvents} />
            </div>
          )}

          {/* 13. WEBSITE & MENU CONFIGURATION */}
          {activeTab === "site-config" && (
            <div className="admin-module-view">
              <MenuAndSiteConfigManager />
            </div>
          )}

          {/* 14. SETTINGS */}
          {activeTab === "settings" && (
            <div className="admin-module-view">
              <AdminSettings />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
