import { useState, useEffect, useRef } from "react";
import { Play, Pause, Download, Share2, RotateCcw, Music, Sparkles, Loader2, Film, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Scene, Track } from "@/types/app";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface VideoPreviewProps {
  avatarImage: string;
  selectedScene: Scene;
  selectedTrack: Track | null;
  customAudio: File | null;
  onStartOver: () => void;
}

interface GeneratedClip {
  videoUrl: string;
  clipIndex: number;
}

type GenerationStatus = 'idle' | 'generating' | 'complete' | 'error';

export function VideoPreview({
  avatarImage,
  selectedScene,
  selectedTrack,
  customAudio,
  onStartOver,
}: VideoPreviewProps) {
  const [status, setStatus] = useState<GenerationStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [generatedClips, setGeneratedClips] = useState<GeneratedClip[]>([]);
  const [currentClipIndex, setCurrentClipIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const musicName = customAudio?.name || selectedTrack?.name || "Your Track";
  const musicGenre = selectedTrack?.genre || "pop";

  // Determine mood from scene or track
  const getMood = (): string => {
    const sceneName = selectedScene.name.toLowerCase();
    if (sceneName.includes('neon') || sceneName.includes('cyber')) return 'energetic';
    if (sceneName.includes('sunset') || sceneName.includes('beach')) return 'chill';
    if (sceneName.includes('dark') || sceneName.includes('night')) return 'dark';
    if (sceneName.includes('forest') || sceneName.includes('nature')) return 'happy';
    return 'energetic';
  };

  const generateVideoClips = async () => {
    setStatus('generating');
    setProgress(0);
    setErrorMessage(null);
    
    const totalClips = 3; // Generate 3 clips for variety
    const clips: GeneratedClip[] = [];
    
    try {
      for (let i = 0; i < totalClips; i++) {
        setProgress(((i) / totalClips) * 100);
        
        console.log(`Generating clip ${i + 1}/${totalClips}...`);
        
        const { data, error } = await supabase.functions.invoke('generate-video-clip', {
          body: {
            avatarImage,
            sceneDescription: selectedScene.name,
            musicGenre,
            mood: getMood(),
            clipIndex: i
          }
        });

        if (error) {
          throw new Error(error.message || 'Failed to generate video clip');
        }

        if (data?.error) {
          throw new Error(data.error);
        }

        if (data?.videoUrl) {
          clips.push({
            videoUrl: data.videoUrl,
            clipIndex: i
          });
        }
        
        setProgress(((i + 1) / totalClips) * 100);
      }
      
      if (clips.length === 0) {
        throw new Error('No video clips were generated');
      }
      
      setGeneratedClips(clips);
      setStatus('complete');
      toast.success(`Generated ${clips.length} video clips!`);
    } catch (error) {
      console.error('Video generation error:', error);
      const message = error instanceof Error ? error.message : 'Failed to generate video';
      setErrorMessage(message);
      setStatus('error');
      toast.error(message);
    }
  };

  // Auto-start generation on mount
  useEffect(() => {
    if (status === 'idle') {
      generateVideoClips();
    }
  }, []);

  // Handle video playback
  const togglePlayback = () => {
    if (!videoRef.current) return;
    
    if (isPlaying) {
      videoRef.current.pause();
      audioRef.current?.pause();
    } else {
      videoRef.current.play();
      audioRef.current?.play();
    }
    setIsPlaying(!isPlaying);
  };

  // Cycle through clips
  const handleVideoEnded = () => {
    if (generatedClips.length > 1) {
      const nextIndex = (currentClipIndex + 1) % generatedClips.length;
      setCurrentClipIndex(nextIndex);
    } else {
      setIsPlaying(false);
    }
  };

  // Auto-play next clip when index changes
  useEffect(() => {
    if (isPlaying && videoRef.current) {
      videoRef.current.play();
    }
  }, [currentClipIndex]);

  const handleDownload = async () => {
    if (generatedClips.length === 0) {
      toast.error('No video to download');
      return;
    }
    
    try {
      const response = await fetch(generatedClips[currentClipIndex].videoUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `music-video-${Date.now()}.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Video downloaded!');
    } catch (error) {
      toast.error('Failed to download video');
    }
  };

  const handleShare = () => {
    toast.info("Sharing features coming soon!");
  };

  // Rendering based on status
  if (status === 'generating') {
    return (
      <div className="space-y-6 animate-fade-in">
        <Card className="overflow-hidden shadow-2xl">
          <CardContent className="p-8 flex flex-col items-center justify-center min-h-[400px] bg-gradient-to-br from-background to-muted">
            <div className="relative mb-6">
              <div className="w-24 h-24 rounded-full gradient-primary flex items-center justify-center animate-pulse">
                <Film className="w-12 h-12 text-primary-foreground" />
              </div>
              <Loader2 className="absolute -bottom-2 -right-2 w-8 h-8 text-primary animate-spin" />
            </div>
            
            <h3 className="text-xl font-semibold mb-2">Creating Your Music Video</h3>
            <p className="text-muted-foreground mb-6 text-center max-w-md">
              AI is animating your avatar in the {selectedScene.name} scene with {musicGenre} vibes...
            </p>
            
            <div className="w-full max-w-md space-y-2">
              <Progress value={progress} className="h-3" />
              <p className="text-sm text-muted-foreground text-center">
                {Math.round(progress)}% complete
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="space-y-6 animate-fade-in">
        <Card className="overflow-hidden shadow-2xl">
          <CardContent className="p-8 flex flex-col items-center justify-center min-h-[400px]">
            <div className="w-20 h-20 rounded-full bg-destructive/20 flex items-center justify-center mb-6">
              <Film className="w-10 h-10 text-destructive" />
            </div>
            
            <h3 className="text-xl font-semibold mb-2">Generation Failed</h3>
            <p className="text-muted-foreground mb-6 text-center max-w-md">
              {errorMessage || 'Something went wrong while creating your video.'}
            </p>
            
            <div className="flex gap-4">
              <Button variant="outline" onClick={onStartOver}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Start Over
              </Button>
              <Button onClick={generateVideoClips}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Video Preview Area */}
      <Card className="overflow-hidden shadow-2xl">
        <CardContent className="p-0 relative aspect-video bg-black">
          {generatedClips.length > 0 ? (
            <>
              {/* Video Player */}
              <video
                ref={videoRef}
                src={generatedClips[currentClipIndex]?.videoUrl}
                className="w-full h-full object-contain"
                onEnded={handleVideoEnded}
                loop={generatedClips.length === 1}
                playsInline
              />
              
              {/* Audio Track (if custom audio provided) */}
              {customAudio && (
                <audio
                  ref={audioRef}
                  src={URL.createObjectURL(customAudio)}
                  loop
                />
              )}
              
              {/* Play/Pause Button Overlay */}
              <button
                onClick={togglePlayback}
                className="absolute inset-0 w-full h-full flex items-center justify-center bg-black/0 hover:bg-black/20 transition-colors group"
              >
                <div className={`
                  w-20 h-20 rounded-full gradient-primary flex items-center justify-center
                  opacity-0 group-hover:opacity-100 transition-opacity shadow-2xl
                  ${!isPlaying ? 'opacity-80' : ''}
                `}>
                  {isPlaying ? (
                    <Pause className="w-8 h-8 text-primary-foreground" />
                  ) : (
                    <Play className="w-8 h-8 text-primary-foreground ml-1" />
                  )}
                </div>
              </button>

              {/* Clip Indicator */}
              {generatedClips.length > 1 && (
                <div className="absolute top-4 right-4 flex gap-1">
                  {generatedClips.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentClipIndex(idx)}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        idx === currentClipIndex ? 'bg-primary' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          )}

          {/* Now Playing Badge */}
          <div className="absolute bottom-4 left-4 right-4">
            <div className="glass rounded-xl p-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center shrink-0">
                <Music className="w-5 h-5 text-primary-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate text-white">{musicName}</p>
                <p className="text-sm text-white/70">
                  {isPlaying ? "Now Playing" : "Click to play"}
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
          onClick={() => generateVideoClips()}
          className="gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Regenerate
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
          disabled={generatedClips.length === 0}
          className="gradient-primary text-primary-foreground glow-primary gap-2"
        >
          <Download className="w-4 h-4" />
          Download Video
        </Button>
      </div>

      <p className="text-center text-sm text-muted-foreground">
        🎬 AI-generated animated video based on your avatar and music style
      </p>
    </div>
  );
}
