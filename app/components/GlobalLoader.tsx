"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export default function GlobalLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  // Complete loading when route changes
  useEffect(() => {
    if (loading) {
      setProgress(100);
      const timer = setTimeout(() => {
        setLoading(false);
        setProgress(0);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [pathname, searchParams]);

  // Intercept internal link clicks for instantaneous visual feedback
  useEffect(() => {
    const handleLinkClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("a");
      if (!target) return;

      const href = target.getAttribute("href");
      if (
        href &&
        href.startsWith("/") &&
        !href.startsWith("#") &&
        !target.getAttribute("download") &&
        target.getAttribute("target") !== "_blank"
      ) {
        // Only trigger if destination is different from current URL
        const currentUrl = window.location.pathname + window.location.search;
        if (href !== currentUrl) {
          setLoading(true);
          setProgress(25);
          setTimeout(() => setProgress((p) => (p < 80 ? 65 : p)), 150);
          setTimeout(() => setProgress((p) => (p < 90 ? 85 : p)), 400);
        }
      }
    };

    document.addEventListener("click", handleLinkClick);
    return () => document.removeEventListener("click", handleLinkClick);
  }, []);

  if (!loading && progress === 0) return null;

  return (
    <>
      {/* Top Shimmer Progress Bar */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: "3.5px",
          zIndex: 999999,
          pointerEvents: "none",
          background: "transparent",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${progress}%`,
            background: "linear-gradient(90deg, #b94a2b 0%, #f59e0b 50%, #10b981 100%)",
            boxShadow: "0 0 10px rgba(185, 74, 43, 0.7), 0 0 5px rgba(245, 158, 11, 0.5)",
            transition: "width 250ms ease-out, opacity 300ms ease",
            borderRadius: "0 2px 2px 0",
          }}
        />
      </div>

      {/* Floating Micro-Pill Indicator */}
      <div
        style={{
          position: "fixed",
          top: "16px",
          right: "20px",
          zIndex: 999999,
          pointerEvents: "none",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          background: "rgba(30, 58, 52, 0.94)",
          backdropFilter: "blur(8px)",
          color: "#ffffff",
          padding: "6px 14px",
          borderRadius: "20px",
          fontSize: "0.78rem",
          fontWeight: 600,
          boxShadow: "0 4px 15px rgba(0,0,0,0.18)",
          animation: "loaderPulse 1.2s ease-in-out infinite",
        }}
      >
        <span
          style={{
            display: "inline-block",
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            background: "#f59e0b",
            boxShadow: "0 0 8px #f59e0b",
          }}
        />
        <span>Loading workspace...</span>
      </div>
    </>
  );
}
