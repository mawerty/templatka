import { apiFetch } from "@/api/fetcher";
import type { AuthResponse, AuthUser, LoginRequest, RegisterRequest } from "./types";

const TOKEN_KEY = "auth_token";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export async function register(data: RegisterRequest): Promise<AuthResponse> {
  const response = await apiFetch<AuthResponse, RegisterRequest>({
    url: "/api/auth/register",
    method: "POST",
    body: data,
  });
  setToken(response.access_token);
  return response;
}

export async function login(data: LoginRequest): Promise<AuthResponse> {
  const response = await apiFetch<AuthResponse, LoginRequest>({
    url: "/api/auth/login",
    method: "POST",
    body: data,
  });
  setToken(response.access_token);
  return response;
}

export async function logout(): Promise<void> {
  const token = getToken();
  if (token) {
    // Invalidate token on backend
    try {
      await apiFetch<void>({
        url: "/api/auth/logout",
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      // Ignore errors - we still want to clear local token
    }
  }
  removeToken();
}

export async function getCurrentUser(): Promise<AuthUser> {
  const token = getToken();
  if (!token) {
    throw new Error("Not authenticated");
  }
  return apiFetch<AuthUser>({ url: "/api/auth/me", headers: { Authorization: `Bearer ${token}` } });
}
