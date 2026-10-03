"use client";

import Link from "next/link";
import type { Plan } from "../../lib/phase1";

export default function CommerceManager({ plans }: { plans: Plan[] }) {
  return (
    <div className="admin-module-container">
      <div className="module-header-row">
        <div>
          <span className="kicker">COMMERCE & MONETIZATION</span>
          <h2 className="module-title">Subscription Plans & Entitlements</h2>
          <p className="module-desc">
            Configure mock test package pricing, access duration, bundled exam passes, and entitlement grants.
          </p>
        </div>
        <Link href="/plans" target="_blank" className="admin-btn-secondary">
          View Public Plans Page ↗
        </Link>
      </div>

      <div className="admin-grid" style={{ maxWidth: "100%", margin: "0 0 32px" }}>
        {plans.map((plan) => (
          <div className={`plan-card ${plan.badge ? "featured-plan" : ""}`} key={plan.id} style={{ transform: "none" }}>
            {plan.badge && <span className="plan-badge">{plan.badge}</span>}
            <span className="kicker">TIER {plan.id.toUpperCase()}</span>
            <h2>{plan.name}</h2>
            <p>{plan.description}</p>
            <div>
              <span className="plan-price">{plan.price}</span>
              <span className="plan-validity">/ {plan.validity}</span>
            </div>
            <ul>
              {plan.includes.map((feature, i) => (
                <li key={i}>✓ {feature}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
