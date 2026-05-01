import type { Request, Response } from "express";

const COOKIE_NAME = "session_id";
const MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days

export function setSessionCookie(res: Response, sessionId: string) {
  res.cookie(COOKIE_NAME, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: MAX_AGE,
    path: "/",
  });
}

export function getSessionCookie(req: Request): string | undefined {
  return req.cookies[COOKIE_NAME] ?? null;
}

export function clearSessionCookie(res: Response) {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });
}
