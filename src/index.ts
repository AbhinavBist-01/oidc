import crypto from "node:crypto";
import express from "express";
import path from "node:path";

import { eq } from "drizzle-orm";
import JWT from "jsonwebtoken";
import jose from "node-jose";
import { db } from "./db";
import { usersTable } from "./db/schema";
import { PRIVATE_KEY, PUBLIC_KEY } from "./utils/cert";
import { type JWTClaims, filterClaimsByScope } from "./utils/user-token";
import cookieParser from "cookie-parser";
import { requireSession } from "./middleware/auth";
import { isAdmin } from "./middleware/admin";
import {
  approveRegistration,
  createClientRegistration,
  getPendingRegistrations,
  rejectRegistration,
  getApprovedClient,
  getClientCredentials,
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

// Custom CORS Middleware
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  if (req.method === "OPTIONS") {
    res.sendStatus(204);
    return;
  }
  next();
});

app.get("/", (req, res) => {
  res.sendFile(path.resolve("public", "index.html"));
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
    end_session_endpoint: `${ISSUER}/o/logout`,
    scopes_supported: ["openid", "profile", "email"],
    response_types_supported: ["code"],
    subject_types_supported: ["public"],
    id_token_signing_alg_values_supported: ["RS256"],
    token_endpoint_auth_methods_supported: [
      "client_secret_post",
      "client_secret_basic",
    ],
    claims_supported: [
      "sub",
      "iss",
      "name",
      "given_name",
      "family_name",
      "picture",
      "email",
      "email_verified",
    ],
  });
});

app.get("/.well-known/jwks.json", async (req, res) => {
  const key = await jose.JWK.asKey(PUBLIC_KEY, "pem");
  res.json({ keys: [key.toJSON()] });
});

// Authentication Endpoints
app.get("/o/authenticate", (req, res) => {
  res.sendFile(path.resolve("public", "index.html"));
});

app.get("/o/sign-up", (req, res) => {
  res.sendFile(path.resolve("public", "index.html"));
});

app.get("/clients/register", requireSession, (req, res) => {
  res.sendFile(path.resolve("public", "index.html"));
});

app.get("/admin/dashboard", requireSession, isAdmin, (req, res) => {
  res.sendFile(path.resolve("public", "index.html"));
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
    res.status(401).json({
      error: "invalid_request",
      error_description: "Invalid or missing authorization header.",
    });
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
    res.status(401).json({
      error: "invalid_token",
      error_description: "The access token is invalid or expired.",
    });
    return;
  }

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, claims.sub) as any)
    .limit(1);

  if (!user) {
    res.status(404).json({
      error: "invalid_grant",
      error_description: "The user associated with the token was not found.",
    });
    return;
  }

  const scope = claims.scope || "openid";
  const filteredClaims = filterClaimsByScope(user, scope);

  res.json(filteredClaims);
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
    code_challenge,
    code_challenge_method,
    prompt,
  } = req.query;

  if (
    response_type !== "code" ||
    typeof client_id !== "string" ||
    typeof redirect_uri !== "string" ||
    typeof scope !== "string"
  ) {
    res.status(400).json({
      error: "invalid_request",
      error_description: "Missing or invalid authorization parameters.",
    });
    return;
  }

  if (
    code_challenge_method &&
    code_challenge_method !== "S256" &&
    code_challenge_method !== "plain"
  ) {
    res.status(400).json({
      error: "invalid_request",
      error_description:
        "Invalid code_challenge_method. Supported values are S256 and plain.",
    });
    return;
  }

  if (!scope.split(" ").includes("openid")) {
    res.status(400).json({
      error: "invalid_scope",
      error_description: "Scope must include 'openid'.",
    });
    return;
  }

  const client = await getApprovedClient(client_id);

  if (!client) {
    res.status(400).json({
      error: "invalid_client",
      error_description: "The client_id is invalid.",
    });
    return;
  }
  const allowedRedirectUris = client.redirectUri as string[];

  if (!allowedRedirectUris.includes(redirect_uri)) {
    res.status(400).json({
      error: "invalid_request",
      error_description: "The redirect_uri is invalid or does not match.",
    });
    return;
  }

  const sessionId = getSessionCookie(req);
  const session = sessionId ? await getSessionById(sessionId) : null;

  if (!session || !isSessionValid(session.expiresAt)) {
    if (prompt === "none") {
      const redirectUrl = new URL(redirect_uri);
      redirectUrl.searchParams.set("error", "login_required");
      if (typeof state === "string") {
        redirectUrl.searchParams.set("state", state);
      }
      res.redirect(redirectUrl.toString());
      return;
    }

    const loginParams = new URLSearchParams({
      redirect_uri: req.originalUrl,
    });

    res.redirect(`/o/authenticate?${loginParams.toString()}`);
    return;
  }

  if (prompt === "none") {
    const userId = session.userId;
    const code = await storeAuthorizationCode(
      client.clientId,
      userId,
      redirect_uri,
      scope,
      typeof nonce === "string" ? nonce : undefined,
      typeof code_challenge === "string" ? code_challenge : undefined,
      typeof code_challenge_method === "string"
        ? code_challenge_method
        : undefined,
    );

    const redirectUrl = new URL(redirect_uri);
    redirectUrl.searchParams.set("code", code);
    if (typeof state === "string") {
      redirectUrl.searchParams.set("state", state);
    }
    res.redirect(redirectUrl.toString());
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
  if (typeof code_challenge === "string") {
    consentParams.set("code_challenge", code_challenge);
    consentParams.set(
      "code_challenge_method",
      (code_challenge_method as string) || "plain",
    );
  }

  res.redirect(`/o/authorize/consent?${consentParams.toString()}`);
});

app.get("/o/authorize/consent", requireSession, async (req, res) => {
  const {
    client_id,
    redirect_uri,
    scope = "",
    state,
    nonce,
    code_challenge,
    code_challenge_method,
  } = req.query;

  if (
    typeof client_id !== "string" ||
    typeof redirect_uri !== "string" ||
    typeof scope !== "string"
  ) {
    res.status(400).json({
      error: "invalid_request",
      error_description: "Invalid consent request parameters.",
    });
    return;
  }

  const client = await getApprovedClient(client_id);
  if (!client) {
    res.status(400).json({
      error: "invalid_client",
      error_description: "The client_id is invalid.",
    });
    return;
  }

  const allowedRedirectUris = client.redirectUri as string[];
  if (!allowedRedirectUris.includes(redirect_uri)) {
    res.status(400).json({
      error: "invalid_request",
      error_description: "The redirect_uri is invalid.",
    });
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
  if (typeof code_challenge === "string") {
    params.set("code_challenge", code_challenge);
    params.set(
      "code_challenge_method",
      (code_challenge_method as string) || "plain",
    );
  }

  res.sendFile(path.resolve("public", "index.html"));
});

app.post("/o/authorize/decision", requireSession, async (req, res) => {
  const {
    action,
    client_id,
    redirect_uri,
    scope = "",
    state,
    nonce,
    code_challenge,
    code_challenge_method,
  } = req.body;

  if (
    typeof action !== "string" ||
    typeof client_id !== "string" ||
    typeof redirect_uri !== "string" ||
    typeof scope !== "string"
  ) {
    res.status(400).json({
      error: "invalid_request",
      error_description: "Invalid authorization decision request parameters.",
    });
    return;
  }

  const client = await getApprovedClient(client_id);
  if (!client) {
    res.status(400).json({
      error: "invalid_client",
      error_description: "The client_id is invalid.",
    });
    return;
  }

  const allowedRedirectUris = client.redirectUri as string[];
  if (!allowedRedirectUris.includes(redirect_uri)) {
    res.status(400).json({
      error: "invalid_request",
      error_description: "The redirect_uri is invalid.",
    });
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
    res.status(400).json({
      error: "invalid_request",
      error_description: "Invalid decision action.",
    });
    return;
  }

  const userId = req.userId!;
  const code = await storeAuthorizationCode(
    client.clientId,
    userId,
    redirect_uri,
    scope,
    typeof nonce === "string" ? nonce : undefined,
    typeof code_challenge === "string" ? code_challenge : undefined,
    typeof code_challenge_method === "string"
      ? code_challenge_method
      : undefined,
  );

  redirectUrl.searchParams.set("code", code);
  if (typeof state === "string") {
    redirectUrl.searchParams.set("state", state);
  }

  res.json({ redirect: redirectUrl.toString() });
});

app.post("/o/token", async (req, res) => {
  const { grant_type, code, redirect_uri, refresh_token, code_verifier } = req.body;

  if (grant_type !== "authorization_code" && grant_type !== "refresh_token") {
    res.status(400).json({
      error: "unsupported_grant_type",
      error_description: "Only authorization_code and refresh_token grant types are supported.",
    });
    return;
  }

  const { clientId, clientSecret } = getClientCredentials(req);
  if (!clientId || !clientSecret) {
    res.status(401).json({
      error: "invalid_client",
      error_description: "Client credentials are required.",
    });
    return;
  }

  const client = await getApprovedClient(clientId);
  const hashedSecret = crypto.createHash("sha256").update(clientSecret).digest("hex");
  if (!client || client.clientSecret !== hashedSecret) {
    res.status(401).json({
      error: "invalid_client",
      error_description: "Client authentication failed.",
    });
    return;
  }

  if (grant_type === "authorization_code") {
    if (typeof code !== "string" || typeof redirect_uri !== "string") {
      res.status(400).json({
        error: "invalid_request",
        error_description: "code and redirect_uri are required.",
      });
      return;
    }

    const authCode = await getAndValidateAuthorizationCode(code);
    if (
      !authCode ||
      authCode.clientId !== clientId ||
      authCode.redirectUri !== redirect_uri
    ) {
      res.status(400).json({
        error: "invalid_grant",
        error_description:
          "Authorization code is invalid, expired, or mismatched.",
      });
      return;
    }

    // PKCE Verification
    if (authCode.codeChallenge) {
      if (typeof code_verifier !== "string") {
        res.status(400).json({
          error: "invalid_grant",
          error_description: "code_verifier is required for PKCE validation.",
        });
        return;
      }

      let isValidChallenge = false;
      if (authCode.codeChallengeMethod === "plain") {
        isValidChallenge = code_verifier === authCode.codeChallenge;
      } else if (authCode.codeChallengeMethod === "S256") {
        const calculatedChallenge = crypto
          .createHash("sha256")
          .update(code_verifier)
          .digest("base64url");
        isValidChallenge = calculatedChallenge === authCode.codeChallenge;
      } else {
        res.status(400).json({
          error: "invalid_request",
          error_description: "Unsupported code_challenge_method.",
        });
        return;
      }

      if (!isValidChallenge) {
        res.status(400).json({
          error: "invalid_grant",
          error_description: "code_verifier verification failed.",
        });
        return;
      }
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

    const accessTokenClaims = {
      iss: ISSUER,
      sub: user.id.toString(),
      exp: now + 3600,
      iat: now,
      scope: authCode.scope,
    };
    const access_token = JWT.sign(accessTokenClaims, PRIVATE_KEY, { algorithm: "RS256" });

    const filteredClaims = filterClaimsByScope(user, authCode.scope);
    const idTokenClaims = {
      iss: ISSUER,
      ...filteredClaims,
      aud: client.clientId,
      nonce: authCode.nonce,
      exp: now + 3600,
      iat: now,
    };
    const id_token = JWT.sign(idTokenClaims, PRIVATE_KEY, { algorithm: "RS256" });

    await deleteAuthorizationCode(code);

    // Create session to generate refresh token
    const session = await createSession(user.id.toString(), authCode.scope);

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
    if (typeof refresh_token !== "string") {
      res.status(400).json({
        error: "invalid_request",
        error_description: "refresh_token is required.",
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

    // Rotate refresh token: delete old session, create new session (preserving scope)
    await deleteSession(session.id);
    const newSession = await createSession(user.id.toString(), session.scope);

    const ISSUER = `http://localhost:${PORT}`;
    const now = Math.floor(Date.now() / 1000);

    const accessTokenClaims = {
      iss: ISSUER,
      sub: user.id.toString(),
      exp: now + 3600,
      iat: now,
      scope: session.scope,
    };
    const access_token = JWT.sign(accessTokenClaims, PRIVATE_KEY, { algorithm: "RS256" });

    const filteredClaims = filterClaimsByScope(user, session.scope);
    const idTokenClaims = {
      iss: ISSUER,
      ...filteredClaims,
      aud: client.clientId,
      exp: now + 3600,
      iat: now,
    };
    const id_token = JWT.sign(idTokenClaims, PRIVATE_KEY, { algorithm: "RS256" });

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

app.post("/o/revoke", async (req, res) => {
  const { clientId, clientSecret } = getClientCredentials(req);
  if (!clientId || !clientSecret) {
    res.status(401).json({
      error: "invalid_client",
      error_description: "Client credentials are required.",
    });
    return;
  }

  const client = await getApprovedClient(clientId);
  const hashedSecret = crypto.createHash("sha256").update(clientSecret).digest("hex");
  if (!client || client.clientSecret !== hashedSecret) {
    res.status(401).json({
      error: "invalid_client",
      error_description: "Client authentication failed.",
    });
    return;
  }

  const { token } = req.body;
  if (typeof token !== "string") {
    res.status(400).json({
      error: "invalid_request",
      error_description: "token is required.",
    });
    return;
  }

  const session = await getSessionByRefreshToken(token);
  if (session) {
    await deleteSession(session.id);
  }

  res.status(200).send();
});

app.post("/o/introspect", async (req, res) => {
  const { clientId, clientSecret } = getClientCredentials(req);
  if (!clientId || !clientSecret) {
    res.status(401).json({
      error: "invalid_client",
      error_description: "Client credentials are required.",
    });
    return;
  }

  const client = await getApprovedClient(clientId);
  const hashedSecret = crypto.createHash("sha256").update(clientSecret).digest("hex");
  if (!client || client.clientSecret !== hashedSecret) {
    res.status(401).json({
      error: "invalid_client",
      error_description: "Client authentication failed.",
    });
    return;
  }

  const { token } = req.body;
  if (typeof token !== "string") {
    res.status(400).json({
      error: "invalid_request",
      error_description: "token is required.",
    });
    return;
  }

  // 1. Try to verify it as a JWT Access Token
  try {
    const claims = JWT.verify(token, PUBLIC_KEY, {
      algorithms: ["RS256"],
    }) as JWTClaims;

    res.json({
      active: true,
      scope: "openid profile email",
      client_id: client.clientId,
      sub: claims.sub,
      exp: claims.exp,
      iat: claims.iat,
      iss: claims.iss,
      token_type: "Bearer",
    });
    return;
  } catch (err) {
    // Fail silently and proceed to check refresh token
  }

  // 2. Try to verify it as a Refresh Token
  const session = await getSessionByRefreshToken(token);
  if (session && isSessionValid(session.expiresAt)) {
    res.json({
      active: true,
      scope: "openid profile email",
      sub: session.userId,
      exp: Math.floor(session.expiresAt.getTime() / 1000),
    });
    return;
  }

  res.json({
    active: false,
  });
});

app.get("/o/logout", async (req, res) => {
  const { id_token_hint, post_logout_redirect_uri, state } = req.query;

  let redirectUrl: string | null = null;

  if (typeof id_token_hint === "string") {
    try {
      const claims = JWT.verify(id_token_hint, PUBLIC_KEY, {
        algorithms: ["RS256"],
      }) as any;

      const clientId = claims.aud;
      if (typeof clientId === "string") {
        const client = await getApprovedClient(clientId);
        if (client && typeof post_logout_redirect_uri === "string") {
          const allowedUris = client.redirectUri as string[];
          if (allowedUris.includes(post_logout_redirect_uri)) {
            const url = new URL(post_logout_redirect_uri);
            if (typeof state === "string") {
              url.searchParams.set("state", state);
            }
            redirectUrl = url.toString();
          }
        }
      }
    } catch (err) {
      // Ignore invalid id_token_hint and just perform standard logout
    }
  }

  const sessionId = getSessionCookie(req);
  if (sessionId) {
    await deleteSession(sessionId);
  }

  clearSessionCookie(res);

  if (redirectUrl) {
    res.redirect(redirectUrl);
  } else {
    res.redirect("/");
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
