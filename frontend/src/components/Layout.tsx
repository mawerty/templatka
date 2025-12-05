import { Link, NavLink, Outlet } from "react-router-dom";
import { Home, LayoutDashboard, LogIn, LogOut } from "lucide-react";
import { useAuth } from "@/features/auth";
import { Button } from "@/components/ui";

function NavLinks() {
  const { isAuthenticated, logout } = useAuth();

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-accent"
    }`;

  return (
    <>
      <NavLink to="/" end className={linkClass}>
        <Home className="h-4 w-4" />
        Home
      </NavLink>

      {isAuthenticated && (
        <NavLink to="/dashboard" className={linkClass}>
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

export default function Layout() {
  return (
    <div className="min-h-screen bg-background">
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

      <main className="container py-8">
        <Outlet />
      </main>
    </div>
  );
}

