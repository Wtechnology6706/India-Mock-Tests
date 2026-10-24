"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export default function GlobalLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const safetyTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const start = () => {
    setIsVisible(true);
    setProgress(30);

    if (timerRef.current) clearInterval(timerRef.current);
    if (safetyTimeoutRef.current) clearTimeout(safetyTimeoutRef.current);

    timerRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev < 65) return prev + 15;
        if (prev < 85) return prev + 6;
        if (prev < 95) return prev + 1.5;
        return prev;
      });
    }, 150);

    // Safety fallback so progress bar never stays visible if navigation cancels
    safetyTimeoutRef.current = setTimeout(() => {
      finish();
    }, 3000);
  };

  const finish = () => {
    setProgress(100);
    if (timerRef.current) clearInterval(timerRef.current);
    if (safetyTimeoutRef.current) clearTimeout(safetyTimeoutRef.current);

    setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => setProgress(0), 200);
    }, 200);
  };

  // Complete progress bar whenever route successfully updates
  useEffect(() => {
    finish();
  }, [pathname, searchParams]);

  useEffect(() => {
    // 1. Listen to browser Back / Forward history buttons
    const handlePopState = () => {
      start();
    };

    // 2. Listen to normal internal link clicks (non-capturing so React Router isn't blocked)
    const handleLinkClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("a");
      if (!target || !target.href) return;

      try {
        const url = new URL(target.href, window.location.href);
        const isInternal = url.origin === window.location.origin;
        const isModified = e.metaKey || e.ctrlKey || e.shiftKey || e.altKey;
        const isTargetBlank = target.target && target.target !== "_self";
        const isSamePathAndHash =
          url.pathname === window.location.pathname &&
          url.search === window.location.search &&
          Boolean(url.hash);
        const isDownload = target.hasAttribute("download");

        if (isInternal && !isModified && !isTargetBlank && !isSamePathAndHash && !isDownload) {
          if (url.pathname !== window.location.pathname || url.search !== window.location.search) {
            start();
          }
        }
      } catch {}
    };

    window.addEventListener("popstate", handlePopState);
    document.addEventListener("click", handleLinkClick, false);

    return () => {
      window.removeEventListener("popstate", handlePopState);
      document.removeEventListener("click", handleLinkClick, false);
      if (timerRef.current) clearInterval(timerRef.current);
      if (safetyTimeoutRef.current) clearTimeout(safetyTimeoutRef.current);
    };
  }, []);

  if (!isVisible && progress === 0) return null;

  return (
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
          boxShadow: "0 0 10px rgba(16, 185, 129, 0.8), 0 0 5px rgba(2, 132, 199, 0.6)",
          transition: progress === 100 ? "width 0.15s ease-out, opacity 0.2s ease" : "width 0.2s ease-out",
          opacity: progress === 100 ? 0 : 1,
          borderRadius: "0 2px 2px 0",
        }}
      />
    </div>
  );
}
