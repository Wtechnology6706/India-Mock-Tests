"use client";

import { useState, useEffect } from "react";

export default function AdminSettings() {
  const [data, setData] = useState<{
    system?: { nodeVersion: string; platform: string; environment: string; uptimeSeconds: number };
    database?: { connected: boolean; version: string; tablesCount: number; pool: { host: string; port: string; database: string } };
    security?: { adminBootstrapConfigured: boolean; sessionDurationDays: number; cookieName: string };
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function fetchSettings() {
    try {
      setRefreshing(true);
      const res = await fetch("/api/admin/settings");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    fetchSettings();
  }, []);

  function formatUptime(seconds: number = 0) {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs}h ${mins}m ${secs}s`;
  }

  return (
    <div className="admin-module-container">
      <div className="module-header-row">
        <div>
          <span className="kicker">PLATFORM CONFIGURATION</span>
          <h2 className="module-title">System Settings & Health</h2>
          <p className="module-desc">
            Monitor MySQL connection pools, runtime environments, security bootstrap keys, and caching layers.
          </p>
        </div>
        <button
          type="button"
          className="admin-btn-secondary"
          onClick={fetchSettings}
          disabled={refreshing}
        >
          <span>{refreshing ? "⟳ Refreshing..." : "⟳ Check Health"}</span>
        </button>
      </div>

      <div className="settings-grid">
        {/* Database Health Card */}
        <div className="settings-card">
          <div className="settings-card-header">
            <div>
              <span className="card-kicker">DATABASE ENGINE</span>
              <h3>MySQL Connection Status</h3>
            </div>
            <span className={`status-badge-live ${data?.database?.connected ? "live-green" : "live-red"}`}>
              <span className="live-ping" />
              {data?.database?.connected ? "Connected (Live)" : "Offline / Local Memory"}
            </span>
          </div>

          <div className="settings-props-list">
            <div className="prop-row">
              <span className="prop-name">Host & Port</span>
              <span className="prop-value"><code>{data?.database?.pool?.host}:{data?.database?.pool?.port}</code></span>
            </div>
            <div className="prop-row">
              <span className="prop-name">Database Name</span>
              <span className="prop-value"><code>{data?.database?.pool?.database}</code></span>
            </div>
            <div className="prop-row">
              <span className="prop-name">Database Version</span>
              <span className="prop-value">{data?.database?.version || "N/A"}</span>
            </div>
            <div className="prop-row">
              <span className="prop-name">Initialized Tables</span>
              <span className="prop-value"><strong>{data?.database?.tablesCount ?? "–"}</strong> schemas</span>
            </div>
          </div>
        </div>

        {/* Security & Authentication Card */}
        <div className="settings-card">
          <div className="settings-card-header">
            <div>
              <span className="card-kicker">AUTHENTICATION & SECURITY</span>
              <h3>Session & Bootstrap Controls</h3>
            </div>
            <span className="info-badge">Encrypted scrypt</span>
          </div>

          <div className="settings-props-list">
            <div className="prop-row">
              <span className="prop-name">Admin Bootstrap Key</span>
              <span className="prop-value">
                {data?.security?.adminBootstrapConfigured ? (
                  <span className="badge-configured">Configured in .env</span>
                ) : (
                  <span className="badge-disabled">Unset (API disabled)</span>
                )}
              </span>
            </div>
            <div className="prop-row">
              <span className="prop-name">Session Cookie</span>
              <span className="prop-value"><code>{data?.security?.cookieName}</code></span>
            </div>
            <div className="prop-row">
              <span className="prop-name">Session Expiry</span>
              <span className="prop-value">{data?.security?.sessionDurationDays} days rolling</span>
            </div>
            <div className="prop-row">
              <span className="prop-name">Password Hashing</span>
              <span className="prop-value">Scrypt (64-byte key + 16-byte random salt)</span>
            </div>
          </div>
        </div>

        {/* Server Runtime Card */}
        <div className="settings-card">
          <div className="settings-card-header">
            <div>
              <span className="card-kicker">RUNTIME & HOST</span>
              <h3>Server Environment</h3>
            </div>
            <span className="env-badge">{data?.system?.environment}</span>
          </div>

          <div className="settings-props-list">
            <div className="prop-row">
              <span className="prop-name">Node.js Version</span>
              <span className="prop-value"><code>{data?.system?.nodeVersion}</code></span>
            </div>
            <div className="prop-row">
              <span className="prop-name">OS Platform</span>
              <span className="prop-value">{data?.system?.platform}</span>
            </div>
            <div className="prop-row">
              <span className="prop-name">Process Uptime</span>
              <span className="prop-value">{formatUptime(data?.system?.uptimeSeconds)}</span>
            </div>
            <div className="prop-row">
              <span className="prop-name">Framework</span>
              <span className="prop-value">Next.js 15 App Router</span>
            </div>
          </div>
        </div>

        {/* Operational Actions */}
        <div className="settings-card">
          <div className="settings-card-header">
            <div>
              <span className="card-kicker">MAINTENANCE</span>
              <h3>Operational Controls</h3>
            </div>
          </div>

          <div className="settings-actions-group">
            <div className="action-row">
              <div>
                <strong>CLI Admin Generator</strong>
                <small>Run <code>npm run create-admin</code> to seed or reset admin credentials via shell.</small>
              </div>
            </div>
            <div className="action-row">
              <div>
                <strong>Database Schema Location</strong>
                <small>Source file located at <code>database/schema.sql</code> and seed at <code>database/seed.sql</code>.</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
