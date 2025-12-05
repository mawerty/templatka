import { Link, NavLink, Route, Routes } from "react-router-dom";
import { Home, LayoutDashboard, LogIn, LogOut } from "lucide-react";

import { AuthProvider, useAuth, ProtectedRoute } from "@/features/auth";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { DashboardPage } from "./pages/DashboardPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { Button } from "@/components/ui";

function NavLinks() {
  const { isAuthenticated, logout } = useAuth();

  return (
    <>
      <NavLink
        to="/"
        end
        className={({ isActive }) =>
          `flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            isActive
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-accent"
          }`
        }
      >
        <Home className="h-4 w-4" />
        Home
      </NavLink>

      {isAuthenticated && (
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-accent"
            }`
          }
        >
          <LayoutDashboard className="h-4 w-4" />
          Dashboard
        </NavLink>
      )}

      <div className="ml-auto">
        {isAuthenticated ? (
          <Button variant="ghost" size="sm" onClick={logout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        ) : (
          <Button asChild variant="ghost" size="sm">
            <Link to="/login">
              <LogIn className="h-4 w-4 mr-2" />
              Login
            </Link>
          </Button>
        )}
      </div>
    </>
  );
}

function AppContent() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b bg-card">
        <div className="container flex h-14 items-center gap-6">
          <Link to="/" className="font-semibold text-lg">
            🚀 Demo App
          </Link>

          <div className="flex flex-1 items-center gap-1">
            <NavLinks />
          </div>
        </div>
      </nav>

      {/* Page Content */}
      <main className="container py-8">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
