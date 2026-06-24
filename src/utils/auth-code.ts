import { eq } from "drizzle-orm";
import { db } from "../db";
import { authorizationCodes } from "../db/schema";
import crypto from "node:crypto";

export interface AuthorizationCode {
  code: string;
  clientId: string;
  userId: string;
  redirectUri: string;
  scope: string;
  nonce?: string;
  codeChallenge?: string;
  codeChallengeMethod?: string;
  expiresAt: Date;
  createdAt: Date;
}

// Generate authorization code

export function generateAuthorizationCode(): string {
  return crypto.randomBytes(64).toString("hex");
}

// Stores in DB for 1 minute

export async function storeAuthorizationCode(
  clientId: string,
  userId: string,
  redirectUri: string,
  scope: string,
  nonce?: string,
  codeChallenge?: string,
  codeChallengeMethod?: string,
): Promise<string> {
  const code = generateAuthorizationCode();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 1 * 60 * 1000); // Expires in 1 minute

  await db.insert(authorizationCodes).values({
    code,
    clientId,
    userId,
    redirectUri,
    scope,
    nonce,
    codeChallenge: codeChallenge || null,
    codeChallengeMethod: codeChallengeMethod || null,
    expiresAt,
    createdAt: now,
  });
  return code;
}

// Retrieve and validate the authorization code

export async function getAndValidateAuthorizationCode(
  code: string,
): Promise<AuthorizationCode | null> {
  const [authCode] = await db
    .select()
    .from(authorizationCodes)
    .where(eq(authorizationCodes.code, code));
  if (!authCode) {
    return null;
  }

  if (authCode.expiresAt < new Date()) {
    // Code has expired, delete it from the database
    await db
      .delete(authorizationCodes)
      .where(eq(authorizationCodes.code, code));
    return null;
  }

  return {
    code: authCode.code,
    clientId: authCode.clientId,
    userId: authCode.userId,
    redirectUri: authCode.redirectUri,
    scope: authCode.scope,
    nonce: authCode.nonce || undefined,
    codeChallenge: authCode.codeChallenge || undefined,
    codeChallengeMethod: authCode.codeChallengeMethod || undefined,
    expiresAt: authCode.expiresAt,
    createdAt: authCode.createdAt,
  };
}

// Delete the authorization code after use
export async function deleteAuthorizationCode(code: string): Promise<void> {
  await db.delete(authorizationCodes).where(eq(authorizationCodes.code, code));
}
