export interface JWTClaims {
  iss: string;
  sub: string;
  email: string;
  email_verified: string;
  exp: number;
  iat: number;
  family_name: string | undefined;
  given_name: string;
  name: string;
  picture: string | null;
}
