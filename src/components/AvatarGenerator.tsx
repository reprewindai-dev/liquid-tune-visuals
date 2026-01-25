import { useState } from "react";
import { Sparkles, RefreshCw, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AvatarGeneratorProps {
  userPhoto: string;
  avatarImage: string | null;
  onAvatarGenerated: (avatar: string) => void;
  onConfirm: () => void;
}

export function AvatarGenerator({
  userPhoto,
  avatarImage,
  onAvatarGenerated,
  onConfirm,
}: AvatarGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateAvatar = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-avatar", {
        body: { imageBase64: userPhoto },
      });

      if (error) throw error;

      if (data.error) {
        toast.error(data.error);
        return;
      }

      if (data.avatarImage) {
        onAvatarGenerated(data.avatarImage);
        toast.success("Avatar created successfully!");
      }
    } catch (err) {
      console.error("Avatar generation error:", err);
      toast.error("Failed to generate avatar. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="grid md:grid-cols-2 gap-8 items-center">
        {/* Original Photo */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground text-center">
            Your Photo
          </p>
          <div className="aspect-square rounded-2xl overflow-hidden shadow-lg border border-border">
            <img
              src={userPhoto}
              alt="Original photo"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Generated Avatar */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground text-center">
            Your Avatar
          </p>
          <div className="aspect-square rounded-2xl overflow-hidden shadow-lg border border-border relative">
            {avatarImage ? (
              <img
                src={avatarImage}
                alt="Generated avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center">
                {isGenerating ? (
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 mx-auto rounded-full gradient-primary animate-pulse flex items-center justify-center">
                      <Sparkles className="w-8 h-8 text-primary-foreground animate-spin" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Creating your avatar...
                    </p>
                  </div>
                ) : (
                  <div className="text-center space-y-2 p-4">
                    <Sparkles className="w-12 h-12 mx-auto text-muted-foreground/50" />
                    <p className="text-sm text-muted-foreground">
                      Click generate to create your cartoon avatar
                    </p>
                  </div>
                )}
              </div>
            )}
            {avatarImage && (
              <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent pointer-events-none" />
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        {!avatarImage ? (
          <Button
            size="lg"
            onClick={generateAvatar}
            disabled={isGenerating}
            className="gradient-primary text-primary-foreground glow-primary gap-2"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate Avatar
              </>
            )}
          </Button>
        ) : (
          <>
            <Button
              variant="outline"
              size="lg"
              onClick={generateAvatar}
              disabled={isGenerating}
              className="gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Regenerate
            </Button>
            <Button
              size="lg"
              onClick={onConfirm}
              className="gradient-primary text-primary-foreground glow-primary gap-2"
            >
              <Check className="w-4 h-4" />
              Use This Avatar
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
