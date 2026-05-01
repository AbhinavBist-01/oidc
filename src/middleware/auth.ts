import type { Request, Response, NextFunction } from "express";
import { getSessionCookie } from "../utils/cookie";
import {
  deleteSession,
  getSessionById,
  isSessionValid,
} from "../utils/session";
import { clearSessionCookie } from "../utils/cookie";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      sessionId?: string;
    }
  }
}

// Requires valid session

export async function requireSession(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const sessionId = getSessionCookie(req);
    if (!sessionId) {
      res.redirect(
        `/o/authenticate?${new URLSearchParams({ redirect_uri: req.originalUrl }).toString()}`,
      );
      return;
    }

    const session = await getSessionById(sessionId);
    if (!session) {
      clearSessionCookie(res);
      res.redirect(
        `/o/authenticate?${new URLSearchParams({ redirect_uri: req.originalUrl }).toString()}`,
      );
      return;
    }

    if (!isSessionValid(session.expiresAt)) {
      await deleteSession(sessionId);
      clearSessionCookie(res);
      res.redirect(
        `/o/authenticate?${new URLSearchParams({ redirect_uri: req.originalUrl }).toString()}`,
      );
      return;
    }

    req.userId = session.userId;
    req.sessionId = sessionId;
    next();
  } catch (err) {
    console.error("Session validation error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
}
