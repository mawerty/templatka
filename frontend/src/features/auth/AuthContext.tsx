import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import * as authApi from "./api";
import type { AuthUser, LoginRequest, RegisterRequest } from "./types";

type AuthContextValue = {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = authApi.getToken();
    if (token) {
      authApi
        .getCurrentUser()
        .then(setUser)
        .catch(() => authApi.removeToken())
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (data: LoginRequest) => {
    const response = await authApi.login(data);
    setUser(response.user);
  }, []);

  const register = useCallback(async (data: RegisterRequest) => {
    const response = await authApi.register(data);
    setUser(response.user);
  }, []);

  const logout = useCallback(async () => {
    await authApi.logout();
    setUser(null);
  }, []);

  const refresh = useCallback(async () => {
    const currentUser = await authApi.getCurrentUser();
    setUser(currentUser);
  }, []);

  const value = useMemo(
    () => ({ user, isLoading, isAuthenticated: !!user, login, register, logout, refresh }),
    [user, isLoading, login, register, logout, refresh]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
