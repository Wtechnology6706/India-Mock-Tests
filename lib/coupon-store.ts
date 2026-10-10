import { randomUUID } from "node:crypto";
import type { RowDataPacket, ResultSetHeader } from "mysql2";
import { db } from "./db";

export type Coupon = {
  id: string;
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number; // e.g., 20 (for 20%) or 100 (for 100 INR)
  minOrderAmount: number; // in INR
  maxDiscountAmount: number; // in INR (for percentage coupons)
  description: string;
  active: boolean;
  startsAt: string | null;
  expiresAt: string | null;
  usageLimit: number; // 0 for unlimited
  usageCount: number;
  createdAt: string;
  updatedAt?: string;
};

export type CouponInput = {
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  description?: string;
  active?: boolean;
  startsAt?: string | null;
  expiresAt?: string | null;
  usageLimit?: number;
};

export async function ensureCouponsTable(): Promise<void> {
  try {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS coupons (
        id VARCHAR(64) PRIMARY KEY,
        code VARCHAR(64) NOT NULL UNIQUE,
        discount_type ENUM('percentage', 'fixed') NOT NULL DEFAULT 'percentage',
        discount_value INT NOT NULL DEFAULT 10,
        min_order_minor INT NOT NULL DEFAULT 0,
        max_discount_minor INT NOT NULL DEFAULT 0,
        description VARCHAR(255) DEFAULT '',
        active TINYINT(1) NOT NULL DEFAULT 1,
        starts_at DATETIME NULL,
        expires_at DATETIME NULL,
        usage_limit INT NOT NULL DEFAULT 0,
        usage_count INT NOT NULL DEFAULT 0,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_coupons_code (code),
        INDEX idx_coupons_active (active)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Ensure missing columns exist in case the table was created by an older schema
    const alterStatements = [
      "ALTER TABLE coupons MODIFY COLUMN id VARCHAR(64) NOT NULL",
      "ALTER TABLE coupons MODIFY COLUMN discount_value INT NOT NULL DEFAULT 10",
      "ALTER TABLE coupons MODIFY COLUMN discount_type ENUM('percentage', 'fixed') NOT NULL DEFAULT 'percentage'",
      "ALTER TABLE coupons ADD COLUMN min_order_minor INT NOT NULL DEFAULT 0",
      "ALTER TABLE coupons ADD COLUMN max_discount_minor INT NOT NULL DEFAULT 0",
      "ALTER TABLE coupons ADD COLUMN description VARCHAR(255) DEFAULT ''",
      "ALTER TABLE coupons ADD COLUMN expires_at DATETIME NULL",
      "ALTER TABLE coupons ADD COLUMN usage_limit INT NOT NULL DEFAULT 0",
      "ALTER TABLE coupons ADD COLUMN usage_count INT NOT NULL DEFAULT 0",
      "ALTER TABLE coupons ADD COLUMN created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP",
      "ALTER TABLE coupons ADD COLUMN updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP",
    ];

    for (const stmt of alterStatements) {
      try {
        await db.execute(stmt);
      } catch {
        // Ignore column exists or constraint errors
      }
    }

    // Seed default coupons if table is empty
    const [rows] = await db.query<RowDataPacket[]>("SELECT COUNT(*) as count FROM coupons");
    if (rows[0]?.count === 0) {
      const defaultCoupons = [
        {
          id: "cpn-welcome20",
          code: "WELCOME20",
          discount_type: "percentage",
          discount_value: 20,
          min_order_minor: 29900,
          max_discount_minor: 20000,
          description: "Get 20% instant discount on all VIP Exam passes!",
          active: 1,
          starts_at: "2026-01-01 00:00:00",
          expires_at: "2027-12-31 23:59:59",
          usage_limit: 10000,
          usage_count: 342,
        },
        {
          id: "cpn-tre4special",
          code: "TRE4SPECIAL",
          discount_type: "fixed",
          discount_value: 150,
          min_order_minor: 49900,
          max_discount_minor: 15000,
          description: "Special Flat ₹150 OFF on BPSC TRE 4.0 & Ultimate VIP Subscriptions.",
          active: 1,
          starts_at: "2026-01-01 00:00:00",
          expires_at: "2027-12-31 23:59:59",
          usage_limit: 5000,
          usage_count: 512,
        },
        {
          id: "cpn-vip50",
          code: "VIP50",
          discount_type: "percentage",
          discount_value: 15,
          min_order_minor: 40000,
          max_discount_minor: 30000,
          description: "Extra 15% OFF for aspiring Government Officers & Teachers.",
          active: 1,
          starts_at: "2026-01-01 00:00:00",
          expires_at: "2027-12-31 23:59:59",
          usage_limit: 2000,
          usage_count: 120,
        },
      ];

      for (const c of defaultCoupons) {
        await db.execute(
          `INSERT INTO coupons (id, code, discount_type, discount_value, min_order_minor, max_discount_minor, description, active, starts_at, expires_at, usage_limit, usage_count, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, UTC_TIMESTAMP())
           ON DUPLICATE KEY UPDATE description=VALUES(description)`,
          [
            c.id,
            c.code,
            c.discount_type,
            c.discount_value,
            c.min_order_minor,
            c.max_discount_minor,
            c.description,
            c.active,
            c.starts_at,
            c.expires_at,
            c.usage_limit,
            c.usage_count,
          ]
        );
      }
    }
  } catch (err) {
    console.error("Error creating or seeding coupons table:", err);
  }
}

export async function getActiveCoupons(): Promise<Coupon[]> {
  await ensureCouponsTable();
  try {
    const [rows] = await db.query<RowDataPacket[]>(
      `SELECT * FROM coupons 
       WHERE active = 1 
         AND (starts_at IS NULL OR starts_at <= UTC_TIMESTAMP())
         AND (expires_at IS NULL OR expires_at >= UTC_TIMESTAMP())
         AND (usage_limit = 0 OR usage_count < usage_limit)
       ORDER BY discount_value DESC`
    );

    return rows.map(mapCouponRow);
  } catch (err) {
    console.error("Error fetching active coupons:", err);
    return [];
  }
}

export async function getAllCoupons(): Promise<Coupon[]> {
  await ensureCouponsTable();
  try {
    const [rows] = await db.query<RowDataPacket[]>(
      "SELECT * FROM coupons ORDER BY created_at DESC"
    );
    return rows.map(mapCouponRow);
  } catch (err) {
    console.error("Error fetching all coupons:", err);
    return [];
  }
}

export async function getCouponByCode(code: string): Promise<Coupon | null> {
  await ensureCouponsTable();
  try {
    const [rows] = await db.query<RowDataPacket[]>(
      "SELECT * FROM coupons WHERE UPPER(code) = UPPER(?) LIMIT 1",
      [code.trim()]
    );
    if (!rows.length) return null;
    return mapCouponRow(rows[0]);
  } catch (err) {
    console.error("Error getting coupon by code:", err);
    return null;
  }
}

export async function validateAndCalculateCoupon(
  code: string,
  orderAmount: number // in INR
): Promise<{
  valid: boolean;
  coupon?: Coupon;
  discountAmount?: number;
  finalAmount?: number;
  message: string;
}> {
  const coupon = await getCouponByCode(code);
  if (!coupon) {
    return {
      valid: false,
      message: `Coupon code '${code.toUpperCase()}' does not exist or is invalid.`,
    };
  }

  if (!coupon.active) {
    return {
      valid: false,
      message: `Coupon code '${coupon.code}' is currently inactive or disabled by admin.`,
    };
  }

  const now = new Date();
  if (coupon.startsAt && new Date(coupon.startsAt) > now) {
    return {
      valid: false,
      message: `Coupon code '${coupon.code}' is not yet active.`,
    };
  }

  if (coupon.expiresAt && new Date(coupon.expiresAt) < now) {
    return {
      valid: false,
      message: `Coupon code '${coupon.code}' has expired.`,
    };
  }

  if (coupon.usageLimit > 0 && coupon.usageCount >= coupon.usageLimit) {
    return {
      valid: false,
      message: `Coupon code '${coupon.code}' has reached its maximum redemptions limit.`,
    };
  }

  if (orderAmount < coupon.minOrderAmount) {
    return {
      valid: false,
      message: `Minimum order value of ₹${coupon.minOrderAmount} required to use coupon '${coupon.code}'.`,
    };
  }

  let discount = 0;
  if (coupon.discountType === "percentage") {
    discount = Math.round((orderAmount * coupon.discountValue) / 100);
    if (coupon.maxDiscountAmount > 0 && discount > coupon.maxDiscountAmount) {
      discount = coupon.maxDiscountAmount;
    }
  } else {
    discount = coupon.discountValue;
  }

  if (discount > orderAmount) {
    discount = orderAmount;
  }

  const finalAmount = Math.max(0, orderAmount - discount);

  return {
    valid: true,
    coupon,
    discountAmount: discount,
    finalAmount,
    message: `Coupon '${coupon.code}' applied successfully! You saved ₹${discount}.`,
  };
}

export async function incrementCouponUsage(code: string): Promise<void> {
  try {
    await db.execute(
      "UPDATE coupons SET usage_count = usage_count + 1 WHERE UPPER(code) = UPPER(?)",
      [code.trim()]
    );
  } catch (err) {
    console.error("Error incrementing coupon usage:", err);
  }
}

export async function createCoupon(input: CouponInput): Promise<Coupon> {
  await ensureCouponsTable();
  const id = `cpn-${randomUUID().slice(0, 8)}`;
  const code = input.code.trim().toUpperCase();
  const minOrderMinor = Math.round((input.minOrderAmount || 0) * 100);
  const maxDiscountMinor = Math.round((input.maxDiscountAmount || 0) * 100);

  await db.execute(
    `INSERT INTO coupons (id, code, discount_type, discount_value, min_order_minor, max_discount_minor, description, active, starts_at, expires_at, usage_limit, usage_count, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, UTC_TIMESTAMP())`,
    [
      id,
      code,
      input.discountType,
      input.discountValue,
      minOrderMinor,
      maxDiscountMinor,
      input.description || "",
      input.active !== false ? 1 : 0,
      input.startsAt ? new Date(input.startsAt).toISOString().slice(0, 19).replace("T", " ") : null,
      input.expiresAt ? new Date(input.expiresAt).toISOString().slice(0, 19).replace("T", " ") : null,
      input.usageLimit || 0,
    ]
  );

  const created = await getCouponByCode(code);
  return created!;
}

export async function updateCoupon(id: string, input: Partial<CouponInput>): Promise<Coupon | null> {
  await ensureCouponsTable();
  const updates: string[] = [];
  const values: any[] = [];

  if (input.code !== undefined) {
    updates.push("code = ?");
    values.push(input.code.trim().toUpperCase());
  }
  if (input.discountType !== undefined) {
    updates.push("discount_type = ?");
    values.push(input.discountType);
  }
  if (input.discountValue !== undefined) {
    updates.push("discount_value = ?");
    values.push(input.discountValue);
  }
  if (input.minOrderAmount !== undefined) {
    updates.push("min_order_minor = ?");
    values.push(Math.round(input.minOrderAmount * 100));
  }
  if (input.maxDiscountAmount !== undefined) {
    updates.push("max_discount_minor = ?");
    values.push(Math.round(input.maxDiscountAmount * 100));
  }
  if (input.description !== undefined) {
    updates.push("description = ?");
    values.push(input.description);
  }
  if (input.active !== undefined) {
    updates.push("active = ?");
    values.push(input.active ? 1 : 0);
  }
  if (input.startsAt !== undefined) {
    updates.push("starts_at = ?");
    values.push(input.startsAt ? new Date(input.startsAt).toISOString().slice(0, 19).replace("T", " ") : null);
  }
  if (input.expiresAt !== undefined) {
    updates.push("expires_at = ?");
    values.push(input.expiresAt ? new Date(input.expiresAt).toISOString().slice(0, 19).replace("T", " ") : null);
  }
  if (input.usageLimit !== undefined) {
    updates.push("usage_limit = ?");
    values.push(input.usageLimit);
  }

  if (updates.length === 0) return null;

  values.push(id);
  await db.execute(
    `UPDATE coupons SET ${updates.join(", ")}, updated_at = UTC_TIMESTAMP() WHERE id = ?`,
    values
  );

  const [rows] = await db.query<RowDataPacket[]>("SELECT * FROM coupons WHERE id = ?", [id]);
  if (!rows.length) return null;
  return mapCouponRow(rows[0]);
}

export async function deleteCoupon(id: string): Promise<boolean> {
  await ensureCouponsTable();
  const [result] = (await db.query("DELETE FROM coupons WHERE id = ?", [id])) as any;
  return Boolean(result?.affectedRows > 0);
}

function mapCouponRow(r: RowDataPacket): Coupon {
  return {
    id: String(r.id),
    code: String(r.code),
    discountType: r.discount_type as "percentage" | "fixed",
    discountValue: Number(r.discount_value),
    minOrderAmount: (r.min_order_minor || 0) / 100,
    maxDiscountAmount: (r.max_discount_minor || 0) / 100,
    description: r.description || "",
    active: Boolean(r.active),
    startsAt: r.starts_at ? new Date(r.starts_at).toISOString() : null,
    expiresAt: r.expires_at ? new Date(r.expires_at).toISOString() : null,
    usageLimit: Number(r.usage_limit || 0),
    usageCount: Number(r.usage_count || 0),
    createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
    updatedAt: r.updated_at ? new Date(r.updated_at).toISOString() : undefined,
  };
}
