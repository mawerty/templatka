import { CreateCatForm } from "@/components/CreateCatForm";
import { PaginatedCatList } from "@/components/PaginatedCatList";
import { AvatarUpload } from "@/components/AvatarUpload";
import { ActivityFeed } from "@/components/ActivityFeed";
import { useAuth } from "@/features/auth";

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome back, {user?.name || "User"}!</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <AvatarUpload />
          <CreateCatForm />
        </div>

        <div className="space-y-6">
          <ActivityFeed />
          <PaginatedCatList />
        </div>
      </div>
    </div>
  );
}

