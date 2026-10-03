import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "../../../../lib/admin-auth";
import { db } from "../../../../lib/db";
import type { RowDataPacket } from "mysql2";

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if ("response" in auth) return auth.response;

  let dbConnected = false;
  let dbTablesCount = 0;
  let dbVersion = "Unknown";
  let poolStats = {
    host: process.env.DB_HOST || "127.0.0.1",
    port: process.env.DB_PORT || "3306",
    database: process.env.DB_NAME || "mock_test_platform",
  };

  try {
    const [ver] = await db.query<(RowDataPacket & { version: string })[]>("SELECT VERSION() as version");
    dbVersion = ver[0]?.version || "MySQL";
    const [tables] = await db.query<RowDataPacket[]>("SHOW TABLES");
    dbTablesCount = tables.length;
    dbConnected = true;
  } catch {
    dbConnected = false;
  }

  return NextResponse.json({
    system: {
      nodeVersion: process.version,
      platform: process.platform,
      environment: process.env.NODE_ENV || "development",
      uptimeSeconds: Math.floor(process.uptime()),
    },
    database: {
      connected: dbConnected,
      version: dbVersion,
      tablesCount: dbTablesCount,
      pool: poolStats,
    },
    security: {
      adminBootstrapConfigured: Boolean(process.env.ADMIN_BOOTSTRAP_KEY),
      sessionDurationDays: 30,
      cookieName: "northstar_session",
    },
  });
}
