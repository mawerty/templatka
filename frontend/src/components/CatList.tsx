import { Cat, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { useDeleteCat, useCats } from "@/api";
import { Button, Card, CardContent } from "@/components/ui";

export function CatList() {
  const { data: cats, isLoading, error } = useCats();
  const deleteCat = useDeleteCat();

  const handleDelete = (catId: number, catName: string) => {
    deleteCat.mutate(catId, {
      onSuccess: () => {
        toast.success(`Deleted ${catName}`);
      },
      onError: () => {
        toast.error("Failed to delete cat");
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
            Failed to load cats. Is the backend running?
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Run: <code className="bg-muted px-1 rounded">pnpm dev</code>
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!cats?.length) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground text-center">
            No cats yet. Create one!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {cats.map((cat) => (
        <Card key={cat.id}>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <Cat className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{cat.name}</p>
                  <p className="text-sm text-muted-foreground">{cat.breed}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDelete(cat.id, cat.name)}
                disabled={deleteCat.isPending}
              >
                {deleteCat.isPending ? (
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

