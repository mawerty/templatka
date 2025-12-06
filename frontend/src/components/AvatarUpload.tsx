import { useState } from "react";
import { Upload, User, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useUploadFile, getUploadUrl } from "@/features/uploads";
import { Button, Card, CardContent } from "@/components/ui";

export function AvatarUpload() {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const { mutate: upload, isPending } = useUploadFile({
    onSuccess: (data) => {
      setAvatarUrl(getUploadUrl(data.filename));
      toast.success("Avatar uploaded!");
    },
    onError: () => {
      toast.error("Failed to upload avatar");
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      upload(file);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <User className="h-4 w-4" />
          Your Avatar
        </h3>

        <div className="flex items-center gap-4">
          <div className="relative h-20 w-20 rounded-full bg-muted flex items-center justify-center overflow-hidden border-2 border-border">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Avatar"
                className="h-full w-full object-cover"
              />
            ) : (
              <User className="h-8 w-8 text-muted-foreground" />
            )}
          </div>

          <div className="flex-1">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              id="avatar-upload"
              disabled={isPending}
            />
            <Button asChild variant="outline" disabled={isPending}>
              <label htmlFor="avatar-upload" className="cursor-pointer">
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Upload Image
                  </>
                )}
              </label>
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              JPG, PNG or GIF. Max 10MB.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


