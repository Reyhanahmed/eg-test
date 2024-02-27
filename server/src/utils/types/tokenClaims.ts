export interface TokenClaims extends TokenData {
  iat: number;
  exp: number;
}

export interface TokenData {
  id: string;
  email: string;
}
