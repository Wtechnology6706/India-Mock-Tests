"use client";

import { useEffect, useState } from "react";

type AdSenseBannerProps = {
  slot?: string;
  format?: "auto" | "rectangle" | "horizontal" | "vertical";
  className?: string;
};

export default function AdSenseBanner({
  slot = "1234567890",
  format = "auto",
  className = "",
}: AdSenseBannerProps) {
  const [clientId, setClientId] = useState<string>("");

  useEffect(() => {
    fetch("/api/config")
      .then((res) => res.json())
      .then((data) => {
        if (data?.config?.adsenseClientId) {
          setClientId(data.config.adsenseClientId);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className={`adsense-wrapper ${className}`}>
      {clientId ? (
        <ins
          className="adsbygoogle"
          style={{ display: "block", textAlign: "center" }}
          data-ad-client={clientId}
          data-ad-slot={slot}
          data-ad-format={format}
          data-full-width-responsive="true"
        />
      ) : (
        <div className="adsense-placeholder">
          <small className="ad-label">SPONSORED ADVERTISEMENT</small>
          <p>Google AdSense Banner Unit (Auto-activated upon publisher approval)</p>
        </div>
      )}
    </div>
  );
}
