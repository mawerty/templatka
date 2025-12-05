import { Loader2, Trash2, User as UserIcon } from "lucide-react";
import { toast } from "sonner";

import { useDeleteUser, useUsers } from "@/api";
import { Button, Card, CardContent } from "@/components/ui";

export function UserList() {
  const { data: users, isLoading, error } = useUsers();
  const deleteUser = useDeleteUser();

  const handleDelete = (userId: number, userName: string) => {
    deleteUser.mutate(userId, {
      onSuccess: () => {
        toast.success(`Deleted ${userName}`);
      },
      onError: () => {
        toast.error("Failed to delete user");
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="pt-6">
          <p className="text-destructive">
            Failed to load users. Is the backend running?
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Run: <code className="bg-muted px-1 rounded">pnpm dev</code>
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!users?.length) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground text-center">
            No users yet. Create one!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {users.map((user) => (
        <Card key={user.id}>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <UserIcon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDelete(user.id, user.name)}
                disabled={deleteUser.isPending}
              >
                {deleteUser.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

