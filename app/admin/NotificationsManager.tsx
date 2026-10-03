"use client";

import Link from "next/link";
import type { Notification } from "../../lib/phase1";

export default function NotificationsManager({ notifications }: { notifications: Notification[] }) {
  return (
    <div className="admin-module-container">
      <div className="module-header-row">
        <div>
          <span className="kicker">ALERTS & ANNOUNCEMENTS</span>
          <h2 className="module-title">Exam Notifications</h2>
          <p className="module-desc">
            Broadcast official examination notices, application deadlines, admit card releases, and key alerts.
          </p>
        </div>
        <Link href="/notifications" target="_blank" className="admin-btn-secondary">
          View Public Notifications ↗
        </Link>
      </div>

      <div className="notification-list" style={{ marginTop: "20px" }}>
        {notifications.map((item) => (
          <article className="notification-card" key={item.id} style={{ borderRadius: "8px", margin: "12px 0" }}>
            <div className="notification-date">
              <span className="kicker">DEADLINE</span>
              <strong>{item.date.split(" ")[0]}</strong>
              <small>{item.date.split(" ").slice(1).join(" ")}</small>
            </div>
            <div>
              <span className="kicker">{item.organization} · {item.category}</span>
              <h3>{item.title}</h3>
              <p>{item.summary}</p>
              <Link href={`/exams/${item.examSlug}`} style={{ fontSize: "11px", color: "var(--coral)", fontWeight: 700 }}>
                View Exam Series →
              </Link>
            </div>
            <span className={`notification-status ${item.status === "Closing soon" ? "closing-soon" : item.status === "Announced" ? "announced" : ""}`}>
              {item.status}
            </span>
          </article>
        ))}
      </div>
    </div>
  );
}
