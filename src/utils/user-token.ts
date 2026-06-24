export interface JWTClaims {
  iss: string;
  sub: string;
  email?: string;
  email_verified?: boolean;
  exp: number;
  iat: number;
  family_name?: string;
  given_name?: string;
  name?: string;
  picture?: string | null;
  scope?: string;
}

export function filterClaimsByScope(
  user: any,
  scopeString: string,
): Partial<JWTClaims> {
  const scopes = scopeString.split(" ");
  const claims: Partial<JWTClaims> = {
    sub: user.id.toString(),
  };

  if (scopes.includes("profile")) {
    claims.name = [user.firstName, user.lastName].filter(Boolean).join(" ");
    claims.given_name = user.firstName || "";
    claims.family_name = user.lastName || "";
    claims.picture = user.profileImageURL || null;
  }

  if (scopes.includes("email")) {
    claims.email = user.email;
    claims.email_verified = user.emailVerified;
  }

  return claims;
}
