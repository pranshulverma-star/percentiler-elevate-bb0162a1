import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response(null, { headers: corsHeaders });

  // Auth: require valid user JWT
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const token = authHeader.replace("Bearer ", "");
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (!user || authError) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const { section_id, chapter_slug } = await req.json();

    // Fetch user's recent question attempts (last 100)
    let query = supabase
      .from("question_attempts")
      .select("question_id, chapter_slug, section_id, is_correct, difficulty, attempted_at")
      .eq("user_id", user.id)
      .order("attempted_at", { ascending: false })
      .limit(100);

    if (section_id) query = query.eq("section_id", section_id);
    if (chapter_slug) query = query.eq("chapter_slug", chapter_slug);

    const { data: attempts, error: attError } = await query;
    if (attError) throw attError;

    if (!attempts || attempts.length === 0) {
      return new Response(
        JSON.stringify({ advice: "You haven't attempted any questions yet. Start practicing to get personalized revision advice!" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Compute stats
    const total = attempts.length;
    const correct = attempts.filter((a) => a.is_correct).length;
    const accuracy = Math.round((correct / total) * 100);

    const byChapter: Record<string, { correct: number; total: number }> = {};
    const byDifficulty: Record<string, { correct: number; total: number }> = {};

    for (const a of attempts) {
      const ch = a.chapter_slug;
      if (!byChapter[ch]) byChapter[ch] = { correct: 0, total: 0 };
      byChapter[ch].total++;
      if (a.is_correct) byChapter[ch].correct++;

      const diff = a.difficulty || "unknown";
      if (!byDifficulty[diff]) byDifficulty[diff] = { correct: 0, total: 0 };
      byDifficulty[diff].total++;
      if (a.is_correct) byDifficulty[diff].correct++;
    }

    const weakChapters = Object.entries(byChapter)
      .filter(([, v]) => v.total >= 2 && v.correct / v.total < 0.5)
      .sort((a, b) => a[1].correct / a[1].total - b[1].correct / b[1].total)
      .slice(0, 5)
      .map(([k, v]) => `${k}: ${v.correct}/${v.total} correct`);

    const strongChapters = Object.entries(byChapter)
      .filter(([, v]) => v.total >= 2 && v.correct / v.total >= 0.7)
      .sort((a, b) => b[1].correct / b[1].total - a[1].correct / a[1].total)
      .slice(0, 3)
      .map(([k, v]) => `${k}: ${v.correct}/${v.total} correct`);

    const diffSummary = Object.entries(byDifficulty)
      .map(([k, v]) => `${k}: ${v.correct}/${v.total} (${Math.round((v.correct / v.total) * 100)}%)`)
      .join(", ");

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY not configured");

    const systemPrompt = `You are an expert CAT (Common Admission Test, India) revision coach. Analyze the student's performance data and give a concise, actionable revision plan.

Rules:
- Use markdown with bold headers and bullet points
- Keep it under 250 words
- Be specific — reference their actual weak chapters and accuracy
- Include: 1) Key weak areas to focus on, 2) Recommended revision strategy, 3) Difficulty progression advice, 4) One motivational line
- If they have strong chapters, acknowledge them briefly
- Be honest but encouraging`;

    const userPrompt = `Generate a personalized revision plan based on this student's practice data:

**Overall:** ${correct}/${total} correct (${accuracy}% accuracy)

**Weak Chapters (< 50% accuracy):**
${weakChapters.length > 0 ? weakChapters.join("\n") : "None — good job!"}

**Strong Chapters (≥ 70% accuracy):**
${strongChapters.length > 0 ? strongChapters.join("\n") : "None yet — keep practicing!"}

**By Difficulty:** ${diffSummary}

${section_id ? `**Section:** ${section_id.toUpperCase()}` : "**Across all sections**"}
${chapter_slug ? `**Chapter focus:** ${chapter_slug}` : ""}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            { role: "user", parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] },
          ],
          generationConfig: { maxOutputTokens: 600 },
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error("Gemini API error:", response.status, errText);
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limited. Please try again shortly." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      return new Response(
        JSON.stringify({ error: "AI service error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const result = await response.json();
    const advice =
      result?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Unable to generate advice. Please try again.";

    return new Response(
      JSON.stringify({ advice, stats: { total, correct, accuracy, weakChapters, strongChapters } }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("ai-revision-coach error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
