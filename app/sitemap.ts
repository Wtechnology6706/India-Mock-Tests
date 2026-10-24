import { MetadataRoute } from "next";
import { featuredExams } from "../lib/catalog";
import { mockTests } from "../lib/syllabus";
import { getPublishedBlogs } from "../lib/blog-store";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://sarkaripractice.com";

  const staticPages = [
    "",
    "/exams",
    "/pyq",
    "/blog",
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
    changeFrequency: (route === "" || route === "/exams" || route === "/pyq" || route === "/blog" ? "daily" : "weekly") as "daily" | "weekly",
    priority: route === "" ? 1.0 : route === "/exams" || route === "/pyq" || route === "/blog" ? 0.9 : 0.8,
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

  let blogPages: MetadataRoute.Sitemap = [];
  try {
    const blogs = await getPublishedBlogs();
    blogPages = blogs.map((b) => ({
      url: `${baseUrl}/blog/${b.slug}`,
      lastModified: new Date(b.updatedAt || b.publishedAt),
      changeFrequency: "weekly" as const,
      priority: 0.9,
    }));
  } catch {}

  return [...staticPages, ...examPages, ...testPages, ...blogPages];
}
