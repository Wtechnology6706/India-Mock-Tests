import type { Metadata } from "next";
import { Suspense } from "react";
import GlobalLoader from "./components/GlobalLoader";
import "./globals.css";
import "./readability.css";
import "./megamenu.css";

export const metadata: Metadata = {
  title: "India Mock Tests | Premier Exam Preparation & Test Series",
  description: "India's premier focused workspace for syllabus-aligned mock tests and measurable competitive exam preparation.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <Suspense fallback={null}>
          <GlobalLoader />
        </Suspense>
        {children}
      </body>
    </html>
  );
}