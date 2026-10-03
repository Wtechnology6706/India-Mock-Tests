"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function HeroSearch() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) {
      router.push("/exams");
      return;
    }
    router.push(`/exams?q=${encodeURIComponent(query.trim())}`);
  }

  return (
    <form className="hero-search" onSubmit={handleSubmit}>
      <span>⌕</span>
      <input
        aria-label="Search exams and tests"
        placeholder="Search an exam, subject, or test series (e.g., BPSC, STET, Math)..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <button type="submit">
        Find my test <span>→</span>
      </button>
    </form>
  );
}
