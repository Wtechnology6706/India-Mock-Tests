import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { db } from "./db";

export type AuthRole = "student" | "editor" | "reviewer" | "admin";
export type SubscriptionTier = "free" | "sprint" | "ultimate";

export type AuthUser = {
  id: string;
  email: string;
  displayName: string;
  role: AuthRole;
  subscriptionTier: SubscriptionTier;
  subscriptionStatus: "active" | "none" | "expired";
  subscriptionExpiresAt?: string;
};

type StoredUser = AuthUser & { passwordHash: string; salt: string };

const globalForAuth = globalThis as unknown as { users?: Map<string, StoredUser>; sessions?: Map<string, string> };
const users = globalForAuth.users ?? new Map<string, StoredUser>();
const sessions = globalForAuth.sessions ?? new Map<string, string>();
if (process.env.NODE_ENV !== "production") { globalForAuth.users = users; globalForAuth.sessions = sessions; }

const normalizeEmail = (email: string) => email.trim().toLowerCase();
const hashPassword = (password: string, salt: string) => scryptSync(password, salt, 64).toString("hex");

const publicUser = (u: StoredUser): AuthUser => {
  const isExpired = u.subscriptionExpiresAt ? new Date(u.subscriptionExpiresAt).getTime() < Date.now() : false;
  const tier: SubscriptionTier = u.role === "admin" ? "ultimate" : (isExpired ? "free" : (u.subscriptionTier || "free"));
  const status = tier !== "free" ? "active" : (isExpired ? "expired" : "none");

  return {
    id: u.id,
    email: u.email,
    displayName: u.displayName,
    role: u.role,
    subscriptionTier: tier,
    subscriptionStatus: status,
    subscriptionExpiresAt: u.subscriptionExpiresAt,
  };
};

const tokenHash = (token: string) => createHash("sha256").update(token).digest("hex");

export async function registerUser(email: string, password: string, displayName: string) {
  return createUser(email, password, displayName, "student");
}

export async function bootstrapAdmin(email: string, password: string, displayName: string) {
  if ([...users.values()].some((user) => user.role === "admin")) return { error: "An administrator is already configured." } as const;
  try {
    const [rows] = await db.query<(RowDataPacket & { count: number })[]>("SELECT COUNT(*) AS count FROM users WHERE role = 'admin'");
    if (Number(rows[0]?.count ?? 0) > 0) return { error: "An administrator is already configured." } as const;
  } catch {
    if (process.env.NODE_ENV === "production") return { error: "Admin bootstrap requires an available database." } as const;
  }
  return createUser(email, password, displayName, "admin");
}

async function createUser(email: string, password: string, displayName: string, role: AuthRole) {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail || password.length < 8 || !displayName.trim()) return { error: "Enter a name, valid email, and password of at least 8 characters." } as const;
  const salt = randomBytes(16).toString("hex");
  const defaultTier: SubscriptionTier = role === "admin" ? "ultimate" : "free";

  let user: StoredUser = {
    id: randomBytes(16).toString("hex"),
    email: normalizedEmail,
    displayName: displayName.trim(),
    role,
    subscriptionTier: defaultTier,
    subscriptionStatus: defaultTier !== "free" ? "active" : "none",
    salt,
    passwordHash: hashPassword(password, salt)
  };

  try {
    const [insert] = await db.execute<ResultSetHeader>(
      "INSERT INTO users (email, password_hash, display_name, role, subscription_tier) VALUES (?, ?, ?, ?, ?)",
      [user.email, `${salt}:${user.passwordHash}`, user.displayName, user.role, user.subscriptionTier]
    );
    user = { ...user, id: String(insert.insertId) };
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ER_DUP_ENTRY") return { error: "An account with this email already exists." } as const;
    if (users.has(normalizedEmail)) return { error: "An account with this email already exists." } as const;
    users.set(normalizedEmail, user);
    return { user: publicUser(user), token: createSession(user.id) } as const;
  }
  users.set(normalizedEmail, user);
  const token = createSession(user.id);
  try { await db.execute("INSERT INTO user_sessions (token_hash, user_id, expires_at) VALUES (?, ?, DATE_ADD(UTC_TIMESTAMP(), INTERVAL 30 DAY))", [tokenHash(token), user.id]); } catch { /* Local fallback session remains available. */ }
  return { user: publicUser(user), token } as const;
}

export async function loginUser(email: string, password: string) {
  const normalizedEmail = normalizeEmail(email);
  let user: StoredUser | undefined = undefined;
  try {
    const [rows] = await db.query<(RowDataPacket & { id: string | number; email: string; password_hash: string; display_name: string; role: AuthRole; subscription_tier?: SubscriptionTier; subscription_expires_at?: string })[]>(
      "SELECT id, email, password_hash, display_name, role, subscription_tier, subscription_expires_at FROM users WHERE LOWER(TRIM(email)) = LOWER(?) LIMIT 1",
      [normalizedEmail]
    );
    if (rows[0]) {
      const [salt, passwordHash] = rows[0].password_hash.split(":");
      user = {
        id: String(rows[0].id),
        email: rows[0].email,
        displayName: rows[0].display_name,
        role: rows[0].role,
        subscriptionTier: rows[0].subscription_tier || (rows[0].role === "admin" ? "ultimate" : "free"),
        subscriptionStatus: rows[0].subscription_tier && rows[0].subscription_tier !== "free" ? "active" : "none",
        subscriptionExpiresAt: rows[0].subscription_expires_at,
        salt,
        passwordHash
      };
      users.set(normalizedEmail, user);
    }
  } catch {
    try {
      const [rows] = await db.query<(RowDataPacket & { id: string | number; email: string; password_hash: string; display_name: string; role: AuthRole })[]>(
        "SELECT id, email, password_hash, display_name, role FROM users WHERE LOWER(TRIM(email)) = LOWER(?) LIMIT 1",
        [normalizedEmail]
      );
      if (rows[0]) {
        const [salt, passwordHash] = rows[0].password_hash.split(":");
        user = {
          id: String(rows[0].id),
          email: rows[0].email,
          displayName: rows[0].display_name,
          role: rows[0].role,
          subscriptionTier: rows[0].role === "admin" ? "ultimate" : "free",
          subscriptionStatus: rows[0].role === "admin" ? "active" : "none",
          salt,
          passwordHash
        };
        users.set(normalizedEmail, user);
      }
    } catch {
      user = users.get(normalizedEmail);
    }
  }
  if (!user) user = users.get(normalizedEmail);
  if (!user) return { error: "Email or password is incorrect." } as const;
  const expected = Buffer.from(user.passwordHash, "hex");
  const actual = Buffer.from(hashPassword(password, user.salt), "hex");
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return { error: "Email or password is incorrect." } as const;
  const token = createSession(user.id);
  try { await db.execute("INSERT INTO user_sessions (token_hash, user_id, expires_at) VALUES (?, ?, DATE_ADD(UTC_TIMESTAMP(), INTERVAL 30 DAY))", [tokenHash(token), user.id]); } catch { /* Local fallback session remains available. */ }
  return { user: publicUser(user), token } as const;
}

function createSession(userId: string) {
  const token = createHash("sha256").update(`${userId}:${randomBytes(32).toString("hex")}`).digest("hex");
  sessions.set(token, userId);
  return token;
}

export async function getUserForToken(token: string | undefined): Promise<AuthUser | null> {
  if (!token) return null;
  try {
    const [rows] = await db.query<(RowDataPacket & { id: string; email: string; display_name: string; role: AuthRole; subscription_tier?: SubscriptionTier; subscription_expires_at?: string })[]>(
      "SELECT u.id, u.email, u.display_name, u.role, u.subscription_tier, u.subscription_expires_at FROM user_sessions s JOIN users u ON u.id = s.user_id WHERE s.token_hash = ? AND s.expires_at > UTC_TIMESTAMP() AND u.status = 'active' LIMIT 1",
      [tokenHash(token)]
    );
    if (rows[0]) {
      const isExpired = rows[0].subscription_expires_at ? new Date(rows[0].subscription_expires_at).getTime() < Date.now() : false;
      const tier: SubscriptionTier = rows[0].role === "admin" ? "ultimate" : (isExpired ? "free" : (rows[0].subscription_tier || "free"));
      return {
        id: String(rows[0].id),
        email: rows[0].email,
        displayName: rows[0].display_name,
        role: rows[0].role,
        subscriptionTier: tier,
        subscriptionStatus: tier !== "free" ? "active" : (isExpired ? "expired" : "none"),
        subscriptionExpiresAt: rows[0].subscription_expires_at,
      };
    }
  } catch {
    try {
      const [rows] = await db.query<(RowDataPacket & { id: string; email: string; display_name: string; role: AuthRole })[]>(
        "SELECT u.id, u.email, u.display_name, u.role FROM user_sessions s JOIN users u ON u.id = s.user_id WHERE s.token_hash = ? AND s.expires_at > UTC_TIMESTAMP() AND u.status = 'active' LIMIT 1",
        [tokenHash(token)]
      );
      if (rows[0]) {
        return {
          id: String(rows[0].id),
          email: rows[0].email,
          displayName: rows[0].display_name,
          role: rows[0].role,
          subscriptionTier: rows[0].role === "admin" ? "ultimate" : "free",
          subscriptionStatus: rows[0].role === "admin" ? "active" : "none",
        };
      }
    } catch {
      // Resolve against local memory when MySQL is unavailable.
    }
  }
  const userId = sessions.get(token);
  if (!userId) return null;
  const found = [...users.values()].find((user) => user.id === userId);
  return found ? publicUser(found) : null;
}

export async function updateUserSubscription(userId: string, tier: SubscriptionTier, durationDays = 90) {
  const expiresAt = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString();
  for (const user of users.values()) {
    if (user.id === userId) {
      user.subscriptionTier = tier;
      user.subscriptionStatus = tier !== "free" ? "active" : "none";
      user.subscriptionExpiresAt = expiresAt;
    }
  }
  try {
    await db.execute(
      "UPDATE users SET subscription_tier = ?, subscription_expires_at = DATE_ADD(UTC_TIMESTAMP(), INTERVAL ? DAY) WHERE id = ?",
      [tier, durationDays, userId]
    );
  } catch {
    // Local fallback
  }
  return { success: true, tier, expiresAt };
}

export async function deleteSession(token: string | undefined) {
  if (!token) return;
  sessions.delete(token);
  try { await db.execute("DELETE FROM user_sessions WHERE token_hash = ?", [tokenHash(token)]); } catch { /* Session is already removed from local fallback storage. */ }
}

export type AdminUserRecord = {
  id: string;
  email: string;
  displayName: string;
  role: AuthRole;
  status: "active" | "disabled";
  createdAt?: string;
};

export async function listUsersForAdmin(filters?: { query?: string; role?: string; status?: string }): Promise<AdminUserRecord[]> {
  try {
    let sql = "SELECT id, email, display_name, role, status, created_at FROM users";
    const conditions: string[] = [];
    const params: unknown[] = [];

    if (filters?.query?.trim()) {
      conditions.push("(email LIKE ? OR display_name LIKE ?)");
      const term = `%${filters.query.trim()}%`;
      params.push(term, term);
    }
    if (filters?.role && filters.role !== "all") {
      conditions.push("role = ?");
      params.push(filters.role);
    }
    if (filters?.status && filters.status !== "all") {
      conditions.push("status = ?");
      params.push(filters.status);
    }

    if (conditions.length > 0) {
      sql += " WHERE " + conditions.join(" AND ");
    }
    sql += " ORDER BY id DESC";

    const [rows] = await db.query<(RowDataPacket & { id: number; email: string; display_name: string; role: AuthRole; status: "active" | "disabled"; created_at: Date | string })[]>(sql, params);
    if (rows.length > 0) {
      return rows.map((r) => ({
        id: String(r.id),
        email: r.email,
        displayName: r.display_name,
        role: r.role,
        status: r.status ?? "active",
        createdAt: r.created_at ? new Date(r.created_at).toISOString() : undefined,
      }));
    }
  } catch {
    // Fallback to local memory
  }

  let list = [...users.values()].map((u) => ({
    id: u.id,
    email: u.email,
    displayName: u.displayName,
    role: u.role,
    status: "active" as const,
  }));

  if (filters?.query?.trim()) {
    const q = filters.query.trim().toLowerCase();
    list = list.filter((u) => u.email.toLowerCase().includes(q) || u.displayName.toLowerCase().includes(q));
  }
  if (filters?.role && filters.role !== "all") {
    list = list.filter((u) => u.role === filters.role);
  }
  return list;
}

export async function createUserByAdmin(email: string, password: string, displayName: string, role: AuthRole): Promise<{ user?: AdminUserRecord; error?: string }> {
  const result = await createUser(email, password, displayName, role);
  if ("error" in result) return { error: result.error };
  return {
    user: {
      id: result.user.id,
      email: result.user.email,
      displayName: result.user.displayName,
      role: result.user.role,
      status: "active",
      createdAt: new Date().toISOString(),
    },
  };
}

export async function updateUserByAdmin(
  userId: string,
  data: { displayName?: string; role?: AuthRole; status?: "active" | "disabled"; password?: string }
): Promise<{ success: boolean; error?: string }> {
  try {
    const updates: string[] = [];
    const params: (string | number)[] = [];

    if (data.displayName?.trim()) {
      updates.push("display_name = ?");
      params.push(data.displayName.trim());
    }
    if (data.role) {
      updates.push("role = ?");
      params.push(data.role);
    }
    if (data.status) {
      updates.push("status = ?");
      params.push(data.status);
    }
    if (data.password && data.password.length >= 8) {
      const salt = randomBytes(16).toString("hex");
      const hash = hashPassword(data.password, salt);
      updates.push("password_hash = ?");
      params.push(`${salt}:${hash}`);
    }

    if (updates.length > 0) {
      params.push(userId);
      await db.execute(`UPDATE users SET ${updates.join(", ")} WHERE id = ?`, params);
    }
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to update user." };
  }
}

export async function deleteUserByAdmin(userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    await db.execute("DELETE FROM user_sessions WHERE user_id = ?", [userId]);
    await db.execute("DELETE FROM users WHERE id = ?", [userId]);
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to delete user." };
  }
}
