/**
 * Visual Mapping Engine
 * 
 * DETERMINISTIC ALGORITHM:
 * This engine uses a rule-based decision matrix to map audio analysis
 * results to visual recommendations. Each decision follows a clear,
 * explainable logic path.
 */

import {
  AudioAnalysisResult,
  VisualRecommendations,
  SceneType,
  ColorPalette,
  AnimationStyle,
  VisualEffect,
  LightingStyle,
  AestheticStyle,
  MoodCategory,
  SubGenre,
  TempoClass,
  EnergyLevel,
} from '@/types/audioAnalysis';

// ============ MAPPING MATRICES ============

/**
 * MOOD → SCENE TYPE MATRIX
 * Primary driver for scene selection
 */
const MOOD_TO_SCENE: Record<MoodCategory, SceneType[]> = {
  aggressive: ['dark_warehouse', 'street_corner', 'city_night'],
  confident: ['luxury_setting', 'mansion_party', 'rooftop'],
  emotional: ['rain_city', 'sunset_vibe', 'recording_studio'],
  party: ['rooftop', 'mansion_party', 'concert_stage'],
  chill: ['sunset_vibe', 'car_interior', 'recording_studio'],
  dark: ['dark_warehouse', 'neon_alley', 'abstract_void'],
  romantic: ['sunset_vibe', 'car_interior', 'luxury_setting'],
};

/**
 * MOOD → COLOR PALETTE MATRIX
 */
const MOOD_TO_COLORS: Record<MoodCategory, ColorPalette[]> = {
  aggressive: ['dark_moody', 'fire_aggressive', 'monochrome'],
  confident: ['golden_luxury', 'purple_reign', 'neon_vibrant'],
  emotional: ['cool_blue', 'warm_sunset', 'monochrome'],
  party: ['neon_vibrant', 'purple_reign', 'fire_aggressive'],
  chill: ['warm_sunset', 'earth_organic', 'cool_blue'],
  dark: ['dark_moody', 'ice_cold', 'monochrome'],
  romantic: ['warm_sunset', 'purple_reign', 'golden_luxury'],
};

/**
 * SUB-GENRE → AESTHETIC STYLE MATRIX
 */
const SUBGENRE_TO_AESTHETIC: Record<SubGenre, AestheticStyle> = {
  atlanta_trap: 'luxury_flex',
  melodic_trap: 'cinematic_epic',
  hard_trap: 'dark_underground',
  phonk: 'dark_underground',
  chicago_drill: 'street_authentic',
  uk_drill: 'street_authentic',
  ny_drill: 'street_authentic',
  boom_bap: 'street_authentic',
  east_coast: 'street_authentic',
  west_coast: 'clean_minimal',
  southern_hip_hop: 'club_nightlife',
  contemporary_rnb: 'luxury_flex',
  neo_soul: 'lo_fi_nostalgic',
  alternative_rnb: 'experimental_art',
  lo_fi_hip_hop: 'lo_fi_nostalgic',
  conscious_hip_hop: 'clean_minimal',
  jersey_club: 'club_nightlife',
  crunk: 'club_nightlife',
  cloud_rap: 'experimental_art',
};

/**
 * ENERGY → ANIMATION INTENSITY MAPPING
 * Linear mapping from energy score to animation intensity
 */
function getAnimationIntensity(energy: EnergyLevel): 'subtle' | 'moderate' | 'intense' | 'extreme' {
  if (energy <= 3) return 'subtle';
  if (energy <= 5) return 'moderate';
  if (energy <= 8) return 'intense';
  return 'extreme';
}

/**
 * TEMPO + MOOD → ANIMATION STYLE MATRIX
 */
function getAnimationStyle(tempo: TempoClass, mood: MoodCategory): AnimationStyle {
  const matrix: Record<TempoClass, Record<MoodCategory, AnimationStyle>> = {
    slow: {
      aggressive: 'minimal_pulse',
      confident: 'smooth_sway',
      emotional: 'smooth_sway',
      party: 'smooth_sway',
      chill: 'minimal_pulse',
      dark: 'minimal_pulse',
      romantic: 'smooth_sway',
    },
    mid: {
      aggressive: 'bounce_groove',
      confident: 'bounce_groove',
      emotional: 'smooth_sway',
      party: 'bounce_groove',
      chill: 'smooth_sway',
      dark: 'glitch_stutter',
      romantic: 'smooth_sway',
    },
    upbeat: {
      aggressive: 'aggressive_pump',
      confident: 'bounce_groove',
      emotional: 'bounce_groove',
      party: 'dance_moves',
      chill: 'bounce_groove',
      dark: 'aggressive_pump',
      romantic: 'bounce_groove',
    },
    high: {
      aggressive: 'aggressive_pump',
      confident: 'aggressive_pump',
      emotional: 'bounce_groove',
      party: 'dance_moves',
      chill: 'bounce_groove',
      dark: 'glitch_stutter',
      romantic: 'dance_moves',
    },
    hyper: {
      aggressive: 'aggressive_pump',
      confident: 'dance_moves',
      emotional: 'dance_moves',
      party: 'dance_moves',
      chill: 'dance_moves',
      dark: 'glitch_stutter',
      romantic: 'dance_moves',
    },
  };
  
  return matrix[tempo][mood];
}

/**
 * MOOD + ENERGY → LIGHTING STYLE
 */
function getLightingStyle(mood: MoodCategory, energy: EnergyLevel): LightingStyle {
  if (mood === 'dark' || mood === 'aggressive') {
    return energy > 6 ? 'strobe_club' : 'dark_silhouette';
  }
  if (mood === 'romantic' || mood === 'emotional') {
    return energy > 5 ? 'golden_hour' : 'ambient_soft';
  }
  if (mood === 'party') {
    return energy > 7 ? 'strobe_club' : 'neon_glow';
  }
  if (mood === 'confident') {
    return energy > 6 ? 'dramatic_spots' : 'ring_light';
  }
  if (mood === 'chill') {
    return 'ambient_soft';
  }
  return 'neon_glow';
}

/**
 * SELECT VISUAL EFFECTS
 * Based on mood, energy, and sub-genre
 */
function selectVisualEffects(
  mood: MoodCategory,
  energy: EnergyLevel,
  subGenre: SubGenre
): VisualEffect[] {
  const effects: VisualEffect[] = [];
  
  // Base effects by mood
  const moodEffects: Record<MoodCategory, VisualEffect[]> = {
    aggressive: ['bass_pulse', 'glitch_distort', 'fire_sparks'],
    confident: ['lens_flare', 'holographic', 'particle_glow'],
    emotional: ['rain_drops', 'color_shift', 'smoke_haze'],
    party: ['strobe_flash', 'neon_trails', 'particle_glow'],
    chill: ['smoke_haze', 'vinyl_grain', 'color_shift'],
    dark: ['smoke_haze', 'glitch_distort', 'bass_pulse'],
    romantic: ['lens_flare', 'particle_glow', 'color_shift'],
  };
  
  effects.push(...moodEffects[mood].slice(0, 2));
  
  // Add energy-based effects
  if (energy >= 7) {
    effects.push('bass_pulse');
  }
  if (energy >= 9) {
    effects.push('strobe_flash');
  }
  
  // Sub-genre specific effects
  if (subGenre === 'lo_fi_hip_hop' || subGenre === 'neo_soul') {
    effects.push('vinyl_grain');
  }
  if (subGenre === 'phonk' || subGenre === 'cloud_rap') {
    effects.push('smoke_haze');
  }
  if (subGenre.includes('drill')) {
    effects.push('glitch_distort');
  }
  
  // Remove duplicates and limit to 4
  return [...new Set(effects)].slice(0, 4);
}

/**
 * GENERATE RATIONALE
 * Human-readable explanation of why these visuals were chosen
 */
function generateRationale(
  analysis: AudioAnalysisResult,
  recommendations: Partial<VisualRecommendations>
): string {
  const parts: string[] = [];
  
  // Tempo explanation
  parts.push(`The track's ${analysis.bpm} BPM (${analysis.tempoClass} tempo)`);
  
  // Mood explanation
  const moodDescriptions: Record<MoodCategory, string> = {
    aggressive: 'aggressive, hard-hitting energy',
    confident: 'confident, self-assured swagger',
    emotional: 'emotional, introspective depth',
    party: 'celebratory, turn-up energy',
    chill: 'relaxed, laid-back atmosphere',
    dark: 'dark, atmospheric intensity',
    romantic: 'sensual, intimate mood',
  };
  parts.push(`combined with its ${moodDescriptions[analysis.mood]}`);
  
  // Genre influence
  parts.push(`and ${analysis.subGenre.replace(/_/g, ' ')} production style`);
  
  // Visual choice explanation
  parts.push(`calls for ${recommendations.animationIntensity} animation with ${recommendations.colorPalette?.replace(/_/g, ' ')} colors`);
  
  // Scene choice
  parts.push(`The ${recommendations.recommendedSceneType?.replace(/_/g, ' ')} scene enhances the track's natural vibe`);
  
  return parts.join(' ') + '.';
}

/**
 * MAIN MAPPING FUNCTION
 * Takes audio analysis and produces visual recommendations
 */
export function mapAudioToVisuals(analysis: AudioAnalysisResult): VisualRecommendations {
  // 1. Scene Selection (Primary: Mood, Secondary: Sub-genre)
  const sceneCandidates = MOOD_TO_SCENE[analysis.mood];
  const recommendedSceneType = sceneCandidates[0]; // Take primary recommendation
  
  // 2. Color Palette (Based on mood + energy modifier)
  const colorCandidates = MOOD_TO_COLORS[analysis.mood];
  // Higher energy = first choice, lower energy = softer choice
  const colorIndex = analysis.energy > 6 ? 0 : analysis.energy > 3 ? 1 : 2;
  const colorPalette = colorCandidates[Math.min(colorIndex, colorCandidates.length - 1)];
  
  // 3. Animation Intensity (Direct energy mapping)
  const animationIntensity = getAnimationIntensity(analysis.energy);
  
  // 4. Animation Style (Tempo + Mood matrix)
  const animationStyle = getAnimationStyle(analysis.tempoClass, analysis.mood);
  
  // 5. Visual Effects (Mood + Energy + Sub-genre)
  const primaryEffects = selectVisualEffects(analysis.mood, analysis.energy, analysis.subGenre);
  
  // 6. Lighting (Mood + Energy)
  const lightingStyle = getLightingStyle(analysis.mood, analysis.energy);
  
  // 7. Aesthetic (Sub-genre driven)
  const aesthetic = SUBGENRE_TO_AESTHETIC[analysis.subGenre];
  
  // Build partial recommendations for rationale
  const partialRecs: Partial<VisualRecommendations> = {
    recommendedSceneType,
    colorPalette,
    animationIntensity,
  };
  
  // 8. Generate rationale
  const rationale = generateRationale(analysis, partialRecs);
  
  return {
    recommendedSceneType,
    colorPalette,
    animationIntensity,
    animationStyle,
    primaryEffects,
    lightingStyle,
    aesthetic,
    rationale,
  };
}

/**
 * SCENE MAPPING
 * Maps our scene types to actual scene IDs in the app
 */
export const SCENE_TYPE_TO_ID: Record<SceneType, string> = {
  concert_stage: 'stage',
  recording_studio: 'studio',
  city_night: 'city-night',
  neon_alley: 'neon-alley',
  rooftop: 'rooftop',
  abstract_void: 'abstract',
  luxury_setting: 'rooftop', // Will need to add luxury scene
  street_corner: 'city-night', // Will need to add street scene
  dark_warehouse: 'neon-alley', // Closest match
  sunset_vibe: 'sunset-beach',
  mansion_party: 'rooftop', // Will need to add mansion scene
  desert_landscape: 'desert',
  rain_city: 'city-night', // Will need rain variant
  car_interior: 'studio', // Will need car scene
};

/**
 * Get recommended scene ID from analysis
 */
export function getRecommendedSceneId(analysis: AudioAnalysisResult): string {
  if (!analysis.visualRecommendations) {
    const recs = mapAudioToVisuals(analysis);
    return SCENE_TYPE_TO_ID[recs.recommendedSceneType];
  }
  return SCENE_TYPE_TO_ID[analysis.visualRecommendations.recommendedSceneType];
}
