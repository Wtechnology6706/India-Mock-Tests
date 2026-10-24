import { NextResponse } from "next/server";

export const dynamic = "force-static";

export async function GET() {
  const content = `# Sarkari Practice
> India's premier online CBT mock test and exam practice portal for teaching and civil recruitment exams.

## Overview
Sarkari Practice (https://sarkaripractice.com) offers authentic Computer-Based Test (CBT) mock simulations, previous year question papers (PYQ), and rank analytics for:
- BPSC TRE 4.0 (Bihar Teacher Recruitment Examination: Primary Class 1-5, Middle Class 6-8, Secondary TGT Class 9-10, Higher Secondary PGT Class 11-12)
- Bihar STET 2026 (State Teacher Eligibility Test: Paper I Secondary, Paper II Higher Secondary)
- CTET July 2026 (Central Teacher Eligibility Test: Paper I Classes 1-5, Paper II Classes 6-8)

## Key Pages & Resources
- Home & Test Catalog: https://sarkaripractice.com/exams
- Previous Year Papers (PYQ): https://sarkaripractice.com/pyq
- Pricing & VIP Access Plans: https://sarkaripractice.com/plans
- Student Practice Dashboard: https://sarkaripractice.com/dashboard
- Concept Tutorials: https://sarkaripractice.com/tutorials

## Technical Specs
- Question Format: Bilingual (Hindi & English) with negative marking simulation.
- Ranking: Real-time All India Rank (AIR), accuracy percentiles, and chapter-level performance breakdowns.
- Support: support@sarkaripractice.com
`;

  return new NextResponse(content, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
