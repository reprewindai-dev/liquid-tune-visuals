import { Check, Camera, Sparkles, Music, Film, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { StepKey } from "@/types/app";

interface Step {
  key: StepKey;
  label: string;
  icon: React.ReactNode;
}

const steps: Step[] = [
  { key: "upload", label: "Photo", icon: <Camera className="w-4 h-4" /> },
  { key: "avatar", label: "Avatar", icon: <Sparkles className="w-4 h-4" /> },
  { key: "music", label: "Music", icon: <Music className="w-4 h-4" /> },
  { key: "scene", label: "Scene", icon: <Film className="w-4 h-4" /> },
  { key: "preview", label: "Preview", icon: <Play className="w-4 h-4" /> },
];

interface StepIndicatorProps {
  currentStep: StepKey;
  completedSteps: StepKey[];
}

export function StepIndicator({ currentStep, completedSteps }: StepIndicatorProps) {
  const currentIndex = steps.findIndex((s) => s.key === currentStep);

  return (
    <div className="flex items-center justify-center gap-2 md:gap-4">
      {steps.map((step, index) => {
        const isCompleted = completedSteps.includes(step.key);
        const isCurrent = step.key === currentStep;
        const isPast = index < currentIndex;

        return (
          <div key={step.key} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300",
                  isCompleted && "gradient-primary text-primary-foreground glow-primary",
                  isCurrent && !isCompleted && "gradient-primary text-primary-foreground animate-pulse-glow",
                  !isCurrent && !isCompleted && "bg-muted text-muted-foreground"
                )}
              >
                {isCompleted ? <Check className="w-4 h-4" /> : step.icon}
              </div>
              <span
                className={cn(
                  "text-xs font-medium hidden md:block",
                  (isCurrent || isCompleted) && "text-foreground",
                  !isCurrent && !isCompleted && "text-muted-foreground"
                )}
              >
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "w-8 md:w-12 h-0.5 mx-2 transition-colors duration-300",
                  isPast || isCompleted ? "gradient-primary" : "bg-muted"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
