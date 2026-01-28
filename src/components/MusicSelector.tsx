import { useState } from "react";
import { Music, Upload, Play, Pause, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Track } from "@/types/app";
import { sampleTracks } from "@/data/scenes";

interface MusicSelectorProps {
  selectedTrack: Track | null;
  customAudio: File | null;
  onTrackSelect: (track: Track | null) => void;
  onCustomAudioSelect: (file: File | null) => void;
}

export function MusicSelector({
  selectedTrack,
  customAudio,
  onTrackSelect,
  onCustomAudioSelect,
}: MusicSelectorProps) {
  const [playingId, setPlayingId] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("audio/")) {
      onCustomAudioSelect(file);
      onTrackSelect(null); // Clear library selection
    }
  };

  const togglePlay = (trackId: string) => {
    setPlayingId(playingId === trackId ? null : trackId);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <Tabs defaultValue="library" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="library" className="gap-2">
            <Music className="w-4 h-4" />
            Music Library
          </TabsTrigger>
          <TabsTrigger value="upload" className="gap-2">
            <Upload className="w-4 h-4" />
            Your Audio
          </TabsTrigger>
        </TabsList>

        <TabsContent value="library" className="space-y-4">
          <div className="grid gap-3">
            {sampleTracks.map((track) => {
              const isSelected = selectedTrack?.id === track.id;
              const isPlaying = playingId === track.id;

              return (
                <Card
                  key={track.id}
                  className={cn(
                    "cursor-pointer transition-all duration-200 hover:shadow-md",
                    isSelected && "ring-2 ring-primary glow-primary"
                  )}
                  onClick={() => {
                    onTrackSelect(track);
                    onCustomAudioSelect(null);
                  }}
                >
                  <CardContent className="p-4 flex items-center gap-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "shrink-0 rounded-full",
                        isPlaying && "gradient-primary text-primary-foreground"
                      )}
                      onClick={(e) => {
                        e.stopPropagation();
                        togglePlay(track.id);
                      }}
                    >
                      {isPlaying ? (
                        <Pause className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                    </Button>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{track.name}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {track.artist}
                      </p>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                      {track.genre}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {track.duration}
                    </span>
                    {isSelected && (
                      <div className="w-6 h-6 rounded-full gradient-primary flex items-center justify-center">
                        <Check className="w-3 h-3 text-primary-foreground" />
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="upload" className="space-y-4">
          <div 
            className="border-2 border-dashed rounded-2xl p-8 text-center transition-all hover:border-primary/50 hover:bg-muted/50 cursor-pointer relative"
            onClick={() => document.getElementById('audio-upload')?.click()}
          >
            <input
              type="file"
              accept="audio/mp3,audio/wav,audio/x-m4a,audio/mpeg,audio/*"
              onChange={handleFileUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              id="audio-upload"
              style={{ fontSize: '0' }}
            />
            <div className="pointer-events-none space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full gradient-secondary flex items-center justify-center">
                <Upload className="w-6 h-6 text-secondary-foreground" />
              </div>
              <div>
                <p className="font-medium">Upload your audio</p>
                <p className="text-sm text-muted-foreground">
                  MP3, WAV, M4A up to 50MB
                </p>
              </div>
            </div>
          </div>

          {customAudio && (
            <Card className="ring-2 ring-secondary glow-accent">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full gradient-secondary flex items-center justify-center shrink-0">
                  <Music className="w-4 h-4 text-secondary-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{customAudio.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(customAudio.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onCustomAudioSelect(null)}
                >
                  Remove
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
