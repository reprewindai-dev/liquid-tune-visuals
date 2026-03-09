import { useState, useCallback, useRef, forwardRef } from "react";
import { Upload, Camera, X, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PhotoUploadProps {
  onPhotoSelected: (photoBase64: string) => void;
  currentPhoto: string | null;
}

export const PhotoUpload = forwardRef<HTMLDivElement, PhotoUploadProps>(
  function PhotoUpload({ onPhotoSelected, currentPhoto }, ref) {
  const [isDragging, setIsDragging] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const processFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
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

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraOpen(false);
  }, []);

  const handleTakeSelfie = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 1280 } }
      });
      streamRef.current = stream;
      setIsCameraOpen(true);
      // Wait for video element to mount
      requestAnimationFrame(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      });
    } catch (error) {
      if (error instanceof Error && error.name === "NotAllowedError") {
        alert("Camera access denied. Please allow camera permissions in your browser settings.");
      } else {
        alert("Could not access camera. Please upload a photo instead.");
      }
      console.error("Camera error:", error);
    }
  }, []);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    // Mirror the image for selfie
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
    onPhotoSelected(dataUrl);
    stopCamera();
  }, [onPhotoSelected, stopCamera]);

  if (currentPhoto) {
    return (
      <div className="animate-fade-in">
        <div className="relative max-w-md mx-auto">
          <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl glow-primary">
            <img src={currentPhoto} alt="Your photo" className="w-full h-full object-cover" />
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

  if (isCameraOpen) {
    return (
      <div className="space-y-4 animate-fade-in">
        <div className="relative max-w-md mx-auto">
          <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl glow-primary bg-black">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover scale-x-[-1]"
            />
          </div>
        </div>
        <div className="flex justify-center gap-3">
          <Button variant="outline" size="lg" onClick={stopCamera}>
            Cancel
          </Button>
          <Button size="lg" className="gap-2" onClick={capturePhoto}>
            <Camera className="w-4 h-4" />
            Capture
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div ref={ref} className="space-y-6 animate-fade-in">
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
            <p className="text-muted-foreground mt-1">or click to browse your files</p>
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
        <Button variant="outline" size="lg" className="gap-2" onClick={handleTakeSelfie}>
          <Camera className="w-4 h-4" />
          Take a Selfie
        </Button>
      </div>
    </div>
  );
});
