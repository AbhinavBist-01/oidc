import { db } from "../db";
import { Request, Response, NextFunction } from "express";
import { usersTable } from "../db/schema";
import { eq } from "drizzle-orm";

export async function isAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .limit(1);
    if (!user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    if (!user.isAdmin) {
      res.status(403).json({ message: "Forbidden" });
      return;
    }
    next();
  } catch (err) {
    console.error("Admin authorization error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
