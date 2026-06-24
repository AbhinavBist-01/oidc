import { sessions } from "../db/schema";
import { eq } from "drizzle-orm";
import { db } from "../db";
import crypto from "node:crypto";
import { date } from "drizzle-orm/mysql-core";

export interface Session {
  id: string;
  userId: string;
  refreshToken: string;
  scope: string;
  expiresAt: Date;
  createdAt: Date;
}

// Generate refresh token

export function generateRefreshToken(): string {
  return crypto.randomBytes(64).toString("hex");
}

// Create a session

export async function createSession(userId: string, scope?: string): Promise<Session> {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days
  const refreshToken = generateRefreshToken();
  const hashedRefreshToken = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");

  const session = await db
    .insert(sessions)
    .values({
      userId,
      refreshToken: hashedRefreshToken,
      scope: scope || "openid",
      expiresAt,
      createdAt: now,
    })
    .returning();

  const createdSession = session[0]!;

  return {
    id: createdSession.id,
    userId: createdSession.userId,
    refreshToken,
    scope: createdSession.scope,
    expiresAt,
    createdAt: now,
  };
}

// Retrieve a session with ID

export async function getSessionById(id: string): Promise<Session | null> {
  const session = await db
    .select()
    .from(sessions)
    .where(eq(sessions.id, id))
    .limit(1);
  return session[0] || null;
}

// Is session valid

export function isSessionValid(expiresAt: Date): boolean {
  return expiresAt > new Date();
}

// Delete session

export async function deleteSession(id: string): Promise<void> {
  await db.delete(sessions).where(eq(sessions.id, id));
}

// Delete all sessions for a user
export async function deleteSessionsByUserId(userId: string): Promise<void> {
  await db.delete(sessions).where(eq(sessions.userId, userId));
}

// Retrieve a session using cleartext refresh token
export async function getSessionByRefreshToken(
  refreshToken: string,
): Promise<Session | null> {
  const hashedRefreshToken = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");

  const [session] = await db
    .select()
    .from(sessions)
    .where(eq(sessions.refreshToken, hashedRefreshToken))
    .limit(1);

  return session || null;
}

