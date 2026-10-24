"use client";

import { useState, useMemo, useEffect } from "react";
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

  // Carousel slider state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  // Responsive visible cards count
  const [visibleCount, setVisibleCount] = useState(3);

  useEffect(() => {
    function handleResize() {
      if (typeof window !== "undefined") {
        if (window.innerWidth < 640) {
          setVisibleCount(1);
        } else if (window.innerWidth < 1024) {
          setVisibleCount(2);
        } else {
          setVisibleCount(3);
        }
      }
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const maxIndex = Math.max(0, filteredTestimonials.length - visibleCount);

  // Reset index if filter changes or exceeds maxIndex
  useEffect(() => {
    setCurrentIndex(0);
  }, [filter, visibleCount]);

  // Auto-slide effect
  useEffect(() => {
    if (isPaused || maxIndex <= 0) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    }, 4200);

    return () => clearInterval(timer);
  }, [isPaused, maxIndex]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  // Touch swipe support
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;
    if (diff > 50) {
      handleNext();
    } else if (diff < -50) {
      handlePrev();
    }
    setTouchStart(null);
  };

  return (
    <section
      className="section testimonials-section"
      id="testimonials"
      style={{
        background: "linear-gradient(180deg, #faf8f5 0%, #ffffff 100%)",
        padding: "70px 24px",
        overflow: "hidden",
      }}
    >
      <div style={{ maxWidth: "1240px", margin: "0 auto" }}>
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
            REAL ASPIRANTS &amp; PROUD FAMILIES
          </span>

          <h2
            style={{
              fontFamily: "Space Grotesk, sans-serif",
              fontSize: "clamp(1.8rem, 4vw, 2.6rem)",
              fontWeight: 700,
              color: "#0f172a",
              margin: "0 0 12px",
              letterSpacing: "-0.5px",
            }}
          >
            Stories of determination<br />
            <em style={{ fontStyle: "italic", color: "#ea580c", fontWeight: 600 }}>
              from our students &amp; parents.
            </em>
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
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            <button
              type="button"
              onClick={() => setFilter("all")}
              style={{
                background: filter === "all" ? "#0f172a" : "transparent",
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
                background: filter === "student" ? "#0f172a" : "transparent",
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
                background: filter === "parent" ? "#0f172a" : "transparent",
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

        {/* Carousel Slider Container */}
        <div
          style={{ position: "relative" }}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Navigation Arrows */}
          {filteredTestimonials.length > visibleCount && (
            <>
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Previous testimonial"
                style={{
                  position: "absolute",
                  left: "-18px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  zIndex: 10,
                  width: "42px",
                  height: "42px",
                  borderRadius: "50%",
                  background: "#ffffff",
                  border: "1.5px solid #e2e8f0",
                  color: "#0f172a",
                  fontSize: "1.3rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 14px rgba(0,0,0,0.1)",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                ‹
              </button>

              <button
                type="button"
                onClick={handleNext}
                aria-label="Next testimonial"
                style={{
                  position: "absolute",
                  right: "-18px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  zIndex: 10,
                  width: "42px",
                  height: "42px",
                  borderRadius: "50%",
                  background: "#ffffff",
                  border: "1.5px solid #e2e8f0",
                  color: "#0f172a",
                  fontSize: "1.3rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 14px rgba(0,0,0,0.1)",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                ›
              </button>
            </>
          )}

          {/* Sliding Track Viewport */}
          <div style={{ overflow: "hidden", padding: "10px 4px 20px" }}>
            <div
              style={{
                display: "flex",
                gap: "24px",
                transition: "transform 500ms cubic-bezier(0.16, 1, 0.3, 1)",
                transform: `translateX(calc(-${currentIndex} * (${100 / visibleCount}% + ${24 / visibleCount}px)))`,
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
                      flex: `0 0 calc(${100 / visibleCount}% - ${(24 * (visibleCount - 1)) / visibleCount}px)`,
                      boxSizing: "border-box",
                      background: "#ffffff",
                      border: "1px solid #e2e8f0",
                      borderRadius: "16px",
                      padding: "26px",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      boxShadow: "0 4px 16px rgba(15, 23, 42, 0.04)",
                      position: "relative",
                      overflow: "hidden",
                      minHeight: "260px",
                    }}
                  >
                    {/* Accent top border stripe */}
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        height: "4px",
                        background: isStudent
                          ? "linear-gradient(90deg, #ea580c, #f97316)"
                          : "linear-gradient(90deg, #0f172a, #10b981)",
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
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "2px",
                            color: "#f59e0b",
                            fontSize: "0.95rem",
                          }}
                        >
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
                            background: isStudent ? "#fff7ed" : "#ecfdf5",
                            color: isStudent ? "#c2410c" : "#065f46",
                            border: `1px solid ${isStudent ? "#ffedd5" : "#a7f3d0"}`,
                          }}
                        >
                          {isStudent ? "🎓 Student" : "👨‍👩‍👧 Parent"}
                        </span>
                      </div>

                      {/* Review Text */}
                      <p
                        style={{
                          fontSize: "0.94rem",
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
                            width: "40px",
                            height: "40px",
                            borderRadius: "50%",
                            background: isStudent
                              ? "linear-gradient(135deg, #ea580c 0%, #f97316 100%)"
                              : "linear-gradient(135deg, #0f172a 0%, #059669 100%)",
                            color: "#ffffff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 700,
                            fontSize: "0.88rem",
                            boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                          }}
                        >
                          {initials}
                        </div>

                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                            <strong style={{ fontSize: "0.92rem", color: "#0f172a" }}>
                              {t.name}
                            </strong>
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

          {/* Pagination Dots */}
          {filteredTestimonials.length > visibleCount && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "8px",
                marginTop: "12px",
              }}
            >
              {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  aria-label={`Go to slide ${idx + 1}`}
                  style={{
                    width: currentIndex === idx ? "24px" : "8px",
                    height: "8px",
                    borderRadius: "4px",
                    background: currentIndex === idx ? "#ea580c" : "#cbd5e1",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                    transition: "all 0.25s ease",
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
