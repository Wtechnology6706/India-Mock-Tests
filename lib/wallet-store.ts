import { randomUUID } from "node:crypto";
import type { RowDataPacket, ResultSetHeader } from "mysql2";
import { db } from "./db";

export type Wallet = {
  id: string;
  userId: string;
  balance: number; // in INR
  balanceMinor: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
};

export type WalletTransaction = {
  id: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  type: "credit" | "debit";
  amount: number; // in INR
  amountMinor: number;
  balanceAfter: number; // in INR
  balanceAfterMinor: number;
  description: string;
  referenceType: "topup" | "purchase" | "refund" | "admin_adjustment";
  referenceId?: string;
  createdAt: string;
};

export async function ensureWalletTables(): Promise<void> {
  try {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS wallets (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) NOT NULL UNIQUE,
        balance_minor BIGINT NOT NULL DEFAULT 0,
        currency VARCHAR(8) NOT NULL DEFAULT 'INR',
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_wallets_user (user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS wallet_transactions (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) NOT NULL,
        type ENUM('credit', 'debit') NOT NULL,
        amount_minor INT NOT NULL,
        balance_after_minor INT NOT NULL,
        description VARCHAR(255) NOT NULL,
        reference_type ENUM('topup', 'purchase', 'refund', 'admin_adjustment') NOT NULL DEFAULT 'topup',
        reference_id VARCHAR(128) DEFAULT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_wt_user (user_id),
        INDEX idx_wt_created (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
  } catch (err) {
    console.error("Error creating wallet tables:", err);
  }
}

export async function getOrCreateWallet(userId: string): Promise<Wallet> {
  await ensureWalletTables();
  try {
    const [rows] = await db.query<RowDataPacket[]>(
      "SELECT * FROM wallets WHERE user_id = ? LIMIT 1",
      [userId]
    );

    if (rows.length > 0) {
      const r = rows[0];
      return {
        id: String(r.id),
        userId: String(r.user_id),
        balance: (r.balance_minor || 0) / 100,
        balanceMinor: Number(r.balance_minor || 0),
        currency: r.currency || "INR",
        createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
        updatedAt: r.updated_at ? new Date(r.updated_at).toISOString() : new Date().toISOString(),
      };
    }

    const walletId = `wal-${randomUUID().slice(0, 8)}`;
    await db.execute(
      `INSERT INTO wallets (id, user_id, balance_minor, currency, created_at)
       VALUES (?, ?, 0, 'INR', UTC_TIMESTAMP())
       ON DUPLICATE KEY UPDATE user_id=VALUES(user_id)`,
      [walletId, userId]
    );

    return {
      id: walletId,
      userId,
      balance: 0,
      balanceMinor: 0,
      currency: "INR",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  } catch (err) {
    console.error("Error in getOrCreateWallet:", err);
    return {
      id: `wal-${userId}`,
      userId,
      balance: 0,
      balanceMinor: 0,
      currency: "INR",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }
}

export async function creditWallet(params: {
  userId: string;
  amount: number; // in INR
  description: string;
  referenceType?: "topup" | "purchase" | "refund" | "admin_adjustment";
  referenceId?: string;
}): Promise<{ success: boolean; newBalance: number; transactionId?: string; error?: string }> {
  await ensureWalletTables();
  const amountMinor = Math.round(params.amount * 100);
  if (amountMinor <= 0) {
    return { success: false, newBalance: 0, error: "Invalid credit amount." };
  }

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    await connection.execute(
      `INSERT INTO wallets (id, user_id, balance_minor, currency, created_at)
       VALUES (?, ?, 0, 'INR', UTC_TIMESTAMP())
       ON DUPLICATE KEY UPDATE id=id`,
      [`wal-${randomUUID().slice(0, 8)}`, params.userId]
    );

    const [walletRows] = await connection.query<RowDataPacket[]>(
      "SELECT balance_minor FROM wallets WHERE user_id = ? FOR UPDATE",
      [params.userId]
    );

    const currentBalanceMinor = Number(walletRows[0]?.balance_minor || 0);
    const newBalanceMinor = currentBalanceMinor + amountMinor;

    await connection.execute(
      "UPDATE wallets SET balance_minor = ?, updated_at = UTC_TIMESTAMP() WHERE user_id = ?",
      [newBalanceMinor, params.userId]
    );

    const txId = `wtx-${randomUUID().slice(0, 12)}`;
    await connection.execute(
      `INSERT INTO wallet_transactions (id, user_id, type, amount_minor, balance_after_minor, description, reference_type, reference_id, created_at)
       VALUES (?, ?, 'credit', ?, ?, ?, ?, ?, UTC_TIMESTAMP())`,
      [
        txId,
        params.userId,
        amountMinor,
        newBalanceMinor,
        params.description,
        params.referenceType || "topup",
        params.referenceId || null,
      ]
    );

    await connection.commit();
    return {
      success: true,
      newBalance: newBalanceMinor / 100,
      transactionId: txId,
    };
  } catch (err: any) {
    await connection.rollback();
    console.error("Error crediting wallet:", err);
    return { success: false, newBalance: 0, error: err.message || "Failed to credit wallet." };
  } finally {
    connection.release();
  }
}

export async function debitWallet(params: {
  userId: string;
  amount: number; // in INR
  description: string;
  referenceType?: "purchase" | "admin_adjustment";
  referenceId?: string;
}): Promise<{ success: boolean; newBalance: number; transactionId?: string; error?: string }> {
  await ensureWalletTables();
  const amountMinor = Math.round(params.amount * 100);
  if (amountMinor <= 0) {
    return { success: false, newBalance: 0, error: "Invalid debit amount." };
  }

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const [walletRows] = await connection.query<RowDataPacket[]>(
      "SELECT balance_minor FROM wallets WHERE user_id = ? FOR UPDATE",
      [params.userId]
    );

    if (!walletRows.length) {
      await connection.rollback();
      return { success: false, newBalance: 0, error: "Wallet not found." };
    }

    const currentBalanceMinor = Number(walletRows[0].balance_minor || 0);
    if (currentBalanceMinor < amountMinor) {
      await connection.rollback();
      return {
        success: false,
        newBalance: currentBalanceMinor / 100,
        error: `Insufficient wallet balance. Available: ₹${(currentBalanceMinor / 100).toFixed(2)}, Required: ₹${params.amount.toFixed(2)}`,
      };
    }

    const newBalanceMinor = currentBalanceMinor - amountMinor;

    await connection.execute(
      "UPDATE wallets SET balance_minor = ?, updated_at = UTC_TIMESTAMP() WHERE user_id = ?",
      [newBalanceMinor, params.userId]
    );

    const txId = `wtx-${randomUUID().slice(0, 12)}`;
    await connection.execute(
      `INSERT INTO wallet_transactions (id, user_id, type, amount_minor, balance_after_minor, description, reference_type, reference_id, created_at)
       VALUES (?, ?, 'debit', ?, ?, ?, ?, ?, UTC_TIMESTAMP())`,
      [
        txId,
        params.userId,
        amountMinor,
        newBalanceMinor,
        params.description,
        params.referenceType || "purchase",
        params.referenceId || null,
      ]
    );

    await connection.commit();
    return {
      success: true,
      newBalance: newBalanceMinor / 100,
      transactionId: txId,
    };
  } catch (err: any) {
    await connection.rollback();
    console.error("Error debiting wallet:", err);
    return { success: false, newBalance: 0, error: err.message || "Failed to debit wallet." };
  } finally {
    connection.release();
  }
}

export async function getUserWalletTransactions(
  userId: string,
  limit: number = 50
): Promise<WalletTransaction[]> {
  await ensureWalletTables();
  try {
    const [rows] = await db.query<RowDataPacket[]>(
      `SELECT * FROM wallet_transactions 
       WHERE user_id = ? 
       ORDER BY created_at DESC 
       LIMIT ?`,
      [userId, limit]
    );

    return rows.map(mapTransactionRow);
  } catch (err) {
    console.error("Error fetching user wallet transactions:", err);
    return [];
  }
}

export async function getAllWalletTransactions(
  limit: number = 100,
  offset: number = 0
): Promise<{ transactions: WalletTransaction[]; total: number }> {
  await ensureWalletTables();
  try {
    const [countRows] = await db.query<RowDataPacket[]>(
      "SELECT COUNT(*) as total FROM wallet_transactions"
    );
    const total = Number(countRows[0]?.total || 0);

    const [rows] = await db.query<RowDataPacket[]>(
      `SELECT wt.*, u.name as user_name, u.email as user_email 
       FROM wallet_transactions wt
       LEFT JOIN users u ON wt.user_id = u.id
       ORDER BY wt.created_at DESC 
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    const transactions = rows.map((r) => ({
      ...mapTransactionRow(r),
      userName: r.user_name || undefined,
      userEmail: r.user_email || undefined,
    }));

    return { transactions, total };
  } catch (err) {
    console.error("Error fetching all wallet transactions:", err);
    return { transactions: [], total: 0 };
  }
}

function mapTransactionRow(r: RowDataPacket): WalletTransaction {
  return {
    id: String(r.id),
    userId: String(r.user_id),
    type: r.type as "credit" | "debit",
    amount: (r.amount_minor || 0) / 100,
    amountMinor: Number(r.amount_minor || 0),
    balanceAfter: (r.balance_after_minor || 0) / 100,
    balanceAfterMinor: Number(r.balance_after_minor || 0),
    description: r.description || "",
    referenceType: r.reference_type as any,
    referenceId: r.reference_id || undefined,
    createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
  };
}
