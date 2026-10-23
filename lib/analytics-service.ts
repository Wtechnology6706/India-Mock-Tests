import { db } from "./db";
import type { RowDataPacket, ResultSetHeader } from "mysql2";

export interface TrackEventInput {
  eventType: "page_view" | "test_click" | "exam_click" | "button_click";
  pagePath: string;
  entitySlug?: string;
  entityTitle?: string;
  userId?: number;
  metadata?: Record<string, any>;
}

export interface ExamAttemptMetric {
  examName: string;
  attemptsCount: number;
  avgDurationMinutes: number;
  percentageOfTotal: number;
}

export interface TestAttemptMetric {
  testTitle: string;
  testSlug: string;
  examName: string;
  attemptsCount: number;
  avgDurationMinutes: number;
  avgDurationFormatted: string;
}

export interface SubjectTimeMetric {
  subjectName: string;
  examName: string;
  attemptsCount: number;
  avgMinutes: number;
  avgDurationFormatted: string;
}

export interface PageInteractionMetric {
  pagePath: string;
  entityTitle: string;
  eventType: string;
  clickCount: number;
  lastClicked: string;
}

export interface AdminAnalyticsData {
  summary: {
    totalAttempts: number;
    uniqueAspirants: number;
    overallAvgMinutes: number;
    totalTrackedClicks: number;
    completedAttempts: number;
  };
  mostAttemptedExams: ExamAttemptMetric[];
  mostAttemptedTests: TestAttemptMetric[];
  averageTimeBySubject: SubjectTimeMetric[];
  topClickedPages: PageInteractionMetric[];
  dailyTrends: { date: string; attemptsCount: number }[];
}

/**
 * Ensure the table exists in MySQL
 */
async function ensureAnalyticsTable(): Promise<void> {
  try {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS analytics_interactions (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        event_type VARCHAR(50) NOT NULL,
        page_path VARCHAR(255) NOT NULL,
        entity_slug VARCHAR(200) NULL,
        entity_title VARCHAR(255) NULL,
        user_id BIGINT UNSIGNED NULL,
        metadata JSON NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_path (page_path),
        INDEX idx_event (event_type),
        INDEX idx_created (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
  } catch (err) {
    console.warn("Analytics table ensure warning:", err);
  }
}

/**
 * Record a user interaction or page click
 */
export async function trackInteraction(input: TrackEventInput): Promise<boolean> {
  try {
    await ensureAnalyticsTable();
    await db.execute(
      `INSERT INTO analytics_interactions 
       (event_type, page_path, entity_slug, entity_title, user_id, metadata, created_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [
        input.eventType,
        input.pagePath.slice(0, 255),
        input.entitySlug ? input.entitySlug.slice(0, 200) : null,
        input.entityTitle ? input.entityTitle.slice(0, 255) : null,
        input.userId || null,
        input.metadata ? JSON.stringify(input.metadata) : null,
      ]
    );
    return true;
  } catch (err) {
    console.warn("Failed recording interaction event:", err);
    return false;
  }
}

/**
 * Query complete aggregated analytics for Admin Dashboard
 */
export async function getAdminAnalytics(timeframe: "all" | "30d" | "7d" | "today" = "all"): Promise<AdminAnalyticsData> {
  await ensureAnalyticsTable();

  // Timeframe filter clauses
  let attemptTimeClause = "1=1";
  let clickTimeClause = "1=1";

  if (timeframe === "today") {
    attemptTimeClause = "ta.started_at >= CURDATE()";
    clickTimeClause = "created_at >= CURDATE()";
  } else if (timeframe === "7d") {
    attemptTimeClause = "ta.started_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)";
    clickTimeClause = "created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)";
  } else if (timeframe === "30d") {
    attemptTimeClause = "ta.started_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)";
    clickTimeClause = "created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)";
  }

  // 1. Overall Summary
  const [totalAttemptsRows] = await db.query<RowDataPacket[]>(
    `SELECT 
       COUNT(*) as total_attempts,
       COUNT(DISTINCT user_id) as unique_aspirants,
       COALESCE(AVG(duration_seconds), 0) as avg_duration_sec,
       COUNT(CASE WHEN submitted_at IS NOT NULL OR result_snapshot IS NOT NULL THEN 1 END) as completed_attempts
     FROM test_attempts ta
     WHERE ${attemptTimeClause}`
  );

  const [totalClicksRows] = await db.query<RowDataPacket[]>(
    `SELECT COUNT(*) as total_clicks 
     FROM analytics_interactions 
     WHERE ${clickTimeClause}`
  );

  const totalAttempts = Number(totalAttemptsRows[0]?.total_attempts || 0);
  const uniqueAspirants = Number(totalAttemptsRows[0]?.unique_aspirants || 0);
  const overallAvgMinutes = Math.round(Number(totalAttemptsRows[0]?.avg_duration_sec || 0) / 60);
  const completedAttempts = Number(totalAttemptsRows[0]?.completed_attempts || 0);
  const totalTrackedClicks = Number(totalClicksRows[0]?.total_clicks || 0);

  // 2. Most Attempted Exams
  const [examRows] = await db.query<RowDataPacket[]>(
    `SELECT 
       COALESCE(exam_name, 'Other') as exam_name,
       COUNT(*) as cnt,
       AVG(duration_seconds) as avg_sec
     FROM test_attempts ta
     WHERE ${attemptTimeClause}
     GROUP BY exam_name
     ORDER BY cnt DESC`
  );

  const mostAttemptedExams: ExamAttemptMetric[] = examRows.map((r) => {
    const count = Number(r.cnt);
    const avgSec = Number(r.avg_sec || 0);
    return {
      examName: String(r.exam_name),
      attemptsCount: count,
      avgDurationMinutes: Math.round(avgSec / 60),
      percentageOfTotal: totalAttempts > 0 ? Math.round((count / totalAttempts) * 100) : 0,
    };
  });

  // 3. Most Attempted Specific Tests
  const [testRows] = await db.query<RowDataPacket[]>(
    `SELECT 
       COALESCE(test_title, test_slug) as test_title,
       test_slug,
       COALESCE(exam_name, 'General') as exam_name,
       COUNT(*) as cnt,
       AVG(duration_seconds) as avg_sec
     FROM test_attempts ta
     WHERE ${attemptTimeClause}
     GROUP BY test_title, test_slug, exam_name
     ORDER BY cnt DESC
     LIMIT 10`
  );

  const mostAttemptedTests: TestAttemptMetric[] = testRows.map((r) => {
    const avgSec = Number(r.avg_sec || 0);
    const mins = Math.floor(avgSec / 60);
    const secs = Math.round(avgSec % 60);
    return {
      testTitle: String(r.test_title),
      testSlug: String(r.test_slug),
      examName: String(r.exam_name),
      attemptsCount: Number(r.cnt),
      avgDurationMinutes: Math.round(avgSec / 60),
      avgDurationFormatted: `${mins}m ${secs}s`,
    };
  });

  // 4. Average Time Taken by Subject & Exam Category
  const [subjectRows] = await db.query<RowDataPacket[]>(
    `SELECT 
       COALESCE(s.name, t.track_slug, 'Core General Studies') as subject_name,
       ta.exam_name,
       COUNT(*) as cnt,
       AVG(ta.duration_seconds) as avg_sec
     FROM test_attempts ta
     LEFT JOIN tests t ON ta.test_slug = t.slug
     LEFT JOIN subjects s ON t.subject_id = s.id
     WHERE ${attemptTimeClause}
     GROUP BY subject_name, ta.exam_name
     ORDER BY cnt DESC`
  );

  const averageTimeBySubject: SubjectTimeMetric[] = subjectRows.map((r) => {
    const avgSec = Number(r.avg_sec || 0);
    const mins = Math.floor(avgSec / 60);
    const secs = Math.round(avgSec % 60);
    return {
      subjectName: String(r.subject_name),
      examName: String(r.exam_name),
      attemptsCount: Number(r.cnt),
      avgMinutes: Math.round(avgSec / 60),
      avgDurationFormatted: `${mins}m ${secs}s`,
    };
  });

  // 5. Click Count on Specific Page / Test
  const [clickRows] = await db.query<RowDataPacket[]>(
    `SELECT 
       page_path,
       COALESCE(entity_title, page_path) as entity_title,
       event_type,
       COUNT(*) as click_cnt,
       MAX(created_at) as last_clicked
     FROM analytics_interactions
     WHERE ${clickTimeClause}
     GROUP BY page_path, entity_title, event_type
     ORDER BY click_cnt DESC
     LIMIT 15`
  );

  const topClickedPages: PageInteractionMetric[] = clickRows.map((r) => ({
    pagePath: String(r.page_path),
    entityTitle: String(r.entity_title),
    eventType: String(r.event_type),
    clickCount: Number(r.click_cnt),
    lastClicked: r.last_clicked ? new Date(r.last_clicked).toLocaleString("en-IN") : "Recent",
  }));

  // 6. Daily Trends (last 14 days)
  const [trendRows] = await db.query<RowDataPacket[]>(
    `SELECT 
       DATE_FORMAT(started_at, '%d %b') as date_label,
       COUNT(*) as cnt
     FROM test_attempts
     WHERE started_at >= DATE_SUB(NOW(), INTERVAL 14 DAY)
     GROUP BY DATE_FORMAT(started_at, '%d %b'), DATE(started_at)
     ORDER BY DATE(started_at) ASC`
  );

  const dailyTrends = trendRows.map((r) => ({
    date: String(r.date_label),
    attemptsCount: Number(r.cnt),
  }));

  return {
    summary: {
      totalAttempts,
      uniqueAspirants,
      overallAvgMinutes,
      totalTrackedClicks,
      completedAttempts,
    },
    mostAttemptedExams,
    mostAttemptedTests,
    averageTimeBySubject,
    topClickedPages,
    dailyTrends,
  };
}
