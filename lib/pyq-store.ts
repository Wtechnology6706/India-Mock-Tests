import type { RowDataPacket, ResultSetHeader } from "mysql2";
import { db } from "./db";

export type PYQDocument = {
  id: string;
  slug: string;
  examSlug: string;
  examName: string;
  trackSlug: string;
  subjectName: string;
  year: number;
  paperName: string;
  title: string;
  description: string;
  fileUrl: string;
  fileSize?: string;
  pageCount?: number;
  downloadCount: number;
  accessTier: "Free" | "Premium";
  status: "Published" | "Draft";
  createdAt: string;
  updatedAt?: string;
};

export type PYQInput = {
  examSlug: string;
  examName: string;
  trackSlug?: string;
  subjectName: string;
  year: number;
  paperName: string;
  title: string;
  description?: string;
  fileUrl: string;
  fileSize?: string;
  pageCount?: number;
  accessTier?: "Free" | "Premium";
  status?: "Published" | "Draft";
};

// Default high-yield seed PYQs
export const defaultPYQs: PYQDocument[] = [
  {
    id: "pyq-1",
    slug: "bpsc-tre3-computer-science-11-12-2024",
    examSlug: "bpsc-tre-4",
    examName: "BPSC TRE 4.0",
    trackSlug: "higher-secondary-11-12",
    subjectName: "Computer Science",
    year: 2024,
    paperName: "BPSC TRE 3.0 Paper III (11-12)",
    title: "BPSC TRE 3.0 (2024) Computer Science (Classes 11–12) Official Question Paper with Detailed Explanations",
    description: "Official 80-question Part III Computer Science & General Studies paper conducted during BPSC TRE 3.0 Re-exam with verified answers and comprehensive syllabus coverage.",
    fileUrl: "/TRE4_Higher_Secondary_Classes_11_12_Detailed_Syllabus_FIXED.pdf",
    fileSize: "4.8 MB",
    pageCount: 32,
    downloadCount: 3840,
    accessTier: "Free",
    status: "Published",
    createdAt: "2026-08-15T10:00:00Z",
  },
  {
    id: "pyq-2",
    slug: "bpsc-tre3-general-studies-primary-2024",
    examSlug: "bpsc-tre-4",
    examName: "BPSC TRE 4.0",
    trackSlug: "primary-1-5",
    subjectName: "General Studies",
    year: 2024,
    paperName: "BPSC TRE 3.0 Primary (Classes 1–5)",
    title: "BPSC TRE 3.0 (2024) Primary Teacher (1–5) Full GS & Elementary Maths Official Question Paper",
    description: "Complete 150-question bilingual (Hindi/English) question paper covering Bihar GK, Indian National Movement, Science, Geography, and Elementary Mathematics.",
    fileUrl: "/TRE4_Higher_Secondary_Classes_11_12_Detailed_Syllabus_FIXED.pdf",
    fileSize: "5.2 MB",
    pageCount: 36,
    downloadCount: 6210,
    accessTier: "Free",
    status: "Published",
    createdAt: "2026-08-10T10:00:00Z",
  },
  {
    id: "pyq-3",
    slug: "bpsc-tre2-mathematics-science-6-8-2023",
    examSlug: "bpsc-tre-4",
    examName: "BPSC TRE 4.0",
    trackSlug: "middle-6-8",
    subjectName: "Mathematics & Science",
    year: 2023,
    paperName: "BPSC TRE 2.0 Middle School (Classes 6–8)",
    title: "BPSC TRE 2.0 (Dec 2023) Middle School Maths & Science 80-Q Subject Drill with Answer Key",
    description: "Official question paper of BPSC Teacher Recruitment Phase 2 for Upper Primary level covering Physics, Chemistry, Biology, and Advanced Secondary Mathematics.",
    fileUrl: "/TRE4_Higher_Secondary_Classes_11_12_Detailed_Syllabus_FIXED.pdf",
    fileSize: "3.9 MB",
    pageCount: 28,
    downloadCount: 4520,
    accessTier: "Premium",
    status: "Published",
    createdAt: "2026-07-20T10:00:00Z",
  },
  {
    id: "pyq-4",
    slug: "bihar-stet-paper1-secondary-2024",
    examSlug: "bihar-stet",
    examName: "Bihar STET",
    trackSlug: "paper-1",
    subjectName: "Teaching Art & General Studies",
    year: 2024,
    paperName: "Bihar STET 2024 Paper 1 (Secondary 9–10)",
    title: "Bihar STET 2024 Paper 1 (Class 9–10) Teaching Pedagogy & General Skills Solved Paper",
    description: "Authentic CBT computer-based test memory questions for Bihar State Teacher Eligibility Test Paper 1 covering Teaching Methodology, Bloom's Taxonomy, and General Aptitude.",
    fileUrl: "/TRE4_Higher_Secondary_Classes_11_12_Detailed_Syllabus_FIXED.pdf",
    fileSize: "2.7 MB",
    pageCount: 20,
    downloadCount: 2980,
    accessTier: "Free",
    status: "Published",
    createdAt: "2026-06-15T10:00:00Z",
  },
  {
    id: "pyq-5",
    slug: "ctet-paper2-social-science-2024",
    examSlug: "ctet",
    examName: "CTET",
    trackSlug: "paper-2",
    subjectName: "Social Science",
    year: 2024,
    paperName: "CTET July 2024 Paper II",
    title: "Central Teacher Eligibility Test (CTET) July 2024 Paper II (Classes 6–8) Social Studies Official PDF",
    description: "Original bilingual CBSE CTET Paper 2 with official answer keys covering Child Development, History, Civics, Geography, and Language I & II.",
    fileUrl: "/TRE4_Higher_Secondary_Classes_11_12_Detailed_Syllabus_FIXED.pdf",
    fileSize: "4.1 MB",
    pageCount: 30,
    downloadCount: 5190,
    accessTier: "Free",
    status: "Published",
    createdAt: "2026-07-30T10:00:00Z",
  },
  {
    id: "pyq-6",
    slug: "bpsc-tre1-secondary-hindi-2023",
    examSlug: "bpsc-tre-4",
    examName: "BPSC TRE 4.0",
    trackSlug: "secondary-9-10",
    subjectName: "Hindi",
    year: 2023,
    paperName: "BPSC TRE 1.0 Secondary (Classes 9–10)",
    title: "BPSC TRE 1.0 (August 2023) Secondary Teacher Hindi Language & Literature Solved Paper",
    description: "Prescribed 80-question Hindi literature, grammar, prosody, and language comprehension examination paper with verified official answer keys.",
    fileUrl: "/TRE4_Higher_Secondary_Classes_11_12_Detailed_Syllabus_FIXED.pdf",
    fileSize: "3.2 MB",
    pageCount: 24,
    downloadCount: 3410,
    accessTier: "Premium",
    status: "Published",
    createdAt: "2026-05-18T10:00:00Z",
  },
];

let localPYQs: PYQDocument[] = [...defaultPYQs];

export async function ensurePYQSchema() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS pyq_documents (
        id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
        slug VARCHAR(191) NOT NULL UNIQUE,
        exam_slug VARCHAR(100) NOT NULL,
        exam_name VARCHAR(180) NOT NULL,
        track_slug VARCHAR(100) NOT NULL DEFAULT 'all',
        subject_name VARCHAR(180) NOT NULL,
        year INT UNSIGNED NOT NULL,
        paper_name VARCHAR(200) NOT NULL,
        title VARCHAR(250) NOT NULL,
        description TEXT NULL,
        file_url VARCHAR(1000) NOT NULL,
        file_size VARCHAR(50) NULL,
        page_count INT UNSIGNED NULL,
        download_count INT UNSIGNED NOT NULL DEFAULT 0,
        access_tier ENUM('free', 'premium') NOT NULL DEFAULT 'free',
        status ENUM('published', 'draft') NOT NULL DEFAULT 'published',
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_pyq_exam_year (exam_slug, year, status),
        INDEX idx_pyq_subject (subject_name)
      )
    `);

    // Seed defaults if empty
    const [rows] = await db.query<RowDataPacket[]>("SELECT COUNT(*) as cnt FROM pyq_documents");
    if (rows[0]?.cnt === 0) {
      for (const p of defaultPYQs) {
        await db.execute(
          `INSERT INTO pyq_documents (slug, exam_slug, exam_name, track_slug, subject_name, year, paper_name, title, description, file_url, file_size, page_count, download_count, access_tier, status, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE title=VALUES(title)`,
          [
            p.slug,
            p.examSlug,
            p.examName,
            p.trackSlug,
            p.subjectName,
            p.year,
            p.paperName,
            p.title,
            p.description,
            p.fileUrl,
            p.fileSize || null,
            p.pageCount || 20,
            p.downloadCount,
            p.accessTier === "Premium" ? "premium" : "free",
            p.status.toLowerCase(),
            p.createdAt,
          ]
        );
      }
    }
  } catch (err) {
    console.error("Error ensuring PYQ schema:", err);
  }
}

export async function listPYQs(filter?: {
  examSlug?: string;
  subjectName?: string;
  year?: number;
  status?: string;
  query?: string;
}): Promise<PYQDocument[]> {
  await ensurePYQSchema();

  try {
    let sql = `
      SELECT id, slug, exam_slug, exam_name, track_slug, subject_name, year, paper_name,
             title, description, file_url, file_size, page_count, download_count, access_tier,
             status, created_at
      FROM pyq_documents
    `;
    const conditions: string[] = [];
    const params: unknown[] = [];

    if (filter?.examSlug && filter.examSlug !== "All") {
      conditions.push("(exam_slug = ? OR LOWER(exam_name) LIKE LOWER(?))");
      params.push(filter.examSlug, `%${filter.examSlug}%`);
    }
    if (filter?.subjectName && filter.subjectName !== "All") {
      conditions.push("subject_name = ?");
      params.push(filter.subjectName);
    }
    if (filter?.year && filter.year > 0) {
      conditions.push("year = ?");
      params.push(filter.year);
    }
    if (filter?.status && filter.status !== "All") {
      conditions.push("LOWER(status) = LOWER(?)");
      params.push(filter.status);
    }
    if (filter?.query?.trim()) {
      const q = `%${filter.query.trim()}%`;
      conditions.push("(title LIKE ? OR description LIKE ? OR paper_name LIKE ? OR subject_name LIKE ?)");
      params.push(q, q, q, q);
    }

    if (conditions.length > 0) {
      sql += " WHERE " + conditions.join(" AND ");
    }
    sql += " ORDER BY year DESC, id DESC";

    const [rows] = await db.query<(RowDataPacket & {
      id: number;
      slug: string;
      exam_slug: string;
      exam_name: string;
      track_slug: string;
      subject_name: string;
      year: number;
      paper_name: string;
      title: string;
      description: string | null;
      file_url: string;
      file_size: string | null;
      page_count: number | null;
      download_count: number;
      access_tier: string;
      status: string;
      created_at: string;
    })[]>(sql, params);

    return rows.map((r) => ({
      id: String(r.id),
      slug: r.slug,
      examSlug: r.exam_slug,
      examName: r.exam_name,
      trackSlug: r.track_slug,
      subjectName: r.subject_name,
      year: r.year,
      paperName: r.paper_name,
      title: r.title,
      description: r.description || "",
      fileUrl: r.file_url,
      fileSize: r.file_size || "3.5 MB",
      pageCount: r.page_count || 24,
      downloadCount: r.download_count || 0,
      accessTier: r.access_tier === "premium" ? "Premium" : "Free",
      status: r.status === "published" ? "Published" : "Draft",
      createdAt: r.created_at,
    }));
  } catch (err) {
    console.error("Error listing PYQs from DB:", err);
  }

  // Local fallback
  let results = [...localPYQs];
  if (filter?.examSlug && filter.examSlug !== "All") {
    results = results.filter((p) => p.examSlug === filter.examSlug || p.examName.toLowerCase().includes(filter.examSlug!.toLowerCase()));
  }
  if (filter?.subjectName && filter.subjectName !== "All") {
    results = results.filter((p) => p.subjectName.toLowerCase() === filter.subjectName!.toLowerCase());
  }
  if (filter?.year && filter.year > 0) {
    results = results.filter((p) => p.year === filter.year);
  }
  if (filter?.status && filter.status !== "All") {
    results = results.filter((p) => p.status === filter.status);
  }
  if (filter?.query?.trim()) {
    const q = filter.query.toLowerCase();
    results = results.filter((p) => p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.subjectName.toLowerCase().includes(q));
  }
  return results;
}

export async function getPYQByIdOrSlug(idOrSlug: string): Promise<PYQDocument | null> {
  await ensurePYQSchema();

  try {
    const [rows] = await db.query<(RowDataPacket & {
      id: number;
      slug: string;
      exam_slug: string;
      exam_name: string;
      track_slug: string;
      subject_name: string;
      year: number;
      paper_name: string;
      title: string;
      description: string | null;
      file_url: string;
      file_size: string | null;
      page_count: number | null;
      download_count: number;
      access_tier: string;
      status: string;
      created_at: string;
    })[]>(
      `SELECT id, slug, exam_slug, exam_name, track_slug, subject_name, year, paper_name,
              title, description, file_url, file_size, page_count, download_count, access_tier,
              status, created_at
       FROM pyq_documents
       WHERE id = ? OR slug = ? LIMIT 1`,
      [idOrSlug, idOrSlug]
    );

    if (rows[0]) {
      const r = rows[0];
      return {
        id: String(r.id),
        slug: r.slug,
        examSlug: r.exam_slug,
        examName: r.exam_name,
        trackSlug: r.track_slug,
        subjectName: r.subject_name,
        year: r.year,
        paperName: r.paper_name,
        title: r.title,
        description: r.description || "",
        fileUrl: r.file_url,
        fileSize: r.file_size || "3.5 MB",
        pageCount: r.page_count || 24,
        downloadCount: r.download_count || 0,
        accessTier: r.access_tier === "premium" ? "Premium" : "Free",
        status: r.status === "published" ? "Published" : "Draft",
        createdAt: r.created_at,
      };
    }
  } catch (err) {
    console.error("Error fetching PYQ:", err);
  }

  return localPYQs.find((p) => p.id === idOrSlug || p.slug === idOrSlug) || null;
}

export async function incrementPYQDownloadCount(idOrSlug: string): Promise<void> {
  try {
    await db.execute("UPDATE pyq_documents SET download_count = download_count + 1 WHERE id = ? OR slug = ?", [idOrSlug, idOrSlug]);
  } catch {
    const item = localPYQs.find((p) => p.id === idOrSlug || p.slug === idOrSlug);
    if (item) item.downloadCount++;
  }
}

export async function createPYQ(input: PYQInput): Promise<PYQDocument> {
  if (!input.title?.trim() || !input.fileUrl?.trim() || !input.examName?.trim() || !input.subjectName?.trim()) {
    throw new Error("PYQ Title, Exam, Subject, and PDF File URL are required.");
  }

  const generatedSlug =
    input.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") +
    "-" +
    (input.year || 2024) +
    "-" +
    Math.random().toString(36).substring(2, 6);

  const cleanYear = Number(input.year) || new Date().getFullYear();
  const cleanAccess = input.accessTier === "Premium" ? "premium" : "free";
  const cleanStatus = input.status === "Draft" ? "draft" : "published";

  const fallback: PYQDocument = {
    id: `pyq-${Date.now()}`,
    slug: generatedSlug,
    examSlug: input.examSlug || input.examName.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    examName: input.examName.trim(),
    trackSlug: input.trackSlug || "all",
    subjectName: input.subjectName.trim(),
    year: cleanYear,
    paperName: input.paperName?.trim() || `${input.examName} (${cleanYear})`,
    title: input.title.trim(),
    description: input.description?.trim() || "",
    fileUrl: input.fileUrl.trim(),
    fileSize: input.fileSize || "3.5 MB",
    pageCount: Number(input.pageCount) || 24,
    downloadCount: 0,
    accessTier: cleanAccess === "premium" ? "Premium" : "Free",
    status: cleanStatus === "published" ? "Published" : "Draft",
    createdAt: new Date().toISOString(),
  };

  try {
    const [ins] = (await db.query(
      `INSERT INTO pyq_documents (slug, exam_slug, exam_name, track_slug, subject_name, year, paper_name, title, description, file_url, file_size, page_count, download_count, access_tier, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)`,
      [
        fallback.slug,
        fallback.examSlug,
        fallback.examName,
        fallback.trackSlug,
        fallback.subjectName,
        fallback.year,
        fallback.paperName,
        fallback.title,
        fallback.description,
        fallback.fileUrl,
        fallback.fileSize,
        fallback.pageCount,
        cleanAccess,
        cleanStatus,
      ]
    )) as any;
    if (ins?.insertId) {
      fallback.id = String(ins.insertId);
    }
  } catch (err) {
    console.error("Error inserting PYQ to DB:", err);
  }

  localPYQs.unshift(fallback);
  return fallback;
}

export async function updatePYQ(id: string, input: Partial<PYQInput>): Promise<PYQDocument> {
  try {
    const setClauses: string[] = [];
    const setParams: (string | number | null)[] = [];

    if (input.title !== undefined) {
      setClauses.push("title = ?");
      setParams.push(input.title.trim());
    }
    if (input.examName !== undefined) {
      setClauses.push("exam_name = ?");
      setParams.push(input.examName.trim());
    }
    if (input.examSlug !== undefined) {
      setClauses.push("exam_slug = ?");
      setParams.push(input.examSlug.trim());
    }
    if (input.trackSlug !== undefined) {
      setClauses.push("track_slug = ?");
      setParams.push(input.trackSlug.trim());
    }
    if (input.subjectName !== undefined) {
      setClauses.push("subject_name = ?");
      setParams.push(input.subjectName.trim());
    }
    if (input.year !== undefined) {
      setClauses.push("year = ?");
      setParams.push(Number(input.year) || 2024);
    }
    if (input.paperName !== undefined) {
      setClauses.push("paper_name = ?");
      setParams.push(input.paperName.trim());
    }
    if (input.description !== undefined) {
      setClauses.push("description = ?");
      setParams.push(input.description ? input.description.trim() : null);
    }
    if (input.fileUrl !== undefined) {
      setClauses.push("file_url = ?");
      setParams.push(input.fileUrl.trim());
    }
    if (input.fileSize !== undefined) {
      setClauses.push("file_size = ?");
      setParams.push(input.fileSize.trim());
    }
    if (input.pageCount !== undefined) {
      setClauses.push("page_count = ?");
      setParams.push(Number(input.pageCount) || 24);
    }
    if (input.accessTier !== undefined) {
      setClauses.push("access_tier = ?");
      setParams.push(input.accessTier === "Premium" ? "premium" : "free");
    }
    if (input.status !== undefined) {
      setClauses.push("status = ?");
      setParams.push(input.status.toLowerCase());
    }

    if (setClauses.length > 0) {
      setParams.push(id, id);
      await db.execute(`UPDATE pyq_documents SET ${setClauses.join(", ")} WHERE id = ? OR slug = ?`, setParams);
    }

    const updated = await getPYQByIdOrSlug(id);
    if (updated) return updated;
  } catch (err) {
    console.error("Error updating PYQ in DB:", err);
  }

  const localIdx = localPYQs.findIndex((p) => p.id === id || p.slug === id);
  if (localIdx !== -1) {
    localPYQs[localIdx] = { ...localPYQs[localIdx], ...input as any };
    return localPYQs[localIdx];
  }
  throw new Error(`PYQ document #${id} could not be found.`);
}

export async function deletePYQ(id: string): Promise<boolean> {
  try {
    const [res] = (await db.execute("DELETE FROM pyq_documents WHERE id = ? OR slug = ?", [id, id])) as any;
    const idx = localPYQs.findIndex((p) => p.id === id || p.slug === id);
    if (idx !== -1) localPYQs.splice(idx, 1);
    return Boolean(res?.affectedRows > 0);
  } catch {
    const idx = localPYQs.findIndex((p) => p.id === id || p.slug === id);
    if (idx !== -1) {
      localPYQs.splice(idx, 1);
      return true;
    }
    return false;
  }
}

export async function getPublishedPYQs(filter?: {
  examSlug?: string;
  subjectName?: string;
  year?: number;
  search?: string;
}): Promise<PYQDocument[]> {
  return listPYQs({
    examSlug: filter?.examSlug,
    subjectName: filter?.subjectName,
    year: filter?.year,
    status: "Published",
    query: filter?.search,
  });
}

export async function getAllPYQs(): Promise<PYQDocument[]> {
  return listPYQs();
}

export async function getPYQById(id: string): Promise<PYQDocument | null> {
  return getPYQByIdOrSlug(id);
}

export async function incrementPYQDownload(id: string): Promise<void> {
  return incrementPYQDownloadCount(id);
}
