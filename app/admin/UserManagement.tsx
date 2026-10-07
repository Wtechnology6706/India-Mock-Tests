"use client";

import { useState, useTransition } from "react";
import type { AdminUserRecord, SubscriptionTier } from "../../lib/auth-store";

interface UserManagementProps {
  initialUsers: AdminUserRecord[];
  currentUserEmail: string;
}

const EXAM_OPTIONS = [
  { slug: "bpsc-tre-4", name: "BPSC TRE 4.0" },
  { slug: "bihar-stet", name: "Bihar STET 2026" },
  { slug: "ctet", name: "CTET Paper I & II" },
  { slug: "uppsc-ro-aro", name: "UPPSC Review Officer" },
  { slug: "mppsc", name: "MPPSC State Service" },
  { slug: "rajasthan-reet", name: "REET / Rajasthan TET" },
];

export default function UserManagement({ initialUsers, currentUserEmail }: UserManagementProps) {
  const [users, setUsers] = useState<AdminUserRecord[]>(initialUsers);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [tierFilter, setTierFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUserRecord | null>(null);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Form states for new user
  const [formEmail, setFormEmail] = useState("");
  const [formName, setFormName] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formRole, setFormRole] = useState<"student" | "editor" | "reviewer" | "admin">("student");

  // Form states for edit user
  const [editRole, setEditRole] = useState<"student" | "editor" | "reviewer" | "admin">("student");
  const [editStatus, setEditStatus] = useState<"active" | "disabled">("active");
  const [editDisplayName, setEditDisplayName] = useState("");
  const [editNewPassword, setEditNewPassword] = useState("");
  const [editTier, setEditTier] = useState<SubscriptionTier>("free");
  const [editDurationDays, setEditDurationDays] = useState<number>(90);
  const [editExamSlug, setEditExamSlug] = useState<string>("bpsc-tre-4");

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.displayName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    const matchesStatus = statusFilter === "all" || u.status === statusFilter;
    const matchesTier = tierFilter === "all" || (u.subscriptionTier || "free") === tierFilter;
    return matchesSearch && matchesRole && matchesStatus && matchesTier;
  });

  const adminCount = users.filter((u) => u.role === "admin").length;
  const editorCount = users.filter((u) => u.role === "editor").length;
  const reviewerCount = users.filter((u) => u.role === "reviewer").length;
  const studentCount = users.filter((u) => u.role === "student").length;
  const activeCount = users.filter((u) => u.status === "active").length;
  const ultimateCount = users.filter((u) => u.subscriptionTier === "ultimate" || u.role === "admin").length;
  const sprintCount = users.filter((u) => u.subscriptionTier === "sprint").length;

  async function handleCreateUser(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    if (!formEmail || !formName || formPassword.length < 8) {
      setMessage({ type: "error", text: "Please enter a valid email, name, and password of at least 8 characters." });
      return;
    }

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formEmail,
          displayName: formName,
          password: formPassword,
          role: formRole,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "error", text: data.error || "Failed to create user." });
        return;
      }
      setUsers((prev) => [data.user, ...prev]);
      setMessage({ type: "success", text: `User ${data.user.email} created successfully.` });
      setFormEmail("");
      setFormName("");
      setFormPassword("");
      setShowAddModal(false);
    } catch {
      setMessage({ type: "error", text: "Network error creating user." });
    }
  }

  async function handleUpdateUser(e: React.FormEvent) {
    e.preventDefault();
    if (!editingUser) return;
    setMessage(null);

    const targetExamObj = EXAM_OPTIONS.find((ex) => ex.slug === editExamSlug);

    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingUser.id,
          displayName: editDisplayName,
          role: editRole,
          status: editStatus,
          password: editNewPassword.trim() ? editNewPassword : undefined,
          subscriptionTier: editTier,
          durationDays: editDurationDays,
          targetExamSlug: editTier === "sprint" ? editExamSlug : null,
          targetExamName: editTier === "sprint" ? (targetExamObj?.name || editExamSlug) : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "error", text: data.error || "Failed to update user." });
        return;
      }
      setUsers((prev) =>
        prev.map((u) =>
          u.id === editingUser.id
            ? {
              ...u,
              displayName: editDisplayName,
              role: editRole,
              status: editStatus,
              subscriptionTier: editTier,
              subscriptionStatus: editTier !== "free" ? "active" : "none",
              targetExamSlug: editTier === "sprint" ? editExamSlug : null,
              targetExamName: editTier === "sprint" ? (targetExamObj?.name || editExamSlug) : null,
            }
            : u
        )
      );
      setMessage({ type: "success", text: `User ${editingUser.email} updated successfully.` });
      setEditingUser(null);
    } catch {
      setMessage({ type: "error", text: "Network error updating user." });
    }
  }

  async function handleDeleteUser(user: AdminUserRecord) {
    if (user.email === currentUserEmail) {
      alert("You cannot delete your own logged-in administrator account.");
      return;
    }
    if (!confirm(`Are you sure you want to permanently delete user '${user.email}'? This action cannot be undone.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/users?id=${encodeURIComponent(user.id)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "error", text: data.error || "Failed to delete user." });
        return;
      }
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
      setMessage({ type: "success", text: `User ${user.email} deleted.` });
    } catch {
      setMessage({ type: "error", text: "Network error deleting user." });
    }
  }

  function openEditModal(u: AdminUserRecord) {
    setEditingUser(u);
    setEditDisplayName(u.displayName);
    setEditRole(u.role);
    setEditStatus(u.status);
    setEditNewPassword("");
    setEditTier(u.subscriptionTier || "free");
    setEditDurationDays(u.subscriptionTier === "ultimate" ? 180 : 90);
    setEditExamSlug(u.targetExamSlug || "bpsc-tre-4");
  }

  return (
    <div className="admin-module-container">
      {/* Header & Stats */}
      <div className="module-header-row">
        <div>
          <span className="kicker">IDENTITY, SUBSCRIPTIONS & ROLES</span>
          <h2 className="module-title">User & Subscription Management</h2>
          <p className="module-desc">
            Monitor registered learners, manage Single Exam Sprint vs All-Exam Ultimate VIP passes, and administer team permissions.
          </p>
        </div>
        <button
          type="button"
          className="admin-btn-primary"
          onClick={() => {
            setShowAddModal(true);
            setMessage(null);
          }}
        >
          <span>＋</span> Add New User
        </button>
      </div>

      {message && (
        <div className={`admin-alert ${message.type === "success" ? "alert-success" : "alert-error"}`}>
          <span>{message.type === "success" ? "✓" : "⚠️"}</span>
          <span>{message.text}</span>
          <button type="button" className="alert-close" onClick={() => setMessage(null)}>✕</button>
        </div>
      )}

      {/* Metric Cards */}
      <div className="admin-mini-metrics">
        <div className="mini-metric-card">
          <small>TOTAL REGISTERED</small>
          <strong>{users.length}</strong>
          <span>{activeCount} active · {users.length - activeCount} disabled</span>
        </div>
        <div className="mini-metric-card" style={{ borderLeft: "4px solid #b94a2b" }}>
          <small>👑 ALL-EXAM ULTIMATE VIP</small>
          <strong style={{ color: "#b94a2b" }}>{ultimateCount}</strong>
          <span>Full access to all 150+ tests</span>
        </div>
        <div className="mini-metric-card" style={{ borderLeft: "4px solid #2563eb" }}>
          <small>⚡ SINGLE EXAM SPRINT</small>
          <strong style={{ color: "#2563eb" }}>{sprintCount}</strong>
          <span>Targeted 1-exam pass holders</span>
        </div>
        <div className="mini-metric-card">
          <small>STAFF & EDUCATORS</small>
          <strong style={{ color: "#166534" }}>{adminCount + editorCount + reviewerCount}</strong>
          <span>{adminCount} admins · {editorCount + reviewerCount} editors</span>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="admin-toolbar">
        <div className="search-input-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search by name, email, or user ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="admin-search-field"
          />
          {searchQuery && (
            <button type="button" className="clear-search-btn" onClick={() => setSearchQuery("")}>
              ✕
            </button>
          )}
        </div>

        <div className="filter-group">
          <label>Pass Tier:</label>
          <select value={tierFilter} onChange={(e) => setTierFilter(e.target.value)} className="admin-select">
            <option value="all">All Subscription Tiers</option>
            <option value="ultimate">👑 Ultimate VIP (All Exams)</option>
            <option value="sprint">⚡ Single Exam Sprint</option>
            <option value="free">🆓 Free Aspirants</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Role:</label>
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="admin-select">
            <option value="all">All Roles ({users.length})</option>
            <option value="admin">Admins ({adminCount})</option>
            <option value="editor">Editors ({editorCount})</option>
            <option value="reviewer">Reviewers ({reviewerCount})</option>
            <option value="student">Students ({studentCount})</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Status:</label>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="admin-select">
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="disabled">Disabled</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="admin-table-wrapper">
        <table className="admin-data-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Role</th>
              <th>Subscription Pass Details</th>
              <th>Account</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={6} className="empty-table-cell">
                  <div className="empty-state-box">
                    <span className="empty-state-icon">👤</span>
                    <h4>No users found matching your filters</h4>
                    <p>Try adjusting your search query or reset filters.</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => {
                const isSelf = user.email === currentUserEmail;
                const isUltimate = user.role === "admin" || user.subscriptionTier === "ultimate";
                const isSprint = user.subscriptionTier === "sprint";

                return (
                  <tr key={user.id} className={user.status === "disabled" ? "row-disabled" : ""}>
                    <td>
                      <div className="user-cell-info">
                        <div className={`user-avatar-badge role-${user.role}`}>
                          {user.displayName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <strong className="user-name">{user.displayName}</strong>
                          {isSelf && <span className="self-tag">You (Active)</span>}
                        </div>
                      </div>
                    </td>
                    <td className="user-email-cell">
                      <code>{user.email}</code>
                    </td>
                    <td>
                      <span className={`role-badge role-${user.role}`}>
                        {user.role.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      {isUltimate ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                          <span
                            style={{
                              display: "inline-block",
                              background: "#fef3c7",
                              color: "#92400e",
                              border: "1px solid #fde68a",
                              padding: "3px 8px",
                              borderRadius: "4px",
                              fontSize: "0.78rem",
                              fontWeight: 700,
                            }}
                          >
                            👑 Ultimate VIP (All Exams)
                          </span>
                          <small style={{ color: "#64748b", fontSize: "0.72rem" }}>
                            {user.role === "admin" ? "Admin Lifetime Pass" : (user.subscriptionExpiresAt ? `Valid till ${new Date(user.subscriptionExpiresAt).toLocaleDateString()}` : "Active")}
                          </small>
                        </div>
                      ) : isSprint ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                          <span
                            style={{
                              display: "inline-block",
                              background: "#eff6ff",
                              color: "#1e40af",
                              border: "1px solid #bfdbfe",
                              padding: "3px 8px",
                              borderRadius: "4px",
                              fontSize: "0.78rem",
                              fontWeight: 700,
                            }}
                          >
                            ⚡ Sprint: {user.targetExamName || user.targetExamSlug || "Single Exam"}
                          </span>
                          <small style={{ color: "#64748b", fontSize: "0.72rem" }}>
                            {user.subscriptionExpiresAt ? `Valid till ${new Date(user.subscriptionExpiresAt).toLocaleDateString()}` : "Active 90-day pass"}
                          </small>
                        </div>
                      ) : (
                        <span
                          style={{
                            display: "inline-block",
                            background: "#f1f5f9",
                            color: "#64748b",
                            padding: "3px 8px",
                            borderRadius: "4px",
                            fontSize: "0.75rem",
                            fontWeight: 600,
                          }}
                        >
                          Free Aspirant
                        </span>
                      )}
                    </td>
                    <td>
                      <span className={`status-pill ${user.status === "active" ? "pill-active" : "pill-disabled"}`}>
                        <span className="status-dot-mini" />
                        {user.status === "active" ? "Active" : "Disabled"}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div className="action-buttons-group">
                        <button
                          type="button"
                          className="table-action-btn edit-btn"
                          onClick={() => openEditModal(user)}
                          title="Edit user & subscription pass"
                        >
                          ✎ Edit / Assign Pass
                        </button>
                        {!isSelf && (
                          <button
                            type="button"
                            className="table-action-btn delete-btn"
                            onClick={() => handleDeleteUser(user)}
                            title="Delete user"
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Add New User Modal */}
      {showAddModal && (
        <div className="admin-modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create New User</h3>
              <button type="button" className="modal-close" onClick={() => setShowAddModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreateUser} className="admin-modal-form">
              <div className="form-field">
                <label>Full Display Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jane Doe"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="admin-input"
                />
              </div>

              <div className="form-field">
                <label>Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. editor@indiamocktests.com"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="admin-input"
                />
              </div>

              <div className="form-field">
                <label>Initial Password (min 8 chars) *</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  placeholder="••••••••"
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  className="admin-input"
                />
              </div>

              <div className="form-field">
                <label>Assigned Role *</label>
                <select
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value as typeof formRole)}
                  className="admin-input"
                >
                  <option value="student">Student / Learner (Standard mock tests & results)</option>
                  <option value="editor">Editor (Author & draft questions)</option>
                  <option value="reviewer">Reviewer (Validate & review question bank)</option>
                  <option value="admin">Administrator (Full operational authority)</option>
                </select>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="admin-btn-primary">
                  Create User Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="admin-modal-overlay" onClick={() => setEditingUser(null)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "580px" }}>
            <div className="modal-header">
              <h3>Edit User & Manage Subscription</h3>
              <button type="button" className="modal-close" onClick={() => setEditingUser(null)}>✕</button>
            </div>
            <form onSubmit={handleUpdateUser} className="admin-modal-form">
              <div className="form-field">
                <label>Email</label>
                <input type="text" disabled value={editingUser.email} className="admin-input disabled-input" />
              </div>

              <div className="form-field">
                <label>Display Name *</label>
                <input
                  type="text"
                  required
                  value={editDisplayName}
                  onChange={(e) => setEditDisplayName(e.target.value)}
                  className="admin-input"
                />
              </div>

              <div className="form-field">
                <label>Role</label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value as typeof editRole)}
                  className="admin-input"
                  disabled={editingUser.email === currentUserEmail}
                >
                  <option value="student">Student</option>
                  <option value="editor">Editor</option>
                  <option value="reviewer">Reviewer</option>
                  <option value="admin">Administrator</option>
                </select>
                {editingUser.email === currentUserEmail && (
                  <small className="field-hint">You cannot change your own active admin role.</small>
                )}
              </div>

              {/* Subscription Pass Assignment Section */}
              <div
                style={{
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  padding: "16px",
                  margin: "12px 0",
                }}
              >
                <h4 style={{ margin: "0 0 12px", fontSize: "0.95rem", color: "#1e293b" }}>
                  🎟️ Subscription Pass & Exam Entitlement
                </h4>

                <div className="form-field">
                  <label>Assigned Plan Tier</label>
                  <select
                    value={editTier}
                    onChange={(e) => setEditTier(e.target.value as SubscriptionTier)}
                    className="admin-input"
                  >
                    <option value="free">Free Aspirant (No paid access)</option>
                    <option value="sprint">⚡ Single Exam Sprint Pass (Targeted 1 Exam)</option>
                    <option value="ultimate">👑 All-Exam Ultimate VIP Pass (All 150+ Mocks)</option>
                  </select>
                </div>

                {editTier === "sprint" && (
                  <div className="form-field" style={{ marginTop: "10px" }}>
                    <label>Target Exam Series (Scope of Pass) *</label>
                    <select
                      value={editExamSlug}
                      onChange={(e) => setEditExamSlug(e.target.value)}
                      className="admin-input"
                    >
                      {EXAM_OPTIONS.map((ex) => (
                        <option key={ex.slug} value={ex.slug}>
                          {ex.name}
                        </option>
                      ))}
                    </select>
                    <small className="field-hint">User will only be allowed to attempt tests of this specific exam.</small>
                  </div>
                )}

                {editTier !== "free" && (
                  <div className="form-field" style={{ marginTop: "10px" }}>
                    <label>Access Duration (Days from today)</label>
                    <input
                      type="number"
                      min={1}
                      max={730}
                      value={editDurationDays}
                      onChange={(e) => setEditDurationDays(Number(e.target.value))}
                      className="admin-input"
                    />
                    <small className="field-hint">e.g. 90 days for 3-month Sprint, 180 days for 6-month Ultimate.</small>
                  </div>
                )}
              </div>

              <div className="form-field">
                <label>Account Status</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as typeof editStatus)}
                  className="admin-input"
                  disabled={editingUser.email === currentUserEmail}
                >
                  <option value="active">Active (Can log in & access platform)</option>
                  <option value="disabled">Disabled (Access suspended)</option>
                </select>
              </div>

              <div className="form-field">
                <label>Reset Password (leave blank to keep existing)</label>
                <input
                  type="password"
                  placeholder="New password (min 8 chars)"
                  minLength={8}
                  value={editNewPassword}
                  onChange={(e) => setEditNewPassword(e.target.value)}
                  className="admin-input"
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setEditingUser(null)}>
                  Cancel
                </button>
                <button type="submit" className="admin-btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

