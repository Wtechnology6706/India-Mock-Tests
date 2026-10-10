"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Props = {
  loggedOutText?: string;
  loggedOutHref?: string;
  loggedInText?: string;
  loggedInHref?: string;
  className?: string;
  style?: React.CSSProperties;
  showArrow?: boolean;
};

export default function ConditionalCTA({
  loggedOutText = "Create your free account",
  loggedOutHref = "/register",
  loggedInText = "Go to Student Dashboard",
  loggedInHref = "/dashboard",
  className = "light-button",
  style,
  showArrow = true,
}: Props) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data?.user) {
          setIsLoggedIn(true);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Link href={loggedOutHref} className={className} style={style}>
        {loggedOutText} {showArrow && <span>→</span>}
      </Link>
    );
  }

  if (isLoggedIn) {
    return (
      <Link href={loggedInHref} className={className} style={style}>
        {loggedInText} {showArrow && <span>→</span>}
      </Link>
    );
  }

  return (
    <Link href={loggedOutHref} className={className} style={style}>
      {loggedOutText} {showArrow && <span>→</span>}
    </Link>
  );
}
