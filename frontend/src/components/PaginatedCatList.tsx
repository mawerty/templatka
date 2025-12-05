import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Cat, ChevronLeft, ChevronRight, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/api/fetcher";
import { Button, Card, CardContent } from "@/components/ui";

type CatType = {
  id: number;
  name: string;
  breed: string;
  created_at: number;
  is_cute: boolean;
  avatar_url: string | null;
};

type PaginatedCats = {
  items: CatType[];
  total: number;
  page: number;
  pages: number;
  has_next: boolean;
  has_prev: boolean;
};

async function fetchCats(page: number): Promise<PaginatedCats> {
  return apiFetch<PaginatedCats>({
    url: `/api/cats?page=${page}&per_page=5`,
  });
}

async function deleteCat(id: number): Promise<void> {
  return apiFetch<void>({
    url: `/api/cats/${id}`,
    method: "DELETE",
  });
}

export function PaginatedCatList() {
  const [page, setPage] = useState(1);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["cats", page],
    queryFn: () => fetchCats(page),
  });

  const handleDelete = async (cat: CatType) => {
    try {
      await deleteCat(cat.id);
      toast.success(`Deleted ${cat.name}`);
      refetch();
    } catch {
      toast.error("Failed to delete cat");
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Cat className="h-4 w-4" />
            Cats
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
            No cats yet. Create one to get started!
          </p>
        ) : (
          <>
            <ul className="space-y-2 mb-4">
              {data.items.map((cat) => (
                <li
                  key={cat.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div className="min-w-0">
                    <p className="font-medium truncate">{cat.name}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      {cat.breed}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(cat)}
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

