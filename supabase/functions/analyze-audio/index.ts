import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

/**
 * AUDIO ANALYSIS SYSTEM
 * 
 * Uses AI to analyze audio characteristics and return deterministic scores
 * based on the following methodology:
 * 
 * 1. TEMPO (BPM): Detected from rhythmic patterns
 * 2. ENERGY (1-10): Based on dynamics, percussion, vocal intensity
 * 3. MOOD: Classified from harmonic content, lyrics, production style
 * 4. SUB-GENRE: Identified from production characteristics
 */

const ANALYSIS_PROMPT = `You are an expert music analyst specializing in hip-hop, R&B, trap, and related genres.

Analyze the provided audio and return a JSON object with EXACTLY this structure (no additional text):

{
  "bpm": <number between 60-200>,
  "tempoClass": "<one of: slow|mid|upbeat|high|hyper>",
  "energy": <number 1-10>,
  "mood": "<one of: aggressive|confident|emotional|party|chill|dark|romantic>",
  "subGenre": "<one of: atlanta_trap|melodic_trap|hard_trap|phonk|chicago_drill|uk_drill|ny_drill|boom_bap|east_coast|west_coast|southern_hip_hop|contemporary_rnb|neo_soul|alternative_rnb|lo_fi_hip_hop|conscious_hip_hop|jersey_club|crunk|cloud_rap>",
  "hasVocals": <boolean>,
  "vocalStyle": "<one of: rapping|singing|mixed|none>",
  "instrumentalDensity": "<one of: sparse|moderate|dense>",
  "bassIntensity": "<one of: light|moderate|heavy|extreme>",
  "productionStyle": "<one of: minimal|layered|maximalist>",
  "keySignature": "<one of: major|minor|ambiguous>",
  "confidence": {
    "genre": <number 0-100>,
    "mood": <number 0-100>,
    "tempo": <number 0-100>,
    "overall": <number 0-100>
  },
  "description": "<2-3 sentence description of the track's vibe and production>"
}

SCORING METHODOLOGY:

BPM/TEMPO:
- slow: 60-85 BPM (ballads, slow jams)
- mid: 86-110 BPM (classic hip-hop, boom bap)
- upbeat: 111-130 BPM (modern trap, mainstream rap)
- high: 131-160 BPM (drill, high-energy)
- hyper: 161+ BPM (jersey club)

ENERGY (1-10):
Score based on: dynamic range, percussion intensity, vocal delivery, harmonic density
- 1-3: Ambient, very chill, minimal
- 4-5: Smooth, balanced
- 6-7: Energetic, hype
- 8-10: Intense, aggressive, maximum

MOOD CLASSIFICATION:
- aggressive: Hard-hitting, confrontational (drill, gangsta rap)
- confident: Boastful, swagger (flex tracks)
- emotional: Vulnerable, introspective (conscious, ballads)
- party: Celebratory, social (club, turn up)
- chill: Relaxed, laid-back (lo-fi, smooth)
- dark: Ominous, mysterious (dark trap, phonk)
- romantic: Sensual, intimate (R&B love songs)

SUB-GENRE MARKERS:
- atlanta_trap: 808 bass, hi-hat rolls, melodic hooks
- melodic_trap: Sung melodies, auto-tune, emotional
- hard_trap: Aggressive 808s, dark synths
- phonk: Chopped samples, cowbell, Memphis influence
- chicago_drill: Dark, sliding 808s, aggressive
- uk_drill: Sliding 808s, complex hi-hats, fast
- ny_drill: UK influence with NY style
- boom_bap: Sample-based, crisp drums
- contemporary_rnb: Modern R&B with trap influence
- neo_soul: Organic, live instruments
- lo_fi_hip_hop: Vinyl crackle, jazzy, nostalgic

Focus ONLY on hip-hop, R&B, trap and related genres. This is NOT for rock, country, EDM, or other genres.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const { audioBase64, fileName } = await req.json();

    if (!audioBase64) {
      return new Response(
        JSON.stringify({ error: 'Audio data is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.info('Analyzing audio:', fileName || 'uploaded file');

    // Call Gemini with audio for analysis
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: ANALYSIS_PROMPT,
              },
              {
                type: 'audio_url',
                audio_url: {
                  url: audioBase64.startsWith('data:') 
                    ? audioBase64 
                    : `data:audio/mp3;base64,${audioBase64}`,
                },
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Payment required. Please add funds to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      throw new Error(`AI analysis failed: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No analysis content received');
    }

    console.info('Analysis complete');

    // Parse the JSON from the response
    let analysis;
    try {
      // Extract JSON from response (handle markdown code blocks)
      const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || 
                       content.match(/```\n?([\s\S]*?)\n?```/) ||
                       [null, content];
      const jsonStr = jsonMatch[1] || content;
      analysis = JSON.parse(jsonStr.trim());
    } catch (parseError) {
      console.error('Failed to parse analysis JSON:', content);
      throw new Error('Failed to parse analysis results');
    }

    // Validate required fields
    const requiredFields = ['bpm', 'tempoClass', 'energy', 'mood', 'subGenre'];
    for (const field of requiredFields) {
      if (!(field in analysis)) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        analysis,
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Audio analysis error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Analysis failed' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
