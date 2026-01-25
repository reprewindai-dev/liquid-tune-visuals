import { useState } from "react";
import { Film, Sparkles, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Scene } from "@/types/app";
import { premadeScenes } from "@/data/scenes";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SceneSelectorProps {
  selectedScene: Scene | null;
  onSceneSelect: (scene: Scene | null) => void;
}

export function SceneSelector({ selectedScene, onSceneSelect }: SceneSelectorProps) {
  const [customDescription, setCustomDescription] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedScenes, setGeneratedScenes] = useState<Scene[]>([]);

  const generateCustomScene = async () => {
    if (!customDescription.trim()) {
      toast.error("Please describe your scene first");
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-scene", {
        body: { description: customDescription },
      });

      if (error) throw error;

      if (data.error) {
        toast.error(data.error);
        return;
      }

      if (data.sceneImage) {
        const newScene: Scene = {
          id: `custom-${Date.now()}`,
          name: customDescription.slice(0, 30) + (customDescription.length > 30 ? "..." : ""),
          image: data.sceneImage,
          isCustom: true,
        };
        setGeneratedScenes((prev) => [newScene, ...prev]);
        onSceneSelect(newScene);
        toast.success("Scene generated!");
        setCustomDescription("");
      }
    } catch (err) {
      console.error("Scene generation error:", err);
      toast.error("Failed to generate scene. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const allScenes = [...generatedScenes, ...premadeScenes];

  return (
    <div className="space-y-6 animate-fade-in">
      <Tabs defaultValue="premade" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="premade" className="gap-2">
            <Film className="w-4 h-4" />
            Pre-made Scenes
          </TabsTrigger>
          <TabsTrigger value="custom" className="gap-2">
            <Sparkles className="w-4 h-4" />
            AI Generate
          </TabsTrigger>
        </TabsList>

        <TabsContent value="premade" className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {allScenes.map((scene) => {
              const isSelected = selectedScene?.id === scene.id;

              return (
                <Card
                  key={scene.id}
                  className={cn(
                    "cursor-pointer overflow-hidden transition-all duration-200 hover:shadow-lg hover:scale-[1.02]",
                    isSelected && "ring-2 ring-primary glow-primary"
                  )}
                  onClick={() => onSceneSelect(scene)}
                >
                  <CardContent className="p-0 relative">
                    <div className="aspect-video">
                      <img
                        src={scene.image}
                        alt={scene.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <p className="text-sm font-medium truncate">{scene.name}</p>
                      {scene.isCustom && (
                        <span className="text-xs text-primary">AI Generated</span>
                      )}
                    </div>
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-6 h-6 rounded-full gradient-primary flex items-center justify-center">
                        <Check className="w-3 h-3 text-primary-foreground" />
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="custom" className="space-y-4">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Describe your scene
                </label>
                <Textarea
                  placeholder="e.g., Neon-lit Tokyo street at night with rain reflecting the colorful signs..."
                  value={customDescription}
                  onChange={(e) => setCustomDescription(e.target.value)}
                  className="min-h-[100px] resize-none"
                />
              </div>
              <Button
                onClick={generateCustomScene}
                disabled={isGenerating || !customDescription.trim()}
                className="w-full gradient-accent text-accent-foreground gap-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating Scene...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate Scene
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {generatedScenes.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm font-medium text-muted-foreground">
                Your Generated Scenes
              </p>
              <div className="grid grid-cols-2 gap-4">
                {generatedScenes.map((scene) => {
                  const isSelected = selectedScene?.id === scene.id;
                  return (
                    <Card
                      key={scene.id}
                      className={cn(
                        "cursor-pointer overflow-hidden transition-all duration-200 hover:shadow-lg",
                        isSelected && "ring-2 ring-primary"
                      )}
                      onClick={() => onSceneSelect(scene)}
                    >
                      <CardContent className="p-0 relative">
                        <div className="aspect-video">
                          <img
                            src={scene.image}
                            alt={scene.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-background/80 to-transparent">
                          <p className="text-xs truncate">{scene.name}</p>
                        </div>
                        {isSelected && (
                          <div className="absolute top-2 right-2 w-5 h-5 rounded-full gradient-primary flex items-center justify-center">
                            <Check className="w-3 h-3 text-primary-foreground" />
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
