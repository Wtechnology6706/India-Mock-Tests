"use client";

import { useState } from "react";
import type { AuditLogEntry } from "../../lib/audit";

export default function AuditLogsViewer({ initialEvents }: { initialEvents: AuditLogEntry[] }) {
  const [events, setEvents] = useState<AuditLogEntry[]>(initialEvents);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("all");

  const filtered = events.filter((ev) => {
    const detailsStr = typeof ev.details === "object" ? JSON.stringify(ev.details) : String(ev.details ?? "");
    const matchesSearch =
      ev.actor.toLowerCase().includes(search.toLowerCase()) ||
      ev.action.toLowerCase().includes(search.toLowerCase()) ||
      ev.entityType.toLowerCase().includes(search.toLowerCase()) ||
      detailsStr.toLowerCase().includes(search.toLowerCase());
    const matchesAction = actionFilter === "all" || ev.action === actionFilter;
    return matchesSearch && matchesAction;
  });

  const actions = Array.from(new Set(events.map((e) => e.action)));

  return (
    <div className="admin-module-container">
      <div className="module-header-row">
        <div>
          <span className="kicker">COMPLIANCE & TRACEABILITY</span>
          <h2 className="module-title">Operator Audit Trail</h2>
          <p className="module-desc">
            Immutable log of all administrative interventions, test updates, question creations, and user operations.
          </p>
        </div>
      </div>

      <div className="admin-toolbar">
        <div className="search-input-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search audit logs by actor, action, details..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="admin-search-field"
          />
        </div>

        <div className="filter-group">
          <label>Action:</label>
          <select value={actionFilter} onChange={(e) => setActionFilter(e.target.value)} className="admin-select">
            <option value="all">All Actions ({events.length})</option>
            {actions.map((act) => (
              <option key={act} value={act}>
                {act}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="admin-table-wrapper">
        <table className="admin-data-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Actor</th>
              <th>Action</th>
              <th>Entity</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="empty-table-cell">
                  <div className="empty-state-box">
                    <p>No audit events match your search query.</p>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((ev, idx) => {
                const detailsDisplay =
                  typeof ev.details === "object" && ev.details !== null
                    ? JSON.stringify(ev.details)
                    : String(ev.details ?? "–");

                return (
                  <tr key={idx}>
                    <td className="date-cell" style={{ whiteSpace: "nowrap" }} suppressHydrationWarning>
                      {new Date(ev.createdAt).toLocaleString()}
                    </td>
                    <td>
                      <strong>{ev.actor}</strong>
                    </td>
                    <td>
                      <span className="role-badge role-editor" style={{ fontSize: "10px" }}>
                        {ev.action}
                      </span>
                    </td>
                    <td>
                      <code>{ev.entityType}:{ev.entityId}</code>
                    </td>
                    <td style={{ fontSize: "12px", color: "#49635b" }}>
                      {detailsDisplay}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
