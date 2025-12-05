import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Loader2, Users, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/api/fetcher";
import { Button, Card, CardContent } from "@/components/ui";

type User = {
  id: number;
  name: string;
  email: string;
  created_at: number;
  is_active: boolean;
  avatar_url: string | null;
};

type PaginatedUsers = {
  items: User[];
  total: number;
  page: number;
  pages: number;
  has_next: boolean;
  has_prev: boolean;
};

async function fetchUsers(page: number): Promise<PaginatedUsers> {
  return apiFetch<PaginatedUsers>({
    url: `/api/users?page=${page}&per_page=5`,
  });
}

async function deleteUser(id: number): Promise<void> {
  return apiFetch<void>({
    url: `/api/users/${id}`,
    method: "DELETE",
  });
}

export function PaginatedUserList() {
  const [page, setPage] = useState(1);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["users", page],
    queryFn: () => fetchUsers(page),
  });

  const handleDelete = async (user: User) => {
    try {
      await deleteUser(user.id);
      toast.success(`Deleted ${user.name}`);
      refetch();
    } catch {
      toast.error("Failed to delete user");
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Users className="h-4 w-4" />
            Users
          </h3>
          {data && (
            <span className="text-sm text-muted-foreground">
              {data.total} total
            </span>
          )}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : !data || data.items.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No users yet. Create one to get started!
          </p>
        ) : (
          <>
            <ul className="space-y-2 mb-4">
              {data.items.map((user) => (
                <li
                  key={user.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div className="min-w-0">
                    <p className="font-medium truncate">{user.name}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      {user.email}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(user)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>

            {/* Pagination */}
            <div className="flex items-center justify-between border-t pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => p - 1)}
                disabled={!data.has_prev}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Prev
              </Button>

              <span className="text-sm text-muted-foreground">
                Page {data.page} of {data.pages}
              </span>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => p + 1)}
                disabled={!data.has_next}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

