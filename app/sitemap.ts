import { MetadataRoute } from "next";
import { featuredExams } from "../lib/catalog";
import { mockTests } from "../lib/syllabus";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://sarkaripractice.com";

  const staticPages = [
    "",
    "/exams",
    "/pyq",
    "/plans",
    "/pricing",
    "/tutorials",
    "/about",
    "/contact",
    "/privacy",
    "/terms",
    "/refund",
    "/shipping",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: (route === "" || route === "/exams" || route === "/pyq" ? "daily" : "weekly") as "daily" | "weekly",
    priority: route === "" ? 1.0 : route === "/exams" || route === "/pyq" ? 0.9 : 0.8,
  }));

  const examPages = featuredExams.map((exam) => ({
    url: `${baseUrl}/exams/${exam.slug}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.95,
  }));

  const testPages = mockTests.map((test) => ({
    url: `${baseUrl}/tests/${test.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.85,
  }));

  return [...staticPages, ...examPages, ...testPages];
}
