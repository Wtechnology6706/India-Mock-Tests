"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export type MegaMenuItem = {
  id?: string;
  label: string;
  slug: string;
  targetUrl?: string;
  isConfigured?: boolean;
  items: { id?: string; name: string; slug: string; audience?: string; targetUrl?: string; isConfigured?: boolean }[];
};

export const mockTestMegaMenu: MegaMenuItem[] = [
  {
    label: "BPSC TRE 4.0",
    slug: "bpsc-tre-4",
    items: [
      { name: "Class 1–5", slug: "primary-1-5", audience: "Primary Teacher" },
      { name: "Class 6–8", slug: "middle-6-8", audience: "Middle School Teacher" },
      { name: "Class 9–10", slug: "secondary-9-10", audience: "Secondary Teacher (TGT)" },
      { name: "Class 11–12", slug: "higher-secondary-11-12", audience: "Higher Secondary (PGT)" },
    ],
  },
  {
    label: "STET",
    slug: "bihar-stet",
    items: [
      { name: "Class 1–5", slug: "paper-1-primary", audience: "Paper I (Primary Foundation)" },
      { name: "Class 6–8", slug: "paper-1-middle", audience: "Paper I (Upper Primary)" },
      { name: "Class 9–10", slug: "paper-1", audience: "Paper I (Secondary)" },
      { name: "Class 11–12", slug: "paper-2", audience: "Paper II (Higher Secondary)" },
    ],
  },
  {
    label: "BTET",
    slug: "btet",
    items: [
      { name: "Class 1–5", slug: "paper-1", audience: "Paper I (Primary Level)" },
      { name: "Class 6–8", slug: "paper-2", audience: "Paper II (Upper Primary)" },
      { name: "Class 9–10", slug: "paper-3", audience: "Secondary Foundation" },
      { name: "Class 11–12", slug: "paper-4", audience: "Senior Secondary" },
    ],
  },
  {
    label: "CTET",
    slug: "ctet",
    items: [
      { name: "Class 1–5", slug: "paper-1", audience: "Paper I (Classes 1 to 5)" },
      { name: "Class 6–8", slug: "paper-2", audience: "Paper II (Classes 6 to 8)" },
      { name: "Class 9–10", slug: "secondary-prep", audience: "Secondary Practice" },
      { name: "Class 11–12", slug: "senior-prep", audience: "Senior Secondary Practice" },
    ],
  },
];

export const tutorialMegaMenu: MegaMenuItem[] = [
  {
    label: "TET",
    slug: "tet",
    items: [
      { name: "CTET", slug: "ctet", audience: "Central Board Preparation" },
      { name: "STET", slug: "stet", audience: "State Eligibility Concepts" },
      { name: "BPSC TRE", slug: "bpsc-tre", audience: "Teacher Recruitment Masterclass" },
      { name: "UGC NET", slug: "ugc-net", audience: "National Eligibility Lectures" },
    ],
  },
  {
    label: "Technical Tutorial",
    slug: "technical",
    items: [
      { name: "Programming", slug: "programming", audience: "Python, C++, Java, JS" },
      { name: "Cloud Computing", slug: "cloud-computing", audience: "AWS, Azure, GCP" },
      { name: "AI / ML", slug: "ai-ml", audience: "Machine Learning & LLMs" },
      { name: "Networking", slug: "networking", audience: "CCNA, Protocols, Routing" },
      { name: "Cybersecurity", slug: "cybersecurity", audience: "Ethical Hacking & Defense" },
    ],
  },
];

export default function MegaMenu() {
  const router = useRouter();
  const [activeMenu, setActiveMenu] = useState<"mock-test" | "tutorial" | null>(null);
  const [selectedMockCatIndex, setSelectedMockCatIndex] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState<{ id: string; email: string; displayName: string; role: string } | null>(null);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [topupAmount, setTopupAmount] = useState<number>(500);
  const [topupLoading, setTopupLoading] = useState(false);
  const [topupMsg, setTopupMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [portalName, setPortalName] = useState("India Mock Tests");
  const [logoImageUrl, setLogoImageUrl] = useState("");
  const [mockMenu, setMockMenu] = useState(mockTestMegaMenu);
  const [tutMenu, setTutMenu] = useState(tutorialMegaMenu);
  const [customNav, setCustomNav] = useState<any[]>([]);
  const [mobileExpandedCat, setMobileExpandedCat] = useState<string | null>(null);
  const [mobileSectionTab, setMobileSectionTab] = useState<"mock" | "tutorial">("mock");
  const menuTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Fetch auth session
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data?.user) {
          setUser(data.user);
          // Fetch wallet balance
          fetch("/api/wallet")
            .then((r) => r.json())
            .then((wData) => {
              if (wData?.success && wData.wallet) {
                setWalletBalance(wData.wallet.balance);
              }
            })
            .catch(() => {});
        }
      })
      .catch(() => {});

    // Fetch site config (portal name, logo, and dynamic menus)
    fetch("/api/config")
      .then((res) => res.json())
      .then((data) => {
        if (data?.config) {
          if (data.config.portalName) setPortalName(data.config.portalName);
          if (data.config.logoImageUrl) setLogoImageUrl(data.config.logoImageUrl);
          if (data.config.mockTestMenu?.length) setMockMenu(data.config.mockTestMenu);
          if (data.config.tutorialMenu?.length) setTutMenu(data.config.tutorialMenu);
          if (data.config.customNavMenu) setCustomNav(data.config.customNavMenu);
        }
      })
      .catch(() => {});
  }, []);

  async function handleWalletTopup(amount: number) {
    setTopupLoading(true);
    setTopupMsg(null);
    try {
      const res = await fetch("/api/wallet/topup/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
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
            amount,
            isSimulated: true,
            razorpayOrderId: data.orderId,
          }),
        });
        const verifyData = await verifyRes.json();
        if (verifyData.success) {
          setWalletBalance(verifyData.newBalance);
          setTopupMsg({ text: `₹${amount} added to your wallet successfully!`, type: "success" });
          setTimeout(() => {
            setWalletModalOpen(false);
            setTopupMsg(null);
          }, 1500);
        } else {
          setTopupMsg({ text: verifyData.error || "Top-up failed", type: "error" });
        }
      } else if (data.mode === "razorpay") {
        // Razorpay checkout
        if (!(window as any).Razorpay) {
          const script = document.createElement("script");
          script.src = "https://checkout.razorpay.com/v1/checkout.js";
          script.async = true;
          document.body.appendChild(script);
          await new Promise((resolve) => {
            script.onload = resolve;
          });
        }

        const options = {
          key: data.keyId,
          amount: data.amount,
          currency: data.currency || "INR",
          name: portalName,
          description: "Wallet Top-up",
          order_id: data.orderId,
          prefill: {
            name: user?.displayName,
            email: user?.email,
          },
          theme: { color: "#2563eb" },
          handler: async function (response: any) {
            const verifyRes = await fetch("/api/wallet/topup/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                amount,
              }),
            });
            const vData = await verifyRes.json();
            if (vData.success) {
              setWalletBalance(vData.newBalance);
              setTopupMsg({ text: `₹${amount} added successfully!`, type: "success" });
              setTimeout(() => {
                setWalletModalOpen(false);
                setTopupMsg(null);
              }, 1500);
            } else {
              setTopupMsg({ text: vData.error || "Verification failed", type: "error" });
            }
          },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      }
    } catch (err: any) {
      setTopupMsg({ text: err.message || "Network error", type: "error" });
    } finally {
      setTopupLoading(false);
    }
  }

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      window.location.href = "/";
    } catch {
      window.location.href = "/";
    }
  }

  function handleMouseEnter(menu: "mock-test" | "tutorial") {
    if (menuTimeoutRef.current) clearTimeout(menuTimeoutRef.current);
    setActiveMenu(menu);
  }

  function handleMouseLeave() {
    menuTimeoutRef.current = setTimeout(() => {
      setActiveMenu(null);
    }, 180);
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/exams?q=${encodeURIComponent(searchQuery.trim())}`);
    setSearchOpen(false);
  }

  const initials = (user?.displayName || "User")
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const firstName = user?.displayName ? user.displayName.split(" ")[0] : "Account";

  return (
    <>
      <header className="public-nav-wrapper">
        <nav className="public-nav">
          <Link className="logo public-logo-link" href="/">
            {logoImageUrl ? (
              <img
                src={logoImageUrl}
                alt={portalName}
                className="public-nav-logo-img"
                style={{ height: "50px", maxHeight: "56px", maxWidth: "260px", width: "auto", objectFit: "contain", display: "block" }}
                onError={() => setLogoImageUrl("")}
              />
            ) : (
              <>
                <span className="logo-mark">{portalName.slice(0, 1).toUpperCase()}</span>
                <span>
                  {portalName}
                  <span className="logo-dot">.</span>
                </span>
              </>
            )}
          </Link>

          {/* Desktop Mega Menu Navigation */}
          <div className="nav-links-mega">
            <Link href="/" className="nav-item-link">
              Home
            </Link>

            {/* Mock Test Mega Menu Trigger (2-Column Sidebar Layout as per India Mock Tests (1).html & Screenshot 5) */}
            <div
              className={`nav-item-dropdown ${activeMenu === "mock-test" ? "open" : ""}`}
              onMouseEnter={() => handleMouseEnter("mock-test")}
              onMouseLeave={handleMouseLeave}
            >
              <button
                type="button"
                className="nav-dropdown-btn"
                onClick={() => setActiveMenu(activeMenu === "mock-test" ? null : "mock-test")}
              >
                Mock Test <span className="chevron-icon">▾</span>
              </button>

              {activeMenu === "mock-test" && (
                <div
                  className="mega-dropdown-panel mega-mock-2col"
                  onMouseEnter={() => handleMouseEnter("mock-test")}
                  onMouseLeave={handleMouseLeave}
                >
                  {/* Left Sidebar Category Tabs */}
                  <div className="mega-sidebar-col">
                    {mockMenu.map((col, idx) => {
                      const icons: Record<string, string> = {
                        "bpsc-tre-4": "🎯",
                        "bihar-stet": "📖",
                        btet: "🎓",
                        ctet: "📝",
                        teaching: "🎯",
                        banking: "🏦",
                        upsc: "🏛️",
                        ssc: "📋",
                        railways: "🚆",
                        "state-pscs": "🎖️",
                      };
                      const icon = icons[col.slug] || "📚";
                      const isActive = idx === selectedMockCatIndex;

                      return (
                        <button
                          key={col.id || col.slug}
                          type="button"
                          className={`mega-sidebar-tab ${isActive ? "active" : ""}`}
                          onMouseEnter={() => setSelectedMockCatIndex(idx)}
                          onClick={() => setSelectedMockCatIndex(idx)}
                        >
                          <span className="mega-tab-ico">{icon}</span>
                          <span className="mega-tab-info">
                            <b>{col.label}</b>
                            <span>{col.items.length} classes / tracks</span>
                          </span>
                          <span style={{ fontSize: "16px", opacity: isActive ? 1 : 0.4, color: isActive ? "#059669" : "inherit" }}>
                            ›
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Right Dynamic Category Content */}
                  {(() => {
                    const activeCol = mockMenu[selectedMockCatIndex] || mockMenu[0];
                    if (!activeCol) return null;
                    return (
                      <div className="mega-main-content">
                        <div>
                          <div className="mega-dropdown-header">
                            <div>
                              <span className="kicker">SELECT TARGET EXAM & CLASS LEVEL</span>
                              <h3>{activeCol.label} Mock Series</h3>
                            </div>
                            <Link
                              href={activeCol.targetUrl || `/exams`}
                              className="mega-view-all"
                              onClick={() => setActiveMenu(null)}
                            >
                              View All {activeCol.label} Tests →
                            </Link>
                          </div>

                          <div className="mega-category-grid">
                            {activeCol.items.map((sub: any) => {
                              const target = sub.targetUrl ?? `/tracks/${activeCol.slug}/${sub.slug}`;
                              const isClickable = sub.isConfigured !== false && Boolean(target.trim());

                              if (!isClickable) {
                                return (
                                  <div
                                    key={sub.id || sub.slug}
                                    className="mega-sub-card disabled-unlinked"
                                    title="Not configured yet"
                                  >
                                    <b>{sub.name}</b>
                                    <span>{sub.audience || "Full Mock & Practice Track"} (Coming soon)</span>
                                  </div>
                                );
                              }

                              return (
                                <Link
                                  key={sub.id || sub.slug}
                                  href={target}
                                  className="mega-sub-card"
                                  onClick={() => setActiveMenu(null)}
                                >
                                  <b>{sub.name}</b>
                                  <span>{sub.audience || "Official CBT Format Practice"}</span>
                                </Link>
                              );
                            })}
                          </div>
                        </div>

                        {/* Bottom Bar: Subject Filters + Live Mock CTA */}
                        <div className="mega-bottom-bar">
                          <div className="mega-subject-chips">
                            <span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", color: "#64748b" }}>
                              By Subject:
                            </span>
                            {["General Studies", "Pedagogy", "Maths", "Hindi", "Science", "Computer Science"].map((subj) => (
                              <Link
                                key={subj}
                                href={`/exams?subj=${encodeURIComponent(subj)}`}
                                className="mega-chip"
                                onClick={() => setActiveMenu(null)}
                              >
                                {subj}
                              </Link>
                            ))}
                          </div>

                          <Link
                            href={`/attempt/bpsc-tre4-full-mock-1`}
                            className="mega-highlight-card"
                            onClick={() => setActiveMenu(null)}
                          >
                            <span style={{ background: "#10b981", color: "#fff", padding: "2px 6px", borderRadius: "4px", fontSize: "10px", fontWeight: 800 }}>
                              LIVE
                            </span>
                            <span>{activeCol.label} Free Mock 1</span>
                            <span>→</span>
                          </Link>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>

            {/* Tutorial Mega Menu Trigger */}
            <div
              className={`nav-item-dropdown ${activeMenu === "tutorial" ? "open" : ""}`}
              onMouseEnter={() => handleMouseEnter("tutorial")}
              onMouseLeave={handleMouseLeave}
            >
              <button
                type="button"
                className="nav-dropdown-btn"
                onClick={() => setActiveMenu(activeMenu === "tutorial" ? null : "tutorial")}
              >
                Tutorial <span className="chevron-icon">▾</span>
              </button>

              {activeMenu === "tutorial" && (
                <div className="mega-dropdown-panel" onMouseEnter={() => handleMouseEnter("tutorial")} onMouseLeave={handleMouseLeave}>
                  <div className="mega-dropdown-inner">
                    <div className="mega-dropdown-header">
                      <div>
                        <span className="kicker">LEARNING & CURRICULUM</span>
                        <h3>Video Lectures & Concept Tutorials</h3>
                      </div>
                    </div>

                    <div className="mega-columns-grid tutorial-grid">
                      {tutMenu.map((col) => (
                        <div key={col.id || col.slug} className="mega-column">
                          <div className="mega-col-title">
                            <span className="layer-2-badge tutorial-badge">{col.label}</span>
                          </div>
                          <div className="mega-sub-items">
                            {col.items.map((sub: any) => {
                              const target = sub.targetUrl ?? `/tutorials/${col.slug}/${sub.slug}`;
                              const isClickable = sub.isConfigured !== false && Boolean(target.trim());

                              if (!isClickable) {
                                return (
                                  <div
                                    key={sub.id || sub.slug}
                                    className="mega-sub-link disabled-unlinked"
                                  >
                                    <strong>{sub.name}</strong>
                                    {sub.audience && <small>{sub.audience}</small>}
                                  </div>
                                );
                              }

                              return (
                                <Link
                                  key={sub.id || sub.slug}
                                  href={target}
                                  className="mega-sub-link"
                                  onClick={() => setActiveMenu(null)}
                                >
                                  <strong>{sub.name}</strong>
                                  {sub.audience && <small>{sub.audience}</small>}
                                </Link>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* PYQ Previous Year Papers */}
            <Link href="/pyq" className="nav-item-link" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
              <span>PYQ Papers</span>
              <span style={{ fontSize: "10px", fontWeight: 800, background: "linear-gradient(135deg, #10b981, #059669)", color: "#fff", padding: "1px 6px", borderRadius: "999px", letterSpacing: "0.5px" }}>NEW</span>
            </Link>

            <Link href="/pricing" className="nav-item-link">
              Plans & Pricing
            </Link>

            {/* Custom Navigation Menu Items (Shopify-Style Navigation Customizer) */}
            {(customNav || []).map((navItem) => {
              if (navItem.subItems && navItem.subItems.length > 0) {
                return (
                  <div
                    key={navItem.id}
                    className="nav-item-dropdown"
                  >
                    <button type="button" className="nav-dropdown-btn">
                      {navItem.label}
                      {navItem.badgeText && (
                        <span style={{ fontSize: "9px", background: "#10b981", color: "#fff", padding: "1px 6px", borderRadius: "999px", marginLeft: "4px" }}>
                          {navItem.badgeText}
                        </span>
                      )}
                      <span className="chevron-icon">▾</span>
                    </button>
                    <div className="custom-sub-dropdown" style={{ minWidth: "200px", padding: "8px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: "10px", boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}>
                      {navItem.subItems.map((sub: any) => (
                        <Link
                          key={sub.id}
                          href={sub.targetUrl}
                          className="mega-sub-link"
                          onClick={() => setActiveMenu(null)}
                          style={{ padding: "8px 10px", borderRadius: "6px", display: "block" }}
                        >
                          <strong>{sub.label}</strong>
                          {sub.audience && <small style={{ display: "block", color: "#64748b" }}>{sub.audience}</small>}
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              }
              return (
                <Link
                  key={navItem.id}
                  href={navItem.targetUrl}
                  className="nav-item-link"
                  style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
                >
                  <span>{navItem.label}</span>
                  {navItem.badgeText && (
                    <span style={{ fontSize: "10px", fontWeight: 800, background: "linear-gradient(135deg, #10b981, #059669)", color: "#fff", padding: "1px 6px", borderRadius: "999px" }}>
                      {navItem.badgeText}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Nav Actions */}
          <div className="nav-actions">
            <button
              type="button"
              className="nav-search-btn"
              onClick={() => setSearchOpen(true)}
              aria-label="Search exams"
            >
              <span className="search-icon">🔍</span>
              <span>Search exams</span>
            </button>

            {user ? (
              <div className="logged-in-nav-group">
                {/* Wallet Balance Badge */}
                <button
                  type="button"
                  onClick={() => setWalletModalOpen(true)}
                  className="nav-wallet-badge-btn"
                  title="Student Wallet - Click to Add Money"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "6px 12px",
                    background: "rgba(16, 185, 129, 0.12)",
                    border: "1px solid rgba(16, 185, 129, 0.35)",
                    borderRadius: "999px",
                    color: "#059669",
                    fontWeight: 700,
                    fontSize: "13px",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                >
                  <span style={{ fontSize: "15px" }}>👛</span>
                  <span>₹{walletBalance !== null ? walletBalance.toFixed(0) : "0"}</span>
                  <span style={{ fontSize: "10px", background: "#10b981", color: "#fff", borderRadius: "50%", width: "16px", height: "16px", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>+</span>
                </button>

                <Link className="btn-dashboard-nav" href="/dashboard">
                  📊 Dashboard
                </Link>

                {/* Profile dropdown trigger */}
                <div className="nav-user-dropdown-container">
                  <button
                    type="button"
                    className="nav-user-avatar-btn"
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  >
                    <span className="user-avatar-circle">{initials}</span>
                    <span className="user-avatar-name">{firstName}</span>
                    <span className="avatar-chevron">▾</span>
                  </button>

                  {profileDropdownOpen && (
                    <div
                      className="header-profile-dropdown"
                      onClick={() => setProfileDropdownOpen(false)}
                    >
                      <div className="header-dropdown-info">
                        <strong>{user.displayName}</strong>
                        <small>{user.email}</small>
                        <span className="header-role-badge">{user.role}</span>
                      </div>

                      <div className="header-dropdown-links">
                        <div
                          style={{
                            padding: "10px 14px",
                            background: "rgba(16, 185, 129, 0.08)",
                            borderRadius: "8px",
                            margin: "4px 8px 8px",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <div>
                            <span style={{ fontSize: "11px", color: "#64748b", display: "block" }}>Wallet Balance</span>
                            <strong style={{ fontSize: "15px", color: "#0f766e" }}>₹{walletBalance !== null ? walletBalance.toFixed(2) : "0.00"}</strong>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setProfileDropdownOpen(false);
                              setWalletModalOpen(true);
                            }}
                            style={{
                              padding: "4px 10px",
                              fontSize: "12px",
                              fontWeight: 700,
                              background: "#059669",
                              color: "#fff",
                              borderRadius: "6px",
                              border: "none",
                              cursor: "pointer",
                            }}
                          >
                            + Top Up
                          </button>
                        </div>

                        <Link href="/dashboard" className="header-dropdown-item">
                          📊 Student Dashboard
                        </Link>
                        <Link href="/pyq" className="header-dropdown-item">
                          📑 Previous Year Papers (PYQ)
                        </Link>
                        <Link href="/dashboard#tests" className="header-dropdown-item">
                          📝 My Mock Tests
                        </Link>
                        <Link href="/dashboard#progress" className="header-dropdown-item">
                          📈 Practice Results
                        </Link>
                        {user.role === "admin" && (
                          <Link href="/admin" className="header-dropdown-item admin-item">
                            🛡️ Admin Studio
                          </Link>
                        )}
                        <button
                          type="button"
                          className="header-dropdown-logout"
                          onClick={handleLogout}
                        >
                          🚪 Log out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <>
                <Link className="login-link" href="/login">
                  Log in
                </Link>
                <Link className="nav-cta-btn" href="/register">
                  Start for free <span>→</span>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Right Actions: Search + Profile + Hamburger */}
          <div className="mobile-header-actions">
            <button
              type="button"
              className="mobile-search-trigger"
              onClick={() => setSearchOpen(true)}
              aria-label="Search"
            >
              🔍
            </button>

            {user ? (
              <Link href="/dashboard" className="mobile-header-avatar" title="Dashboard">
                {initials}
              </Link>
            ) : (
              <Link href="/login" className="mobile-header-login-btn">
                Log in
              </Link>
            )}

            <button
              type="button"
              className="menu-button-toggle"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle Navigation Menu"
            >
              {mobileOpen ? "✕" : "☰"}
            </button>
          </div>
        </nav>

        {/* Mobile Navigation Drawer */}
        {mobileOpen && (
          <div className="mobile-nav-drawer">
            {/* User Profile Card */}
            {user ? (
              <div className="mobile-user-card">
                <div className="mobile-avatar">{initials}</div>
                <div className="mobile-user-info">
                  <strong>{user.displayName}</strong>
                  <small>{user.email}</small>
                  <span className="mobile-role-badge">{user.role}</span>
                </div>
                <Link
                  href="/dashboard"
                  className="mobile-dashboard-link"
                  onClick={() => setMobileOpen(false)}
                >
                  Dashboard →
                </Link>
              </div>
            ) : (
              <div className="mobile-guest-card">
                <p>Sign in to track test attempts & view performance</p>
                <div className="mobile-guest-buttons">
                  <Link href="/login" className="btn-secondary-sm" onClick={() => setMobileOpen(false)}>
                    Log in
                  </Link>
                  <Link href="/register" className="btn-primary-sm" onClick={() => setMobileOpen(false)}>
                    Start Free Practice →
                  </Link>
                </div>
              </div>
            )}

            {/* Quick Links Row */}
            <div className="mobile-quick-links-row">
              <Link href="/" className="mobile-pill-link" onClick={() => setMobileOpen(false)}>
                🏠 Home
              </Link>
              <Link href="/pyq" className="mobile-pill-link" onClick={() => setMobileOpen(false)} style={{ background: "rgba(16, 185, 129, 0.12)", color: "#059669", fontWeight: 700 }}>
                📑 PYQ Papers
              </Link>
              <Link href="/exams" className="mobile-pill-link" onClick={() => setMobileOpen(false)}>
                📚 All Exams
              </Link>
              <Link href="/pricing" className="mobile-pill-link" onClick={() => setMobileOpen(false)}>
                ⭐ Plans & VIP
              </Link>
            </div>

            {user && (
              <div
                style={{
                  margin: "8px 16px 12px",
                  padding: "12px 14px",
                  background: "linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(6, 182, 212, 0.1))",
                  border: "1px solid rgba(16, 185, 129, 0.25)",
                  borderRadius: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <div style={{ fontSize: "11px", fontWeight: 600, color: "#64748b" }}>👛 Student Wallet</div>
                  <div style={{ fontSize: "18px", fontWeight: 800, color: "#065f46" }}>
                    ₹{walletBalance !== null ? walletBalance.toFixed(2) : "0.00"}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setMobileOpen(false);
                    setWalletModalOpen(true);
                  }}
                  style={{
                    padding: "6px 14px",
                    fontSize: "12px",
                    fontWeight: 700,
                    background: "#059669",
                    color: "#fff",
                    borderRadius: "8px",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  + Add Money
                </button>
              </div>
            )}

            {/* Section Switcher Tabs */}
            <div className="mobile-nav-tabs">
              <button
                type="button"
                className={`mobile-tab-btn ${mobileSectionTab === "mock" ? "active" : ""}`}
                onClick={() => setMobileSectionTab("mock")}
              >
                📝 Mock Tests ({mockMenu.length})
              </button>
              <button
                type="button"
                className={`mobile-tab-btn ${mobileSectionTab === "tutorial" ? "active" : ""}`}
                onClick={() => setMobileSectionTab("tutorial")}
              >
                📹 Tutorials ({tutMenu.length})
              </button>
            </div>

            {/* Tab 1: Mock Tests 3-Layer Dynamic Accordion */}
            {mobileSectionTab === "mock" && (
              <div className="mobile-accordion-list">
                {mockMenu.map((exam) => {
                  const isExpanded = mobileExpandedCat === (exam.slug || exam.id);
                  return (
                    <div key={exam.id || exam.slug} className={`mobile-accordion-card ${isExpanded ? "expanded" : ""}`}>
                      <button
                        type="button"
                        className="mobile-accordion-trigger"
                        onClick={() => setMobileExpandedCat(isExpanded ? null : (exam.slug || exam.id || null))}
                      >
                        <span className="accordion-label">{exam.label}</span>
                        <span className="accordion-count">{exam.items.length} levels</span>
                        <span className="accordion-arrow">{isExpanded ? "▴" : "▾"}</span>
                      </button>

                      {isExpanded && (
                        <div className="mobile-sub-items-container">
                          {exam.items.map((sub: any) => {
                            const target = sub.targetUrl ?? `/tracks/${exam.slug}/${sub.slug}`;
                            const isClickable = sub.isConfigured !== false && Boolean(target.trim());

                            if (!isClickable) {
                              return (
                                <div key={sub.id || sub.slug} className="mobile-sub-link-item disabled-unlinked">
                                  <strong>{sub.name}</strong>
                                  {sub.audience && <small>{sub.audience} (Unlinked)</small>}
                                </div>
                              );
                            }

                            return (
                              <Link
                                key={sub.id || sub.slug}
                                href={target}
                                className="mobile-sub-link-item"
                                onClick={() => setMobileOpen(false)}
                              >
                                <div>
                                  <strong>{sub.name}</strong>
                                  {sub.audience && <small>{sub.audience}</small>}
                                </div>
                                <span className="mobile-arrow">→</span>
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Tab 2: Tutorials 3-Layer Dynamic Accordion */}
            {mobileSectionTab === "tutorial" && (
              <div className="mobile-accordion-list">
                {tutMenu.map((tut) => {
                  const isExpanded = mobileExpandedCat === (tut.slug || tut.id);
                  return (
                    <div key={tut.id || tut.slug} className={`mobile-accordion-card ${isExpanded ? "expanded" : ""}`}>
                      <button
                        type="button"
                        className="mobile-accordion-trigger"
                        onClick={() => setMobileExpandedCat(isExpanded ? null : (tut.slug || tut.id || null))}
                      >
                        <span className="accordion-label tutorial-color">{tut.label}</span>
                        <span className="accordion-count">{tut.items.length} topics</span>
                        <span className="accordion-arrow">{isExpanded ? "▴" : "▾"}</span>
                      </button>

                      {isExpanded && (
                        <div className="mobile-sub-items-container">
                          {tut.items.map((sub: any) => {
                            const target = sub.targetUrl ?? `/tutorials/${tut.slug}/${sub.slug}`;
                            const isClickable = sub.isConfigured !== false && Boolean(target.trim());

                            if (!isClickable) {
                              return (
                                <div key={sub.id || sub.slug} className="mobile-sub-link-item disabled-unlinked">
                                  <strong>{sub.name}</strong>
                                  {sub.audience && <small>{sub.audience} (Unlinked)</small>}
                                </div>
                              );
                            }

                            return (
                              <Link
                                key={sub.id || sub.slug}
                                href={target}
                                className="mobile-sub-link-item"
                                onClick={() => setMobileOpen(false)}
                              >
                                <div>
                                  <strong>{sub.name}</strong>
                                  {sub.audience && <small>{sub.audience}</small>}
                                </div>
                                <span className="mobile-arrow">→</span>
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Mobile Footer Links */}
            <div className="mobile-drawer-footer">
              <div className="mobile-footer-nav-grid">
                <Link href="/about" onClick={() => setMobileOpen(false)}>
                  About {portalName}
                </Link>
                <Link href="/contact" onClick={() => setMobileOpen(false)}>
                  Help & Support
                </Link>
                <Link href="/pricing" onClick={() => setMobileOpen(false)}>
                  Pricing & Plans
                </Link>
                <Link href="/terms" onClick={() => setMobileOpen(false)}>
                  Terms of Service
                </Link>
                <Link href="/privacy" onClick={() => setMobileOpen(false)}>
                  Privacy Policy
                </Link>
                {user?.role === "admin" && (
                  <Link href="/admin" className="admin-link-highlight" onClick={() => setMobileOpen(false)}>
                    🛡 Admin Studio
                  </Link>
                )}
              </div>

              {user && (
                <button
                  type="button"
                  className="mobile-logout-full-btn"
                  onClick={() => {
                    setMobileOpen(false);
                    handleLogout();
                  }}
                >
                  ⏻ Log out of account
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Global Interactive Search Modal */}
      {searchOpen && (
        <div className="search-modal-overlay" onClick={() => setSearchOpen(false)}>
          <div className="search-modal-card" onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleSearchSubmit} className="search-modal-form">
              <span className="modal-search-icon">🔍</span>
              <input
                type="text"
                autoFocus
                placeholder="Search exams, subjects, classes, topics (e.g. BPSC, STET, Math)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-modal-input"
              />
              <button type="submit" className="search-submit-btn">
                Search →
              </button>
              <button type="button" className="search-close-btn" onClick={() => setSearchOpen(false)}>
                ✕
              </button>
            </form>

            <div className="search-quick-tags">
              <span className="quick-tags-label">Popular Searches:</span>
              <button type="button" className="quick-tag" onClick={() => { setSearchQuery("BPSC TRE 4.0"); router.push("/exams?q=BPSC"); setSearchOpen(false); }}>
                BPSC TRE 4.0
              </button>
              <button type="button" className="quick-tag" onClick={() => { setSearchQuery("Bihar STET"); router.push("/exams?q=STET"); setSearchOpen(false); }}>
                Bihar STET
              </button>
              <button type="button" className="quick-tag" onClick={() => { setSearchQuery("CTET Paper 1"); router.push("/exams?q=CTET"); setSearchOpen(false); }}>
                CTET Paper 1
              </button>
              <button type="button" className="quick-tag" onClick={() => { setSearchQuery("General Studies"); router.push("/exams?q=General+Studies"); setSearchOpen(false); }}>
                General Studies
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Wallet Top-Up Modal */}
      {walletModalOpen && (
        <div className="search-modal-overlay" onClick={() => setWalletModalOpen(false)}>
          <div
            className="search-modal-card"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "480px", padding: "28px" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "28px" }}>👛</span>
                <div>
                  <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 800, color: "#0f172a" }}>Student Wallet Recharge</h3>
                  <p style={{ margin: 0, fontSize: "13px", color: "#64748b" }}>Instant checkout for mock tests & VIP passes</p>
                </div>
              </div>
              <button
                type="button"
                className="search-close-btn"
                onClick={() => setWalletModalOpen(false)}
                style={{ position: "static" }}
              >
                ✕
              </button>
            </div>

            {/* Current Balance Card */}
            <div
              style={{
                background: "linear-gradient(135deg, #0f766e, #065f46)",
                borderRadius: "14px",
                padding: "18px 20px",
                color: "#fff",
                marginBottom: "20px",
                boxShadow: "0 10px 25px -5px rgba(15, 118, 110, 0.3)",
              }}
            >
              <div style={{ fontSize: "12px", opacity: 0.85, fontWeight: 600 }}>AVAILABLE BALANCE</div>
              <div style={{ fontSize: "30px", fontWeight: 900, marginTop: "4px" }}>
                ₹{walletBalance !== null ? walletBalance.toFixed(2) : "0.00"}
              </div>
              <div style={{ fontSize: "11px", opacity: 0.8, marginTop: "4px" }}>
                Active for: {user?.displayName || "Student"}
              </div>
            </div>

            {/* Amount Selection */}
            <div style={{ marginBottom: "18px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "#334155", marginBottom: "8px" }}>
                Select Top-up Amount:
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px", marginBottom: "12px" }}>
                {[100, 250, 499, 999].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setTopupAmount(amt)}
                    style={{
                      padding: "10px 4px",
                      borderRadius: "10px",
                      border: topupAmount === amt ? "2px solid #059669" : "1px solid #e2e8f0",
                      background: topupAmount === amt ? "rgba(16, 185, 129, 0.12)" : "#f8fafc",
                      color: topupAmount === amt ? "#047857" : "#334155",
                      fontWeight: 800,
                      fontSize: "14px",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                  >
                    ₹{amt}
                  </button>
                ))}
              </div>

              {/* Custom amount input */}
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", fontWeight: 800, color: "#64748b" }}>₹</span>
                <input
                  type="number"
                  min="10"
                  max="50000"
                  value={topupAmount}
                  onChange={(e) => setTopupAmount(Number(e.target.value))}
                  style={{
                    width: "100%",
                    padding: "12px 14px 12px 32px",
                    borderRadius: "10px",
                    border: "1px solid #cbd5e1",
                    fontSize: "16px",
                    fontWeight: 700,
                  }}
                  placeholder="Or enter custom amount..."
                />
              </div>
            </div>

            {topupMsg && (
              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: "8px",
                  marginBottom: "14px",
                  fontSize: "13px",
                  fontWeight: 600,
                  background: topupMsg.type === "success" ? "#ecfdf5" : "#fef2f2",
                  color: topupMsg.type === "success" ? "#065f46" : "#991b1b",
                  border: `1px solid ${topupMsg.type === "success" ? "#a7f3d0" : "#fecaca"}`,
                }}
              >
                {topupMsg.text}
              </div>
            )}

            <button
              type="button"
              disabled={topupLoading || topupAmount < 10}
              onClick={() => handleWalletTopup(topupAmount)}
              style={{
                width: "100%",
                padding: "14px",
                background: "linear-gradient(135deg, #059669, #047857)",
                color: "#fff",
                border: "none",
                borderRadius: "10px",
                fontSize: "15px",
                fontWeight: 800,
                cursor: topupLoading ? "not-allowed" : "pointer",
                boxShadow: "0 4px 14px rgba(5, 150, 105, 0.35)",
              }}
            >
              {topupLoading ? "Processing Payment..." : `Proceed to Add ₹${topupAmount} →`}
            </button>

            <div style={{ marginTop: "14px", textAlign: "center", fontSize: "11px", color: "#94a3b8" }}>
              🔒 100% Secure Transaction · Instant Wallet Credit via Razorpay / UPI
            </div>
          </div>
        </div>
      )}
    </>
  );
}
