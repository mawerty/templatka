import { Loader2 } from "lucide-react";
import type { ReactNode } from "react";
import { useAuth } from "./AuthContext";

type ProtectedRouteProps = {
  children: ReactNode;
  fallback?: ReactNode;
  loadingFallback?: ReactNode;
};

export function ProtectedRoute({ children, fallback, loadingFallback }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      loadingFallback ?? (
        <div className="flex items-center justify-center min-h-[200px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )
    );
  }

  if (!isAuthenticated) {
    return fallback ?? <DefaultLoginPrompt />;
  }

  return <>{children}</>;
}

function DefaultLoginPrompt() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] text-center">
      <h2 className="text-2xl font-semibold mb-2">Authentication Required</h2>
      <p className="text-muted-foreground mb-4">Please log in to access this page.</p>
    </div>
  );
}
