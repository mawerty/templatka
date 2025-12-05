import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Cat, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { useCreateCat } from "@/api";
import { Button, Card, CardContent, Input, Label } from "@/components/ui";

const catSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  breed: z.string().max(100).optional(),
});

type CatFormData = z.infer<typeof catSchema>;

export function CreateCatForm() {
  const createCat = useCreateCat();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CatFormData>({
    resolver: zodResolver(catSchema),
  });

  const onSubmit = (data: CatFormData) => {
    createCat.mutate(data, {
      onSuccess: (cat) => {
        toast.success(`Created ${cat.name}`);
        reset();
      },
      onError: () => {
        toast.error("Failed to create cat");
      },
    });
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <h3 className="font-semibold flex items-center gap-2 mb-4">
          <Cat className="h-4 w-4" />
          Add New Cat
        </h3>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="Whiskers"
              {...register("name")}
              aria-invalid={!!errors.name}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="breed">Breed</Label>
            <Input
              id="breed"
              placeholder="Persian"
              {...register("breed")}
              aria-invalid={!!errors.breed}
            />
            {errors.breed && (
              <p className="text-sm text-destructive">{errors.breed.message}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={createCat.isPending}
          >
            {createCat.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Cat"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

