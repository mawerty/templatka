/**
 * Auth Context - provides authentication state throughout the app.
 *
 * Usage:
 *   // In App.tsx or main.tsx
 *   <AuthProvider>
 *     <App />
 *   </AuthProvider>
 *
 *   // In components
 *   const { user, login, logout, register } = useAuth();
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import * as authApi from "./api";
import type { AuthUser, LoginRequest, RegisterRequest } from "./types";

type AuthContextValue = {
  /** Current authenticated user, null if not logged in */
  user: AuthUser | null;
  /** Whether auth state is being loaded */
  isLoading: boolean;
  /** Whether user is authenticated */
  isAuthenticated: boolean;
  /** Login with email and password */
  login: (data: LoginRequest) => Promise<void>;
  /** Register a new user */
  register: (data: RegisterRequest) => Promise<void>;
  /** Logout current user */
  logout: () => void;
  /** Refresh current user data */
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user on mount if token exists
  useEffect(() => {
    const token = authApi.getToken();
    if (token) {
      authApi
        .getCurrentUser()
        .then(setUser)
        .catch(() => {
          // Token invalid/expired - remove it
          authApi.removeToken();
        })
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

  const logout = useCallback(() => {
    authApi.logout();
    setUser(null);
  }, []);

  const refresh = useCallback(async () => {
    const currentUser = await authApi.getCurrentUser();
    setUser(currentUser);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: !!user,
      login,
      register,
      logout,
      refresh,
    }),
    [user, isLoading, login, register, logout, refresh]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to access auth context.
 *
 * Must be used within AuthProvider.
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

