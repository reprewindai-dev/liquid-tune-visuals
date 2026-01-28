import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AudioAnalysisResult } from '@/types/audioAnalysis';
import { mapAudioToVisuals } from '@/lib/visualMappingEngine';
import { toast } from 'sonner';

interface UseAudioAnalysisReturn {
  analysis: AudioAnalysisResult | null;
  isAnalyzing: boolean;
  error: string | null;
  analyzeAudio: (file: File) => Promise<AudioAnalysisResult | null>;
  clearAnalysis: () => void;
}

export function useAudioAnalysis(): UseAudioAnalysisReturn {
  const [analysis, setAnalysis] = useState<AudioAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeAudio = useCallback(async (file: File): Promise<AudioAnalysisResult | null> => {
    setIsAnalyzing(true);
    setError(null);

    try {
      // Convert file to base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      toast.info('Analyzing your track...', {
        description: 'AI is detecting tempo, mood, and genre',
      });

      const { data, error: fnError } = await supabase.functions.invoke('analyze-audio', {
        body: {
          audioBase64: base64,
          fileName: file.name,
        },
      });

      if (fnError) {
        throw new Error(fnError.message || 'Analysis failed');
      }

      if (!data?.success || !data?.analysis) {
        throw new Error(data?.error || 'No analysis returned');
      }

      // Add visual recommendations
      const analysisWithVisuals: AudioAnalysisResult = {
        ...data.analysis,
        visualRecommendations: mapAudioToVisuals(data.analysis),
      };

      setAnalysis(analysisWithVisuals);

      toast.success('Analysis complete!', {
        description: `${analysisWithVisuals.subGenre.replace(/_/g, ' ')} • ${analysisWithVisuals.bpm} BPM • Energy ${analysisWithVisuals.energy}/10`,
      });

      return analysisWithVisuals;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Analysis failed';
      setError(message);
      toast.error('Analysis failed', { description: message });
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const clearAnalysis = useCallback(() => {
    setAnalysis(null);
    setError(null);
  }, []);

  return {
    analysis,
    isAnalyzing,
    error,
    analyzeAudio,
    clearAnalysis,
  };
}
