/**
 * Auth feature module.
 *
 * Enable auth in backend config.py first:
 *   enable_auth: bool = True
 *
 * Usage in App.tsx:
 *   import { AuthProvider, useAuth, ProtectedRoute } from "@/features/auth";
 *
 *   function App() {
 *     return (
 *       <AuthProvider>
 *         <ProtectedRoute>
 *           <Dashboard />
 *         </ProtectedRoute>
 *       </AuthProvider>
 *     );
 *   }
 *
 * Usage in components:
 *   const { user, login, logout, isAuthenticated } = useAuth();
 */

export { AuthProvider, useAuth } from "./AuthContext";
export { ProtectedRoute } from "./ProtectedRoute";
export { LoginForm } from "./LoginForm";
export { RegisterForm } from "./RegisterForm";
export * from "./api";
export type * from "./types";

