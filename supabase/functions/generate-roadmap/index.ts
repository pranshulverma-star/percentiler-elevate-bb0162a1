import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response(null, { headers: corsHeaders });

  try {
    const {
      profile_score,
      strength,
      target_top10,
      target_top20,
      target_top30,
      tenth_score,
      twelfth_score,
      grad_score,
      grad_stream,
      gender,
      workex_months,
      gap_years,
      internships,
      certifications,
    } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const systemPrompt = `You are a CAT (Common Admission Test, India) preparation expert and career counselor for MBA aspirants. Generate a concise, actionable, and truly personalized preparation roadmap.

Rules:
- Use markdown formatting with bold headers and bullet points
- Keep it under 300 words
- Be specific — reference the student's actual scores and profile
- Include: 1) Key strengths & gaps, 2) Section-wise priority (VARC/LRDI/QA), 3) Week-by-week high-level plan (8-12 weeks), 4) Mock test strategy, 5) One motivational closing line
- If work experience is strong, mention how to leverage it in interviews
- If profile is weak, be honest but encouraging — emphasize that CAT score can compensate`;

    const userPrompt = `Generate a personalized CAT preparation roadmap for this student:

**Academic Profile:**
- 10th: ${tenth_score}% | 12th: ${twelfth_score}% | Graduation: ${grad_score}%
- Stream: ${grad_stream} | Gender: ${gender}

**Experience & Extras:**
- Work Experience: ${workex_months} months
- Gap Years: ${gap_years} | Internships: ${internships} | Certifications: ${certifications}

**Profile Analysis:**
- Profile Score: ${profile_score}/100 (Strength: ${strength})
- Target for Top 10 B-Schools: ${target_top10}+ percentile
- Target for Top 20 B-Schools: ${target_top20}+ percentile
- Target for Top 30 B-Schools: ${target_top30}+ percentile`;

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          stream: true,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limited. Please try again shortly." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(
        JSON.stringify({ error: "AI gateway error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("generate-roadmap error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
