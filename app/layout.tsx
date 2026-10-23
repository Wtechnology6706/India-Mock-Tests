import type { Metadata } from "next";
import { Suspense } from "react";
import GlobalLoader from "./components/GlobalLoader";
import AnalyticsTracker from "./components/AnalyticsTracker";
import "./globals.css";
import "./readability.css";
import "./megamenu.css";

export const metadata: Metadata = {
  title: "Sarkari Practice | Premier Exam Preparation & Test Series",
  description: "Sarkari Practice - India's premier focused workspace for syllabus-aligned mock tests and measurable competitive exam preparation.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <Suspense fallback={null}>
          <GlobalLoader />
          <AnalyticsTracker />
        </Suspense>
        {children}
      </body>
    </html>
  );
}