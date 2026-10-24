import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBlogBySlug, getPublishedBlogs, incrementBlogViews } from "@/lib/blog-store";
import BlogPostClient from "./BlogPostClient";
import MegaMenu from "../../components/MegaMenu";
import Footer from "../../components/Footer";
import "../blog.css";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const blog = await getBlogBySlug(slug);

  if (!blog || blog.status !== "Published") {
    return {
      title: "Article Not Found | Sarkari Practice",
      description: "The requested article could not be found.",
    };
  }

  const siteUrl = "https://sarkaripractice.com";
  const canonicalUrl = `${siteUrl}/blog/${blog.slug}`;
  const ogImage = blog.featuredImage || `${siteUrl}/brand-logo.png`;

  return {
    title: `${blog.title} | Sarkari Practice`,
    description: blog.excerpt,
    keywords: blog.tags,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: blog.title,
      description: blog.excerpt,
      url: canonicalUrl,
      siteName: "Sarkari Practice",
      type: "article",
      publishedTime: blog.publishedAt,
      authors: [blog.authorName],
      tags: blog.tags,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: blog.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: blog.title,
      description: blog.excerpt,
      images: [ogImage],
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const blog = await getBlogBySlug(slug);

  if (!blog || blog.status !== "Published") {
    notFound();
  }

  // Increment view counter asynchronously
  incrementBlogViews(blog.id).catch(() => {});

  // Fetch related articles (same category or recent)
  const allPublished = await getPublishedBlogs();
  const relatedBlogs = allPublished
    .filter((b) => b.id !== blog.id)
    .sort((a, b) => (a.category === blog.category ? -1 : 1))
    .slice(0, 3);

  // Structured Data Schema for Google Rich Snippets
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: blog.title,
    description: blog.excerpt,
    image: blog.featuredImage || "https://sarkaripractice.com/brand-logo.png",
    datePublished: blog.publishedAt,
    dateModified: blog.updatedAt || blog.publishedAt,
    author: {
      "@type": "Person",
      name: blog.authorName,
      jobTitle: blog.authorRole,
    },
    publisher: {
      "@type": "Organization",
      name: "Sarkari Practice",
      logo: {
        "@type": "ImageObject",
        url: "https://sarkaripractice.com/brand-logo.png",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://sarkaripractice.com/blog/${blog.slug}`,
    },
    keywords: blog.tags.join(", "),
  };

  return (
    <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <script
        id="article-jsonld-schema"
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <MegaMenu />
      <div style={{ flex: 1 }}>
        <BlogPostClient blog={blog} relatedBlogs={relatedBlogs} />
      </div>
      <Footer />
    </main>
  );
}
