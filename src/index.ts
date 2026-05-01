import crypto from "node:crypto";
import express from "express";
import path from "node:path";

import { eq } from "drizzle-orm";
import JWT from "jsonwebtoken";
import jose from "node-jose";
import { db } from "./db";
import { usersTable } from "./db/schema";
import { PRIVATE_KEY, PUBLIC_KEY } from "./utils/cert";
import type { JWTClaims } from "./utils/user-token";
import cookieParser from "cookie-parser";
import { requireSession } from "./middleware/auth";
import { isAdmin } from "./middleware/admin";
import { getPendingRegistrations } from "./utils/client";
import { createSession } from "./utils/session";
import { setSessionCookie } from "./utils/cookie";
import { getSessionCookie } from "./utils/cookie";
import { getSessionById, isSessionValid } from "./utils/session";
import { getApprovedClient } from "./utils/client";
import { storeAuthorizationCode } from "./utils/auth-code";

const app = express();
const PORT = process.env.PORT ?? 8000;

app.use(express.json());
app.use(express.static(path.resolve("public")));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.json({ message: "Hello from Auth Server" });
});
app.get("/health", (req, res) => {
  res.json({
    message: "Server is healhty",
    healthy: true,
  });
});

// OIDC Endpoints
app.get("/.well-known/openid-configuration", (req, res) => {
  const ISSUER = `http://localhost:${PORT}`;
  return res.json({
    issuer: ISSUER,
    authorization_endpoint: `${ISSUER}/o/authenticate`,
    userinfo_endpoint: `${ISSUER}/o/userinfo`,
    jwks_uri: `${ISSUER}/.well-known/jwks.json`,
  });
});

app.get("/.well-known/jwks.json", async (req, res) => {
  const key = await jose.JWK.asKey(PUBLIC_KEY, "pem");
  res.json({ keys: [key.toJSON()] });
});

app.get("/o/authorize", (req, res) => {
  res.sendFile(path.resolve("public", "authenticate.html"));
});

app.post("/o/authenticate/sign-in", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ message: "Email and password are required." });
    return;
  }

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email))
    .limit(1);

  if (!user || !user.password || !user.salt) {
    res.json({ message: "Invalid email or password." });
    return;
  }

  const hash = crypto
    .createHash("sha256")
    .update(password + user.salt)
    .digest("hex");

  if (hash !== user.password) {
    res.status(401).json({ message: "Invalid email or password." });
    return;
  }

  const ISSUER = `http://localhost:${PORT}`;
  const now = Math.floor(Date.now() / 1000);

  const claims: JWTClaims = {
    iss: ISSUER,
    sub: user.id.toString(),
    email: user.email,
    email_verified: user.emailVerified,
    exp: now + 3600,
    iat: now,
    given_name: user.firstName || "",
    family_name: user.lastName || "",
    name: [user.firstName, user.lastName].filter(Boolean).join(" "),
    picture: user.profileImageURL || null,
  };

  const token = JWT.sign(claims, PRIVATE_KEY, { algorithm: "RS256" });
  const session = await createSession(user.id.toString());
  setSessionCookie(res, session.id);

  res.json({ token });
});

app.post("/o/authenticate/sign-up", async (req, res) => {
  const { email, password, firstName, lastName } = req.body;

  if (!email || !password || !firstName) {
    res
      .status(400)
      .json({ message: "Email, password and first name are required." });
    return;
  }

  const [existingUser] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email))
    .limit(1);

  if (existingUser) {
    res.status(409).json({ message: "Email is already in use." });
    return;
  }

  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto
    .createHash("sha256")
    .update(password + salt)
    .digest("hex");

  await db.insert(usersTable).values({
    firstName,
    lastName: lastName ?? null,
    email,
    password: hash,
    salt,
  });
  res.status(201).json({ ok: true });
});

app.get("/o/userinfo", async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    res
      .status(401)
      .json({ message: "Invalid or missing authorization header" });
    return;
  }

  const token = Array.isArray(authHeader)
    ? authHeader[0].slice(7)
    : authHeader.slice(7);

  let claims: JWTClaims;
  try {
    claims = JWT.verify(token, PUBLIC_KEY, {
      algorithms: ["RS256"],
    }) as JWTClaims;
  } catch (err) {
    res.status(401).json({ message: "Invalid or expired token." });
    return;
  }

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, claims.sub) as any)
    .limit(1);

  if (!user) {
    res.status(404).json({ message: "User not found." });
    return;
  }

  res.json({
    sub: user.id,
    email: user.email,
    email_verified: user.emailVerified,
    given_name: user.firstName || "",
    family_name: user.lastName || "",
    name: [user.firstName, user.lastName].filter(Boolean).join(" "),
    picture: user.profileImageURL ?? null,
  });
});

app.get("/admin/registrations", requireSession, isAdmin, async (req, res) => {
  try {
    const registrations = await getPendingRegistrations();
    res.json({ registrations });
  } catch (error) {
    console.error("Error fetching registrations:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/o/authorize", async (req, res) => {
  const {
    response_type,
    client_id,
    redirect_uri,
    scope = "",
    state,
    nonce,
  } = req.query;

  if (
    response_type !== "code" ||
    typeof client_id !== "string" ||
    typeof redirect_uri !== "string" ||
    typeof scope !== "string"
  ) {
    res.status(400).json({ message: "Invalid authorization request" });
    return;
  }

  if (!scope.split(" ").includes("openid")) {
    res.status(400).json({ message: "Scope must include 'openid'" });
    return;
  }

  const client = await getApprovedClient(client_id);

  if (!client) {
    res.status(400).json({ message: "Invalid client_id" });
    return;
  }
  const allowedRedirectUris = client.redirectUri as string[];

  if (!allowedRedirectUris.includes(redirect_uri)) {
    res.status(400).json({ message: "Invalid redirect_uri" });
    return;
  }

  const sessionId = getSessionCookie(req);
  const session = sessionId ? await getSessionById(sessionId) : null;

  if (!session || !isSessionValid(session.expiresAt)) {
    const loginParams = new URLSearchParams({
      redirect_uri: req.originalUrl,
    });

    res.redirect(`/o/authenticate?${loginParams.toString()}`);
    return;
  }

  const code = await storeAuthorizationCode(
    client.clientId,
    session.userId,
    redirect_uri,
    scope,
    typeof nonce === "string" ? nonce : undefined,
  );

  const redirectUrl = new URL(redirect_uri);
  redirectUrl.searchParams.set("code", code);

  if (typeof state === "string") {
    redirectUrl.searchParams.set("state", state);
  }

  res.redirect(redirectUrl.toString());
});

app.listen(PORT, () => {
  console.log(`AuthServer is running on PORT ${PORT}`);
});
