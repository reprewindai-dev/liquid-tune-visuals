import { useState, useCallback } from "react";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { StepIndicator } from "@/components/StepIndicator";
import { PhotoUpload } from "@/components/PhotoUpload";
import { AvatarGenerator } from "@/components/AvatarGenerator";
import { MusicSelector } from "@/components/MusicSelector";
import { SceneSelector } from "@/components/SceneSelector";
import { VideoPreview } from "@/components/VideoPreview";
import { AppState, StepKey, Scene, Track } from "@/types/app";
import { useAudioAnalysis } from "@/hooks/useAudioAnalysis";

const stepInfo: Record<StepKey, { title: string; description: string }> = {
  upload: {
    title: "Upload Your Photo",
    description: "Take a selfie or upload a clear photo of your face",
  },
  avatar: {
    title: "Create Your Avatar",
    description: "AI will transform your photo into an animated character",
  },
  music: {
    title: "Choose Your Music",
    description: "Pick from our library or upload your own track",
  },
  scene: {
    title: "Select Your Scene",
    description: "Choose a background or describe your dream location",
  },
  preview: {
    title: "Your Music Video",
    description: "Preview your avatar performing to the music",
  },
};

const stepOrder: StepKey[] = ["upload", "avatar", "music", "scene", "preview"];

export default function Index() {
  const [state, setState] = useState<AppState>({
    step: "upload",
    userPhoto: null,
    avatarImage: null,
    selectedTrack: null,
    customAudio: null,
    selectedScene: null,
  });

  const [completedSteps, setCompletedSteps] = useState<StepKey[]>([]);
  
  // Audio analysis hook
  const { analysis, isAnalyzing, analyzeAudio, clearAnalysis } = useAudioAnalysis();

  const currentStepIndex = stepOrder.indexOf(state.step);

  const canGoNext = useCallback(() => {
    switch (state.step) {
      case "upload":
        return !!state.userPhoto;
      case "avatar":
        return !!state.avatarImage;
      case "music":
        return !!state.selectedTrack || !!state.customAudio;
      case "scene":
        return !!state.selectedScene;
      case "preview":
        return false;
      default:
        return false;
    }
  }, [state]);

  const goToStep = (step: StepKey) => {
    setState((prev) => ({ ...prev, step }));
  };

  const goNext = () => {
    if (currentStepIndex < stepOrder.length - 1 && canGoNext()) {
      const currentStep = state.step;
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps((prev) => [...prev, currentStep]);
      }
      goToStep(stepOrder[currentStepIndex + 1]);
    }
  };

  const goBack = () => {
    if (currentStepIndex > 0) {
      goToStep(stepOrder[currentStepIndex - 1]);
    }
  };

  const startOver = () => {
    setState({
      step: "upload",
      userPhoto: null,
      avatarImage: null,
      selectedTrack: null,
      customAudio: null,
      selectedScene: null,
    });
    setCompletedSteps([]);
    clearAnalysis();
  };

  const updateState = <K extends keyof AppState>(key: K, value: AppState[K]) => {
    setState((prev) => ({ ...prev, [key]: value }));
  };

  const info = stepInfo[state.step];

  return (
    <div className="min-h-screen gradient-dark">
      {/* Header */}
      <header className="border-b border-border/50 glass sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center glow-primary">
                <Sparkles className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-gradient">AvatarMV</span>
            </div>
            <StepIndicator currentStep={state.step} completedSteps={completedSteps} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card className="glass border-border/50 shadow-2xl animate-scale-in">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl md:text-3xl">{info.title}</CardTitle>
              <CardDescription className="text-base">{info.description}</CardDescription>
            </CardHeader>
            <CardContent className="p-6 md:p-8">
              {/* Step Content */}
              {state.step === "upload" && (
                <PhotoUpload
                  onPhotoSelected={(photo) => updateState("userPhoto", photo || null)}
                  currentPhoto={state.userPhoto}
                />
              )}

              {state.step === "avatar" && state.userPhoto && (
                <AvatarGenerator
                  userPhoto={state.userPhoto}
                  avatarImage={state.avatarImage}
                  onAvatarGenerated={(avatar) => updateState("avatarImage", avatar)}
                  onConfirm={goNext}
                />
              )}

              {state.step === "music" && (
                <MusicSelector
                  selectedTrack={state.selectedTrack}
                  customAudio={state.customAudio}
                  onTrackSelect={(track) => updateState("selectedTrack", track)}
                  onCustomAudioSelect={(file) => updateState("customAudio", file)}
                  analysis={analysis}
                  isAnalyzing={isAnalyzing}
                  onAnalyzeAudio={analyzeAudio}
                />
              )}

              {state.step === "scene" && (
                <SceneSelector
                  selectedScene={state.selectedScene}
                  onSceneSelect={(scene) => updateState("selectedScene", scene)}
                  analysis={analysis}
                />
              )}

              {state.step === "preview" && state.avatarImage && state.selectedScene && (
                <VideoPreview
                  avatarImage={state.avatarImage}
                  selectedScene={state.selectedScene}
                  selectedTrack={state.selectedTrack}
                  customAudio={state.customAudio}
                  onStartOver={startOver}
                />
              )}

              {/* Navigation Buttons */}
              {state.step !== "preview" && state.step !== "avatar" && (
                <div className="flex justify-between mt-8 pt-6 border-t border-border/50">
                  <Button
                    variant="ghost"
                    onClick={goBack}
                    disabled={currentStepIndex === 0}
                    className="gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </Button>
                  <Button
                    onClick={goNext}
                    disabled={!canGoNext()}
                    className="gradient-primary text-primary-foreground glow-primary gap-2"
                  >
                    Continue
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              )}

              {state.step === "avatar" && !state.avatarImage && (
                <div className="flex justify-start mt-8 pt-6 border-t border-border/50">
                  <Button
                    variant="ghost"
                    onClick={goBack}
                    className="gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 mt-auto">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p>Create personalized music videos with your AI avatar ✨</p>
        </div>
      </footer>
    </div>
  );
}
