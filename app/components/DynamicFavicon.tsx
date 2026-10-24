"use client";

import { useEffect } from "react";

export default function DynamicFavicon() {
  useEffect(() => {
    function applyFavicon(iconUrl: string) {
      if (!iconUrl) return;
      const head = document.head || document.getElementsByTagName("head")[0];

      // Update existing favicon link in-place without deleting nodes from React's fiber tree
      const iconLinks = head.querySelectorAll("link[rel*='icon']");
      if (iconLinks.length > 0) {
        iconLinks.forEach((link) => {
          (link as HTMLLinkElement).href = iconUrl;
        });
      } else {
        const iconLink = document.createElement("link");
        iconLink.rel = "icon";
        iconLink.type = iconUrl.endsWith(".svg") ? "image/svg+xml" : "image/png";
        iconLink.href = iconUrl;
        head.appendChild(iconLink);
      }
    }

    // Fetch site config logo
    const fetchFavicon = () => {
      fetch(`/api/config?t=${Date.now()}`, { cache: "no-store" })
        .then((res) => res.json())
        .then((data) => {
          if (data?.config?.logoImageUrl) {
            applyFavicon(data.config.logoImageUrl);
          }
        })
        .catch(() => {});
    };

    fetchFavicon();

    // Listen for real-time config changes from admin panel
    const handleUpdate = () => fetchFavicon();
    window.addEventListener("site_config_updated", handleUpdate);
    window.addEventListener("storage", (e) => {
      if (e.key === "site_config_updated_at") fetchFavicon();
    });

    return () => {
      window.removeEventListener("site_config_updated", handleUpdate);
    };
  }, []);

  return null;
}
