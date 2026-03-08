import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const ADMIN_EMAILS = ["pranshul.verma1992@gmail.com"];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate JWT
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const anonClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await anonClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const email = (claimsData.claims.email as string || "").toLowerCase();
    if (!ADMIN_EMAILS.includes(email)) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Use service role to bypass RLS
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Parallel queries
    const [
      leadsRes,
      heatRes,
      practiceRes,
      campaignRes,
      webinarRes,
      plannerStatsRes,
    ] = await Promise.all([
      supabase.from("leads").select("*").order("created_at", { ascending: false }).limit(500),
      supabase.from("planner_heat_score").select("*").order("heat_score", { ascending: false }).limit(200),
      supabase.from("practice_lab_attempts").select("*").order("created_at", { ascending: false }).limit(500),
      supabase.from("campaign_state").select("*").limit(500),
      supabase.from("webinar_engagement").select("*").limit(500),
      supabase.from("planner_stats").select("*").limit(500),
    ]);

    // Compute summary stats
    const leads = leadsRes.data || [];
    const heatScores = heatRes.data || [];
    const practiceAttempts = practiceRes.data || [];
    const campaigns = campaignRes.data || [];
    const webinar = webinarRes.data || [];
    const plannerStats = plannerStatsRes.data || [];

    const hotLeads = heatScores.filter((h: any) => h.lead_category === "Hot").length;
    const warmLeads = heatScores.filter((h: any) => h.lead_category === "Warm").length;
    const conversions = campaigns.filter((c: any) => c.converted_at !== null).length;
    const activePlanners = plannerStats.length;
    const webinarCompleted = webinar.filter((w: any) => w.completed).length;

    // Campaign pipeline breakdown
    const pipelineMap: Record<string, number> = {};
    for (const c of campaigns) {
      const status = (c as any).workflow_status || "unknown";
      pipelineMap[status] = (pipelineMap[status] || 0) + 1;
    }

    // Practice lab aggregates by chapter
    const chapterMap: Record<string, { attempts: number; totalScore: number; totalQuestions: number }> = {};
    for (const a of practiceAttempts) {
      const ch = (a as any).chapter_slug;
      if (!chapterMap[ch]) chapterMap[ch] = { attempts: 0, totalScore: 0, totalQuestions: 0 };
      chapterMap[ch].attempts++;
      chapterMap[ch].totalScore += (a as any).score_pct || 0;
      chapterMap[ch].totalQuestions += (a as any).total_questions || 0;
    }

    const practiceByChapter = Object.entries(chapterMap).map(([slug, d]) => ({
      chapter_slug: slug,
      attempts: d.attempts,
      avg_score: d.attempts ? Math.round(d.totalScore / d.attempts) : 0,
      total_questions: d.totalQuestions,
    }));

    return new Response(
      JSON.stringify({
        summary: {
          total_leads: leads.length,
          hot_leads: hotLeads,
          warm_leads: warmLeads,
          conversions,
          active_planners: activePlanners,
          webinar_completed: webinarCompleted,
          total_practice_attempts: practiceAttempts.length,
        },
        leads,
        heat_scores: heatScores,
        practice_by_chapter: practiceByChapter,
        practice_attempts: practiceAttempts,
        campaign_pipeline: pipelineMap,
        campaigns,
        webinar,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Admin analytics error:", err);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
