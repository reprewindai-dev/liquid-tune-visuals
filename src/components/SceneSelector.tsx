import { useState, useEffect } from "react";
import { Film, Sparkles, Check, Loader2, Zap, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Scene } from "@/types/app";
import { premadeScenes } from "@/data/scenes";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AudioAnalysisResult } from "@/types/audioAnalysis";
import { SCENE_TYPE_TO_ID } from "@/lib/visualMappingEngine";

interface SceneSelectorProps {
  selectedScene: Scene | null;
  onSceneSelect: (scene: Scene | null) => void;
  analysis?: AudioAnalysisResult | null;
}

export function SceneSelector({ selectedScene, onSceneSelect, analysis }: SceneSelectorProps) {
  const [customDescription, setCustomDescription] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedScenes, setGeneratedScenes] = useState<Scene[]>([]);

  // Get recommended scene ID from analysis
  const recommendedSceneId = analysis?.visualRecommendations
    ? SCENE_TYPE_TO_ID[analysis.visualRecommendations.recommendedSceneType]
    : null;

  // Auto-select recommended scene when analysis is available
  useEffect(() => {
    if (recommendedSceneId && !selectedScene) {
      const recommended = premadeScenes.find(s => s.id === recommendedSceneId);
      if (recommended) {
        onSceneSelect(recommended);
        toast.success('AI selected a scene based on your track!', {
          description: analysis?.visualRecommendations?.rationale?.slice(0, 100) + '...',
        });
      }
    }
  }, [recommendedSceneId]);

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

  // Sort scenes to show recommended first
  const sortedScenes = recommendedSceneId
    ? [
        ...allScenes.filter(s => s.id === recommendedSceneId),
        ...allScenes.filter(s => s.id !== recommendedSceneId),
      ]
    : allScenes;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* AI Recommendation Banner */}
      {analysis?.visualRecommendations && (
        <Card className="border-primary/30 bg-gradient-to-r from-primary/10 to-secondary/10">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center shrink-0">
                <Zap className="w-5 h-5 text-primary-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold flex items-center gap-2">
                  AI Scene Recommendation
                  <Badge variant="outline" className="bg-primary/10 text-xs">
                    Based on your track
                  </Badge>
                </h4>
                <p className="text-sm text-muted-foreground mt-1">
                  {analysis.visualRecommendations.rationale}
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge className="bg-primary/20 text-primary border-0">
                    {analysis.visualRecommendations.colorPalette.replace(/_/g, ' ')} palette
                  </Badge>
                  <Badge className="bg-secondary/20 text-secondary border-0">
                    {analysis.visualRecommendations.lightingStyle.replace(/_/g, ' ')} lighting
                  </Badge>
                  <Badge className="bg-accent/20 text-accent-foreground border-0">
                    {analysis.visualRecommendations.aesthetic.replace(/_/g, ' ')} aesthetic
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="premade" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="premade" className="gap-2">
            <Film className="w-4 h-4" />
            {analysis ? 'AI Recommended' : 'Pre-made Scenes'}
          </TabsTrigger>
          <TabsTrigger value="custom" className="gap-2">
            <Sparkles className="w-4 h-4" />
            AI Generate
          </TabsTrigger>
        </TabsList>

        <TabsContent value="premade" className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {sortedScenes.map((scene, index) => {
              const isSelected = selectedScene?.id === scene.id;
              const isRecommended = scene.id === recommendedSceneId;

              return (
                <Card
                  key={scene.id}
                  className={cn(
                    "cursor-pointer overflow-hidden transition-all duration-200 hover:shadow-lg hover:scale-[1.02]",
                    isSelected && "ring-2 ring-primary glow-primary",
                    isRecommended && !isSelected && "ring-2 ring-secondary/50"
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
                    {isRecommended && (
                      <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 rounded-full bg-secondary/90 text-secondary-foreground text-xs">
                        <Star className="w-3 h-3" />
                        AI Pick
                      </div>
                    )}
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
                  placeholder={
                    analysis
                      ? `Based on your ${analysis.subGenre.replace(/_/g, ' ')} track, try: "${analysis.mood === 'dark' ? 'Dark warehouse with red neon lights and smoke' : analysis.mood === 'party' ? 'VIP club section with bottle service and strobe lights' : 'Luxury penthouse overlooking city skyline at night'}"`
                      : "e.g., Neon-lit Tokyo street at night with rain reflecting the colorful signs..."
                  }
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
