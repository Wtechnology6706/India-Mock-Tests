"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { AuthUser } from "../../lib/auth-store";
import type { UserDashboardPayload, UserAttemptHistoryItem } from "../../lib/dashboard-store";
import type { OrderRecord } from "../../lib/commerce-store";
import type { MockTest } from "../../lib/admin-content";
import { mockTests } from "../../lib/syllabus";
import { featuredExams } from "../../lib/catalog";
import InvoiceModal from "../components/InvoiceModal";
import WalletModal from "../components/WalletModal";
import { evaluateTestAccess, defaultExamGroups, type ExamGroup } from "../../lib/exam-group-types";

type TabKey = "overview" | "tests" | "exams" | "pyq" | "tutorials" | "progress" | "membership" | "settings" | "wallet";

type DashboardClientProps = {
  user: AuthUser;
  initialData?: UserDashboardPayload;
  initialMockTests?: MockTest[];
};

export default function DashboardClient({ user, initialData, initialMockTests }: DashboardClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [examFilter, setExamFilter] = useState("All");
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<OrderRecord | null>(null);
  const [logoImageUrl, setLogoImageUrl] = useState("");
  const [logoHeight, setLogoHeight] = useState<number>(38);
  const [logoOffsetX, setLogoOffsetX] = useState<number>(0);
  const [logoOffsetY, setLogoOffsetY] = useState<number>(0);
  const [portalName, setPortalName] = useState("Sarkari Practice");
  const [isMounted, setIsMounted] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // Wallet state
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [walletTransactions, setWalletTransactions] = useState<any[]>([]);
  const [walletLoading, setWalletLoading] = useState(false);
  const [walletFilter, setWalletFilter] = useState<"all" | "credit" | "debit">("all");
  const [accessFilter, setAccessFilter] = useState<"all" | "purchased" | "unpurchased" | "free">("all");
  const [topupAmount, setTopupAmount] = useState<number>(499);
  const [topupLoading, setTopupLoading] = useState(false);
  const [topupMsg, setTopupMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // PYQ papers tab state
  const [dashboardPyqs, setDashboardPyqs] = useState<any[]>([]);
  const [pyqLoading, setPyqLoading] = useState(false);
  const [pyqExamFilter, setPyqExamFilter] = useState("all");
  const [pyqSearch, setPyqSearch] = useState("");

  useEffect(() => {
    if (activeTab === "pyq" && dashboardPyqs.length === 0 && !pyqLoading) {
      setPyqLoading(true);
      fetch("/api/pyq")
        .then((res) => res.json())
        .then((data) => {
          if (data?.success && Array.isArray(data.pyqs)) {
            setDashboardPyqs(data.pyqs);
          }
        })
        .catch(() => {})
        .finally(() => setPyqLoading(false));
    }
  }, [activeTab, dashboardPyqs.length, pyqLoading]);

  const loadWallet = async () => {
    setWalletLoading(true);
    try {
      const res = await fetch("/api/wallet");
      const data = await res.json();
      if (data?.success) {
        if (data.wallet) setWalletBalance(data.wallet.balance);
        if (Array.isArray(data.transactions)) setWalletTransactions(data.transactions);
      }
    } catch (err) {
      console.error("Failed to load wallet data:", err);
    } finally {
      setWalletLoading(false);
    }
  };

  useEffect(() => {
    loadWallet();
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const fetchFreshConfig = () => {
      fetch(`/api/config?t=${Date.now()}`, { cache: "no-store" })
        .then((res) => res.json())
        .then((data) => {
          if (data?.config) {
            if (data.config.logoImageUrl !== undefined) setLogoImageUrl(data.config.logoImageUrl || "");
            if (data.config.portalName) setPortalName(data.config.portalName);
            if (data.config.logoHeight !== undefined) setLogoHeight(Number(data.config.logoHeight) || 38);
            if (data.config.logoOffsetX !== undefined) setLogoOffsetX(Number(data.config.logoOffsetX) || 0);
            if (data.config.logoOffsetY !== undefined) setLogoOffsetY(Number(data.config.logoOffsetY) || 0);
          }
        })
        .catch(() => { });
    };

    fetchFreshConfig();

    const handleBroadcast = () => fetchFreshConfig();
    window.addEventListener("site_config_updated", handleBroadcast);
    window.addEventListener("storage", (e) => {
      if (e.key === "site_config_updated_at") fetchFreshConfig();
    });

    return () => {
      window.removeEventListener("site_config_updated", handleBroadcast);
    };
  }, []);

  // Settings state
  const [displayName, setDisplayName] = useState(user.displayName);
  const [targetExam, setTargetExam] = useState("BPSC TRE 4.0");
  const [dailyGoal, setDailyGoal] = useState("45");
  const [settingsFeedback, setSettingsFeedback] = useState<string | null>(null);

  // Real dashboard data
  const stats = initialData?.stats || {
    totalAttempts: 0,
    completedTests: 0,
    averageScorePercent: 0,
    accuracyPercent: 0,
    totalTimeMinutes: 0,
    bestScorePercent: 0,
    currentStreakDays: 1,
  };

  const recentAttempts: UserAttemptHistoryItem[] = initialData?.recentAttempts || [];
  const orders: OrderRecord[] = initialData?.orders || [];
  const recommendedTests = initialData?.recommendedTests || mockTests.slice(0, 6);

  // Sync tab with URL hash if present
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace("#", "") as TabKey;
      if (["overview", "tests", "exams", "pyq", "tutorials", "progress", "membership", "settings", "wallet"].includes(hash)) {
        setActiveTab(hash);
      }
    };
    handleHash();
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, []);

  function switchTab(tab: TabKey) {
    setActiveTab(tab);
    window.location.hash = tab;
    setIsMobileNavOpen(false);
  }

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.href = "/";
    } catch {
      window.location.href = "/";
    }
  }

  async function handleDashboardTopup(amt: number) {
    if (amt < 10) return;
    setTopupLoading(true);
    setTopupMsg(null);
    try {
      const res = await fetch("/api/wallet/topup/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: amt }),
      });
      const data = await res.json();
      if (!data.success) {
        setTopupMsg({ text: data.error || "Top-up failed", type: "error" });
        setTopupLoading(false);
        return;
      }
      if (data.mode === "simulated") {
        const verifyRes = await fetch("/api/wallet/topup/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: amt,
            isSimulated: true,
            razorpayOrderId: data.orderId,
          }),
        });
        const vData = await verifyRes.json();
        if (vData.success) {
          setWalletBalance(vData.newBalance);
          setTopupMsg({ text: `✓ ₹${amt} added to your wallet successfully!`, type: "success" });
          loadWallet();
        } else {
          setTopupMsg({ text: vData.error || "Verification failed", type: "error" });
        }
      } else if (data.orderId && typeof window !== "undefined") {
        const options = {
          key: data.keyId,
          amount: data.amount,
          currency: data.currency || "INR",
          name: portalName || "Sarkari Practice",
          description: "Student Wallet Recharge",
          order_id: data.orderId,
          handler: async function (response: any) {
            const verifyRes = await fetch("/api/wallet/topup/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                amount: amt,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpayOrderId: response.razorpay_order_id,
                razorpaySignature: response.razorpay_signature,
              }),
            });
            const vData = await verifyRes.json();
            if (vData.success) {
              setWalletBalance(vData.newBalance);
              setTopupMsg({ text: `✓ ₹${amt} added to your wallet successfully!`, type: "success" });
              loadWallet();
            }
          },
          prefill: {
            name: user.displayName,
            email: user.email,
          },
          theme: { color: "#059669" },
        };
        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      }
    } catch (err: any) {
      setTopupMsg({ text: err?.message || "Payment process error", type: "error" });
    } finally {
      setTopupLoading(false);
    }
  }

  const [examGroups, setExamGroups] = useState<ExamGroup[]>(defaultExamGroups);

  useEffect(() => {
    fetch("/api/exam-groups")
      .then((res) => res.json())
      .then((data) => {
        if (data?.success && Array.isArray(data.groups) && data.groups.length > 0) {
          setExamGroups(data.groups);
        }
      })
      .catch(() => { });
  }, []);

  // Subscription & Exam access checker (supports both Full Bundles and Clubbed Subject Series)
  function checkTestAccess(test: { access?: string; exam?: string; examSlug?: string; subject?: string; subjectName?: string; slug?: string }) {
    return evaluateTestAccess(
      user,
      {
        access: test.access,
        exam: test.exam,
        examSlug: test.examSlug,
        subjectName: test.subjectName || test.subject,
        slug: test.slug,
      },
      examGroups
    );
  }

  // Available tests with database banners
  const availableTests = useMemo(() => {
    if (initialMockTests && initialMockTests.length > 0) {
      return initialMockTests.map((t) => ({
        slug: t.slug,
        name: t.name,
        exam: t.examName,
        examSlug: t.examSlug,
        subject: t.subjectName,
        track: t.trackSlug.replace(/-/g, " ").toUpperCase(),
        questions: t.questionCount,
        duration: `${t.durationMinutes} min`,
        access: t.access,
        bannerImageUrl: t.bannerImageUrl,
      }));
    }
    return mockTests.map((t) => ({
      ...t,
      examSlug: t.slug.includes("bpsc") ? "bpsc-tre-4" : t.slug.includes("stet") ? "bihar-stet" : "ctet",
    }));
  }, [initialMockTests]);

  // Filtered mock tests for the "tests" tab with purchased, unpurchased, and free filters
  const filteredTests = useMemo(() => {
    return availableTests.filter((test) => {
      const accessInfo = checkTestAccess(test);

      if (accessFilter === "purchased") {
        if (!accessInfo.hasAccess || accessInfo.isFree) return false;
      } else if (accessFilter === "unpurchased") {
        if (accessInfo.hasAccess) return false;
      } else if (accessFilter === "free") {
        if (!accessInfo.isFree && test.access !== "Free") return false;
      }

      if (examFilter !== "All" && !test.exam.toLowerCase().includes(examFilter.toLowerCase())) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          test.name.toLowerCase().includes(q) ||
          test.subject.toLowerCase().includes(q) ||
          test.exam.toLowerCase().includes(q) ||
          test.track.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [availableTests, accessFilter, examFilter, searchQuery, user]);

  const purchasedCount = useMemo(() => {
    return availableTests.filter((t) => {
      const acc = checkTestAccess(t);
      return acc.hasAccess && !acc.isFree;
    }).length;
  }, [availableTests, user]);

  const freeCount = useMemo(() => {
    return availableTests.filter((t) => {
      const acc = checkTestAccess(t);
      return acc.isFree || t.access === "Free";
    }).length;
  }, [availableTests]);

  const unpurchasedCount = useMemo(() => {
    return availableTests.filter((t) => {
      const acc = checkTestAccess(t);
      return !acc.hasAccess;
    }).length;
  }, [availableTests, user]);

  const initials = (user.displayName || "User")
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const firstName = user.displayName.split(" ")[0] || "Learner";
  const isVip = user.role === "admin" || user.subscriptionTier === "ultimate" || user.subscriptionTier === "sprint";
  const isUltimate = user.role === "admin" || user.subscriptionTier === "ultimate";

  const tierLabel = user.role === "admin"
    ? "👑 VIP ULTIMATE (ADMIN)"
    : user.subscriptionTier === "ultimate"
      ? "👑 VIP ULTIMATE"
      : user.subscriptionTier === "sprint"
        ? "⚡ VIP SPRINT"
        : "FREE ASPIRANT";

  return (
    <main className="dashboard-page">
      {/* Mobile Backdrop */}
      {isMobileNavOpen && (
        <div
          className="dashboard-mobile-backdrop"
          onClick={() => setIsMobileNavOpen(false)}
        />
      )}

      {/* Persistent Left Sidebar */}
      <aside className={`dashboard-sidebar ${isMobileNavOpen ? "mobile-sidebar-open" : ""}`}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", gap: "8px" }}>
          <Link
            className="logo dashboard-logo-link"
            href={user.role === "admin" ? "/" : "/dashboard"}
            onClick={(e) => {
              if (user.role !== "admin") {
                e.preventDefault();
                switchTab("overview");
              }
            }}
            style={{
              display: "flex",
              alignItems: "center",
              textDecoration: "none",
              gap: "10px",
              minWidth: 0,
              flex: 1,
            }}
          >
          {logoImageUrl ? (
            <img
              src={logoImageUrl}
              alt={portalName || "Sarkari Practice"}
              style={{
                height: "48px",
                maxHeight: "52px",
                maxWidth: "52px",
                width: "auto",
                objectFit: "contain",
                flexShrink: 0,
                display: "block",
              }}
              onError={() => setLogoImageUrl("")}
            />
          ) : (
            <span
              className="logo-mark"
              style={{
                flexShrink: 0,
                width: "44px",
                height: "44px",
                fontSize: "18px",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {(portalName || "Sarkari Practice").slice(0, 1).toUpperCase()}
            </span>
          )}
          {(() => {
            const raw = (portalName || "Sarkari Practice").trim();
            const words = raw.split(/\s+/);
            const first = words[0]?.replace(/\.+$/, "") || "Sarkari";
            const rest = (words.slice(1).join(" ") || "Practice").replace(/\.+$/, "");
            return (
              <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.05, minWidth: 0, justifyContent: "center" }}>
                <span
                  style={{
                    fontFamily: "'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif",
                    fontWeight: 800,
                    fontSize: "18.5px",
                    color: "var(--ink, #1e293b)",
                    letterSpacing: "-0.5px",
                    lineHeight: 1.08,
                    whiteSpace: "nowrap",
                  }}
                >
                  {first}.
                </span>
                <span
                  style={{
                    fontFamily: "'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif",
                    fontWeight: 800,
                    fontSize: "18.5px",
                    color: "var(--ink, #1e293b)",
                    letterSpacing: "-0.5px",
                    lineHeight: 1.08,
                    whiteSpace: "nowrap",
                  }}
                >
                  {rest}
                  <span className="logo-dot" style={{ color: "var(--coral, #d96548)" }}>.</span>
                </span>
              </div>
            );
          })()}
        </Link>
        <button
          type="button"
          className="dashboard-drawer-close-btn"
          onClick={() => setIsMobileNavOpen(false)}
          title="Close Navigation Drawer"
          aria-label="Close"
        >
          ✕
        </button>
      </div>

      <nav className="dashboard-nav">
          <button
            type="button"
            className={`dashboard-nav-btn ${activeTab === "overview" ? "active" : ""}`}
            onClick={() => switchTab("overview")}
          >
            <span>📊</span>
            Overview
          </button>

          <button
            type="button"
            className={`dashboard-nav-btn ${activeTab === "tests" ? "active" : ""}`}
            onClick={() => switchTab("tests")}
          >
            <span>📝</span>
            Mock tests
          </button>

          <button
            type="button"
            className={`dashboard-nav-btn ${activeTab === "exams" ? "active" : ""}`}
            onClick={() => switchTab("exams")}
          >
            <span>🏛️</span>
            Exam directory
          </button>

          <button
            type="button"
            className={`dashboard-nav-btn ${activeTab === "pyq" ? "active" : ""}`}
            onClick={() => switchTab("pyq")}
          >
            <span>📄</span>
            Previous Year Papers (PYQ)
            <span
              style={{
                marginLeft: "auto",
                fontSize: "10px",
                fontWeight: 700,
                background: "#ecfdf5",
                color: "#059669",
                padding: "2px 6px",
                borderRadius: "10px",
                letterSpacing: "0.4px",
              }}
            >
              NEW
            </span>
          </button>

          <button
            type="button"
            className={`dashboard-nav-btn ${activeTab === "tutorials" ? "active" : ""}`}
            onClick={() => switchTab("tutorials")}
          >
            <span>📹</span>
            Tutorials
            <span
              style={{
                marginLeft: "auto",
                fontSize: "9.5px",
                fontWeight: 700,
                background: "#fef3c7",
                color: "#92400e",
                padding: "2px 6px",
                borderRadius: "10px",
                letterSpacing: "0.4px",
              }}
            >
              SOON
            </span>
          </button>

          <button
            type="button"
            className={`dashboard-nav-btn ${activeTab === "progress" ? "active" : ""}`}
            onClick={() => switchTab("progress")}
          >
            <span>📈</span>
            Test results ({stats.totalAttempts})
          </button>

          <button
            type="button"
            className={`dashboard-nav-btn ${activeTab === "membership" ? "active" : ""}`}
            onClick={() => switchTab("membership")}
          >
            <span>👑</span>
            VIP Pass & Invoices
          </button>

          <button
            type="button"
            className={`dashboard-nav-btn ${activeTab === "wallet" ? "active" : ""}`}
            onClick={() => switchTab("wallet")}
          >
            <img
              src="/wallet.png"
              alt="Wallet"
              style={{
                width: "18px",
                height: "18px",
                objectFit: "contain",
                display: "inline-block",
                verticalAlign: "middle",
              }}
            />
            Student Wallet
          </button>
        </nav>

        <div className="dashboard-sidebar-bottom">
          <button
            type="button"
            className={`dashboard-nav-btn ${activeTab === "settings" ? "active" : ""}`}
            onClick={() => switchTab("settings")}
          >
            <span>⚙️</span>
            Account Settings
          </button>

          {user.role === "admin" && (
            <Link
              href="/admin"
              className="dashboard-nav-btn admin-link-btn"
              style={{ marginBottom: "16px", color: "#b94a2b" }}
            >
              <span>🛡️</span>
              Admin Studio
            </Link>
          )}

          <div className="dashboard-profile">
            <span className="dashboard-avatar">{initials}</span>
            <div className="dashboard-profile-info">
              <strong>{user.displayName}</strong>
              <small>{user.email}</small>
            </div>
            <button
              type="button"
              className="btn-logout-mini"
              onClick={handleLogout}
              title="Log out"
            >
              🚪
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <section className="dashboard-main">
        {/* Top bar with Search & User Menu */}
        <header className="dashboard-topbar">
          <button
            type="button"
            className="dashboard-mobile-menu-btn"
            onClick={() => setIsMobileNavOpen(true)}
            aria-label="Open navigation menu"
            title="Open Menu"
          >
            ☰
          </button>
          <div className="dashboard-search-container">
            <span className="search-symbol">⌕</span>
            <input
              type="text"
              placeholder="Search tests, topics, subjects, chapters..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (activeTab === "overview" && e.target.value.trim()) {
                  setActiveTab("tests");
                }
              }}
              className="dashboard-search-input"
            />
            {searchQuery && (
              <button
                type="button"
                className="search-clear-btn"
                onClick={() => setSearchQuery("")}
              >
                ✕
              </button>
            )}
          </div>

          <div className="dashboard-top-actions">
            {/* VIP Status Pill */}
            <Link
              href={isVip ? "/dashboard#membership" : "/pricing"}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                padding: "6px 12px",
                borderRadius: "20px",
                fontSize: "0.78rem",
                fontWeight: 700,
                textDecoration: "none",
                background: isUltimate ? "#fef3c7" : isVip ? "#dcfce7" : "#f1f5f9",
                color: isUltimate ? "#92400e" : isVip ? "#166534" : "#475569",
                border: isUltimate ? "1px solid #f59e0b" : isVip ? "1px solid #86efac" : "1px solid #cbd5e1",
              }}
            >
              {isVip ? tierLabel : "⚡ Upgrade to VIP"}
            </Link>

            {/* Only Super Admin can see Home link on sticky top bar */}
            {user.role === "admin" && (
              <Link href="/" className="btn-top-home" title="Go to website home">
                🏠 Home
              </Link>
            )}

            {user.role === "admin" && (
              <Link href="/admin" className="btn-top-admin" title="Admin Studio">
                🛡 Admin
              </Link>
            )}

            {/* Profile Dropdown */}
            <div className="dashboard-user-dropdown-wrapper">
              <button
                type="button"
                className="dashboard-avatar-btn"
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                aria-label="User profile options"
              >
                <span className="dashboard-mini-avatar">{initials}</span>
                <span className="avatar-user-name">{firstName}</span>
                <span className="chevron">▾</span>
              </button>

              {profileDropdownOpen && (
                <div
                  className="dashboard-profile-menu"
                  onClick={() => setProfileDropdownOpen(false)}
                >
                  <div className="menu-header">
                    <strong>{user.displayName}</strong>
                    <small>{user.email}</small>
                    <span className="role-tag">{tierLabel}</span>
                  </div>
                  <div className="menu-items">
                    <button type="button" onClick={() => switchTab("overview")}>
                      <span>📊</span> Dashboard Overview
                    </button>
                    {/* Wallet link adjusted right below Dashboard Overview */}
                    <button
                      type="button"
                      onClick={() => switchTab("wallet")}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        width: "100%",
                        color: "#065f46",
                        fontWeight: 700,
                        padding: "10px 14px",
                        margin: "3px 0",
                        cursor: "pointer",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <img src="/wallet.png" alt="Wallet" style={{ width: "18px", height: "18px", objectFit: "contain" }} />
                        <span>Student Wallet</span>
                      </div>
                      <span
                        style={{
                          background: "#059669",
                          color: "#fff",
                          padding: "2px 8px",
                          borderRadius: "12px",
                          fontSize: "0.78rem",
                          fontWeight: 800,
                        }}
                      >
                        ₹{walletBalance !== null ? walletBalance.toFixed(2) : "0.00"}
                      </span>
                    </button>
                    <button type="button" onClick={() => switchTab("tests")}>
                      <span>📝</span> My Mock Tests
                    </button>
                    <button type="button" onClick={() => switchTab("pyq")}>
                      <span>📄</span> Previous Year Papers (PYQ)
                    </button>
                    <button type="button" onClick={() => switchTab("tutorials")}>
                      <span>📹</span> Video Tutorials (Coming Soon)
                    </button>
                    <button type="button" onClick={() => switchTab("progress")}>
                      <span>📈</span> Test Performance ({stats.totalAttempts})
                    </button>
                    <button type="button" onClick={() => switchTab("membership")}>
                      <span>👑</span> VIP Pass & Invoices
                    </button>
                    <button type="button" onClick={() => switchTab("settings")}>
                      <span>⚙️</span> Account Settings
                    </button>
                    {user.role === "admin" && (
                      <Link href="/admin" className="admin-menu-link">
                        <span>🛡️</span> Admin Console →
                      </Link>
                    )}
                    <button
                      type="button"
                      className="logout-menu-btn"
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                    >
                      <span>🚪</span> {isLoggingOut ? "Logging out..." : "Sign Out"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* TAB 1: OVERVIEW */}
        {activeTab === "overview" && (
          <div className="tab-pane-content">
            <div className="dashboard-welcome">
              <div>
                <span className="kicker" suppressHydrationWarning>
                  {isMounted
                    ? new Date().toLocaleDateString("en-US", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    }).toUpperCase()
                    : ""}
                </span>
                <h1>
                  Good morning, {firstName}
                  <em>.</em>
                </h1>
                <p>Welcome to your personal exam practice dashboard.</p>
              </div>
              <button
                type="button"
                className="dashboard-primary"
                onClick={() => switchTab("tests")}
              >
                + Find a practice test
              </button>
            </div>

            {/* REAL USER STATS */}
            <section className="dashboard-stats">
              <div>
                <span className="dashboard-stat-icon coral-icon">↗</span>
                <small>OVERALL ACCURACY</small>
                <strong>{stats.accuracyPercent}%</strong>
                <em>{stats.completedTests > 0 ? `Across ${stats.completedTests} finished tests` : "Take a test to calculate"}</em>
              </div>
              <div>
                <span className="dashboard-stat-icon teal-icon">◷</span>
                <small>PRACTICE TIME</small>
                <strong>{stats.totalTimeMinutes}m</strong>
                <em>Total time engaged</em>
                <i className="dashboard-ring">{stats.completedTests}</i>
              </div>
              <div>
                <span className="dashboard-stat-icon gold-icon">✦</span>
                <small>COMPLETED TESTS</small>
                <strong>{stats.completedTests}</strong>
                <em>{stats.totalAttempts} total attempts initiated</em>
              </div>
            </section>

            {/* VIP STATUS BANNER */}
            <section style={{ marginTop: "24px" }}>
              <div
                style={{
                  background: isUltimate
                    ? "linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)"
                    : isVip
                      ? "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)"
                      : "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
                  border: isUltimate ? "1px solid #fde68a" : isVip ? "1px solid #bbf7d0" : "1px solid #e2e8f0",
                  borderRadius: "10px",
                  padding: "20px 24px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "16px",
                }}
              >
                <div>
                  <span
                    style={{
                      fontSize: "0.72rem",
                      fontWeight: 800,
                      letterSpacing: "1px",
                      color: isUltimate ? "#b45309" : isVip ? "#15803d" : "#64748b",
                    }}
                  >
                    MEMBERSHIP STATUS
                  </span>
                  <h3 style={{ margin: "4px 0 6px", fontSize: "1.2rem", fontFamily: "Space Grotesk" }}>
                    {isUltimate
                      ? "All-Exam Ultimate VIP Pass (Active)"
                      : isVip
                        ? "Single Exam Sprint Pass (Active)"
                        : "Free Aspirant Account"}
                  </h3>
                  <p style={{ margin: 0, fontSize: "0.85rem", color: "#64748b" }}>
                    {isUltimate
                      ? "Unlimited access to all state PSCs, TET, CTET, and BPSC TRE mock tests."
                      : isVip
                        ? "Access to all full-length mocks for your selected exam series."
                        : "You currently have access to free diagnostic tests. Upgrade to unlock all 500+ test series."}
                  </p>
                </div>
                <div>
                  {isVip ? (
                    <button
                      type="button"
                      className="dashboard-plan-btn"
                      onClick={() => switchTab("membership")}
                      style={{ background: "#1e3a34", color: "#fff", padding: "10px 18px", borderRadius: "6px", cursor: "pointer", fontWeight: 600, fontSize: "0.85rem" }}
                    >
                      View Billing & Invoices →
                    </button>
                  ) : (
                    <Link
                      href="/checkout?plan=ultimate"
                      style={{
                        display: "inline-block",
                        background: "linear-gradient(135deg, #b94a2b 0%, #d97706 100%)",
                        color: "#fff",
                        padding: "10px 20px",
                        borderRadius: "6px",
                        fontWeight: 700,
                        textDecoration: "none",
                        fontSize: "0.88rem",
                      }}
                    >
                      ⚡ Upgrade to VIP Pass →
                    </Link>
                  )}
                </div>
              </div>
            </section>

            {/* RECENT OR CONTINUING TEST */}
            <section className="dashboard-continue">
              <div className="dashboard-section-title">
                <div>
                  <span className="kicker">YOUR LATEST ACTIVITY</span>
                  <h2>{recentAttempts.length > 0 ? "Latest Attempt" : "Recommended Mock Test"}</h2>
                </div>
                <button
                  type="button"
                  className="link-plain-btn"
                  onClick={() => switchTab("tests")}
                >
                  View all tests →
                </button>
              </div>

              {recentAttempts.length > 0 ? (
                <div className="continue-card">
                  <div className="continue-symbol">✓</div>
                  <div className="continue-copy">
                    <span>{recentAttempts[0].exam.toUpperCase()}</span>
                    <h3>{recentAttempts[0].title}</h3>
                    <p>
                      {recentAttempts[0].isCompleted
                        ? `Score: ${recentAttempts[0].score}/${recentAttempts[0].maxScore} · ${recentAttempts[0].accuracy}% Accuracy`
                        : "In progress · Continue answering questions"}
                    </p>
                    <div className="dashboard-progress">
                      <i
                        style={{
                          width: recentAttempts[0].isCompleted
                            ? `${recentAttempts[0].accuracy}%`
                            : "50%",
                        }}
                      />
                    </div>
                  </div>
                  <strong>
                    {recentAttempts[0].isCompleted
                      ? `${recentAttempts[0].score} pts`
                      : "Active"}
                  </strong>
                  <Link
                    className="continue-action"
                    href={
                      recentAttempts[0].isCompleted
                        ? `/results/${recentAttempts[0].id}`
                        : `/attempt/${recentAttempts[0].testSlug}`
                    }
                  >
                    {recentAttempts[0].isCompleted ? "Review Analysis" : "Resume Test"} <span>→</span>
                  </Link>
                </div>
              ) : (
                <div className="continue-card">
                  <div className="continue-symbol">✦</div>
                  <div className="continue-copy">
                    <span>BPSC TRE 4.0 · FULL LENGTH MOCK 01</span>
                    <h3>BPSC TRE 4.0 General Studies & Language Diagnostic Test</h3>
                    <p>150 Questions · 150 Minutes · 5-Option OMR Format</p>
                  </div>
                  <Link className="continue-action" href="/attempt/bpsc-tre-4-full-mock-01">
                    Start Test <span>→</span>
                  </Link>
                </div>
              )}
            </section>

            {/* LOWER GRID: RECENT RESULTS & FOCUS AREAS */}
            <section className="dashboard-lower" id="progress">
              <div className="dashboard-panel">
                <div className="dashboard-section-title">
                  <div>
                    <span className="kicker">TEST HISTORY</span>
                    <h2>Recent attempts</h2>
                  </div>
                  <button
                    type="button"
                    className="link-plain-btn"
                    onClick={() => switchTab("progress")}
                  >
                    View all ({stats.totalAttempts}) →
                  </button>
                </div>
                <div className="result-list">
                  {recentAttempts.length > 0 ? (
                    recentAttempts.slice(0, 5).map((attempt) => (
                      <Link
                        href={attempt.isCompleted ? `/results/${attempt.id}` : `/attempt/${attempt.testSlug}`}
                        className="result-row"
                        key={attempt.id}
                        style={{ textDecoration: "none", color: "inherit" }}
                      >
                        <span className="result-mark">{attempt.isCompleted ? "✓" : "◷"}</span>
                        <div>
                          <strong>{attempt.title}</strong>
                          <small suppressHydrationWarning>
                            {attempt.exam} · {new Date(attempt.startedAt).toLocaleDateString()}
                          </small>
                        </div>
                        <b>{attempt.isCompleted ? `${attempt.score}/${attempt.maxScore}` : "Ongoing"}</b>
                        <span>↗</span>
                      </Link>
                    ))
                  ) : (
                    <div style={{ padding: "20px 0", color: "#94a3b8", fontSize: "0.88rem" }}>
                      No mock tests attempted yet. Pick a test from the mock tests tab to start tracking your progress!
                    </div>
                  )}
                </div>
              </div>

              <div className="dashboard-panel">
                <div className="dashboard-section-title">
                  <div>
                    <span className="kicker">TARGET SYLLABUS</span>
                    <h2>High-weightage Topics</h2>
                  </div>
                </div>
                <div className="focus-list">
                  {[
                    { topic: "Bihar History & Freedom Movement", exam: "BPSC TRE 4.0", weight: "22 Qs", color: "coral" },
                    { topic: "Child Development & Pedagogy (CDP)", exam: "CTET / STET", weight: "30 Qs", color: "teal" },
                    { topic: "Quantitative Aptitude & Number Systems", exam: "General Studies", weight: "18 Qs", color: "gold" },
                    { topic: "Indian National Movement & Geography", exam: "Class 9-10 & 11-12", weight: "25 Qs", color: "coral" },
                  ].map((focus, idx) => (
                    <div className="focus-row" key={idx}>
                      <span className={`focus-dot ${focus.color}`} />
                      <div>
                        <strong>{focus.topic}</strong>
                        <small>{focus.exam}</small>
                      </div>
                      <b>{focus.weight}</b>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        )}

        {/* TAB 2: MOCK TESTS */}
        {activeTab === "tests" && (
          <div className="tab-pane-content">
            <div className="dashboard-welcome">
              <div>
                <span className="kicker">EXAMINATION MOCK TESTS</span>
                <h1>Practice test library</h1>
                <p>Curated tests aligned with current syllabus, negative marking, and timer controls.</p>
              </div>
            </div>

            {/* Primary Access Segment Filter Buttons */}
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "16px" }}>
              <button
                type="button"
                onClick={() => setAccessFilter("purchased")}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "8px 16px",
                  borderRadius: "20px",
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  border: accessFilter === "purchased" ? "2px solid #059669" : "1px solid #cbd5e1",
                  background: accessFilter === "purchased" ? "#ecfdf5" : "#ffffff",
                  color: accessFilter === "purchased" ? "#065f46" : "#475569",
                  boxShadow: accessFilter === "purchased" ? "0 2px 6px rgba(5, 150, 105, 0.2)" : "none",
                  transition: "all 0.15s ease",
                }}
              >
                <span>👑 My Purchased Tests ({purchasedCount})</span>
              </button>

              <button
                type="button"
                onClick={() => setAccessFilter("free")}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "8px 16px",
                  borderRadius: "20px",
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  border: accessFilter === "free" ? "2px solid #2563eb" : "1px solid #cbd5e1",
                  background: accessFilter === "free" ? "#eff6ff" : "#ffffff",
                  color: accessFilter === "free" ? "#1d4ed8" : "#475569",
                  boxShadow: accessFilter === "free" ? "0 2px 6px rgba(37, 99, 235, 0.2)" : "none",
                  transition: "all 0.15s ease",
                }}
              >
                <span>🎁 Free Mock Tests ({freeCount})</span>
              </button>

              <button
                type="button"
                onClick={() => setAccessFilter("unpurchased")}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "8px 16px",
                  borderRadius: "20px",
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  border: accessFilter === "unpurchased" ? "2px solid #d97706" : "1px solid #cbd5e1",
                  background: accessFilter === "unpurchased" ? "#fffbeb" : "#ffffff",
                  color: accessFilter === "unpurchased" ? "#b45309" : "#475569",
                  boxShadow: accessFilter === "unpurchased" ? "0 2px 6px rgba(217, 119, 6, 0.2)" : "none",
                  transition: "all 0.15s ease",
                }}
              >
                <span>🔍 Explore Other Exams ({unpurchasedCount})</span>
              </button>

              <button
                type="button"
                onClick={() => setAccessFilter("all")}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "8px 16px",
                  borderRadius: "20px",
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  border: accessFilter === "all" ? "2px solid #334155" : "1px solid #cbd5e1",
                  background: accessFilter === "all" ? "#f1f5f9" : "#ffffff",
                  color: accessFilter === "all" ? "#0f172a" : "#475569",
                  transition: "all 0.15s ease",
                }}
              >
                <span>📚 All Tests ({availableTests.length})</span>
              </button>
            </div>

            {/* Exam Filter Chips */}
            <div className="dashboard-filter-bar">
              {["All", "BPSC TRE 4.0", "Bihar STET", "CTET"].map((filter) => (
                <button
                  type="button"
                  key={filter}
                  className={`filter-chip ${examFilter === filter ? "active" : ""}`}
                  onClick={() => setExamFilter(filter)}
                >
                  {filter}
                </button>
              ))}
            </div>

            {filteredTests.length > 0 ? (
              <div className="tests-grid-layout">
                {filteredTests.map((test: any) => {
                  const accessInfo = checkTestAccess(test);
                  const testExamSlug = test.examSlug || (test.slug.includes("bpsc") ? "bpsc-tre-4" : test.slug.includes("stet") ? "bihar-stet" : "ctet");
                  return (
                    <div className="test-card-item" key={test.slug}>
                      {test.bannerImageUrl ? (
                        <div className="test-card-custom-banner-wrap" style={{ height: "100px", margin: "-18px -18px 12px -18px" }}>
                          <img src={test.bannerImageUrl} alt={test.name} className="test-card-custom-banner-img" />
                          <div className="test-card-custom-banner-overlay">
                            <span className="catalog-subject-tag-overlay">{test.exam || "Official Exam"}</span>
                            <span
                              className={test.access === "Premium" ? "test-vip-tag-overlay" : "test-free-tag-overlay"}
                              title={test.access === "Premium" ? "VIP Pass Required" : "Free Mock Test"}
                            >
                              {test.access === "Premium" ? "👑" : "Free"}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="test-card-badge-row">
                          <span className="test-exam-tag">{test.exam}</span>
                          <span
                            className={`test-tier-tag ${test.access === "Premium" ? "premium" : "free"}`}
                            title={test.access === "Premium" ? "VIP Pass Required" : "Free Mock Test"}
                          >
                            {test.access === "Premium" ? "👑" : "Free"}
                          </span>
                        </div>
                      )}
                      <h3>{test.name}</h3>
                      <p className="test-desc">{test.subject} · {test.track}</p>
                      <div className="test-card-meta">
                        <span>⏱ {test.duration}</span>
                        <span>📝 {test.questions} Questions</span>
                      </div>
                      <div className="test-card-actions">
                        {accessInfo.hasAccess ? (
                          <Link
                            href={`/attempt/${test.slug}`}
                            className="btn-start-test"
                            style={!accessInfo.isFree ? { background: "linear-gradient(135deg, #15803d 0%, #166534 100%)", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "6px" } : undefined}
                          >
                            {!accessInfo.isFree ? "🔓 " : ""}Start Test →
                          </Link>
                        ) : (
                          <Link
                            href={`/checkout?plan=sprint&exam=${testExamSlug}`}
                            className="btn-start-test"
                            style={{
                              background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                              color: "#fff",
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: "6px",
                              fontWeight: 700,
                            }}
                          >
                            🔒 Unlock Test
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div
                className="empty-state-box"
                style={{
                  background: "#ffffff",
                  padding: "48px 24px",
                  borderRadius: "14px",
                  border: "1px dashed #cbd5e1",
                  textAlign: "center",
                  maxWidth: "600px",
                  margin: "24px auto",
                }}
              >
                <div style={{ fontSize: "40px", marginBottom: "12px" }}>
                  {accessFilter === "purchased" ? "👑" : accessFilter === "free" ? "🎁" : "🔍"}
                </div>
                <h3 style={{ margin: "0 0 8px", fontSize: "1.2rem", fontWeight: 800 }}>
                  {accessFilter === "purchased"
                    ? "No Active Purchased Exams"
                    : accessFilter === "free"
                      ? "No Free Tests Found"
                      : "No Mock Tests Found"}
                </h3>
                <p style={{ color: "#64748b", margin: "0 0 20px", fontSize: "0.9rem", lineHeight: "1.5" }}>
                  {accessFilter === "purchased"
                    ? "You haven't enrolled in a paid test series for this exam category yet. Explore other exam tracks to unlock full mock tests or practice with our free tests!"
                    : "No mock tests match your selected filter criteria."}
                </p>
                <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap" }}>
                  {accessFilter === "purchased" ? (
                    <>
                      <button
                        type="button"
                        className="dashboard-primary"
                        onClick={() => {
                          setAccessFilter("unpurchased");
                          setExamFilter("All");
                        }}
                      >
                        🔍 Explore Other Exams →
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setAccessFilter("free");
                          setExamFilter("All");
                        }}
                        style={{
                          background: "#eff6ff",
                          color: "#1d4ed8",
                          border: "1px solid #bfdbfe",
                          padding: "8px 18px",
                          borderRadius: "6px",
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        🎁 View Free Mock Tests
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      className="dashboard-primary"
                      onClick={() => {
                        setAccessFilter("all");
                        setExamFilter("All");
                      }}
                    >
                      Reset All Filters
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: EXAM DIRECTORY */}
        {activeTab === "exams" && (
          <div className="tab-pane-content">
            <div className="dashboard-welcome">
              <div>
                <span className="kicker">NATIONAL & STATE EXAMS</span>
                <h1>Target Examination Profiles</h1>
                <p>Official exam tracks with syllabus breakdowns, marking schemes, and subject hierarchies.</p>
              </div>
            </div>

            <div className="exams-directory-grid">
              {featuredExams.map((exam) => (
                <div className="dashboard-exam-card" key={exam.slug}>
                  <div className="exam-card-icon">{exam.symbol || "🏛"}</div>
                  <h2>{exam.title}</h2>
                  <p>{exam.meta}</p>
                  <div className="exam-card-stats">
                    <div>
                      <small>Mock Tests</small>
                      <strong>{exam.tests}</strong>
                    </div>
                    <div>
                      <small>Category</small>
                      <strong>{exam.badge}</strong>
                    </div>
                  </div>
                  <Link href={`/exams/${exam.slug}`} className="btn-view-exam">
                    Explore Tracks & Syllabus →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: PREVIOUS YEAR QUESTIONS (PYQ) */}
        {activeTab === "pyq" && (
          <div className="tab-pane-content">
            <div className="dashboard-welcome">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", width: "100%", flexWrap: "wrap", gap: "16px" }}>
                <div>
                  <span className="kicker">OFFICIAL QUESTION ARCHIVE</span>
                  <h1>Previous Year Question Papers (PYQ)</h1>
                  <p>Download and practice authentic past examination papers with official answer keys.</p>
                </div>
                <Link
                  href="/pyq"
                  target="_blank"
                  className="dashboard-primary"
                  style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "6px" }}
                >
                  Full-Screen PYQ Hub ↗
                </Link>
              </div>
            </div>

            {/* Filter pills & search */}
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center", marginBottom: "20px" }}>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                {["all", "bpsc-tre-4", "bihar-stet", "ctet"].map((slug) => {
                  const labels: Record<string, string> = {
                    all: "🌟 All Exams",
                    "bpsc-tre-4": "🎯 BPSC TRE",
                    "bihar-stet": "📖 Bihar STET",
                    ctet: "📝 CTET",
                  };
                  const isSelected = pyqExamFilter === slug;
                  return (
                    <button
                      key={slug}
                      type="button"
                      onClick={() => setPyqExamFilter(slug)}
                      style={{
                        padding: "6px 14px",
                        borderRadius: "20px",
                        fontSize: "0.82rem",
                        fontWeight: 700,
                        border: isSelected ? "2px solid #059669" : "1px solid #cbd5e1",
                        background: isSelected ? "#ecfdf5" : "#ffffff",
                        color: isSelected ? "#065f46" : "#475569",
                        cursor: "pointer",
                      }}
                    >
                      {labels[slug] || slug}
                    </button>
                  );
                })}
              </div>

              <input
                type="text"
                placeholder="Search PYQ papers..."
                value={pyqSearch}
                onChange={(e) => setPyqSearch(e.target.value)}
                style={{
                  padding: "6px 12px",
                  borderRadius: "6px",
                  border: "1px solid #cbd5e1",
                  fontSize: "0.85rem",
                  marginLeft: "auto",
                  minWidth: "220px",
                }}
              />
            </div>

            {pyqLoading ? (
              <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
                <div style={{ fontSize: "24px", marginBottom: "8px" }}>⏳</div>
                <p>Loading previous year papers archive...</p>
              </div>
            ) : (() => {
              const filtered = dashboardPyqs.filter((p) => {
                const matchExam = pyqExamFilter === "all" || p.examSlug === pyqExamFilter;
                const matchSearch =
                  !pyqSearch.trim() ||
                  p.title.toLowerCase().includes(pyqSearch.toLowerCase()) ||
                  p.paperName.toLowerCase().includes(pyqSearch.toLowerCase()) ||
                  p.examName.toLowerCase().includes(pyqSearch.toLowerCase());
                return matchExam && matchSearch;
              });

              if (filtered.length === 0) {
                return (
                  <div style={{ padding: "40px 20px", textAlign: "center", background: "#f8fafc", borderRadius: "10px", border: "1px dashed #cbd5e1" }}>
                    <span style={{ fontSize: "2rem" }}>📂</span>
                    <h3 style={{ margin: "10px 0 6px", color: "#1e293b" }}>No PYQ Papers Found</h3>
                    <p style={{ color: "#64748b", margin: "0 0 16px", fontSize: "0.88rem" }}>
                      Our editorial faculty is cataloging more authentic past papers. You can visit the full directory now.
                    </p>
                    <Link href="/pyq" className="dashboard-primary" style={{ textDecoration: "none", display: "inline-block" }}>
                      Visit PYQ Directory →
                    </Link>
                  </div>
                );
              }

              return (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
                  {filtered.map((pyq) => (
                    <div
                      key={pyq.id}
                      style={{
                        background: "#ffffff",
                        border: "1px solid #e2e8f0",
                        borderRadius: "10px",
                        padding: "16px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: "11px", fontWeight: 700, color: "#059669", background: "#ecfdf5", padding: "2px 8px", borderRadius: "4px" }}>
                          {pyq.year} Official
                        </span>
                        <span style={{ fontSize: "11px", color: "#64748b" }}>
                          {pyq.language || "Bilingual"}
                        </span>
                      </div>
                      <h3 style={{ fontSize: "0.98rem", fontWeight: 700, margin: 0, color: "#0f172a", lineHeight: 1.35 }}>
                        {pyq.title}
                      </h3>
                      <p style={{ fontSize: "0.8rem", color: "#64748b", margin: 0 }}>
                        {pyq.examName} · {pyq.paperName}
                      </p>
                      <div style={{ marginTop: "auto", paddingTop: "12px", borderTop: "1px solid #f1f5f9", display: "flex", gap: "8px" }}>
                        <Link
                          href={`/pyq?paper=${pyq.id}`}
                          className="dashboard-primary"
                          style={{ flex: 1, textAlign: "center", textDecoration: "none", fontSize: "0.82rem", padding: "7px 10px" }}
                        >
                          View & Solve ↗
                        </Link>
                        {pyq.pdfUrl && (
                          <a
                            href={pyq.pdfUrl}
                            download
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              padding: "7px 12px",
                              borderRadius: "6px",
                              border: "1px solid #cbd5e1",
                              background: "#f8fafc",
                              color: "#334155",
                              fontSize: "0.82rem",
                              fontWeight: 700,
                              textDecoration: "none",
                            }}
                            title="Download PDF"
                          >
                            ⬇ PDF
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        )}

        {/* TAB: TUTORIALS (COMING SOON) */}
        {activeTab === "tutorials" && (
          <div className="tab-pane-content">
            <div
              style={{
                background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
                border: "1px solid #e2e8f0",
                borderRadius: "14px",
                padding: "44px 28px",
                textAlign: "center",
                maxWidth: "780px",
                margin: "20px auto",
                boxShadow: "0 8px 30px rgba(0,0,0,0.04)",
              }}
            >
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "4px 12px",
                  background: "#fef3c7",
                  color: "#92400e",
                  borderRadius: "20px",
                  fontSize: "0.78rem",
                  fontWeight: 800,
                  letterSpacing: "0.5px",
                  marginBottom: "16px",
                }}
              >
                <span>📹</span> VIDEO MASTERCLASSES & CONCEPT LECTURES
              </div>

              <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "#0f172a", margin: "0 0 10px", lineHeight: 1.25 }}>
                Video Tutorials & Notes
                <br />
                <span style={{ color: "#d96548" }}>Coming Soon!</span>
              </h1>

              <p style={{ color: "#475569", fontSize: "0.96rem", lineHeight: 1.6, maxWidth: "580px", margin: "0 auto 28px" }}>
                Our expert faculty is authoring high-definition concept lectures, previous-year question video solutions, and downloadable PDF summary sheets. We will launch this module shortly.
              </p>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
                  gap: "14px",
                  textAlign: "left",
                  margin: "0 0 28px",
                }}
              >
                <div style={{ background: "#ffffff", padding: "16px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                  <div style={{ fontSize: "20px", marginBottom: "6px" }}>🎥</div>
                  <strong style={{ fontSize: "0.88rem", color: "#0f172a", display: "block", marginBottom: "4px" }}>
                    Bilingual Video Classes
                  </strong>
                  <p style={{ fontSize: "0.78rem", color: "#64748b", margin: 0, lineHeight: 1.4 }}>
                    Step-by-step theory and exam tricks for BPSC TRE, STET, and CTET.
                  </p>
                </div>

                <div style={{ background: "#ffffff", padding: "16px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                  <div style={{ fontSize: "20px", marginBottom: "6px" }}>📑</div>
                  <strong style={{ fontSize: "0.88rem", color: "#0f172a", display: "block", marginBottom: "4px" }}>
                    Revision Formula Sheets
                  </strong>
                  <p style={{ fontSize: "0.78rem", color: "#64748b", margin: 0, lineHeight: 1.4 }}>
                    Concise chapter-wise notes downloadable directly to device.
                  </p>
                </div>

                <div style={{ background: "#ffffff", padding: "16px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                  <div style={{ fontSize: "20px", marginBottom: "6px" }}>⚡</div>
                  <strong style={{ fontSize: "0.88rem", color: "#0f172a", display: "block", marginBottom: "4px" }}>
                    Quizzes & Retention
                  </strong>
                  <p style={{ fontSize: "0.78rem", color: "#64748b", margin: 0, lineHeight: 1.4 }}>
                    Instant MCQ checkpoints linked with our live mock tests.
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
                <button
                  type="button"
                  className="dashboard-primary"
                  onClick={() => switchTab("tests")}
                >
                  📝 Practice Mock Tests Meanwhile →
                </button>
                <button
                  type="button"
                  onClick={() => switchTab("pyq")}
                  style={{
                    padding: "10px 20px",
                    borderRadius: "6px",
                    border: "1px solid #cbd5e1",
                    background: "#ffffff",
                    color: "#334155",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  📄 View PYQ Papers
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: TEST RESULTS & PROGRESS */}
        {activeTab === "progress" && (
          <div className="tab-pane-content">
            <div className="dashboard-welcome">
              <div>
                <span className="kicker">PERFORMANCE ANALYTICS</span>
                <h1>Your Test Results History</h1>
                <p>Detailed breakdown of your completed and in-progress mock tests.</p>
              </div>
            </div>

            {recentAttempts.length > 0 ? (
              <div className="performance-table-container">
                <table className="results-table">
                  <thead>
                    <tr>
                      <th>Test Title & Exam</th>
                      <th>Date Taken</th>
                      <th>Score</th>
                      <th>Accuracy</th>
                      <th>Correct / Wrong</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentAttempts.map((attempt) => (
                      <tr key={attempt.id}>
                        <td>
                          <strong>{attempt.title}</strong>
                          <small style={{ display: "block", color: "#94a3b8" }}>{attempt.exam}</small>
                        </td>
                        <td suppressHydrationWarning>{new Date(attempt.startedAt).toLocaleDateString()}</td>
                        <td>
                          <strong style={{ color: "#b94a2b" }}>
                            {attempt.isCompleted ? `${attempt.score} / ${attempt.maxScore}` : "—"}
                          </strong>
                        </td>
                        <td>
                          {attempt.isCompleted ? (
                            <span className="accuracy-pill">{attempt.accuracy}%</span>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td>
                          {attempt.isCompleted ? (
                            <span>
                              <span style={{ color: "#166534", fontWeight: 600 }}>+{attempt.correct}</span> /{" "}
                              <span style={{ color: "#991b1b", fontWeight: 600 }}>-{attempt.incorrect}</span>
                            </span>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td>
                          <span className={`status-badge ${attempt.isCompleted ? "completed" : "active"}`}>
                            {attempt.isCompleted ? "Completed" : "In Progress"}
                          </span>
                        </td>
                        <td>
                          <Link
                            href={attempt.isCompleted ? `/results/${attempt.id}` : `/attempt/${attempt.testSlug}`}
                            className="btn-table-action"
                          >
                            {attempt.isCompleted ? "Review Solutions" : "Resume"}
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state-box">
                <div className="empty-icon">📊</div>
                <h3>No Test History Yet</h3>
                <p>When you attempt mock tests, your scorecards, question-by-question analytics, and answer rationales will appear here.</p>
                <button type="button" className="dashboard-primary" onClick={() => switchTab("tests")}>
                  Take a Diagnostic Test Now →
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: MEMBERSHIP & INVOICES */}
        {activeTab === "membership" && (
          <div className="tab-pane-content">
            <div className="dashboard-welcome">
              <div>
                <span className="kicker">VIP MEMBERSHIP & BILLING</span>
                <h1>Subscription Details & Invoices</h1>
                <p>Manage your VIP pass, review transaction history, and download official receipts.</p>
              </div>
              <Link href="/pricing" className="dashboard-primary" style={{ textDecoration: "none" }}>
                + Browse All Plans
              </Link>
            </div>

            {/* Plan Details Card */}
            <div
              style={{
                background: "#fff",
                border: "1px solid #e2e8f0",
                borderRadius: "10px",
                padding: "24px",
                marginBottom: "28px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
                <div>
                  <div
                    style={{
                      display: "inline-block",
                      padding: "4px 10px",
                      borderRadius: "16px",
                      fontSize: "0.75rem",
                      fontWeight: 800,
                      background: isUltimate ? "#fef3c7" : isVip ? "#dcfce7" : "#f1f5f9",
                      color: isUltimate ? "#92400e" : isVip ? "#166534" : "#475569",
                      marginBottom: "8px",
                    }}
                  >
                    CURRENT TIER: {tierLabel}
                  </div>
                  <h2 style={{ margin: "4px 0 8px", fontFamily: "Space Grotesk" }}>
                    {isUltimate
                      ? "All-Exam Ultimate VIP Pass"
                      : isVip
                        ? (user.targetExamName ? `Single Exam Sprint Pass (${user.targetExamName})` : "Single Exam Sprint Pass")
                        : "Free Aspirant Account"}
                  </h2>
                  <p style={{ margin: 0, color: "#64748b", fontSize: "0.9rem" }}>
                    {isUltimate
                      ? "Full unrestricted access to 500+ mock tests across BPSC TRE, Bihar STET, CTET & State TETs."
                      : isVip
                        ? `Targeted full access to ${user.targetExamName || "selected examination"} mock tests, detailed AI analytics & bilingual explanations.`
                        : "Basic access to free diagnostic tests."}
                  </p>
                </div>

                <div style={{ textAlign: "right" }}>
                  <span style={{ display: "block", fontSize: "0.78rem", color: "#94a3b8", fontWeight: 700 }}>
                    VALIDITY STATUS
                  </span>
                  <strong style={{ fontSize: "1.1rem", color: isVip ? "#166534" : "#64748b" }} suppressHydrationWarning>
                    {user.role === "admin"
                      ? "Permanent Administrator Pass"
                      : user.subscriptionExpiresAt
                        ? `Valid until ${new Date(user.subscriptionExpiresAt).toLocaleDateString()}`
                        : "No Expiry (Free Plan)"}
                  </strong>
                  <div style={{ marginTop: "12px" }}>
                    <Link
                      href="/checkout?plan=ultimate"
                      style={{
                        display: "inline-block",
                        background: "#1e3a34",
                        color: "#fff",
                        padding: "8px 16px",
                        borderRadius: "6px",
                        fontSize: "0.82rem",
                        fontWeight: 600,
                        textDecoration: "none",
                      }}
                    >
                      {isVip ? "Extend / Renew Pass →" : "Upgrade to Ultimate VIP →"}
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Transactions & Invoices Table */}
            <div className="dashboard-section-title">
              <div>
                <span className="kicker">ORDER HISTORY</span>
                <h2>Transaction Receipts ({orders.length})</h2>
              </div>
            </div>

            {orders.length > 0 ? (
              <div className="performance-table-container">
                <table className="results-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Plan Description</th>
                      <th>Date</th>
                      <th>Amount Paid</th>
                      <th>Payment Method</th>
                      <th>Status</th>
                      <th>Invoice</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id}>
                        <td>
                          <strong>{order.orderNumber}</strong>
                        </td>
                        <td>
                          <strong>{order.planName}</strong>
                          {order.targetExamName && (
                            <span style={{ display: "block", fontSize: "0.8rem", color: "#166534", fontWeight: 600 }}>
                              Target: {order.targetExamName}
                            </span>
                          )}
                          <small style={{ display: "block", color: "#64748b" }}>{order.durationMonths} Months Validity</small>
                        </td>
                        <td suppressHydrationWarning>{new Date(order.createdAt).toLocaleDateString()}</td>
                        <td>
                          <strong style={{ color: "#1e3a34" }}>₹{order.amount}</strong>
                        </td>
                        <td>{order.paymentMethod}</td>
                        <td>
                          <span className="status-badge completed" style={{ background: "#dcfce7", color: "#15803d" }}>
                            Paid (Success)
                          </span>
                        </td>
                        <td>
                          <button
                            type="button"
                            className="btn-table-action"
                            onClick={() => setSelectedInvoice(order)}
                          >
                            View Receipt 📄
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state-box">
                <div className="empty-icon">🧾</div>
                <h3>No Transactions Recorded</h3>
                <p>When you purchase a VIP Pass via our simulated payment gateway, your tax invoices and payment receipts will be archived here.</p>
                <Link href="/checkout?plan=ultimate" className="dashboard-primary" style={{ textDecoration: "none" }}>
                  Simulate a Checkout Now →
                </Link>
              </div>
            )}

            {/* INVOICE MODAL (Official GST Tax Invoice & A4 PDF Print) */}
            {selectedInvoice && (
              <InvoiceModal
                invoice={selectedInvoice}
                onClose={() => setSelectedInvoice(null)}
                portalName={portalName}
                logoImageUrl={logoImageUrl}
                userDisplayName={user.displayName}
                userEmail={user.email}
              />
            )}
          </div>
        )}

        {/* TAB 6: SETTINGS */}
        {activeTab === "settings" && (
          <div className="tab-pane-content">
            <div className="dashboard-welcome">
              <div>
                <span className="kicker">PREFERENCES</span>
                <h1>Account & Goal Settings</h1>
                <p>Update your display profile and target examination pace.</p>
              </div>
            </div>

            <div className="settings-form-container">
              {settingsFeedback && (
                <div className="settings-alert success">{settingsFeedback}</div>
              )}

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setSettingsFeedback("Your preferences have been saved.");
                  setTimeout(() => setSettingsFeedback(null), 3500);
                }}
              >
                <div className="form-field-group">
                  <label>Display Name</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-field-group">
                  <label>Email Address</label>
                  <input type="email" value={user.email} disabled />
                  <small>Email address cannot be modified once verified.</small>
                </div>

                <div className="form-field-group">
                  <label>Primary Target Examination</label>
                  <select
                    value={targetExam}
                    onChange={(e) => setTargetExam(e.target.value)}
                  >
                    <option value="BPSC TRE 4.0">BPSC TRE 4.0 (Teaching Service)</option>
                    <option value="Bihar STET">Bihar STET (Paper 1 & Paper 2)</option>
                    <option value="CTET">Central Teacher Eligibility Test (CTET)</option>
                  </select>
                </div>

                <div className="form-field-group">
                  <label>Daily Study Goal (Minutes)</label>
                  <input
                    type="number"
                    value={dailyGoal}
                    onChange={(e) => setDailyGoal(e.target.value)}
                    min="15"
                    max="300"
                  />
                </div>

                <button type="submit" className="dashboard-primary">
                  Save Preferences
                </button>
              </form>
            </div>
          </div>
        )}
        {/* TAB 7: STUDENT WALLET & TRANSACTIONS PASSBOOK */}
        {activeTab === "wallet" && (
          <div className="tab-pane-content">
            <div className="dashboard-welcome">
              <div>
                <span className="kicker">FINANCIAL SUMMARY & PASSBOOK</span>
                <h1>Student Digital Wallet</h1>
                <p>Recharge balance, track instant checkout credits, and inspect full transaction receipts.</p>
              </div>
              <button
                type="button"
                className="dashboard-primary"
                onClick={() => setWalletModalOpen(true)}
                style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}
              >
                <span>➕</span>
                <span>Open Wallet Popup</span>
              </button>
            </div>

            {/* Wallet Overview & Recharge Cards */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                gap: "24px",
                marginBottom: "32px",
              }}
            >
              {/* Balance Card */}
              <div
                style={{
                  background: "linear-gradient(135deg, #064e3b 0%, #065f46 50%, #0f766e 100%)",
                  borderRadius: "16px",
                  padding: "28px",
                  color: "#ffffff",
                  boxShadow: "0 14px 30px -8px rgba(6, 78, 59, 0.45)",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div style={{ position: "relative", zIndex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                    <span style={{ fontSize: "12px", letterSpacing: "1px", fontWeight: 700, color: "#a7f3d0" }}>
                      ACTIVE WALLET BALANCE
                    </span>
                    <img src="/wallet.png" alt="Wallet" style={{ width: "32px", height: "32px", objectFit: "contain" }} />
                  </div>

                  <div style={{ fontSize: "40px", fontWeight: 900, letterSpacing: "-1px", lineHeight: 1 }}>
                    ₹{walletBalance !== null ? walletBalance.toFixed(2) : "0.00"}
                  </div>

                  <div style={{ marginTop: "14px", fontSize: "13px", color: "#d1fae5" }}>
                    Account Holder: <strong>{user.displayName}</strong>
                  </div>

                  <div
                    style={{
                      marginTop: "20px",
                      paddingTop: "14px",
                      borderTop: "1px solid rgba(255,255,255,0.2)",
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "12px",
                      color: "#ecfdf5",
                    }}
                  >
                    <span>Instant 1-Click Mock Test Checkout</span>
                    <span>100% RBI Compliant</span>
                  </div>
                </div>
              </div>

              {/* Quick Top-up Card */}
              <div
                style={{
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "16px",
                  padding: "24px",
                  boxShadow: "0 4px 14px rgba(0,0,0,0.04)",
                }}
              >
                <h3 style={{ margin: "0 0 6px 0", fontSize: "17px", fontWeight: 800, color: "#0f172a" }}>
                  Instant Top-Up
                </h3>
                <p style={{ margin: "0 0 16px 0", fontSize: "13px", color: "#64748b" }}>
                  Add funds via UPI, QR, Credit/Debit Cards, or Net Banking.
                </p>

                {/* Preset Chips */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px", marginBottom: "14px" }}>
                  {[100, 250, 499, 999].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setTopupAmount(amt)}
                      style={{
                        padding: "9px 4px",
                        borderRadius: "8px",
                        border: topupAmount === amt ? "2px solid #059669" : "1px solid #cbd5e1",
                        background: topupAmount === amt ? "rgba(16, 185, 129, 0.12)" : "#f8fafc",
                        color: topupAmount === amt ? "#047857" : "#334155",
                        fontWeight: 800,
                        fontSize: "13px",
                        cursor: "pointer",
                      }}
                    >
                      ₹{amt}
                    </button>
                  ))}
                </div>

                <div style={{ display: "flex", gap: "10px" }}>
                  <div style={{ position: "relative", flex: 1 }}>
                    <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", fontWeight: 800, color: "#64748b" }}>
                      ₹
                    </span>
                    <input
                      type="number"
                      min="10"
                      value={topupAmount}
                      onChange={(e) => setTopupAmount(Number(e.target.value))}
                      style={{
                        width: "100%",
                        padding: "10px 12px 10px 28px",
                        borderRadius: "8px",
                        border: "1px solid #cbd5e1",
                        fontSize: "14px",
                        fontWeight: 700,
                      }}
                    />
                  </div>
                  <button
                    type="button"
                    disabled={topupLoading || topupAmount < 10}
                    onClick={() => handleDashboardTopup(topupAmount)}
                    style={{
                      padding: "10px 20px",
                      background: "linear-gradient(135deg, #059669, #047857)",
                      color: "#fff",
                      border: "none",
                      borderRadius: "8px",
                      fontSize: "13px",
                      fontWeight: 800,
                      cursor: topupLoading ? "not-allowed" : "pointer",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {topupLoading ? "Processing..." : `Recharge ₹${topupAmount} →`}
                  </button>
                </div>

                {topupMsg && (
                  <div
                    style={{
                      marginTop: "12px",
                      padding: "8px 12px",
                      borderRadius: "6px",
                      fontSize: "12px",
                      fontWeight: 600,
                      background: topupMsg.type === "success" ? "#ecfdf5" : "#fef2f2",
                      color: topupMsg.type === "success" ? "#065f46" : "#991b1b",
                      border: `1px solid ${topupMsg.type === "success" ? "#a7f3d0" : "#fecaca"}`,
                    }}
                  >
                    {topupMsg.text}
                  </div>
                )}
              </div>
            </div>

            {/* Transactions Section & Filter Pills */}
            <div className="dashboard-section-title" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <span className="kicker">LEDGER & STATEMENT</span>
                <h2>Wallet Transaction History ({walletTransactions.length})</h2>
              </div>

              <div style={{ display: "inline-flex", gap: "6px", background: "#e2e8f0", padding: "3px", borderRadius: "8px" }}>
                <button
                  type="button"
                  onClick={() => setWalletFilter("all")}
                  style={{
                    padding: "4px 12px",
                    borderRadius: "6px",
                    border: "none",
                    background: walletFilter === "all" ? "#ffffff" : "transparent",
                    color: walletFilter === "all" ? "#0f172a" : "#64748b",
                    fontWeight: 700,
                    fontSize: "12px",
                    cursor: "pointer",
                  }}
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => setWalletFilter("credit")}
                  style={{
                    padding: "4px 12px",
                    borderRadius: "6px",
                    border: "none",
                    background: walletFilter === "credit" ? "#ffffff" : "transparent",
                    color: walletFilter === "credit" ? "#047857" : "#64748b",
                    fontWeight: 700,
                    fontSize: "12px",
                    cursor: "pointer",
                  }}
                >
                  + Credits (Deposits)
                </button>
                <button
                  type="button"
                  onClick={() => setWalletFilter("debit")}
                  style={{
                    padding: "4px 12px",
                    borderRadius: "6px",
                    border: "none",
                    background: walletFilter === "debit" ? "#ffffff" : "transparent",
                    color: walletFilter === "debit" ? "#b91c1c" : "#64748b",
                    fontWeight: 700,
                    fontSize: "12px",
                    cursor: "pointer",
                  }}
                >
                  - Debits (Spent)
                </button>
              </div>
            </div>

            {walletLoading ? (
              <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
                Loading wallet transactions...
              </div>
            ) : walletTransactions.filter((tx) => walletFilter === "all" || tx.type === walletFilter).length > 0 ? (
              <div className="performance-table-container">
                <table className="results-table">
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Transaction Details</th>
                      <th>Reference ID</th>
                      <th>Date & Time</th>
                      <th>Amount</th>
                      <th>Balance After</th>
                    </tr>
                  </thead>
                  <tbody>
                    {walletTransactions
                      .filter((tx) => walletFilter === "all" || tx.type === walletFilter)
                      .map((tx) => {
                        const isCredit = tx.type === "credit";
                        return (
                          <tr key={tx.id}>
                            <td>
                              <span
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "5px",
                                  padding: "3px 8px",
                                  borderRadius: "6px",
                                  fontSize: "11px",
                                  fontWeight: 800,
                                  background: isCredit ? "#dcfce7" : "#fee2e2",
                                  color: isCredit ? "#15803d" : "#b91c1c",
                                }}
                              >
                                {isCredit ? "↓ CREDIT" : "↑ DEBIT"}
                              </span>
                            </td>
                            <td>
                              <strong>{tx.description || (isCredit ? "Wallet Recharge" : "Mock Test Purchase")}</strong>
                            </td>
                            <td>
                              <code style={{ fontSize: "11px", color: "#64748b" }}>
                                {tx.referenceId || tx.id.slice(0, 14)}
                              </code>
                            </td>
                            <td suppressHydrationWarning>{new Date(tx.createdAt).toLocaleString("en-IN")}</td>
                            <td>
                              <strong style={{ color: isCredit ? "#166534" : "#dc2626", fontSize: "14px" }}>
                                {isCredit ? "+" : "-"}₹{tx.amount}
                              </strong>
                            </td>
                            <td>
                              <span style={{ fontWeight: 600, color: "#334155" }}>
                                ₹{tx.balanceAfter !== undefined ? tx.balanceAfter.toFixed(2) : "—"}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state-box">
                <div className="empty-icon">
                  <img src="/wallet.png" alt="Wallet" style={{ width: "48px", height: "48px", objectFit: "contain", opacity: 0.8 }} />
                </div>
                <h3>No Transactions Found</h3>
                <p>You have not made any wallet deposits or test series redemptions matching this filter yet.</p>
                <button
                  type="button"
                  className="dashboard-primary"
                  onClick={() => handleDashboardTopup(499)}
                >
                  Add ₹499 to Wallet Now →
                </button>
              </div>
            )}
          </div>
        )}

        {/* Global Wallet Modal Popup */}
        <WalletModal
          isOpen={walletModalOpen}
          onClose={() => setWalletModalOpen(false)}
          userDisplayName={user.displayName}
          initialBalance={walletBalance}
          onBalanceUpdate={(newBal) => {
            setWalletBalance(newBal);
            loadWallet();
          }}
        />
      </section>

      {/* Mobile Bottom Navigation Bar for rapid thumb access */}
      <nav className="dashboard-mobile-bottom-bar" aria-label="Mobile Navigation">
        <button
          type="button"
          className={`dashboard-mobile-bottom-tab ${activeTab === "overview" ? "active" : ""}`}
          onClick={() => switchTab("overview")}
        >
          <span>📊</span>
          Overview
        </button>
        <button
          type="button"
          className={`dashboard-mobile-bottom-tab ${activeTab === "tests" ? "active" : ""}`}
          onClick={() => switchTab("tests")}
        >
          <span>📝</span>
          Mocks
        </button>
        <button
          type="button"
          className={`dashboard-mobile-bottom-tab ${activeTab === "progress" ? "active" : ""}`}
          onClick={() => switchTab("progress")}
        >
          <span>📈</span>
          Results
        </button>
        <button
          type="button"
          className={`dashboard-mobile-bottom-tab ${activeTab === "membership" ? "active" : ""}`}
          onClick={() => switchTab("membership")}
        >
          <span>👑</span>
          VIP
        </button>
        <button
          type="button"
          className="dashboard-mobile-bottom-tab"
          onClick={() => setIsMobileNavOpen(true)}
        >
          <span>☰</span>
          Menu
        </button>
      </nav>
    </main>
  );
}
