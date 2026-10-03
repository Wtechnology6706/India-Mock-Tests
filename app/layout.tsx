import type { Metadata } from "next";
import { Suspense } from "react";
import GlobalLoader from "./components/GlobalLoader";
import "./globals.css";
import "./readability.css";
import "./megamenu.css";

export const metadata: Metadata = {
  title: "Northstar | Mock Test Platform",
  description: "A focused workspace for measurable exam preparation.",
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