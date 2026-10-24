"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import WalletModal from "./WalletModal";

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
    targetUrl: "/exams/bpsc-tre-4",
    items: [
      { name: "Class 1–5", slug: "primary-1-5", audience: "Primary Teacher", targetUrl: "/exams/bpsc-tre-4?track=primary-1-5", isConfigured: true },
      { name: "Class 6–8", slug: "middle-6-8", audience: "Middle School Teacher", targetUrl: "/exams/bpsc-tre-4?track=middle-6-8", isConfigured: true },
      { name: "Class 9–10", slug: "secondary-9-10", audience: "Secondary Teacher (TGT)", targetUrl: "/exams/bpsc-tre-4?track=secondary-9-10", isConfigured: true },
      { name: "Class 11–12", slug: "higher-secondary-11-12", audience: "Higher Secondary (PGT)", targetUrl: "/exams/bpsc-tre-4?track=higher-secondary-11-12", isConfigured: true },
    ],
  },
  {
    label: "STET",
    slug: "bihar-stet",
    targetUrl: "/exams/bihar-stet",
    items: [
      { name: "Class 9–10 (Paper I)", slug: "paper-1-9-10", audience: "Paper I (Secondary)", targetUrl: "/exams/bihar-stet?track=paper-1-9-10", isConfigured: true },
      { name: "Class 11–12 (Paper II)", slug: "paper-2-11-12", audience: "Paper II (Higher Secondary)", targetUrl: "/exams/bihar-stet?track=paper-2-11-12", isConfigured: true },
      { name: "Class 1–5 (Foundation)", slug: "paper-1-primary", audience: "Primary Foundation Prep", targetUrl: "/exams/bihar-stet?track=paper-1-9-10", isConfigured: true },
      { name: "Class 6–8 (Foundation)", slug: "paper-1-middle", audience: "Upper Primary Foundation", targetUrl: "/exams/bihar-stet?track=paper-1-9-10", isConfigured: true },
    ],
  },
  {
    label: "BTET",
    slug: "btet",
    targetUrl: "/exams/bihar-stet",
    items: [
      { name: "Class 1–5", slug: "paper-1", audience: "Paper I (Primary Level)", targetUrl: "/exams/bihar-stet?track=paper-1-9-10", isConfigured: true },
      { name: "Class 6–8", slug: "paper-2", audience: "Paper II (Upper Primary)", targetUrl: "/exams/bihar-stet?track=paper-1-9-10", isConfigured: true },
      { name: "Class 9–10", slug: "paper-3", audience: "Secondary Foundation", targetUrl: "/exams/bihar-stet?track=paper-1-9-10", isConfigured: true },
      { name: "Class 11–12", slug: "paper-4", audience: "Senior Secondary", targetUrl: "/exams/bihar-stet?track=paper-2-11-12", isConfigured: true },
    ],
  },
  {
    label: "CTET",
    slug: "ctet",
    targetUrl: "/exams/ctet",
    items: [
      { name: "Class 1–5 (Paper I)", slug: "paper-1", audience: "Paper I (Classes 1 to 5)", targetUrl: "/exams/ctet?track=paper-1", isConfigured: true },
      { name: "Class 6–8 (Paper II)", slug: "paper-2", audience: "Paper II (Classes 6 to 8)", targetUrl: "/exams/ctet?track=paper-2", isConfigured: true },
      { name: "Class 9–10 (Secondary)", slug: "secondary-prep", audience: "Secondary Practice", targetUrl: "/exams/ctet?track=paper-2", isConfigured: true },
      { name: "Class 11–12 (Senior)", slug: "senior-prep", audience: "Senior Secondary Practice", targetUrl: "/exams/ctet?track=paper-2", isConfigured: true },
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

export type MegaMenuProps = {
  initialConfig?: {
    portalName?: string;
    logoImageUrl?: string;
    logoHeight?: number;
    logoOffsetX?: number;
    logoOffsetY?: number;
    mockTestMenu?: any[];
    tutorialMenu?: any[];
    customNavMenu?: any[];
  };
};

export default function MegaMenu({ initialConfig }: MegaMenuProps = {}) {
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
  const [portalName, setPortalName] = useState(initialConfig?.portalName || "Sarkari Practice");
  const [logoImageUrl, setLogoImageUrl] = useState(initialConfig?.logoImageUrl || "");
  const [logoHeight, setLogoHeight] = useState<number>(initialConfig?.logoHeight ?? 48);
  const [logoOffsetX, setLogoOffsetX] = useState<number>(initialConfig?.logoOffsetX ?? 0);
  const [logoOffsetY, setLogoOffsetY] = useState<number>(initialConfig?.logoOffsetY ?? 0);
  const [mockMenu, setMockMenu] = useState(initialConfig?.mockTestMenu && initialConfig.mockTestMenu.length > 0 ? initialConfig.mockTestMenu : mockTestMegaMenu);
  const [tutMenu, setTutMenu] = useState(initialConfig?.tutorialMenu && initialConfig.tutorialMenu.length > 0 ? initialConfig.tutorialMenu : tutorialMegaMenu);
  const [customNav, setCustomNav] = useState<any[]>(initialConfig?.customNavMenu || []);
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
            .catch(() => { });
        }
      })
      .catch(() => { });

    // Fetch site config (portal name, logo, and dynamic menus) with fresh cache-busting
    const fetchFreshConfig = () => {
      fetch(`/api/config?t=${Date.now()}`, { cache: "no-store" })
        .then((res) => res.json())
        .then((data) => {
          if (data?.config) {
            if (data.config.portalName) setPortalName(data.config.portalName);
            if (data.config.logoImageUrl !== undefined) setLogoImageUrl(data.config.logoImageUrl || "");
            if (data.config.logoHeight !== undefined) setLogoHeight(Number(data.config.logoHeight) || 48);
            if (data.config.logoOffsetX !== undefined) setLogoOffsetX(Number(data.config.logoOffsetX) || 0);
            if (data.config.logoOffsetY !== undefined) setLogoOffsetY(Number(data.config.logoOffsetY) || 0);
            if (data.config.mockTestMenu?.length) setMockMenu(data.config.mockTestMenu);
            if (data.config.tutorialMenu?.length) setTutMenu(data.config.tutorialMenu);
            if (data.config.customNavMenu) setCustomNav(data.config.customNavMenu);
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
          <Link className="logo public-logo-link" href={user && user.role !== "admin" ? "/dashboard" : "/"}>
            {logoImageUrl ? (
              <img
                src={logoImageUrl}
                alt={portalName}
                className="public-nav-logo-img"
                style={{
                  height: `${logoHeight || 48}px`,
                  maxHeight: `${logoHeight || 48}px`,
                  maxWidth: "340px",
                  width: "auto",
                  objectFit: "contain",
                  display: "block",
                  position: "relative",
                  top: `${logoOffsetY || 0}px`,
                  left: `${logoOffsetX || 0}px`,
                }}
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
            {(!user || user.role === "admin") && (
              <Link href="/" className="nav-item-link">
                Home
              </Link>
            )}

            {/* Mock Test Mega Menu Trigger (2-Column Sidebar Layout as per Sarkari Practice (1).html & Screenshot 5) */}
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
                              // Intelligently fallback to filtered exam route if targetUrl is empty
                              const target =
                                sub.targetUrl && sub.targetUrl.trim()
                                  ? sub.targetUrl.trim()
                                  : `/exams/${activeCol.slug === "btet" ? "bihar-stet" : activeCol.slug}?track=${sub.slug}`;
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
                        <Link href="/dashboard" className="header-dropdown-item">
                          📊 Student Dashboard Overview
                        </Link>

                        {/* Student Wallet adjusted directly below Dashboard Overview */}
                        <button
                          type="button"
                          className="header-dropdown-item"
                          onClick={(e) => {
                            e.stopPropagation();
                            setProfileDropdownOpen(false);
                            setWalletModalOpen(true);
                          }}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            width: "100%",
                            background: "rgba(16, 185, 129, 0.08)",
                            color: "#065f46",
                            fontWeight: 700,
                            border: "none",
                            padding: "9px 12px",
                            cursor: "pointer",
                            textAlign: "left",
                            borderRadius: "6px",
                            margin: "2px 0",
                          }}
                        >
                          <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <img src="/wallet.png" alt="Wallet" style={{ width: "16px", height: "16px", objectFit: "contain" }} />
                            <span>Student Wallet</span>
                          </span>
                          <span
                            style={{
                              background: "#059669",
                              color: "#fff",
                              padding: "2px 8px",
                              borderRadius: "12px",
                              fontSize: "11px",
                              fontWeight: 800,
                            }}
                          >
                            ₹{walletBalance !== null ? walletBalance.toFixed(2) : "0.00"}
                          </span>
                        </button>

                        <Link href="/pyq" className="header-dropdown-item">
                          📑 Previous Year Papers (PYQ)
                        </Link>
                        <Link href="/dashboard#tests" className="header-dropdown-item">
                          📝 My Mock Tests
                        </Link>
                        <Link href="/dashboard#progress" className="header-dropdown-item">
                          📈 Practice Results
                        </Link>
                        <Link href="/dashboard#settings" className="header-dropdown-item">
                          ⚙️ Account Settings
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
              {(!user || user.role === "admin") && (
                <Link href="/" className="mobile-pill-link" onClick={() => setMobileOpen(false)}>
                  🏠 Home
                </Link>
              )}
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
                  <div style={{ fontSize: "11px", fontWeight: 600, color: "#64748b", display: "flex", alignItems: "center", gap: "5px" }}>
                    <img src="/wallet.png" alt="Wallet" style={{ width: "14px", height: "14px", objectFit: "contain" }} />
                    <span>Student Wallet</span>
                  </div>
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

      {/* Student Wallet Modal with Full Transactions Passbook */}
      <WalletModal
        isOpen={walletModalOpen}
        onClose={() => setWalletModalOpen(false)}
        userDisplayName={user?.displayName || "Student"}
        initialBalance={walletBalance}
        onBalanceUpdate={(newBal) => setWalletBalance(newBal)}
      />
    </>
  );
}
