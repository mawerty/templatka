import { Link, useNavigate } from "react-router-dom";
import { RegisterForm } from "@/features/auth";

export default function Register() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Create account</h1>
          <p className="text-muted-foreground mt-1">Get started with your free account</p>
        </div>

        <RegisterForm onSuccess={() => navigate("/dashboard")} />

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

