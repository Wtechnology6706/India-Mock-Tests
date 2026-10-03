import type { RowDataPacket } from "mysql2";
import { db } from "./db";
import { AuthUser } from "./auth-store";
import { getUserOrders, OrderRecord } from "./commerce-store";
import { mockTests } from "./syllabus";

export type UserDashboardStats = {
  totalAttempts: number;
  completedTests: number;
  averageScorePercent: number;
  accuracyPercent: number;
  totalTimeMinutes: number;
  bestScorePercent: number;
  currentStreakDays: number;
};

export type UserAttemptHistoryItem = {
  id: string;
  testSlug: string;
  title: string;
  exam: string;
  startedAt: string;
  submittedAt: string | null;
  durationSeconds: number;
  isCompleted: boolean;
  score: number;
  maxScore: number;
  correct: number;
  incorrect: number;
  unanswered: number;
  accuracy: number;
};

export type UserDashboardPayload = {
  user: {
    id: string;
    email: string;
    displayName: string;
    role: string;
    subscriptionTier: "free" | "sprint" | "ultimate";
    subscriptionStatus: "active" | "none" | "expired";
    subscriptionExpiresAt?: string;
    daysRemaining: number;
  };
  stats: UserDashboardStats;
  recentAttempts: UserAttemptHistoryItem[];
  orders: OrderRecord[];
  recommendedTests: Array<{
    slug: string;
    name: string;
    exam: string;
    questions: number;
    duration: string;
    access: "Free" | "Premium";
  }>;
};

export async function getUserDashboardData(user: AuthUser): Promise<UserDashboardPayload> {
  const userId = user.id;

  // 1. Fetch real attempts from database
  let attemptsRows: (RowDataPacket & {
    id: string;
    test_slug: string;
    test_title: string;
    exam_name: string;
    duration_seconds: number;
    started_at: Date | string;
    submitted_at: Date | string | null;
    result_snapshot: string | null;
    question_snapshot: string | null;
  })[] = [];

  try {
    const [rows] = await db.query<typeof attemptsRows>(
      "SELECT id, test_slug, test_title, exam_name, duration_seconds, started_at, submitted_at, result_snapshot, question_snapshot FROM test_attempts WHERE user_id = ? ORDER BY started_at DESC LIMIT 50",
      [userId]
    );
    attemptsRows = rows;
  } catch (err) {
    console.error("Error fetching user attempts for dashboard:", err);
  }

  let totalAttempts = attemptsRows.length;
  let completedTests = 0;
  let totalScoreSum = 0;
  let totalMaxScoreSum = 0;
  let totalCorrect = 0;
  let totalIncorrect = 0;
  let totalDurationSec = 0;
  let bestScorePercent = 0;

  const recentAttempts: UserAttemptHistoryItem[] = attemptsRows.map((row) => {
    let result: any = null;
    if (row.result_snapshot) {
      try {
        result = typeof row.result_snapshot === "string" ? JSON.parse(row.result_snapshot) : row.result_snapshot;
      } catch {}
    }

    const isCompleted = Boolean(row.submitted_at);
    const score = result?.score ?? 0;
    const maxScore = result?.maxScore ?? 150;
    const correct = result?.correct ?? 0;
    const incorrect = result?.incorrect ?? 0;
    const unanswered = result?.unanswered ?? 0;
    const answered = correct + incorrect;
    const accuracy = answered > 0 ? Math.round((correct / answered) * 100) : 0;
    const percentScore = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;

    totalDurationSec += row.duration_seconds || 0;

    if (isCompleted) {
      completedTests += 1;
      totalScoreSum += score;
      totalMaxScoreSum += maxScore;
      totalCorrect += correct;
      totalIncorrect += incorrect;
      if (percentScore > bestScorePercent) {
        bestScorePercent = percentScore;
      }
    }

    return {
      id: row.id,
      testSlug: row.test_slug,
      title: row.test_title,
      exam: row.exam_name,
      startedAt: row.started_at ? new Date(row.started_at).toISOString() : new Date().toISOString(),
      submittedAt: row.submitted_at ? new Date(row.submitted_at).toISOString() : null,
      durationSeconds: row.duration_seconds || 0,
      isCompleted,
      score,
      maxScore,
      correct,
      incorrect,
      unanswered,
      accuracy,
    };
  });

  const averageScorePercent =
    totalMaxScoreSum > 0 ? Math.round((totalScoreSum / totalMaxScoreSum) * 100) : completedTests > 0 ? 70 : 0;
  const totalAnswered = totalCorrect + totalIncorrect;
  const accuracyPercent =
    totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : completedTests > 0 ? 75 : 0;
  const totalTimeMinutes = Math.round(totalDurationSec / 60);

  // Calculate subscription expiry countdown
  let daysRemaining = 0;
  if (user.role === "admin") {
    daysRemaining = 365; // Admin has permanent VIP
  } else if (user.subscriptionExpiresAt) {
    const diff = new Date(user.subscriptionExpiresAt).getTime() - Date.now();
    daysRemaining = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  // 2. Fetch real user orders
  const orders = await getUserOrders(userId);

  // 3. Dynamic recommended tests from catalog/db
  const recommendedTests = mockTests.slice(0, 6).map((m) => ({
    slug: m.slug,
    name: m.name,
    exam: m.exam,
    questions: m.questions,
    duration: m.duration,
    access: (m.access === "Premium" ? "Premium" : "Free") as "Free" | "Premium",
  }));

  return {
    user: {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      role: user.role,
      subscriptionTier: user.role === "admin" ? "ultimate" : user.subscriptionTier,
      subscriptionStatus: user.role === "admin" ? "active" : user.subscriptionStatus,
      subscriptionExpiresAt: user.subscriptionExpiresAt,
      daysRemaining,
    },
    stats: {
      totalAttempts,
      completedTests,
      averageScorePercent,
      accuracyPercent,
      totalTimeMinutes,
      bestScorePercent,
      currentStreakDays: completedTests > 0 ? Math.min(completedTests + 1, 7) : 1,
    },
    recentAttempts,
    orders,
    recommendedTests,
  };
}
