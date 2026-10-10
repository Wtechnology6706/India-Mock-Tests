import { Metadata } from "next";
import { getPublishedPYQs } from "@/lib/pyq-store";
import PYQClient from "./PYQClient";
import MegaMenu from "../components/MegaMenu";
import Footer from "../components/Footer";

export const metadata: Metadata = {
  title: "Official Previous Year Question Papers (PYQ) | India Mock Tests",
  description:
    "Download and solve official previous year question papers with answer keys for BPSC TRE, Bihar STET, CTET, and State PSCs with full-screen PDF preview.",
};

export const dynamic = "force-dynamic";

export default async function PYQPage() {
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

