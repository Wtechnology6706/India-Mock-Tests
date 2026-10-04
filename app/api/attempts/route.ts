import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createAttempt, getTestStartInfo } from "../../../lib/attempt-store";
import { getUserForToken } from "../../../lib/auth-store";

export async function POST(request: NextRequest) {
  const { testSlug } = await request.json();
  const cookieStore = await cookies();
  const user = await getUserForToken(cookieStore.get("northstar_session")?.value);

  const testInfo = await getTestStartInfo(testSlug);

  // Check subscription access if test is premium
  if (testInfo && testInfo.access === "Premium") {
    const isStaff = user && (user.role === "admin" || user.role === "editor");
    const isActiveUser = user && user.subscriptionStatus === "active";

    if (!isStaff) {
      if (!isActiveUser || !user) {
        return NextResponse.json(
          {
            error: "This is a Premium VIP mock test. Please upgrade your subscription to unlock full test series.",
            code: "PREMIUM_REQUIRED",
            testName: testInfo.name,
            access: "Premium",
          },
          { status: 403 }
        );
      }

      // If user has Sprint Pass, verify it matches the test's exam
      if (user.subscriptionTier === "sprint") {
        const userExamSlug = user.targetExamSlug?.trim().toLowerCase();
        const testExamSlug = testInfo.examSlug?.trim().toLowerCase();

        // If sprint pass is bound to a specific exam and doesn't match
        if (userExamSlug && testExamSlug && userExamSlug !== testExamSlug) {
          const sprintExamLabel = user.targetExamName || user.targetExamSlug;
          return NextResponse.json(
            {
              error: `Your Single Exam Sprint Pass is active for ${sprintExamLabel}. To attempt ${testInfo.examTitle} tests, please upgrade to the All-Exam Ultimate VIP Pass.`,
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
