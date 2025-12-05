/**
 * Auth types - matching backend schemas.
 */

export type AuthUser = {
  id: number;
  email: string;
  name: string;
  created_at: number;
  is_active: boolean;
  avatar_url: string | null;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterRequest = {
  email: string;
  password: string;
  name: string;
};

export type AuthResponse = {
  user: AuthUser;
  access_token: string;
  token_type: string;
};

