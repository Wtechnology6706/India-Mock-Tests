"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export default function AnalyticsTracker() {
  const pathname = usePathname();
  const lastTrackedPath = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname || pathname.startsWith("/api")) return;
    if (lastTrackedPath.current === pathname) return;
    lastTrackedPath.current = pathname;

    // Send page_view interaction beacon
    try {
      fetch("/api/analytics/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventType: "page_view",
          pagePath: pathname,
          entityTitle: typeof document !== "undefined" ? document.title || pathname : pathname,
        }),
      }).catch(() => {});
    } catch {}
  }, [pathname]);

  return null;
}
