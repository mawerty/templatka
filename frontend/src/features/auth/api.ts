/**
 * Auth API functions.
 */

import { apiFetch } from "@/api/fetcher";
import type { AuthResponse, AuthUser, LoginRequest, RegisterRequest } from "./types";

const TOKEN_KEY = "auth_token";

/**
 * Get stored auth token.
 */
export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * Store auth token.
 */
export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

/**
 * Remove auth token.
 */
export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

/**
 * Register a new user.
 */
export async function register(data: RegisterRequest): Promise<AuthResponse> {
  const response = await apiFetch<AuthResponse, RegisterRequest>({
    url: "/api/auth/register",
    method: "POST",
    body: data,
  });
  setToken(response.access_token);
  return response;
}

/**
 * Login with email and password.
 */
export async function login(data: LoginRequest): Promise<AuthResponse> {
  const response = await apiFetch<AuthResponse, LoginRequest>({
    url: "/api/auth/login",
    method: "POST",
    body: data,
  });
  setToken(response.access_token);
  return response;
}

/**
 * Logout - removes token from storage.
 */
export function logout(): void {
  removeToken();
}

/**
 * Get current user (requires auth).
 */
export async function getCurrentUser(): Promise<AuthUser> {
  const token = getToken();
  if (!token) {
    throw new Error("Not authenticated");
  }

  return apiFetch<AuthUser>({
    url: "/api/auth/me",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

