import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VideoRequest {
  avatarImage: string; // base64 or URL of the cartoon avatar
  sceneDescription: string; // e.g., "neon city at night"
  musicGenre: string; // e.g., "hip-hop", "electronic"
  mood: string; // e.g., "energetic", "chill"
  clipIndex: number; // which clip in the sequence
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { avatarImage, sceneDescription, musicGenre, mood, clipIndex } = await req.json() as VideoRequest;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    if (!avatarImage) {
      throw new Error("No avatar image provided");
    }

    console.log(`Generating video clip ${clipIndex} for ${musicGenre} ${mood} scene...`);

    // Build dynamic prompt based on music/scene context
    const actionPrompts: Record<string, string[]> = {
      "hip-hop": [
        "character dancing with confident swagger, head nodding to the beat",
        "character walking with attitude through the scene, arms moving rhythmically",
        "character performing energetic dance moves, body grooving",
        "character vibing intensely, hands in the air"
      ],
      "electronic": [
        "character moving with fluid robotic dance motions",
        "character pulsing and moving to synthetic beats, glowing effects",
        "character in trance-like flowing movement",
        "character with dynamic rave-style dancing"
      ],
      "pop": [
        "character doing upbeat cheerful dance moves",
        "character spinning and moving joyfully",
        "character performing catchy choreographed movements",
        "character grooving with happy energy"
      ],
      "rock": [
        "character headbanging with intense energy",
        "character air-guitaring with passion",
        "character moving with raw powerful motions",
        "character jumping and rocking out"
      ],
      "chill": [
        "character swaying gently, relaxed movement",
        "character floating peacefully, subtle motion",
        "character in calm meditative movement",
        "character drifting serenely"
      ],
      "default": [
        "character dancing expressively",
        "character moving rhythmically to music",
        "character performing dynamic movements",
        "character vibing with energy"
      ]
    };

    const actions = actionPrompts[musicGenre.toLowerCase()] || actionPrompts["default"];
    const action = actions[clipIndex % actions.length];

    const moodModifiers: Record<string, string> = {
      "energetic": "high energy, dynamic lighting, vibrant colors",
      "chill": "soft lighting, dreamy atmosphere, smooth motion",
      "dark": "moody shadows, dramatic contrast, intense atmosphere",
      "happy": "bright colors, warm lighting, uplifting feel",
      "intense": "powerful visuals, strong contrast, pulsing energy"
    };

    const moodStyle = moodModifiers[mood.toLowerCase()] || "cinematic lighting, professional quality";

    const videoPrompt = `Animated cartoon character ${action} in ${sceneDescription}. ${moodStyle}. Music video style, smooth animation, artistic quality. The character should be the main focus, moving naturally and expressively.`;

    console.log("Video prompt:", videoPrompt);

    // Call the video generation API
    const response = await fetch("https://ai.gateway.lovable.dev/v1/video/generations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: videoPrompt,
        starting_frame: avatarImage,
        duration: 5,
        resolution: "1080p",
        aspect_ratio: "16:9"
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits depleted. Please add more credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("Video generation error:", response.status, errorText);
      throw new Error(`Video generation error: ${response.status}`);
    }

    const data = await response.json();
    console.log("Video generation response received");

    const videoUrl = data.video_url || data.data?.[0]?.url;

    if (!videoUrl) {
      throw new Error("No video URL in response");
    }

    return new Response(JSON.stringify({ 
      videoUrl,
      clipIndex,
      prompt: videoPrompt
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("generate-video-clip error:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Failed to generate video clip" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
