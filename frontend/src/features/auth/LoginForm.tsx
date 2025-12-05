import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button, Card, CardContent, Input, Label } from "@/components/ui";
import { useAuth } from "./AuthContext";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

type LoginFormProps = {
  onSuccess?: () => void;
  onRegisterClick?: () => void;
};

export function LoginForm({ onSuccess, onRegisterClick }: LoginFormProps) {
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginFormData) => {
    setError(null);
    setIsLoading(true);

    try {
      await login(data);
      onSuccess?.();
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "payload" in err
          ? (err as { payload?: { detail?: string } }).payload?.detail
          : "Login failed";
      setError(message ?? "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="you@example.com" {...register("email")} aria-invalid={!!errors.email} />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" placeholder="••••••••" {...register("password")} aria-invalid={!!errors.password} />
            {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
          </div>

          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Logging in...
              </>
            ) : (
              "Log in"
            )}
          </Button>

          {onRegisterClick && (
            <p className="text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <button type="button" onClick={onRegisterClick} className="text-primary hover:underline">
                Sign up
              </button>
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
