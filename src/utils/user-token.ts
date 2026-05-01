export interface JWTClaims {
  iss: string;
  sub: string;
  email: string;
  email_verified: boolean;
  exp: number;
  iat: number;
  family_name: string | undefined;
  given_name: string;
  name: string;
  picture: string | null;
}
