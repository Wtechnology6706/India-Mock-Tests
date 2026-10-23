import { randomUUID } from "node:crypto";
import type { RowDataPacket, ResultSetHeader } from "mysql2";
import { db } from "./db";
import {
  type ExamGroup,
  type ExamGroupType,
  defaultExamGroups,
  evaluateTestAccess,
} from "./exam-group-types";

export * from "./exam-group-types";

// In-memory fallback
const globalForExamGroups = globalThis as unknown as { examGroups?: ExamGroup[] };
const localExamGroups: ExamGroup[] = globalForExamGroups.examGroups ?? [...defaultExamGroups];
if (process.env.NODE_ENV !== "production") {
  globalForExamGroups.examGroups = localExamGroups;
}

export async function ensureExamGroupsTable() {
  try {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS exam_groups (
        id VARCHAR(64) PRIMARY KEY,
        slug VARCHAR(128) NOT NULL UNIQUE,
        title VARCHAR(255) NOT NULL,
        type VARCHAR(32) NOT NULL DEFAULT 'individual',
        exam_slug VARCHAR(64) NOT NULL,
        exam_name VARCHAR(128) NOT NULL,
        target_subject VARCHAR(128) NULL,
        clubbed_subjects TEXT NOT NULL,
        included_test_slugs TEXT NULL,
        price INT NOT NULL DEFAULT 299,
        validity_days INT NOT NULL DEFAULT 90,
        description TEXT NULL,
        badge VARCHAR(64) NULL,
        active TINYINT(1) NOT NULL DEFAULT 1,
        sort_order INT NOT NULL DEFAULT 0,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Seed defaults into DB if empty
    const [rows] = await db.query<RowDataPacket[]>("SELECT COUNT(*) AS count FROM exam_groups");
    const count = (rows[0] as any)?.count || 0;

    if (count === 0) {
      for (const group of defaultExamGroups) {
        await db.execute(
          `INSERT INTO exam_groups 
            (id, slug, title, type, exam_slug, exam_name, target_subject, clubbed_subjects, included_test_slugs, price, validity_days, description, badge, active, sort_order, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, UTC_TIMESTAMP())
           ON DUPLICATE KEY UPDATE title=VALUES(title)`,
          [
            group.id,
            group.slug,
            group.title,
            group.type,
            group.examSlug,
            group.examName,
            group.targetSubject || null,
            JSON.stringify(group.clubbedSubjects),
            JSON.stringify(group.includedTestSlugs || []),
            group.price,
            group.validityDays,
            group.description,
            group.badge || null,
            group.active ? 1 : 0,
            group.sortOrder,
          ]
        );
      }
    }
  } catch (err) {
    // Local fallback will operate if DB is offline
  }
}

function mapRowToExamGroup(row: any): ExamGroup {
  let clubbedSubjects: string[] = [];
  try {
    clubbedSubjects = typeof row.clubbed_subjects === "string" ? JSON.parse(row.clubbed_subjects) : (row.clubbed_subjects || []);
  } catch {
    clubbedSubjects = (row.clubbed_subjects || "").split(",").map((s: string) => s.trim()).filter(Boolean);
  }

  let includedTestSlugs: string[] = [];
  try {
    includedTestSlugs = typeof row.included_test_slugs === "string" ? JSON.parse(row.included_test_slugs) : (row.included_test_slugs || []);
  } catch {
    includedTestSlugs = [];
  }

  return {
    id: String(row.id),
    slug: row.slug,
    title: row.title,
    type: (row.type as ExamGroupType) || "individual",
    examSlug: row.exam_slug,
    examName: row.exam_name,
    targetSubject: row.target_subject || undefined,
    clubbedSubjects,
    includedTestSlugs,
    price: Number(row.price) || 299,
    validityDays: Number(row.validity_days) || 90,
    description: row.description || "",
    badge: row.badge || undefined,
    active: Boolean(row.active),
    sortOrder: Number(row.sort_order) || 0,
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
    updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : undefined,
  };
}

export async function listExamGroups(filter?: {
  type?: ExamGroupType;
  examSlug?: string;
  activeOnly?: boolean;
}): Promise<ExamGroup[]> {
  await ensureExamGroupsTable();
  try {
    let query = "SELECT * FROM exam_groups WHERE 1=1";
    const params: any[] = [];

    if (filter?.activeOnly !== false) {
      query += " AND active = 1";
    }
    if (filter?.type) {
      query += " AND type = ?";
      params.push(filter.type);
    }
    if (filter?.examSlug && filter.examSlug !== "all") {
      query += " AND exam_slug = ?";
      params.push(filter.examSlug);
    }

    query += " ORDER BY sort_order ASC, title ASC";

    const [rows] = await db.query<RowDataPacket[]>(query, params);
    if (rows && rows.length > 0) {
      return rows.map(mapRowToExamGroup);
    }
  } catch {
    // DB failed, fall through to in-memory
  }

  let list = [...localExamGroups];
  if (filter?.activeOnly !== false) {
    list = list.filter((g) => g.active);
  }
  if (filter?.type) {
    list = list.filter((g) => g.type === filter.type);
  }
  if (filter?.examSlug && filter.examSlug !== "all") {
    list = list.filter((g) => g.examSlug === filter.examSlug);
  }
  return list.sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function getExamGroupBySlug(slug: string): Promise<ExamGroup | null> {
  await ensureExamGroupsTable();
  try {
    const [rows] = await db.query<RowDataPacket[]>(
      "SELECT * FROM exam_groups WHERE slug = ? OR id = ? LIMIT 1",
      [slug, slug]
    );
    if (rows && rows.length > 0) {
      return mapRowToExamGroup(rows[0]);
    }
  } catch {
    // Fall through
  }

  const found = localExamGroups.find((g) => g.slug === slug || g.id === slug);
  return found || null;
}

export async function upsertExamGroup(data: {
  id?: string;
  slug?: string;
  title: string;
  type: ExamGroupType;
  examSlug: string;
  examName: string;
  targetSubject?: string;
  clubbedSubjects: string[];
  includedTestSlugs?: string[];
  price: number;
  validityDays?: number;
  description: string;
  badge?: string;
  active?: boolean;
  sortOrder?: number;
}): Promise<ExamGroup> {
  await ensureExamGroupsTable();

  const id = data.id || `eg-${Date.now()}`;
  const slug =
    data.slug ||
    data.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

  const validityDays = data.validityDays || 90;
  const active = data.active !== false;
  const sortOrder = data.sortOrder || 0;

  const newGroup: ExamGroup = {
    id,
    slug,
    title: data.title,
    type: data.type,
    examSlug: data.examSlug,
    examName: data.examName,
    targetSubject: data.targetSubject,
    clubbedSubjects: data.clubbedSubjects,
    includedTestSlugs: data.includedTestSlugs || [],
    price: data.price,
    validityDays,
    description: data.description,
    badge: data.badge,
    active,
    sortOrder,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  try {
    await db.execute(
      `INSERT INTO exam_groups 
        (id, slug, title, type, exam_slug, exam_name, target_subject, clubbed_subjects, included_test_slugs, price, validity_days, description, badge, active, sort_order, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, UTC_TIMESTAMP(), UTC_TIMESTAMP())
       ON DUPLICATE KEY UPDATE
        title=VALUES(title),
        type=VALUES(type),
        exam_slug=VALUES(exam_slug),
        exam_name=VALUES(exam_name),
        target_subject=VALUES(target_subject),
        clubbed_subjects=VALUES(clubbed_subjects),
        included_test_slugs=VALUES(included_test_slugs),
        price=VALUES(price),
        validity_days=VALUES(validity_days),
        description=VALUES(description),
        badge=VALUES(badge),
        active=VALUES(active),
        sort_order=VALUES(sort_order),
        updated_at=UTC_TIMESTAMP()`,
      [
        id,
        slug,
        newGroup.title,
        newGroup.type,
        newGroup.examSlug,
        newGroup.examName,
        newGroup.targetSubject || null,
        JSON.stringify(newGroup.clubbedSubjects),
        JSON.stringify(newGroup.includedTestSlugs || []),
        newGroup.price,
        newGroup.validityDays,
        newGroup.description,
        newGroup.badge || null,
        newGroup.active ? 1 : 0,
        newGroup.sortOrder,
      ]
    );
  } catch (err) {
    // Local storage
  }

  const existingIdx = localExamGroups.findIndex((g) => g.id === id || g.slug === slug);
  if (existingIdx !== -1) {
    localExamGroups[existingIdx] = newGroup;
  } else {
    localExamGroups.push(newGroup);
  }

  return newGroup;
}

export async function deleteExamGroup(id: string): Promise<boolean> {
  await ensureExamGroupsTable();
  try {
    await db.execute("DELETE FROM exam_groups WHERE id = ? OR slug = ?", [id, id]);
  } catch {
    // Ignore
  }

  const idx = localExamGroups.findIndex((g) => g.id === id || g.slug === id);
  if (idx !== -1) {
    localExamGroups.splice(idx, 1);
    return true;
  }
  return false;
}
