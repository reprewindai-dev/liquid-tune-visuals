/**
 * Audio Analysis System for Hip-Hop/R&B/Trap Music
 * 
 * SCORING METHODOLOGY:
 * This system uses a deterministic scoring approach based on established
 * music production and audio engineering principles. Each metric is derived
 * from analyzable audio characteristics.
 */

// ============ TEMPO CLASSIFICATION ============
// Based on standard BPM ranges in hip-hop/R&B production
export type TempoClass = 
  | 'slow'      // 60-85 BPM: Ballads, slow jams, emotional R&B
  | 'mid'       // 86-110 BPM: Classic hip-hop, boom bap, chill rap
  | 'upbeat'    // 111-130 BPM: Modern rap, mainstream trap
  | 'high'      // 131-160 BPM: Drill, crunk, hyphy
  | 'hyper';    // 161+ BPM: Jersey club, some drill variants

export const TEMPO_RANGES: Record<TempoClass, { min: number; max: number; label: string }> = {
  slow: { min: 60, max: 85, label: 'Slow & Smooth' },
  mid: { min: 86, max: 110, label: 'Mid-Tempo Groove' },
  upbeat: { min: 111, max: 130, label: 'Upbeat Energy' },
  high: { min: 131, max: 160, label: 'High Energy' },
  hyper: { min: 161, max: 200, label: 'Hyper/Club' },
};

// ============ ENERGY SCORING ============
// 1-10 scale based on:
// - Dynamic range (loudness variation)
// - Percussion intensity
// - Vocal delivery intensity
// - Harmonic density
export type EnergyLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export const ENERGY_DESCRIPTIONS: Record<EnergyLevel, string> = {
  1: 'Ambient/Atmospheric',
  2: 'Very Chill',
  3: 'Relaxed',
  4: 'Smooth',
  5: 'Balanced',
  6: 'Energetic',
  7: 'Hype',
  8: 'Intense',
  9: 'Aggressive',
  10: 'Maximum Intensity',
};

// ============ MOOD/VIBE CLASSIFICATION ============
// Primary emotional tone of the track
export type MoodCategory = 
  | 'aggressive'   // Drill, gangsta rap, hard trap - confrontational energy
  | 'confident'    // Flex tracks, boastful - self-assured swagger
  | 'emotional'    // Conscious rap, R&B ballads - vulnerability, introspection
  | 'party'        // Club tracks, turn up music - celebratory, social
  | 'chill'        // Lo-fi, smooth R&B, jazz rap - relaxed, laid-back
  | 'dark'         // Dark trap, phonk - ominous, mysterious
  | 'romantic';    // Love songs, slow jams - intimate, sensual

export const MOOD_CHARACTERISTICS: Record<MoodCategory, string[]> = {
  aggressive: ['hard-hitting 808s', 'aggressive delivery', 'dark production', 'intense drops'],
  confident: ['boastful lyrics', 'steady groove', 'triumphant melodies', 'commanding presence'],
  emotional: ['melodic hooks', 'introspective themes', 'softer dynamics', 'layered harmonies'],
  party: ['danceable rhythm', 'catchy hooks', 'call-and-response', 'high energy builds'],
  chill: ['laid-back groove', 'smooth basslines', 'atmospheric pads', 'relaxed tempo'],
  dark: ['minor keys', 'ominous synths', 'heavy sub-bass', 'sparse arrangement'],
  romantic: ['sensual melodies', 'intimate production', 'smooth vocals', 'warm tones'],
};

// ============ SUB-GENRE DETECTION ============
// Specific sub-genres within hip-hop/R&B/trap umbrella
export type SubGenre = 
  // Trap variants
  | 'atlanta_trap'      // 808-heavy, hi-hat rolls, melodic hooks
  | 'melodic_trap'      // Sung/melodic delivery over trap beats
  | 'hard_trap'         // Aggressive trap with heavy 808s
  | 'phonk'             // Memphis-inspired, chopped vocals, dark aesthetic
  
  // Drill variants
  | 'chicago_drill'     // Original drill sound, dark, aggressive
  | 'uk_drill'          // Sliding 808s, faster hi-hats
  | 'ny_drill'          // Blend of UK drill with NY influence
  
  // Classic hip-hop
  | 'boom_bap'          // Sample-based, crisp drums, lyric-focused
  | 'east_coast'        // NY sound, jazz samples, complex rhymes
  | 'west_coast'        // G-funk influence, laid-back, synth-heavy
  | 'southern_hip_hop'  // Bass-heavy, bounce influence
  
  // R&B variants
  | 'contemporary_rnb'  // Modern R&B with trap influences
  | 'neo_soul'          // Organic, live instruments, soulful
  | 'alternative_rnb'   // Experimental, genre-bending
  
  // Other
  | 'lo_fi_hip_hop'     // Nostalgic, vinyl crackle, jazzy samples
  | 'conscious_hip_hop' // Message-driven, thought-provoking
  | 'jersey_club'       // Fast tempo, choppy samples, dance-oriented
  | 'crunk'             // Call-and-response, energetic, party-oriented
  | 'cloud_rap';        // Ethereal, ambient, dreamy production

export const SUBGENRE_INFO: Record<SubGenre, { 
  label: string; 
  bpmRange: [number, number];
  characteristics: string[];
}> = {
  atlanta_trap: {
    label: 'Atlanta Trap',
    bpmRange: [130, 150],
    characteristics: ['808 bass', 'hi-hat rolls', 'melodic hooks', 'ad-libs'],
  },
  melodic_trap: {
    label: 'Melodic Trap',
    bpmRange: [120, 145],
    characteristics: ['sung melodies', 'auto-tune', 'emotional themes', 'layered vocals'],
  },
  hard_trap: {
    label: 'Hard Trap',
    bpmRange: [130, 160],
    characteristics: ['aggressive 808s', 'dark synths', 'intense energy', 'minimal melody'],
  },
  phonk: {
    label: 'Phonk',
    bpmRange: [120, 140],
    characteristics: ['chopped samples', 'cowbell', 'dark aesthetic', 'Memphis influence'],
  },
  chicago_drill: {
    label: 'Chicago Drill',
    bpmRange: [60, 70],
    characteristics: ['dark production', 'sliding 808s', 'aggressive lyrics', 'ominous pads'],
  },
  uk_drill: {
    label: 'UK Drill',
    bpmRange: [140, 150],
    characteristics: ['sliding 808s', 'complex hi-hats', 'quick flows', 'minor keys'],
  },
  ny_drill: {
    label: 'NY Drill',
    bpmRange: [140, 150],
    characteristics: ['UK drill influence', 'sample flips', 'aggressive delivery', 'NYC slang'],
  },
  boom_bap: {
    label: 'Boom Bap',
    bpmRange: [85, 100],
    characteristics: ['sample-based', 'crisp drums', 'lyric-focused', 'jazz/soul samples'],
  },
  east_coast: {
    label: 'East Coast',
    bpmRange: [85, 105],
    characteristics: ['complex rhymes', 'jazz samples', 'lyricism', 'boom bap drums'],
  },
  west_coast: {
    label: 'West Coast',
    bpmRange: [95, 110],
    characteristics: ['g-funk synths', 'laid-back flow', 'talk-box', 'smooth basslines'],
  },
  southern_hip_hop: {
    label: 'Southern Hip-Hop',
    bpmRange: [75, 95],
    characteristics: ['heavy bass', 'bounce influence', 'double-time hi-hats', 'trunk music'],
  },
  contemporary_rnb: {
    label: 'Contemporary R&B',
    bpmRange: [70, 110],
    characteristics: ['trap drums', 'smooth vocals', 'modern production', 'sensual themes'],
  },
  neo_soul: {
    label: 'Neo-Soul',
    bpmRange: [70, 100],
    characteristics: ['live instruments', 'organic feel', 'jazz chords', 'conscious lyrics'],
  },
  alternative_rnb: {
    label: 'Alternative R&B',
    bpmRange: [80, 130],
    characteristics: ['experimental', 'genre-bending', 'electronic elements', 'atmospheric'],
  },
  lo_fi_hip_hop: {
    label: 'Lo-Fi Hip-Hop',
    bpmRange: [70, 90],
    characteristics: ['vinyl crackle', 'jazzy samples', 'relaxed vibe', 'nostalgic'],
  },
  conscious_hip_hop: {
    label: 'Conscious Hip-Hop',
    bpmRange: [85, 110],
    characteristics: ['meaningful lyrics', 'social commentary', 'boom bap influence', 'message-driven'],
  },
  jersey_club: {
    label: 'Jersey Club',
    bpmRange: [130, 145],
    characteristics: ['fast tempo', 'choppy samples', 'bed squeak', 'dance-oriented'],
  },
  crunk: {
    label: 'Crunk',
    bpmRange: [105, 120],
    characteristics: ['call-and-response', 'energetic', 'party anthems', 'heavy bass'],
  },
  cloud_rap: {
    label: 'Cloud Rap',
    bpmRange: [60, 80],
    characteristics: ['ethereal pads', 'ambient textures', 'dreamy', 'spacey production'],
  },
};

// ============ COMPLETE ANALYSIS RESULT ============
export interface AudioAnalysisResult {
  // Core metrics
  bpm: number;
  tempoClass: TempoClass;
  energy: EnergyLevel;
  mood: MoodCategory;
  subGenre: SubGenre;
  
  // Secondary characteristics
  hasVocals: boolean;
  vocalStyle: 'rapping' | 'singing' | 'mixed' | 'none';
  instrumentalDensity: 'sparse' | 'moderate' | 'dense';
  bassIntensity: 'light' | 'moderate' | 'heavy' | 'extreme';
  
  // Production characteristics
  productionStyle: 'minimal' | 'layered' | 'maximalist';
  keySignature: 'major' | 'minor' | 'ambiguous';
  
  // Confidence scores (0-100)
  confidence: {
    genre: number;
    mood: number;
    tempo: number;
    overall: number;
  };
  
  // AI-generated description
  description: string;
  
  // Visual recommendations (populated by mapping engine)
  visualRecommendations?: VisualRecommendations;
}

// ============ VISUAL MAPPING OUTPUT ============
export interface VisualRecommendations {
  // Primary scene recommendation
  recommendedSceneType: SceneType;
  
  // Color palette
  colorPalette: ColorPalette;
  
  // Animation settings
  animationIntensity: 'subtle' | 'moderate' | 'intense' | 'extreme';
  animationStyle: AnimationStyle;
  
  // Visual effects
  primaryEffects: VisualEffect[];
  
  // Lighting
  lightingStyle: LightingStyle;
  
  // Overall aesthetic
  aesthetic: AestheticStyle;
  
  // Rationale for recommendations
  rationale: string;
}

export type SceneType = 
  | 'concert_stage'    // High energy, performance-focused
  | 'recording_studio' // Authentic, artist-focused
  | 'city_night'       // Urban, modern
  | 'neon_alley'       // Vibrant, club aesthetic
  | 'rooftop'          // Social, party vibe
  | 'abstract_void'    // Artistic, experimental
  | 'luxury_setting'   // Flex, confident
  | 'street_corner'    // Raw, authentic
  | 'dark_warehouse'   // Underground, hard
  | 'sunset_vibe'      // Chill, romantic
  | 'mansion_party'    // Celebratory, success
  | 'desert_landscape' // Atmospheric, cinematic
  | 'rain_city'        // Moody, emotional
  | 'car_interior';    // Intimate, personal

export type ColorPalette = 
  | 'neon_vibrant'     // Bright pinks, blues, purples
  | 'dark_moody'       // Deep blacks, reds, dark blues
  | 'golden_luxury'    // Golds, blacks, warm tones
  | 'cool_blue'        // Blues, teals, cyans
  | 'warm_sunset'      // Oranges, pinks, purples
  | 'monochrome'       // Black, white, grays
  | 'purple_reign'     // Purples, pinks, magentas
  | 'earth_organic'    // Browns, greens, warm neutrals
  | 'ice_cold'         // White, light blues, silvers
  | 'fire_aggressive'; // Reds, oranges, blacks

export type AnimationStyle = 
  | 'smooth_sway'      // Gentle, rhythmic movement
  | 'bounce_groove'    // Head nod, body bounce
  | 'aggressive_pump'  // Intense, high-energy movement
  | 'dance_moves'      // Full choreography
  | 'minimal_pulse'    // Subtle, ambient movement
  | 'glitch_stutter';  // Experimental, choppy

export type VisualEffect = 
  | 'particle_glow'    // Floating particles with glow
  | 'smoke_haze'       // Atmospheric smoke
  | 'lens_flare'       // Cinematic flares
  | 'glitch_distort'   // Digital glitches
  | 'neon_trails'      // Light trails
  | 'rain_drops'       // Weather effects
  | 'bass_pulse'       // Rhythm-synced pulses
  | 'color_shift'      // Gradual color changes
  | 'strobe_flash'     // Quick light flashes
  | 'vinyl_grain'      // Nostalgic film grain
  | 'holographic'      // Iridescent effects
  | 'fire_sparks';     // Flame particles

export type LightingStyle = 
  | 'dramatic_spots'   // High contrast spotlights
  | 'ambient_soft'     // Even, soft lighting
  | 'neon_glow'        // Colored neon lighting
  | 'strobe_club'      // Club-style strobes
  | 'golden_hour'      // Warm, natural light
  | 'dark_silhouette'  // Backlit, shadowy
  | 'ring_light'       // Social media style
  | 'moody_low_key';   // Dark, atmospheric

export type AestheticStyle = 
  | 'luxury_flex'      // High-end, expensive feel
  | 'street_authentic' // Raw, real, gritty
  | 'club_nightlife'   // Party, social, vibrant
  | 'cinematic_epic'   // Movie-quality, dramatic
  | 'lo_fi_nostalgic'  // Vintage, warm, cozy
  | 'dark_underground' // Edgy, alternative
  | 'clean_minimal'    // Simple, focused
  | 'experimental_art';// Avant-garde, creative
