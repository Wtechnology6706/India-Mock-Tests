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
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState<{ id: string; email: string; displayName: string; role: string } | null>(null);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [portalName, setPortalName] = useState("India Mock Tests");
  const [logoImageUrl, setLogoImageUrl] = useState("");
  const [mockMenu, setMockMenu] = useState(mockTestMegaMenu);
  const [tutMenu, setTutMenu] = useState(tutorialMegaMenu);
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
        }
      })
      .catch(() => {});
  }, []);

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
          <Link className="logo" href="/">
            {logoImageUrl ? (
              <img
                src={logoImageUrl}
                alt={portalName}
                style={{ maxHeight: "36px", maxWidth: "170px", objectFit: "contain", display: "block" }}
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

            {/* Mock Test Mega Menu Trigger */}
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
                <div className="mega-dropdown-panel" onMouseEnter={() => handleMouseEnter("mock-test")} onMouseLeave={handleMouseLeave}>
                  <div className="mega-dropdown-inner">
                    <div className="mega-dropdown-header">
                      <div>
                        <span className="kicker">SELECT TARGET EXAM & CLASS LEVEL</span>
                        <h3>All Examination Mock Series</h3>
                      </div>
                      <Link href="/exams" className="mega-view-all" onClick={() => setActiveMenu(null)}>
                        View All Exams Directory →
                      </Link>
                    </div>

                    <div className="mega-columns-grid">
                      {mockMenu.map((col) => (
                        <div key={col.id || col.slug} className="mega-column">
                          <div className="mega-col-title">
                            <span className="layer-2-badge">{col.label}</span>
                          </div>
                          <div className="mega-sub-items">
                            {col.items.map((sub: any) => {
                              const target = sub.targetUrl ?? `/tracks/${col.slug}/${sub.slug}`;
                              const isClickable = sub.isConfigured !== false && Boolean(target.trim());

                              if (!isClickable) {
                                return (
                                  <div
                                    key={sub.id || sub.slug}
                                    className="mega-sub-link disabled-unlinked"
                                    title="Not configured yet"
                                  >
                                    <strong>{sub.name}</strong>
                                    {sub.audience && <small>{sub.audience} (Unlinked)</small>}
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

            <Link href="/about" className="nav-item-link">
              About
            </Link>

            <Link href="/contact" className="nav-item-link">
              Contact Us
            </Link>
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
                  ◈ Dashboard
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
                          ◈ Student Dashboard
                        </Link>
                        <Link href="/dashboard#tests" className="header-dropdown-item">
                          ▣ My Mock Tests
                        </Link>
                        <Link href="/dashboard#progress" className="header-dropdown-item">
                          ↗ Practice Results
                        </Link>
                        {user.role === "admin" && (
                          <Link href="/admin" className="header-dropdown-item admin-item">
                            🛡 Admin Studio
                          </Link>
                        )}
                        <button
                          type="button"
                          className="header-dropdown-logout"
                          onClick={handleLogout}
                        >
                          ⏻ Log out
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
              <Link href="/exams" className="mobile-pill-link" onClick={() => setMobileOpen(false)}>
                📚 All Exams
              </Link>
              <Link href="/pricing" className="mobile-pill-link" onClick={() => setMobileOpen(false)}>
                ⭐ Plans & VIP
              </Link>
            </div>

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
    </>
  );
}
