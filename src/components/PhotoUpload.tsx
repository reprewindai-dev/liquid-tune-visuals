import { useState, useCallback } from "react";
import { Upload, Camera, X, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PhotoUploadProps {
  onPhotoSelected: (photoBase64: string) => void;
  currentPhoto: string | null;
}

export function PhotoUpload({ onPhotoSelected, currentPhoto }: PhotoUploadProps) {
  const [isDragging, setIsDragging] = useState(false);

  const processFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      onPhotoSelected(result);
    };
    reader.readAsDataURL(file);
  }, [onPhotoSelected]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  }, [processFile]);

  if (currentPhoto) {
    return (
      <div className="animate-fade-in">
        <div className="relative max-w-md mx-auto">
          <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl glow-primary">
            <img
              src={currentPhoto}
              alt="Your photo"
              className="w-full h-full object-cover"
            />
          </div>
          <Button
            variant="destructive"
            size="icon"
            className="absolute -top-3 -right-3 rounded-full shadow-lg"
            onClick={() => onPhotoSelected("")}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-center mt-4 text-muted-foreground">
          Looking good! Click continue to create your avatar.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          "relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 cursor-pointer",
          isDragging
            ? "border-primary bg-primary/5 scale-[1.02]"
            : "border-muted-foreground/30 hover:border-primary/50 hover:bg-muted/50"
        )}
      >
        <input
          type="file"
          accept="image/*"
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div className="space-y-4">
          <div className="w-20 h-20 mx-auto rounded-full gradient-primary flex items-center justify-center glow-primary">
            <Upload className="w-8 h-8 text-primary-foreground" />
          </div>
          <div>
            <h3 className="text-xl font-semibold">Drop your photo here</h3>
            <p className="text-muted-foreground mt-1">
              or click to browse your files
            </p>
          </div>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Image className="w-4 h-4" />
            <span>JPG, PNG up to 10MB</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex-1 h-px bg-border" />
        <span className="text-muted-foreground text-sm">or</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      <div className="flex justify-center">
        <Button 
          variant="outline" 
          size="lg" 
          className="gap-2"
          onClick={() => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.capture = 'user';
            input.onchange = (e) => {
              const file = (e.target as HTMLInputElement).files?.[0];
              if (file) processFile(file);
            };
            input.click();
          }}
        >
          <Camera className="w-4 h-4" />
          Take a Selfie
        </Button>
      </div>
    </div>
  );
}
