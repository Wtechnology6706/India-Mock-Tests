import { db } from "./db";
import { featuredExams, type FeaturedExam } from "./catalog";
import type { RowDataPacket } from "mysql2";

export async function getFeaturedExams(): Promise<FeaturedExam[]> {
  try {
    const [rows] = await db.query<RowDataPacket[]>(
      `SELECT name, slug, description, badge, visual_tone, visual_symbol, image_url FROM exams ORDER BY id ASC`
    );
    if (rows && rows.length > 0) {
      return featuredExams.map((fe) => {
        const match = rows.find(
          (r) => r.slug === fe.slug || (r.name && r.name.toLowerCase().includes(fe.title.toLowerCase()))
        );
        if (match) {
          return {
            ...fe,
            badge: match.badge || fe.badge,
            tone: match.visual_tone || fe.tone,
            symbol: match.visual_symbol || fe.symbol,
            imageUrl: match.image_url || fe.imageUrl || undefined,
          };
        }
        return fe;
      });
    }
  } catch {
    // Fallback to static catalog in memory
  }
  return featuredExams;
}
