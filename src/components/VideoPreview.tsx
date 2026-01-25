import { useState, useEffect } from "react";
import { Play, Download, Share2, RotateCcw, Music, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Scene, Track } from "@/types/app";
import { toast } from "sonner";

interface VideoPreviewProps {
  avatarImage: string;
  selectedScene: Scene;
  selectedTrack: Track | null;
  customAudio: File | null;
  onStartOver: () => void;
}

export function VideoPreview({
  avatarImage,
  selectedScene,
  selectedTrack,
  customAudio,
  onStartOver,
}: VideoPreviewProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [animationPhase, setAnimationPhase] = useState(0);

  // Simulate animation phases for avatar movement
  useEffect(() => {
    if (!isPlaying) return;
    
    const interval = setInterval(() => {
      setAnimationPhase((prev) => (prev + 1) % 4);
    }, 500);

    return () => clearInterval(interval);
  }, [isPlaying]);

  const handleDownload = () => {
    toast.info("Video export coming soon! This is a preview of your music video concept.");
  };

  const handleShare = () => {
    toast.info("Sharing features coming soon!");
  };

  const musicName = customAudio?.name || selectedTrack?.name || "Your Track";

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Video Preview Area */}
      <Card className="overflow-hidden shadow-2xl">
        <CardContent className="p-0 relative aspect-video">
          {/* Background Scene */}
          <img
            src={selectedScene.image}
            alt={selectedScene.name}
            className="absolute inset-0 w-full h-full object-cover"
          />
          
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-background/40 via-transparent to-background/20" />
          
          {/* Avatar Container */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div 
              className={`relative transition-all duration-300 ${
                isPlaying ? 'animate-float' : ''
              }`}
              style={{
                transform: isPlaying 
                  ? `translateY(${Math.sin(animationPhase) * 5}px) scale(${1 + Math.sin(animationPhase * 0.5) * 0.02})`
                  : 'none'
              }}
            >
              {/* Glow effect behind avatar */}
              <div className="absolute inset-0 blur-2xl opacity-50 gradient-primary rounded-full scale-110" />
              
              {/* Avatar */}
              <div className="relative w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden border-4 border-primary/50 shadow-2xl">
                <img
                  src={avatarImage}
                  alt="Your avatar"
                  className="w-full h-full object-cover"
                />
                
                {/* Lip sync indicator when playing */}
                {isPlaying && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                    <div className="flex items-end gap-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div
                          key={i}
                          className="w-1 bg-primary-foreground rounded-full transition-all duration-150"
                          style={{
                            height: `${8 + Math.random() * 16}px`,
                            opacity: 0.8,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Play/Pause Button Overlay */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="absolute inset-0 w-full h-full flex items-center justify-center bg-background/0 hover:bg-background/10 transition-colors group"
          >
            <div className={`
              w-20 h-20 rounded-full gradient-primary flex items-center justify-center
              opacity-0 group-hover:opacity-100 transition-opacity shadow-2xl
              ${!isPlaying ? 'opacity-80' : ''}
            `}>
              {isPlaying ? (
                <div className="flex gap-1">
                  <div className="w-2 h-8 bg-primary-foreground rounded" />
                  <div className="w-2 h-8 bg-primary-foreground rounded" />
                </div>
              ) : (
                <Play className="w-8 h-8 text-primary-foreground ml-1" />
              )}
            </div>
          </button>

          {/* Now Playing Badge */}
          <div className="absolute bottom-4 left-4 right-4">
            <div className="glass rounded-xl p-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center shrink-0">
                <Music className="w-5 h-5 text-primary-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{musicName}</p>
                <p className="text-sm text-muted-foreground">
                  {isPlaying ? "Now Playing" : "Click to preview"}
                </p>
              </div>
              {isPlaying && (
                <div className="flex items-end gap-0.5">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="w-1 bg-primary rounded-full animate-pulse"
                      style={{
                        height: `${12 + i * 4}px`,
                        animationDelay: `${i * 0.1}s`,
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Info Cards */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0">
              <img
                src={avatarImage}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avatar</p>
              <p className="font-medium flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-primary" />
                AI Generated
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0">
              <img
                src={selectedScene.image}
                alt="Scene"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Scene</p>
              <p className="font-medium">{selectedScene.name}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button
          variant="outline"
          size="lg"
          onClick={onStartOver}
          className="gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          Start Over
        </Button>
        <Button
          variant="outline"
          size="lg"
          onClick={handleShare}
          className="gap-2"
        >
          <Share2 className="w-4 h-4" />
          Share
        </Button>
        <Button
          size="lg"
          onClick={handleDownload}
          className="gradient-primary text-primary-foreground glow-primary gap-2"
        >
          <Download className="w-4 h-4" />
          Export Video
        </Button>
      </div>

      <p className="text-center text-sm text-muted-foreground">
        🎬 This is a preview of your music video concept. Full video generation with lip sync and dance moves coming soon!
      </p>
    </div>
  );
}
