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

    const { data: { user }, error: userError } = await anonClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!ADMIN_EMAILS.includes((user.email || "").toLowerCase())) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Parse optional time range filter
    const url = new URL(req.url);
    const range = url.searchParams.get("range") || "all"; // today, 7d, 30d, all
    
    const now = new Date();
    let rangeStart: string | null = null;
    if (range === "today") {
      rangeStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    } else if (range === "7d") {
      rangeStart = new Date(now.getTime() - 7 * 86400000).toISOString();
    } else if (range === "30d") {
      rangeStart = new Date(now.getTime() - 30 * 86400000).toISOString();
    }

    // Parallel queries — all tables
    const [
      leadsRes,
      heatRes,
      practiceRes,
      campaignRes,
      webinarRes,
      plannerStatsRes,
      battleRoomsRes,
      battlePlayersRes,
      plannerActivityRes,
      readinessRes,
      profileRes,
    ] = await Promise.all([
      supabase.from("leads").select("*").order("created_at", { ascending: false }).limit(1000),
      supabase.from("planner_heat_score").select("*").order("heat_score", { ascending: false }).limit(1000),
      supabase.from("practice_lab_attempts").select("*").order("created_at", { ascending: false }).limit(1000),
      supabase.from("campaign_state").select("*").limit(1000),
      supabase.from("webinar_engagement").select("*").limit(1000),
      supabase.from("planner_stats").select("*").limit(1000),
      supabase.from("battle_rooms").select("*").order("created_at", { ascending: false }).limit(1000),
      supabase.from("battle_players").select("*").order("joined_at", { ascending: false }).limit(1000),
      supabase.from("planner_activity").select("*").order("created_at", { ascending: false }).limit(1000),
      supabase.from("readiness_quiz").select("*").order("created_at", { ascending: false }).limit(500),
      supabase.from("profile_percentile_planner").select("*").order("created_at", { ascending: false }).limit(500),
    ]);

    const leads = leadsRes.data || [];
    const heatScores = heatRes.data || [];
    const practiceAttempts = practiceRes.data || [];
    const campaigns = campaignRes.data || [];
    const webinar = webinarRes.data || [];
    const plannerStats = plannerStatsRes.data || [];
    const battleRooms = battleRoomsRes.data || [];
    const battlePlayers = battlePlayersRes.data || [];
    const plannerActivity = plannerActivityRes.data || [];
    const readinessQuiz = readinessRes.data || [];
    const profilePlanner = profileRes.data || [];

    // Filter by range if specified
    const filterByDate = <T extends Record<string, any>>(arr: T[], dateField: string): T[] => {
      if (!rangeStart) return arr;
      return arr.filter((item) => item[dateField] && item[dateField] >= rangeStart);
    };

    const fLeads = filterByDate(leads, "created_at");
    const fPractice = filterByDate(practiceAttempts, "created_at");
    const fBattleRooms = filterByDate(battleRooms, "created_at");
    const fBattlePlayers = filterByDate(battlePlayers, "joined_at");
    const fPlannerActivity = filterByDate(plannerActivity, "created_at");

    // ── Summary ──
    const todayStr = now.toISOString().slice(0, 10);
    const newUsersToday = leads.filter((l: any) => l.created_at?.startsWith(todayStr)).length;
    const uniquePracticeUsers = new Set(fPractice.map((p: any) => p.user_id)).size;
    const avgScore = fPractice.length
      ? Math.round(fPractice.reduce((s: number, a: any) => s + (a.score_pct || 0), 0) / fPractice.length)
      : 0;
    const hotLeads = heatScores.filter((h: any) => h.lead_category === "Hot").length;
    const warmLeads = heatScores.filter((h: any) => h.lead_category === "Warm").length;
    const conversions = campaigns.filter((c: any) => c.converted_at !== null).length;

    // Active users today (practiced or planner activity today)
    const practiceToday = practiceAttempts.filter((p: any) => p.created_at?.startsWith(todayStr));
    const activityToday = plannerActivity.filter((a: any) => a.created_at?.startsWith(todayStr));
    const activeUsersToday = new Set([
      ...practiceToday.map((p: any) => p.user_id),
      ...activityToday.map((a: any) => a.phone_number),
    ]).size;

    // ── Daily activity for charts (last 30 days) ──
    const dailyMap: Record<string, { leads: number; quizzes: number; battles: number; users: Set<string> }> = {};
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 86400000);
      const key = d.toISOString().slice(0, 10);
      dailyMap[key] = { leads: 0, quizzes: 0, battles: 0, users: new Set() };
    }

    for (const l of leads) {
      const d = l.created_at?.slice(0, 10);
      if (d && dailyMap[d]) dailyMap[d].leads++;
    }
    for (const p of practiceAttempts) {
      const d = p.created_at?.slice(0, 10);
      if (d && dailyMap[d]) {
        dailyMap[d].quizzes++;
        dailyMap[d].users.add(p.user_id);
      }
    }
    for (const b of battleRooms) {
      const d = b.created_at?.slice(0, 10);
      if (d && dailyMap[d]) dailyMap[d].battles++;
    }

    const dailyChart = Object.entries(dailyMap).map(([date, v]) => ({
      date,
      leads: v.leads,
      quizzes: v.quizzes,
      battles: v.battles,
      active_users: v.users.size,
    }));

    // ── Practice by chapter ──
    const chapterMap: Record<string, { attempts: number; totalScore: number; section: string }> = {};
    for (const a of fPractice) {
      const ch = a.chapter_slug;
      if (!chapterMap[ch]) chapterMap[ch] = { attempts: 0, totalScore: 0, section: a.section_id };
      chapterMap[ch].attempts++;
      chapterMap[ch].totalScore += a.score_pct || 0;
    }
    const practiceByChapter = Object.entries(chapterMap)
      .map(([slug, d]) => ({
        chapter_slug: slug,
        section_id: d.section,
        attempts: d.attempts,
        avg_score: d.attempts ? Math.round(d.totalScore / d.attempts) : 0,
      }))
      .sort((a, b) => b.attempts - a.attempts);

    // ── Practice by section ──
    const sectionMap: Record<string, { attempts: number; totalScore: number }> = {};
    for (const a of fPractice) {
      const s = a.section_id;
      if (!sectionMap[s]) sectionMap[s] = { attempts: 0, totalScore: 0 };
      sectionMap[s].attempts++;
      sectionMap[s].totalScore += a.score_pct || 0;
    }
    const practiceBySection = Object.entries(sectionMap).map(([id, d]) => ({
      section_id: id,
      attempts: d.attempts,
      avg_score: d.attempts ? Math.round(d.totalScore / d.attempts) : 0,
    }));

    // ── Score distribution ──
    const scoreBuckets = [0, 0, 0, 0, 0]; // 0-20, 21-40, 41-60, 61-80, 81-100
    for (const a of fPractice) {
      const s = a.score_pct || 0;
      const idx = Math.min(4, Math.floor(s / 20));
      scoreBuckets[idx]++;
    }
    const scoreDistribution = scoreBuckets.map((count, i) => ({
      range: `${i * 20 + (i > 0 ? 1 : 0)}-${(i + 1) * 20}%`,
      count,
    }));

    // ── Battle analytics ──
    const battlesByStatus: Record<string, number> = {};
    for (const r of fBattleRooms) {
      battlesByStatus[r.status] = (battlesByStatus[r.status] || 0) + 1;
    }

    // Top battlers
    const battlerScores: Record<string, { games: number; totalScore: number; name: string }> = {};
    for (const p of fBattlePlayers) {
      if (!battlerScores[p.user_id]) battlerScores[p.user_id] = { games: 0, totalScore: 0, name: p.display_name };
      battlerScores[p.user_id].games++;
      battlerScores[p.user_id].totalScore += p.score_pct || 0;
    }
    const topBattlers = Object.entries(battlerScores)
      .map(([uid, d]) => ({ user_id: uid, display_name: d.name, games: d.games, avg_score: Math.round(d.totalScore / d.games) }))
      .sort((a, b) => b.games - a.games)
      .slice(0, 20);

    const avgBattleScore = fBattlePlayers.length
      ? Math.round(fBattlePlayers.reduce((s: number, p: any) => s + (p.score_pct || 0), 0) / fBattlePlayers.length)
      : 0;

    // ── Campaign pipeline ──
    const pipelineMap: Record<string, number> = {};
    for (const c of campaigns) {
      const status = c.workflow_status || "unknown";
      pipelineMap[status] = (pipelineMap[status] || 0) + 1;
    }

    // ── Lead sources ──
    const sourceMap: Record<string, number> = {};
    for (const l of fLeads) {
      const src = l.source || "unknown";
      sourceMap[src] = (sourceMap[src] || 0) + 1;
    }
    const leadSources = Object.entries(sourceMap)
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count);

    // ── Most Active Users ──
    // Aggregate activity: quizzes + battles per user_id, resolve name/email from leads
    const userActivity: Record<string, { quizzes: number; battles: number; totalScore: number; name: string; email: string }> = {};
    
    // Build a user_id → lead info map
    const userIdToLead: Record<string, { name: string; email: string }> = {};
    for (const l of leads) {
      if (l.user_id) {
        userIdToLead[l.user_id] = { name: l.name || "", email: l.email || "" };
      }
    }

    for (const p of practiceAttempts) {
      const uid = p.user_id;
      if (!userActivity[uid]) {
        const info = userIdToLead[uid] || { name: "", email: "" };
        userActivity[uid] = { quizzes: 0, battles: 0, totalScore: 0, name: info.name, email: info.email };
      }
      userActivity[uid].quizzes++;
      userActivity[uid].totalScore += p.score_pct || 0;
    }

    for (const bp of battlePlayers) {
      const uid = bp.user_id;
      if (!userActivity[uid]) {
        const info = userIdToLead[uid] || { name: "", email: "" };
        userActivity[uid] = { quizzes: 0, battles: 0, totalScore: 0, name: info.name, email: info.email };
      }
      userActivity[uid].battles++;
      // Use display_name as fallback
      if (!userActivity[uid].name && bp.display_name) {
        userActivity[uid].name = bp.display_name;
      }
    }

    const mostActiveUsers = Object.entries(userActivity)
      .map(([uid, d]) => ({
        user_id: uid,
        name: d.name,
        email: d.email,
        quizzes: d.quizzes,
        battles: d.battles,
        total_actions: d.quizzes + d.battles,
        avg_score: d.quizzes ? Math.round(d.totalScore / d.quizzes) : 0,
      }))
      .sort((a, b) => b.total_actions - a.total_actions)
      .slice(0, 25);

    return new Response(
      JSON.stringify({
        summary: {
          total_leads: fLeads.length,
          total_leads_all: leads.length,
          new_users_today: newUsersToday,
          active_users_today: activeUsersToday,
          hot_leads: hotLeads,
          warm_leads: warmLeads,
          conversions,
          active_planners: plannerStats.length,
          webinar_completed: webinar.filter((w: any) => w.completed).length,
          total_practice_attempts: fPractice.length,
          unique_practice_users: uniquePracticeUsers,
          avg_score: avgScore,
          total_battles: fBattleRooms.length,
          total_battle_players: fBattlePlayers.length,
          avg_battle_score: avgBattleScore,
          total_readiness_quizzes: readinessQuiz.length,
          total_profile_assessments: profilePlanner.length,
        },
        daily_chart: dailyChart,
        leads: fLeads.slice(0, 500),
        lead_sources: leadSources,
        heat_scores: heatScores,
        practice_by_chapter: practiceByChapter,
        practice_by_section: practiceBySection,
        score_distribution: scoreDistribution,
        practice_attempts: fPractice.slice(0, 200),
        battle_rooms: fBattleRooms.slice(0, 100),
        battles_by_status: battlesByStatus,
        top_battlers: topBattlers,
        most_active_users: mostActiveUsers,
        campaign_pipeline: pipelineMap,
        campaigns: campaigns.slice(0, 200),
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
