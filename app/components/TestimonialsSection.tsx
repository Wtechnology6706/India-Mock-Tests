"use client";

import { useState, useMemo } from "react";
import type { TestimonialItem } from "../../lib/site-config-defaults";
import { defaultTestimonials } from "../../lib/site-config-defaults";

interface TestimonialsSectionProps {
  initialTestimonials?: TestimonialItem[];
}

export default function TestimonialsSection({ initialTestimonials }: TestimonialsSectionProps) {
  const [filter, setFilter] = useState<"all" | "student" | "parent">("all");
  const testimonials = initialTestimonials?.length ? initialTestimonials : defaultTestimonials;

  const filteredTestimonials = useMemo(() => {
    if (filter === "all") return testimonials;
    return testimonials.filter((t) => t.type === filter);
  }, [testimonials, filter]);

  const studentCount = testimonials.filter((t) => t.type === "student").length;
  const parentCount = testimonials.filter((t) => t.type === "parent").length;

  return (
    <section className="section testimonials-section" id="testimonials" style={{ background: "linear-gradient(180deg, #faf8f5 0%, #ffffff 100%)", padding: "70px 24px" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Section Header */}
        <div style={{ textAlign: "center", marginBottom: "36px" }}>
          <span
            style={{
              display: "inline-block",
              fontSize: "0.75rem",
              fontWeight: 800,
              letterSpacing: "1.5px",
              color: "#b94a2b",
              textTransform: "uppercase",
              background: "rgba(185, 74, 43, 0.08)",
              padding: "4px 12px",
              borderRadius: "20px",
              marginBottom: "12px",
            }}
          >
            REAL ASPIRANTS & PROUD FAMILIES
          </span>

          <h2
            style={{
              fontFamily: "Space Grotesk, sans-serif",
              fontSize: "clamp(1.8rem, 4vw, 2.6rem)",
              fontWeight: 700,
              color: "#1e3a34",
              margin: "0 0 12px",
              letterSpacing: "-0.5px",
            }}
          >
            Stories of determination<br />
            <em style={{ fontStyle: "italic", color: "#b94a2b", fontWeight: 600 }}>from our students & parents.</em>
          </h2>

          <p
            style={{
              fontSize: "1rem",
              color: "#64748b",
              maxWidth: "600px",
              margin: "0 auto 24px",
              lineHeight: 1.6,
            }}
          >
            Discover how authentic CBT exam simulation, bilingual answer explanations, and syllabus-aligned mock tests empower aspirants across India.
          </p>

          {/* Interactive Filter Pills */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: "#ffffff",
              padding: "5px",
              borderRadius: "30px",
              border: "1px solid #e2e8f0",
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            }}
          >
            <button
              type="button"
              onClick={() => setFilter("all")}
              style={{
                background: filter === "all" ? "#1e3a34" : "transparent",
                color: filter === "all" ? "#ffffff" : "#475569",
                border: "none",
                padding: "8px 18px",
                borderRadius: "24px",
                fontSize: "0.85rem",
                fontWeight: 700,
                cursor: "pointer",
                transition: "all 150ms ease",
              }}
            >
              All Stories ({testimonials.length})
            </button>

            <button
              type="button"
              onClick={() => setFilter("student")}
              style={{
                background: filter === "student" ? "#1e3a34" : "transparent",
                color: filter === "student" ? "#ffffff" : "#475569",
                border: "none",
                padding: "8px 18px",
                borderRadius: "24px",
                fontSize: "0.85rem",
                fontWeight: 700,
                cursor: "pointer",
                transition: "all 150ms ease",
              }}
            >
              🎓 Students ({studentCount})
            </button>

            <button
              type="button"
              onClick={() => setFilter("parent")}
              style={{
                background: filter === "parent" ? "#1e3a34" : "transparent",
                color: filter === "parent" ? "#ffffff" : "#475569",
                border: "none",
                padding: "8px 18px",
                borderRadius: "24px",
                fontSize: "0.85rem",
                fontWeight: 700,
                cursor: "pointer",
                transition: "all 150ms ease",
              }}
            >
              👨‍👩‍👧 Parents ({parentCount})
            </button>
          </div>
        </div>

        {/* Testimonials Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: "24px",
          }}
        >
          {filteredTestimonials.map((t) => {
            const initials = t.name
              .split(" ")
              .map((n) => n[0])
              .slice(0, 2)
              .join("")
              .toUpperCase();

            const isStudent = t.type === "student";

            return (
              <article
                key={t.id}
                style={{
                  background: "#ffffff",
                  border: "1px solid #e8ecf1",
                  borderRadius: "14px",
                  padding: "26px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  boxShadow: "0 4px 14px rgba(0,0,0,0.03)",
                  transition: "transform 200ms ease, box-shadow 200ms ease",
                  position: "relative",
                  overflow: "hidden",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = "0 12px 28px rgba(0,0,0,0.08)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 4px 14px rgba(0,0,0,0.03)";
                }}
              >
                {/* Accent top border stripe */}
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: "3px",
                    background: isStudent
                      ? "linear-gradient(90deg, #b94a2b, #ea580c)"
                      : "linear-gradient(90deg, #1e3a34, #10b981)",
                  }}
                />

                <div>
                  {/* Top Row: Stars + Type Badge */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: "14px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "2px", color: "#f59e0b", fontSize: "0.95rem" }}>
                      {Array.from({ length: t.rating || 5 }).map((_, i) => (
                        <span key={i}>★</span>
                      ))}
                    </div>

                    <span
                      style={{
                        fontSize: "0.72rem",
                        fontWeight: 800,
                        padding: "3px 10px",
                        borderRadius: "12px",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        background: isStudent ? "#fef3c7" : "#dcfce7",
                        color: isStudent ? "#92400e" : "#166534",
                      }}
                    >
                      {isStudent ? "🎓 Student" : "👨‍👩‍👧 Parent"}
                    </span>
                  </div>

                  {/* Review Text */}
                  <p
                    style={{
                      fontSize: "0.92rem",
                      color: "#334155",
                      lineHeight: "1.65",
                      margin: "0 0 20px",
                      fontStyle: "normal",
                    }}
                  >
                    “{t.content}”
                  </p>
                </div>

                {/* Author Info Strip */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingTop: "14px",
                    borderTop: "1px solid #f1f5f9",
                    flexWrap: "wrap",
                    gap: "10px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div
                      style={{
                        width: "38px",
                        height: "38px",
                        borderRadius: "50%",
                        background: isStudent
                          ? "linear-gradient(135deg, #b94a2b 0%, #f59e0b 100%)"
                          : "linear-gradient(135deg, #1e3a34 0%, #10b981 100%)",
                        color: "#ffffff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 700,
                        fontSize: "0.85rem",
                      }}
                    >
                      {initials}
                    </div>

                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                        <strong style={{ fontSize: "0.9rem", color: "#0f172a" }}>{t.name}</strong>
                        {t.verified !== false && (
                          <span
                            title="Verified Learner / Parent"
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              width: "14px",
                              height: "14px",
                              borderRadius: "50%",
                              background: "#10b981",
                              color: "#fff",
                              fontSize: "9px",
                              fontWeight: "bold",
                            }}
                          >
                            ✓
                          </span>
                        )}
                      </div>
                      <small style={{ display: "block", color: "#64748b", fontSize: "0.78rem" }}>
                        {t.role}
                      </small>
                    </div>
                  </div>

                  {t.examBadge && (
                    <span
                      style={{
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        color: "#475569",
                        background: "#f1f5f9",
                        padding: "3px 8px",
                        borderRadius: "6px",
                      }}
                    >
                      {t.examBadge}
                    </span>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
