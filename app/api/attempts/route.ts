import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createAttempt, getTestStartInfo } from "../../../lib/attempt-store";
import { getUserForToken } from "../../../lib/auth-store";
import { evaluateTestAccess, listExamGroups } from "../../../lib/exam-group-store";

export async function POST(request: NextRequest) {
  const { testSlug } = await request.json();
  const cookieStore = await cookies();
  const user = await getUserForToken(cookieStore.get("northstar_session")?.value);

  const testInfo = await getTestStartInfo(testSlug);

  // Check subscription access if test is premium
  if (testInfo && testInfo.access === "Premium") {
    const isStaff = user && (user.role === "admin" || user.role === "editor");

    if (!isStaff) {
      const examGroups = await listExamGroups();
      const accessEval = evaluateTestAccess(
        user,
        {
          access: testInfo.access,
          exam: testInfo.examTitle,
          examSlug: testInfo.examSlug,
          subjectName: (testInfo as any).subject,
          slug: testSlug,
        },
        examGroups
      );

      if (!accessEval.hasAccess) {
        return NextResponse.json(
          {
            error: accessEval.reason || `Please upgrade your subscription to unlock this mock test.`,
            code: "PREMIUM_REQUIRED",
            testName: testInfo.name,
            access: "Premium",
            requiredTier: "ultimate",
          },
          { status: 403 }
        );
      }
    }
  }

  const attempt = await createAttempt(testSlug, user?.id ?? null);
  if (!attempt) return NextResponse.json({ error: "Test not found" }, { status: 404 });

  return NextResponse.json(
    {
      data: {
        id: attempt.id,
        testSlug: attempt.testSlug,
        startedAt: attempt.startedAt,
        durationSeconds: attempt.durationSeconds,
      },
    },
    { status: 201 }
  );
}
