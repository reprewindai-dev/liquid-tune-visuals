import { Music, Loader2, Zap, Heart, Gauge, Volume2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AudioAnalysisResult, TEMPO_RANGES, ENERGY_DESCRIPTIONS, MOOD_CHARACTERISTICS, SUBGENRE_INFO } from "@/types/audioAnalysis";

interface AnalysisDisplayProps {
  analysis: AudioAnalysisResult | null;
  isAnalyzing: boolean;
}

export function AnalysisDisplay({ analysis, isAnalyzing }: AnalysisDisplayProps) {
  if (isAnalyzing) {
    return (
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center animate-pulse">
              <Music className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                <span className="font-medium">Analyzing your track...</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Detecting tempo, mood, genre, and production style
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analysis) {
    return null;
  }

  const tempoInfo = TEMPO_RANGES[analysis.tempoClass];
  const energyDesc = ENERGY_DESCRIPTIONS[analysis.energy];
  const moodChars = MOOD_CHARACTERISTICS[analysis.mood];
  const genreInfo = SUBGENRE_INFO[analysis.subGenre];

  return (
    <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-secondary/5 overflow-hidden">
      <CardContent className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h4 className="font-semibold text-lg flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              Track Analysis
            </h4>
            <p className="text-sm text-muted-foreground">AI-powered audio breakdown</p>
          </div>
          <Badge variant="outline" className="bg-primary/10">
            {analysis.confidence.overall}% Confidence
          </Badge>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* BPM */}
          <div className="p-3 rounded-lg bg-background/60 border border-border/50">
            <div className="text-xs text-muted-foreground uppercase tracking-wide">Tempo</div>
            <div className="text-2xl font-bold text-primary">{analysis.bpm}</div>
            <div className="text-xs text-muted-foreground">{tempoInfo.label}</div>
          </div>

          {/* Energy */}
          <div className="p-3 rounded-lg bg-background/60 border border-border/50">
            <div className="text-xs text-muted-foreground uppercase tracking-wide">Energy</div>
            <div className="text-2xl font-bold text-secondary">{analysis.energy}/10</div>
            <div className="text-xs text-muted-foreground">{energyDesc}</div>
          </div>

          {/* Mood */}
          <div className="p-3 rounded-lg bg-background/60 border border-border/50">
            <div className="text-xs text-muted-foreground uppercase tracking-wide">Mood</div>
            <div className="text-lg font-bold capitalize">{analysis.mood}</div>
            <div className="text-xs text-muted-foreground">{moodChars[0]}</div>
          </div>

          {/* Genre */}
          <div className="p-3 rounded-lg bg-background/60 border border-border/50">
            <div className="text-xs text-muted-foreground uppercase tracking-wide">Genre</div>
            <div className="text-lg font-bold">{genreInfo.label}</div>
            <div className="text-xs text-muted-foreground">{genreInfo.bpmRange[0]}-{genreInfo.bpmRange[1]} BPM typical</div>
          </div>
        </div>

        {/* Production Details */}
        <div className="space-y-2">
          <h5 className="text-sm font-medium flex items-center gap-2">
            <Volume2 className="w-3 h-3" />
            Production Characteristics
          </h5>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="text-xs">
              {analysis.vocalStyle === 'none' ? 'Instrumental' : `Vocals: ${analysis.vocalStyle}`}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              Bass: {analysis.bassIntensity}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              Density: {analysis.instrumentalDensity}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {analysis.keySignature} key
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {analysis.productionStyle} production
            </Badge>
          </div>
        </div>

        {/* Visual Recommendations Preview */}
        {analysis.visualRecommendations && (
          <div className="space-y-2 pt-2 border-t border-border/50">
            <h5 className="text-sm font-medium flex items-center gap-2">
              <Heart className="w-3 h-3 text-primary" />
              AI Visual Recommendation
            </h5>
            <p className="text-sm text-muted-foreground">
              {analysis.visualRecommendations.rationale}
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge className="bg-primary/20 text-primary border-0">
                {analysis.visualRecommendations.recommendedSceneType.replace(/_/g, ' ')}
              </Badge>
              <Badge className="bg-secondary/20 text-secondary border-0">
                {analysis.visualRecommendations.colorPalette.replace(/_/g, ' ')}
              </Badge>
              <Badge className="bg-accent/20 text-accent-foreground border-0">
                {analysis.visualRecommendations.animationIntensity} animation
              </Badge>
            </div>
          </div>
        )}

        {/* Confidence Bars */}
        <div className="grid grid-cols-3 gap-3 pt-2">
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Genre</span>
              <span>{analysis.confidence.genre}%</span>
            </div>
            <Progress value={analysis.confidence.genre} className="h-1" />
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Mood</span>
              <span>{analysis.confidence.mood}%</span>
            </div>
            <Progress value={analysis.confidence.mood} className="h-1" />
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Tempo</span>
              <span>{analysis.confidence.tempo}%</span>
            </div>
            <Progress value={analysis.confidence.tempo} className="h-1" />
          </div>
        </div>

        {/* Description */}
        {analysis.description && (
          <p className="text-sm italic text-muted-foreground bg-muted/30 p-3 rounded-lg">
            "{analysis.description}"
          </p>
        )}
      </CardContent>
    </Card>
  );
}
