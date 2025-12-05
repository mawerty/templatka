import { Link, useNavigate } from "react-router-dom";
import { LoginForm } from "@/features/auth";

export function LoginPage() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Welcome back</h1>
          <p className="text-muted-foreground mt-1">
            Sign in to your account
          </p>
        </div>

        <LoginForm onSuccess={() => navigate("/dashboard")} />

        <p className="text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link to="/register" className="text-primary hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}

