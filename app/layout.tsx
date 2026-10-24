import type { Metadata } from "next";
import { Suspense } from "react";
import GlobalLoader from "./components/GlobalLoader";
import AnalyticsTracker from "./components/AnalyticsTracker";
import DynamicFavicon from "./components/DynamicFavicon";
import "./globals.css";
import "./readability.css";
import "./megamenu.css";

const siteUrl = "https://sarkaripractice.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Sarkari Practice | Premier Exam Preparation & Mock Test Series",
    template: "%s | Sarkari Practice",
  },
  description:
    "India's premier focused workspace for syllabus-aligned CBT mock tests, previous year papers (PYQ), and real-time rank analytics for BPSC TRE 4.0, Bihar STET, CTET, and teaching examinations.",
  keywords: [
    "Sarkari Practice",
    "BPSC TRE 4.0 Mock Test",
    "Bihar STET 2026 Mock Test",
    "CTET July 2026 Test Series",
    "Online CBT Mock Test India",
    "Teacher Recruitment Examination",
    "Teaching Exam Mock Test",
    "Previous Year Question Papers",
    "PYQ Papers Hindi English",
    "Sarkari Exam Preparation",
    "Free Mock Test Series",
  ],
  authors: [{ name: "Sarkari Practice Editorial Team" }],
  creator: "Sarkari Practice",
  publisher: "Sarkari Practice",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: siteUrl,
    siteName: "Sarkari Practice",
    title: "Sarkari Practice | India's Premier Online Mock Test Series",
    description:
      "Attempt real CBT format mock tests for BPSC TRE 4.0, Bihar STET, CTET July 2026 & more with bilingual questions, instant AIR ranking, and in-depth performance analytics.",
    images: [
      {
        url: "/uploads/taxonomy/bpsc-tre-cover-1792847844078.png",
        width: 1200,
        height: 630,
        alt: "Sarkari Practice - Live CBT Mock Test Series",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sarkari Practice | Real CBT Mock Test Series",
    description:
      "Master BPSC TRE 4.0, Bihar STET, CTET & Govt Exams with official syllabus mock tests and instant ranking.",
    images: ["/uploads/taxonomy/bpsc-tre-cover-1792847844078.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || undefined,
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://sarkaripractice.com/#website",
      "url": "https://sarkaripractice.com",
      "name": "Sarkari Practice",
      "description": "Premier Exam Preparation & Mock Test Series Platform",
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": "https://sarkaripractice.com/exams?q={search_term_string}",
        },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "EducationalOrganization",
      "@id": "https://sarkaripractice.com/#organization",
      "name": "Sarkari Practice",
      "url": "https://sarkaripractice.com",
      "logo": "https://sarkaripractice.com/uploads/taxonomy/bihar-stet-cover-1792847814675.png",
      "contactPoint": {
        "@type": "ContactPoint",
        "email": "support@sarkaripractice.com",
        "contactType": "customer support",
        "areaServed": "IN",
        "availableLanguage": ["Hindi", "English"],
      },
    },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID || process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  return (
    <html lang="en">
      <head>
        {gaId && (
          <>
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
            />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${gaId}', { page_path: window.location.pathname });
                `,
              }}
            />
          </>
        )}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <Suspense fallback={null}>
          <GlobalLoader />
          <AnalyticsTracker />
          <DynamicFavicon />
        </Suspense>
        {children}
      </body>
    </html>
  );
}