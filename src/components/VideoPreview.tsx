import { useState, useEffect, useRef, useCallback } from "react";
import { Play, Pause, Download, Share2, RotateCcw, Music, Sparkles, Loader2, Film, RefreshCw, Clock, SkipForward, SkipBack } from "lucide-react";
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
  prompt?: string;
}

type GenerationStatus = 'idle' | 'selecting' | 'generating' | 'complete' | 'error';

interface VideoLength {
  id: string;
  name: string;
  clips: number;
  duration: string;
  description: string;
}

const VIDEO_LENGTHS: VideoLength[] = [
  { id: 'short', name: 'Short', clips: 2, duration: '~10s', description: 'Quick preview' },
  { id: 'medium', name: 'Medium', clips: 4, duration: '~20s', description: 'Music clip' },
  { id: 'full', name: 'Full', clips: 6, duration: '~30s', description: 'Full video' },
  { id: 'extended', name: 'Extended', clips: 10, duration: '~50s', description: 'Extended cut' },
];

export function VideoPreview({
  avatarImage,
  selectedScene,
  selectedTrack,
  customAudio,
  onStartOver,
}: VideoPreviewProps) {
  const [status, setStatus] = useState<GenerationStatus>('selecting');
  const [selectedLength, setSelectedLength] = useState<VideoLength | null>(null);
  const [progress, setProgress] = useState(0);
  const [currentGeneratingClip, setCurrentGeneratingClip] = useState(0);
  const [generatedClips, setGeneratedClips] = useState<GeneratedClip[]>([]);
  const [currentClipIndex, setCurrentClipIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [overallProgress, setOverallProgress] = useState(0);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const nextVideoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const audioUrlRef = useRef<string | null>(null);

  const musicName = customAudio?.name || selectedTrack?.name || "Your Track";
  const musicGenre = selectedTrack?.genre || "pop";

  // Create audio URL once
  useEffect(() => {
    if (customAudio && !audioUrlRef.current) {
      audioUrlRef.current = URL.createObjectURL(customAudio);
    }
    return () => {
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current);
      }
    };
  }, [customAudio]);

  // Determine mood from scene
  const getMood = (): string => {
    const sceneName = selectedScene.name.toLowerCase();
    if (sceneName.includes('neon') || sceneName.includes('cyber')) return 'energetic';
    if (sceneName.includes('sunset') || sceneName.includes('beach')) return 'chill';
    if (sceneName.includes('dark') || sceneName.includes('night')) return 'dark';
    if (sceneName.includes('forest') || sceneName.includes('nature')) return 'happy';
    return 'energetic';
  };

  const generateVideoClips = useCallback(async () => {
    if (!selectedLength) return;
    
    setStatus('generating');
    setProgress(0);
    setCurrentGeneratingClip(0);
    setErrorMessage(null);
    setGeneratedClips([]);
    
    const totalClips = selectedLength.clips;
    const clips: GeneratedClip[] = [];
    
    try {
      for (let i = 0; i < totalClips; i++) {
        setCurrentGeneratingClip(i + 1);
        setProgress((i / totalClips) * 100);
        
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
            clipIndex: i,
            prompt: data.prompt
          });
          
          // Update clips as they come in for preview
          setGeneratedClips([...clips]);
        }
        
        setProgress(((i + 1) / totalClips) * 100);
      }
      
      if (clips.length === 0) {
        throw new Error('No video clips were generated');
      }
      
      setGeneratedClips(clips);
      setStatus('complete');
      setCurrentClipIndex(0);
      toast.success(`Generated ${clips.length} video clips!`, {
        description: `Total duration: ~${clips.length * 5} seconds`
      });
    } catch (error) {
      console.error('Video generation error:', error);
      const message = error instanceof Error ? error.message : 'Failed to generate video';
      setErrorMessage(message);
      setStatus('error');
      toast.error(message);
    }
  }, [selectedLength, avatarImage, selectedScene, musicGenre]);

  // Start generation when length is selected
  useEffect(() => {
    if (selectedLength && status === 'selecting') {
      generateVideoClips();
    }
  }, [selectedLength]);

  // Handle video playback controls
  const togglePlayback = () => {
    if (!videoRef.current || generatedClips.length === 0) return;
    
    if (isPlaying) {
      videoRef.current.pause();
      audioRef.current?.pause();
    } else {
      videoRef.current.play();
      audioRef.current?.play();
    }
    setIsPlaying(!isPlaying);
  };

  // Preload next video
  useEffect(() => {
    if (generatedClips.length > 1 && nextVideoRef.current) {
      const nextIndex = (currentClipIndex + 1) % generatedClips.length;
      nextVideoRef.current.src = generatedClips[nextIndex]?.videoUrl || '';
      nextVideoRef.current.load();
    }
  }, [currentClipIndex, generatedClips]);

  // Handle video ending - seamless transition
  const handleVideoEnded = () => {
    if (generatedClips.length > 1) {
      const nextIndex = (currentClipIndex + 1) % generatedClips.length;
      
      // If we've completed all clips, stop
      if (nextIndex === 0) {
        setIsPlaying(false);
        setCurrentClipIndex(0);
        if (audioRef.current) {
          audioRef.current.currentTime = 0;
          audioRef.current.pause();
        }
        return;
      }
      
      setCurrentClipIndex(nextIndex);
    } else {
      setIsPlaying(false);
    }
  };

  // Auto-play next clip
  useEffect(() => {
    if (isPlaying && videoRef.current && status === 'complete') {
      videoRef.current.play().catch(console.error);
    }
  }, [currentClipIndex, isPlaying, status]);

  // Track overall progress
  const handleTimeUpdate = () => {
    if (!videoRef.current || generatedClips.length === 0) return;
    
    const clipProgress = videoRef.current.currentTime / (videoRef.current.duration || 5);
    const overall = ((currentClipIndex + clipProgress) / generatedClips.length) * 100;
    setOverallProgress(overall);
  };

  // Skip to specific clip
  const skipToClip = (index: number) => {
    setCurrentClipIndex(index);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
    }
  };

  // Skip forward/backward
  const skipForward = () => {
    if (currentClipIndex < generatedClips.length - 1) {
      skipToClip(currentClipIndex + 1);
    }
  };

  const skipBackward = () => {
    if (currentClipIndex > 0) {
      skipToClip(currentClipIndex - 1);
    }
  };

  // Download all clips as zip or individual
  const handleDownload = async () => {
    if (generatedClips.length === 0) {
      toast.error('No video to download');
      return;
    }
    
    toast.info('Downloading clips...', { description: 'This may take a moment' });
    
    try {
      for (let i = 0; i < generatedClips.length; i++) {
        const clip = generatedClips[i];
        const response = await fetch(clip.videoUrl);
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `music-video-clip-${i + 1}.mp4`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        // Small delay between downloads
        await new Promise(r => setTimeout(r, 500));
      }
      
      toast.success(`Downloaded ${generatedClips.length} clips!`, {
        description: 'Use a video editor to stitch them together'
      });
    } catch (error) {
      toast.error('Failed to download videos');
    }
  };

  // Download current clip only
  const handleDownloadCurrent = async () => {
    if (generatedClips.length === 0) return;
    
    try {
      const clip = generatedClips[currentClipIndex];
      const response = await fetch(clip.videoUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `music-video-clip-${currentClipIndex + 1}.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Clip downloaded!');
    } catch (error) {
      toast.error('Failed to download clip');
    }
  };

  const handleShare = () => {
    toast.info("Sharing features coming soon!");
  };

  // Length selection screen
  if (status === 'selecting') {
    return (
      <div className="space-y-6 animate-fade-in">
        <Card className="overflow-hidden shadow-2xl">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center mx-auto mb-4">
                <Film className="w-10 h-10 text-primary-foreground" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Choose Video Length</h2>
              <p className="text-muted-foreground">
                Select how long you want your music video to be
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {VIDEO_LENGTHS.map((length) => (
                <button
                  key={length.id}
                  onClick={() => setSelectedLength(length)}
                  className={`p-4 rounded-xl border-2 transition-all text-left hover:scale-105 ${
                    selectedLength?.id === length.id
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-primary" />
                    <span className="font-semibold">{length.name}</span>
                  </div>
                  <p className="text-2xl font-bold text-primary mb-1">{length.duration}</p>
                  <p className="text-xs text-muted-foreground">{length.clips} clips</p>
                  <p className="text-xs text-muted-foreground mt-1">{length.description}</p>
                </button>
              ))}
            </div>
            
            <div className="flex justify-center gap-4">
              <Button variant="outline" onClick={onStartOver}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Generation progress screen
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
            <p className="text-muted-foreground mb-2 text-center max-w-md">
              AI is animating your avatar in the {selectedScene.name} scene
            </p>
            <p className="text-sm text-primary mb-6">
              Generating clip {currentGeneratingClip} of {selectedLength?.clips || 0}
            </p>
            
            <div className="w-full max-w-md space-y-3">
              <Progress value={progress} className="h-3" />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{Math.round(progress)}% complete</span>
                <span>~{Math.ceil(((selectedLength?.clips || 0) - currentGeneratingClip) * 0.5)} min remaining</span>
              </div>
            </div>
            
            {/* Show generated clips preview */}
            {generatedClips.length > 0 && (
              <div className="mt-6 flex gap-2">
                {generatedClips.map((clip, idx) => (
                  <div key={idx} className="w-16 h-10 rounded overflow-hidden border-2 border-primary">
                    <video src={clip.videoUrl} className="w-full h-full object-cover" muted />
                  </div>
                ))}
                {Array.from({ length: (selectedLength?.clips || 0) - generatedClips.length }).map((_, idx) => (
                  <div key={`pending-${idx}`} className="w-16 h-10 rounded bg-muted animate-pulse" />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error screen
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
              <Button onClick={() => { setStatus('selecting'); setSelectedLength(null); }}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Video player screen
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Video Preview Area */}
      <Card className="overflow-hidden shadow-2xl">
        <CardContent className="p-0 relative aspect-video bg-black">
          {generatedClips.length > 0 ? (
            <>
              {/* Main Video Player */}
              <video
                ref={videoRef}
                src={generatedClips[currentClipIndex]?.videoUrl}
                className="w-full h-full object-contain"
                onEnded={handleVideoEnded}
                onTimeUpdate={handleTimeUpdate}
                playsInline
              />
              
              {/* Preload next video (hidden) */}
              <video
                ref={nextVideoRef}
                className="hidden"
                preload="auto"
                muted
              />
              
              {/* Audio Track */}
              {audioUrlRef.current && (
                <audio
                  ref={audioRef}
                  src={audioUrlRef.current}
                />
              )}
              
              {/* Play/Pause Overlay */}
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

              {/* Timeline Progress */}
              <div className="absolute bottom-20 left-4 right-4">
                <div className="flex gap-1 mb-2">
                  {generatedClips.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => skipToClip(idx)}
                      className={`flex-1 h-1.5 rounded-full transition-all ${
                        idx < currentClipIndex
                          ? 'bg-primary'
                          : idx === currentClipIndex
                          ? 'bg-primary/70'
                          : 'bg-white/30'
                      }`}
                      title={`Clip ${idx + 1}`}
                    />
                  ))}
                </div>
                <div className="flex justify-between text-xs text-white/70">
                  <span>Clip {currentClipIndex + 1}/{generatedClips.length}</span>
                  <span>{Math.round(overallProgress)}%</span>
                </div>
              </div>

              {/* Skip Controls */}
              <div className="absolute top-1/2 left-4 -translate-y-1/2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={skipBackward}
                  disabled={currentClipIndex === 0}
                  className="text-white/70 hover:text-white hover:bg-white/20"
                >
                  <SkipBack className="w-6 h-6" />
                </Button>
              </div>
              <div className="absolute top-1/2 right-4 -translate-y-1/2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={skipForward}
                  disabled={currentClipIndex === generatedClips.length - 1}
                  className="text-white/70 hover:text-white hover:bg-white/20"
                >
                  <SkipForward className="w-6 h-6" />
                </Button>
              </div>
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
                  {isPlaying ? "Now Playing" : "Click to play"} • {generatedClips.length * 5}s total
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

      {/* Clip Thumbnails */}
      <Card>
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground mb-3">Video Timeline</p>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {generatedClips.map((clip, idx) => (
              <button
                key={idx}
                onClick={() => skipToClip(idx)}
                className={`flex-shrink-0 w-24 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                  idx === currentClipIndex
                    ? 'border-primary ring-2 ring-primary/30'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <video
                  src={clip.videoUrl}
                  className="w-full h-full object-cover"
                  muted
                />
              </button>
            ))}
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
      <div className="flex flex-col sm:flex-row gap-4 justify-center flex-wrap">
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
          onClick={() => { setStatus('selecting'); setSelectedLength(null); }}
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
          variant="outline"
          size="lg"
          onClick={handleDownloadCurrent}
          disabled={generatedClips.length === 0}
          className="gap-2"
        >
          <Download className="w-4 h-4" />
          Download Clip
        </Button>
        <Button
          size="lg"
          onClick={handleDownload}
          disabled={generatedClips.length === 0}
          className="gradient-primary text-primary-foreground glow-primary gap-2"
        >
          <Download className="w-4 h-4" />
          Download All ({generatedClips.length})
        </Button>
      </div>

      <p className="text-center text-sm text-muted-foreground">
        🎬 {generatedClips.length} AI-animated clips • {selectedLength?.name} format • ~{generatedClips.length * 5}s total
      </p>
    </div>
  );
}
