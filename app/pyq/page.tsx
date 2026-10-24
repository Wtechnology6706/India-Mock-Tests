import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth-store";
import { getPublishedPYQs } from "@/lib/pyq-store";
import PYQClient from "./PYQClient";
import MegaMenu from "../components/MegaMenu";
import Footer from "../components/Footer";

export const metadata: Metadata = {
  title: "Official Previous Year Question Papers (PYQ) | Sarkari Practice",
  description:
    "Download and solve official previous year question papers with answer keys for BPSC TRE, Bihar STET, CTET, and State PSCs with full-screen PDF preview.",
};

export const dynamic = "force-dynamic";

interface PYQPageProps {
  searchParams?: Promise<{ paper?: string; exam?: string }>;
}

export default async function PYQPage({ searchParams }: PYQPageProps) {
  const user = await getCurrentUser();
  const resolvedParams = searchParams ? await searchParams : undefined;
  const paper = resolvedParams?.paper;

  // If user is logged in, open with the layout of dashboard with left navbar
  if (user) {
    if (paper) {
      redirect(`/dashboard?pyqPaper=${encodeURIComponent(paper)}#pyq`);
    } else {
      redirect("/dashboard#pyq");
    }
  }

  const pyqs = await getPublishedPYQs();
  return (
    <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <MegaMenu />
      <div style={{ flex: 1 }}>
        <PYQClient initialPYQs={pyqs} />
      </div>
      <Footer />
    </main>
  );
}


