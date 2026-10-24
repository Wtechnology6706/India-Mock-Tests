import { Metadata } from "next";
import { getPublishedBlogs } from "@/lib/blog-store";
import BlogCatalogClient from "./BlogCatalogClient";
import MegaMenu from "../components/MegaMenu";
import Footer from "../components/Footer";
import "./blog.css";

export const metadata: Metadata = {
  title: "Official Exam Preparation Blog & Guides | Sarkari Practice",
  description:
    "Free expert articles, syllabus breakdowns, 5-option testing techniques, and 90-day preparation strategies for BPSC TRE 4.0, Bihar STET, and CTET written by top educators.",
  keywords: [
    "BPSC TRE 4.0 Preparation Strategy",
    "Bihar STET 2026 Eligibility",
    "Score 120 in CTET",
    "Sarkari Exam Blog",
    "Teacher Recruitment Guides India",
    "NCERT SCERT Books for BPSC",
  ],
  openGraph: {
    title: "Official Exam Preparation Blog & Guides | Sarkari Practice",
    description:
      "Free expert articles, syllabus breakdowns, 5-option testing techniques, and 90-day preparation strategies for BPSC TRE 4.0, Bihar STET, and CTET.",
    url: "https://sarkaripractice.com/blog",
    siteName: "Sarkari Practice",
    type: "website",
  },
};

export const dynamic = "force-dynamic";

export default async function BlogPage() {
  const blogs = await getPublishedBlogs();

  return (
    <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <MegaMenu />
      <div style={{ flex: 1 }}>
        <BlogCatalogClient initialBlogs={blogs} />
      </div>
      <Footer />
    </main>
  );
}
