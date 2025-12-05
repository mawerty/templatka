import { CreateUserForm } from "@/components/CreateUserForm";
import { PaginatedUserList } from "@/components/PaginatedUserList";
import { AvatarUpload } from "@/components/AvatarUpload";
import { ActivityFeed } from "@/components/ActivityFeed";
import { useAuth } from "@/features/auth";

export function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome back, {user?.name || "User"}!
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left column */}
        <div className="space-y-6">
          <AvatarUpload />
          <CreateUserForm />
        </div>

        {/* Right column */}
        <div className="space-y-6">
          <ActivityFeed />
          <PaginatedUserList />
        </div>
      </div>
    </div>
  );
}

