"use client";

import { useEffect, useState, useRef, useTransition } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export default function GlobalLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showSpinnerPill, setShowSpinnerPill] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const spinnerDelayRef = useRef<NodeJS.Timeout | null>(null);
  const safetyTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const startLoading = () => {
    setIsLoading(true);
    setProgress(25);

    if (spinnerDelayRef.current) clearTimeout(spinnerDelayRef.current);
    if (safetyTimeoutRef.current) clearTimeout(safetyTimeoutRef.current);
    if (timerRef.current) clearInterval(timerRef.current);

    // Show floating spinner pill if loading takes > 140ms (backward/forward or server routes)
    spinnerDelayRef.current = setTimeout(() => {
      setShowSpinnerPill(true);
    }, 140);

    // Smooth progress simulation
    timerRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev < 65) return prev + 15;
        if (prev < 85) return prev + 6;
        if (prev < 95) return prev + 1.5;
        return prev;
      });
    }, 180);

    // Safety timeout in case navigation is aborted
    safetyTimeoutRef.current = setTimeout(() => {
      stopLoading();
    }, 4500);
  };

  const stopLoading = () => {
    setProgress(100);
    if (timerRef.current) clearInterval(timerRef.current);
    if (spinnerDelayRef.current) clearTimeout(spinnerDelayRef.current);
    if (safetyTimeoutRef.current) clearTimeout(safetyTimeoutRef.current);

    setTimeout(() => {
      setIsLoading(false);
      setShowSpinnerPill(false);
      setTimeout(() => setProgress(0), 200);
    }, 180);
  };

  // Trigger stop whenever pathname or searchParams change (navigation finished)
  useEffect(() => {
    stopLoading();
  }, [pathname, searchParams]);

  useEffect(() => {
    // 1. Listen to browser Back / Forward history navigation (popstate)
    const handlePopState = () => {
      startLoading();
    };

    // 2. Intercept internal link clicks for immediate feedback before Next.js completes route transition
    const handleLinkClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("a");
      if (!target || !target.href) return;

      const url = new URL(target.href, window.location.href);
      const isInternal = url.origin === window.location.origin;
      const isModified = e.metaKey || e.ctrlKey || e.shiftKey || e.altKey;
      const isTargetBlank = target.target && target.target !== "_self";
      const isSamePathAndHash = url.pathname === window.location.pathname && url.search === window.location.search && url.hash;
      const isDownload = target.hasAttribute("download");

      if (isInternal && !isModified && !isTargetBlank && !isSamePathAndHash && !isDownload) {
        // If clicking a link pointing to a different route
        if (url.pathname !== window.location.pathname || url.search !== window.location.search) {
          startLoading();
        }
      }
    };

    window.addEventListener("popstate", handlePopState);
    document.addEventListener("click", handleLinkClick, true);

    return () => {
      window.removeEventListener("popstate", handlePopState);
      document.removeEventListener("click", handleLinkClick, true);
      if (timerRef.current) clearInterval(timerRef.current);
      if (spinnerDelayRef.current) clearTimeout(spinnerDelayRef.current);
      if (safetyTimeoutRef.current) clearTimeout(safetyTimeoutRef.current);
    };
  }, []);

  if (!isLoading && progress === 0) return null;

  return (
    <>
      {/* Top Animated Progress Bar */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: "3px",
          zIndex: 99999999,
          pointerEvents: "none",
          background: "transparent",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${progress}%`,
            background: "linear-gradient(90deg, #10b981 0%, #059669 40%, #0284c7 80%, #f59e0b 100%)",
            boxShadow: "0 0 12px rgba(16, 185, 129, 0.8), 0 0 6px rgba(2, 132, 199, 0.6)",
            transition: progress === 100 ? "width 0.15s ease-out, opacity 0.2s ease" : "width 0.22s ease-out",
            opacity: progress === 100 ? 0 : 1,
            borderRadius: "0 2px 2px 0",
          }}
        />
      </div>

      {/* Floating Center Glassmorphism Loading Indicator */}
      {showSpinnerPill && (
        <div
          role="status"
          aria-live="polite"
          style={{
            position: "fixed",
            top: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 99999998,
            display: "inline-flex",
            alignItems: "center",
            gap: "10px",
            padding: "8px 18px",
            background: "rgba(15, 23, 42, 0.88)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            borderRadius: "999px",
            border: "1px solid rgba(255, 255, 255, 0.18)",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.28), 0 0 1px rgba(255, 255, 255, 0.2)",
            color: "#ffffff",
            fontSize: "12.5px",
            fontWeight: 700,
            letterSpacing: "0.3px",
            pointerEvents: "none",
            animation: "fadeInLoader 0.2s ease",
          }}
        >
          <div
            style={{
              width: "16px",
              height: "16px",
              borderRadius: "50%",
              border: "2px solid rgba(16, 185, 129, 0.25)",
              borderTopColor: "#34d399",
              animation: "spinLoader 0.7s linear infinite",
              flexShrink: 0,
            }}
          />
          <span>Rendering page...</span>

          <style>{`
            @keyframes spinLoader {
              to { transform: rotate(360deg); }
            }
            @keyframes fadeInLoader {
              from { opacity: 0; transform: translate(-50%, -8px); }
              to { opacity: 1; transform: translate(-50%, 0); }
            }
          `}</style>
        </div>
      )}
    </>
  );
}
