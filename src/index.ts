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
import {
  approveRegistration,
  createClientRegistration,
  getPendingRegistrations,
  rejectRegistration,
} from "./utils/client";
import {
  createSession,
  deleteSession,
  getSessionById,
  isSessionValid,
  getSessionByRefreshToken,
} from "./utils/session";
import { clearSessionCookie, setSessionCookie } from "./utils/cookie";
import { getSessionCookie } from "./utils/cookie";
import { getApprovedClient } from "./utils/client";
import {
  storeAuthorizationCode,
  getAndValidateAuthorizationCode,
  deleteAuthorizationCode,
} from "./utils/auth-code";

const app = express();
const PORT = process.env.PORT ?? 8000;

app.use(express.json());
app.use(express.static(path.resolve("public")));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.sendFile(path.resolve("public", "landing.html"));
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
    authorization_endpoint: `${ISSUER}/o/authorize`,
    token_endpoint: `${ISSUER}/o/token`,
    userinfo_endpoint: `${ISSUER}/o/userinfo`,
    jwks_uri: `${ISSUER}/.well-known/jwks.json`,
  });
});

app.get("/.well-known/jwks.json", async (req, res) => {
  const key = await jose.JWK.asKey(PUBLIC_KEY, "pem");
  res.json({ keys: [key.toJSON()] });
});

// Authentication Endpoints
app.get("/o/authenticate", (req, res) => {
  res.sendFile(path.resolve("public", "authenticate.html"));
});

app.get("/o/sign-up", (req, res) => {
  res.sendFile(path.resolve("public", "singup.html"));
});

app.get("/clients/register", requireSession, (req, res) => {
  res.sendFile(path.resolve("public", "client-register.html"));
});

app.get("/admin/dashboard", requireSession, isAdmin, (req, res) => {
  res.sendFile(path.resolve("public", "admin-dashboard.html"));
});

app.post("/o/authenticate/sign-in", async (req, res) => {
  const { email, password, redirect_uri } = req.body;

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

  res.json({
    token,
    redirect: typeof redirect_uri === "string" ? redirect_uri : undefined,
  });
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

app.post("/clients/register", requireSession, async (req, res) => {
  try {
    const { clientName, redirectUris, description } = req.body;

    if (
      typeof clientName !== "string" ||
      !Array.isArray(redirectUris) ||
      redirectUris.length === 0 ||
      !redirectUris.every((uri) => typeof uri === "string")
    ) {
      res.status(400).json({ message: "Invalid client registration payload" });
      return;
    }

    const registrationId = await createClientRegistration(
      clientName,
      redirectUris,
      typeof description === "string" ? description : undefined,
      req.userId,
    );

    res.status(201).json({
      registrationId,
      status: "pending",
    });
  } catch (error) {
    console.error("Error creating client registration:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post(
  "/admin/registrations/:id/approve",
  requireSession,
  isAdmin,
  async (req, res) => {
    try {
      const registrationId = req.params.id;
      if (typeof registrationId !== "string") {
        res.status(400).json({ message: "Invalid registration id" });
        return;
      }

      const credentials = await approveRegistration(
        registrationId,
        req.userId!,
      );
      res.status(201).json(credentials);
    } catch (error) {
      console.error("Error approving client registration:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
);

app.post(
  "/admin/registrations/:id/reject",
  requireSession,
  isAdmin,
  async (req, res) => {
    try {
      const registrationId = req.params.id;
      if (typeof registrationId !== "string") {
        res.status(400).json({ message: "Invalid registration id" });
        return;
      }

      await rejectRegistration(registrationId, req.userId!);
      res.json({ ok: true, status: "rejected" });
    } catch (error) {
      console.error("Error rejecting client registration:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
);

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

  const consentParams = new URLSearchParams({
    client_id,
    redirect_uri,
    scope,
  });
  if (typeof state === "string") {
    consentParams.set("state", state);
  }
  if (typeof nonce === "string") {
    consentParams.set("nonce", nonce);
  }

  res.redirect(`/o/authorize/consent?${consentParams.toString()}`);
});

app.get("/o/authorize/consent", requireSession, async (req, res) => {
  const { client_id, redirect_uri, scope = "", state, nonce } = req.query;

  if (
    typeof client_id !== "string" ||
    typeof redirect_uri !== "string" ||
    typeof scope !== "string"
  ) {
    res.status(400).json({ message: "Invalid consent request" });
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

  const params = new URLSearchParams({
    client_id,
    redirect_uri,
    scope,
  });
  if (typeof state === "string") {
    params.set("state", state);
  }
  if (typeof nonce === "string") {
    params.set("nonce", nonce);
  }

  res.redirect(`/consent.html?${params.toString()}`);
});

app.post("/o/authorize/decision", requireSession, async (req, res) => {
  const {
    action,
    client_id,
    redirect_uri,
    scope = "",
    state,
    nonce,
  } = req.body;

  if (
    typeof action !== "string" ||
    typeof client_id !== "string" ||
    typeof redirect_uri !== "string" ||
    typeof scope !== "string"
  ) {
    res.status(400).json({ message: "Invalid authorization decision request" });
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

  const redirectUrl = new URL(redirect_uri);

  if (action === "deny") {
    redirectUrl.searchParams.set("error", "access_denied");
    if (typeof state === "string") {
      redirectUrl.searchParams.set("state", state);
    }
    res.json({ redirect: redirectUrl.toString() });
    return;
  }

  if (action !== "allow") {
    res.status(400).json({ message: "Invalid decision action" });
    return;
  }

  const userId = req.userId!;
  const code = await storeAuthorizationCode(
    client.clientId,
    userId,
    redirect_uri,
    scope,
    typeof nonce === "string" ? nonce : undefined,
  );

  redirectUrl.searchParams.set("code", code);
  if (typeof state === "string") {
    redirectUrl.searchParams.set("state", state);
  }

  res.json({ redirect: redirectUrl.toString() });
});

app.post("/o/token", async (req, res) => {
  const { grant_type, code, redirect_uri, client_id, client_secret, refresh_token } = req.body;

  if (grant_type !== "authorization_code" && grant_type !== "refresh_token") {
    res.status(400).json({
      error: "unsupported_grant_type",
      error_description: "Only authorization_code and refresh_token grant types are supported.",
    });
    return;
  }

  if (grant_type === "authorization_code") {
    if (
      typeof code !== "string" ||
      typeof redirect_uri !== "string" ||
      typeof client_id !== "string" ||
      typeof client_secret !== "string"
    ) {
      res.status(400).json({
        error: "invalid_request",
        error_description:
          "code, redirect_uri, client_id, and client_secret are required.",
      });
      return;
    }

    const client = await getApprovedClient(client_id);
    if (!client || client.clientSecret !== client_secret) {
      res.status(401).json({
        error: "invalid_client",
        error_description: "Client authentication failed.",
      });
      return;
    }

    const authCode = await getAndValidateAuthorizationCode(code);
    if (
      !authCode ||
      authCode.clientId !== client_id ||
      authCode.redirectUri !== redirect_uri
    ) {
      res.status(400).json({
        error: "invalid_grant",
        error_description:
          "Authorization code is invalid, expired, or mismatched.",
      });
      return;
    }

    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, authCode.userId) as any)
      .limit(1);

    if (!user) {
      res.status(400).json({
        error: "invalid_grant",
        error_description: "Authorization code subject user is invalid.",
      });
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
    const access_token = JWT.sign(claims, PRIVATE_KEY, { algorithm: "RS256" });

    const id_token = JWT.sign(
      {
        ...claims,
        aud: client.clientId,
        nonce: authCode.nonce,
      },
      PRIVATE_KEY,
      { algorithm: "RS256" },
    );

    await deleteAuthorizationCode(code);

    // Create session to generate refresh token
    const session = await createSession(user.id.toString());

    res.json({
      access_token,
      id_token,
      refresh_token: session.refreshToken,
      token_type: "Bearer",
      expires_in: 3600,
      scope: authCode.scope,
    });
    return;
  }

  if (grant_type === "refresh_token") {
    if (
      typeof refresh_token !== "string" ||
      typeof client_id !== "string" ||
      typeof client_secret !== "string"
    ) {
      res.status(400).json({
        error: "invalid_request",
        error_description:
          "refresh_token, client_id, and client_secret are required.",
      });
      return;
    }

    const client = await getApprovedClient(client_id);
    if (!client || client.clientSecret !== client_secret) {
      res.status(401).json({
        error: "invalid_client",
        error_description: "Client authentication failed.",
      });
      return;
    }

    const session = await getSessionByRefreshToken(refresh_token);
    if (!session || !isSessionValid(session.expiresAt)) {
      res.status(400).json({
        error: "invalid_grant",
        error_description: "Refresh token is invalid or expired.",
      });
      return;
    }

    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, session.userId) as any)
      .limit(1);

    if (!user) {
      res.status(400).json({
        error: "invalid_grant",
        error_description: "Session user is invalid.",
      });
      return;
    }

    // Rotate refresh token: delete old session, create new session
    await deleteSession(session.id);
    const newSession = await createSession(user.id.toString());

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
    const access_token = JWT.sign(claims, PRIVATE_KEY, { algorithm: "RS256" });

    const id_token = JWT.sign(
      {
        ...claims,
        aud: client.clientId,
      },
      PRIVATE_KEY,
      { algorithm: "RS256" },
    );

    res.json({
      access_token,
      id_token,
      refresh_token: newSession.refreshToken,
      token_type: "Bearer",
      expires_in: 3600,
    });
    return;
  }
});

app.post("/o/logout", async (req, res) => {
  const sessionId = getSessionCookie(req);

  if (sessionId) {
    await deleteSession(sessionId);
  }

  clearSessionCookie(res);
  res.status(204).send();
});

app.get("/o/session/me", requireSession, async (req, res) => {
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, req.userId!) as any)
    .limit(1);

  if (!user) {
    res.status(404).json({ message: "User not found." });
    return;
  }

  res.json({
    id: user.id,
    email: user.email,
    isAdmin: user.isAdmin,
    name: [user.firstName, user.lastName].filter(Boolean).join(" "),
  });
});

app.listen(PORT, () => {
  console.log(`AuthServer is running on PORT ${PORT}`);
});
