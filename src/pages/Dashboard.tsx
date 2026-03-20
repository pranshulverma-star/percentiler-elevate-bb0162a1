import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useStreaks } from "@/hooks/useStreaks";
import { supabase } from "@/integrations/supabase/client";
import DashboardTopBar from "@/components/dashboard/DashboardTopBar";
import DashboardStreakHero from "@/components/dashboard/DashboardStreakHero";
import DashboardTodayAction from "@/components/dashboard/DashboardTodayAction";
import DashboardStatPills from "@/components/dashboard/DashboardStatPills";
import DashboardProgressCompact from "@/components/dashboard/DashboardProgressCompact";
import DashboardLeaderboardCompact from "@/components/dashboard/DashboardLeaderboardCompact";
import DashboardRecommendations from "@/components/dashboard/DashboardRecommendations";
import DashboardQuickAccess from "@/components/dashboard/DashboardQuickAccess";
import DashboardBottomNav from "@/components/dashboard/DashboardBottomNav";
import SEO from "@/components/SEO";
import { motion } from "framer-motion";

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const userId = user?.id || "";
  const { currentStreak, longestStreak, weeklyActivity, loading: loadingStreaks } = useStreaks();

  const [lead, setLead] = useState<any>(null);
  const [plannerData, setPlannerData] = useState<any>(null);
  const [engagement, setEngagement] = useState<any>(null);
  const [campaign, setCampaign] = useState<any>(null);
  const [practiceAttempts, setPracticeAttempts] = useState<any[]>([]);

  const [, setLoadingLead] = useState(true);
  const [loadingPlanner, setLoadingPlanner] = useState(true);
  const [loadingPractice, setLoadingPractice] = useState(true);

  const fetchLead = async () => {
    if (!userId) return;
    setLoadingLead(true);
    try {
      const { data } = await (supabase.from("leads") as any)
        .select("name, email, phone_number")
        .eq("user_id", userId)
        .maybeSingle();
      setLead(data);
    } catch (e) { console.error("[Dashboard] fetchLead ERROR", e); }
    setLoadingLead(false);
  };

  const fetchPlanner = async () => {
    const phone = localStorage.getItem("percentilers_phone");
    if (!phone) { setLoadingPlanner(false); return; }
    setLoadingPlanner(true);
    try {
      const [statsRes, heatRes, activityRes] = await Promise.all([
        (supabase.from("planner_stats") as any).select("current_phase, start_date, target_year, crash_mode").eq("phone_number", phone).maybeSingle(),
        (supabase.from("planner_heat_score") as any).select("heat_score, lead_category, total_active_days, consistency_score").eq("phone_number", phone).maybeSingle(),
        (supabase.from("planner_activity") as any).select("date").eq("phone_number", phone).gte("date", getWeekStart()),
      ]);
      setPlannerData({
        stats: statsRes.data,
        heat: heatRes.data,
        activeDaysThisWeek: new Set((activityRes.data || []).map((r: any) => r.date)).size,
      });
    } catch (e) { console.error("[Dashboard] fetchPlanner ERROR", e); }
    setLoadingPlanner(false);
  };

  const fetchPractice = async () => {
    if (!userId) { setLoadingPractice(false); return; }
    setLoadingPractice(true);
    try {
      const { data } = await (supabase.from("practice_lab_attempts") as any)
        .select("section_id, chapter_slug, score_pct, total_questions, correct, time_used_seconds, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(50);
      setPracticeAttempts((data || []).slice(0, 20));
    } catch (e) { console.error("[Dashboard] fetchPractice ERROR", e); }
    setLoadingPractice(false);
  };

  const fetchCampaign = async () => {
    const phone = localStorage.getItem("percentilers_phone");
    if (!phone) { setCampaign(null); return; }
    try {
      const { data } = await (supabase.from("campaign_state") as any)
        .select("call_booked_at, converted_at, workflow_status, mentorship_active")
        .eq("phone_number", phone)
        .maybeSingle();
      setCampaign(data);
    } catch (e) { console.error("[Dashboard] fetchCampaign ERROR", e); }
  };

  const fetchMasterclass = async () => {
    const phone = localStorage.getItem("percentilers_phone");
    if (!phone) { setEngagement(null); return; }
    try {
      const { data } = await (supabase.from("webinar_engagement") as any)
        .select("watch_percentage, completed")
        .eq("phone_number", phone)
        .maybeSingle();
      setEngagement(data);
    } catch (e) { console.error("[Dashboard] fetchMasterclass ERROR", e); }
  };

  useEffect(() => {
    if (userId) {
      fetchLead();
      fetchPlanner();
      fetchPractice();
      fetchCampaign();
      fetchMasterclass();
    }
  }, [userId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Derive practice stats (accuracy, quiz count) from practice_lab_attempts
  const practiceStats = useMemo(() => {
    if (practiceAttempts.length === 0) return null;
    const totalQuizzes = practiceAttempts.length;
    const avgAccuracy = Math.round(practiceAttempts.reduce((s, a) => s + a.score_pct, 0) / totalQuizzes);
    return { totalQuizzes, avgAccuracy };
  }, [practiceAttempts]);

  // Combine streak data + practice stats for components
  const streakData = useMemo(() => {
    return {
      currentStreak,
      longestStreak,
      weeklyActivity,
      totalQuizzes: practiceStats?.totalQuizzes ?? 0,
      avgAccuracy: practiceStats?.avgAccuracy ?? 0,
    };
  }, [currentStreak, longestStreak, weeklyActivity, practiceStats]);

  const navigate = useNavigate();
  const firstName = lead?.name?.split(" ")[0] || user?.user_metadata?.full_name?.split(" ")[0] || "there";
  const converted = !!campaign?.converted_at;
  const mentorshipActive = !!campaign?.mentorship_active;

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const fade = (i: number) => ({
    initial: { opacity: 0, y: 16, filter: "blur(4px)" },
    animate: { opacity: 1, y: 0, filter: "blur(0px)" },
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  });

  return (
    <>
      <SEO title="Dashboard | Percentilers" description="Your personalized CAT preparation dashboard" canonical="https://percentilers.in/dashboard" />

      {/* Sticky top bar */}
      <DashboardTopBar
        firstName={firstName}
        streakCount={streakData.currentStreak}
        onSignOut={handleSignOut}
      />

      <main className="min-h-screen bg-background pt-16 pb-24">
        <div className="mx-auto px-4 max-w-lg">

          {/* Section 1: Greeting + Streak Hero */}
          <motion.div {...fade(0)} className="mt-4">
            <h1 className="text-xl font-bold text-foreground tracking-tight leading-tight">
              Hey {firstName} 👋
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5 mb-4">Let's keep the momentum going</p>
            <DashboardStreakHero streakData={streakData} loading={loadingStreaks} />
          </motion.div>

          {/* Section 2: Today's Action */}
          <motion.div {...fade(1)} className="mt-6">
            <DashboardTodayAction engagement={engagement} />
          </motion.div>

          {/* Section 3: Stat Pills */}
          <motion.div {...fade(2)} className="mt-6">
            <DashboardStatPills streakData={streakData} loading={loadingStreaks} />
          </motion.div>

          {/* Section 4: Progress */}
          <motion.div {...fade(3)} className="mt-6">
            <DashboardProgressCompact
              plannerData={plannerData}
              loadingPlanner={loadingPlanner}
              practiceAttempts={practiceAttempts}
              loadingPractice={loadingPractice}
            />
          </motion.div>

          {/* Section 5: Leaderboard */}
          <motion.div {...fade(4)} className="mt-6">
            <DashboardLeaderboardCompact />
          </motion.div>

          {/* Section 6: Recommendations */}
          <motion.div {...fade(5)} className="mt-6">
            <DashboardRecommendations practiceAttempts={practiceAttempts} />
          </motion.div>

          {/* Section 7: Quick Access */}
          <motion.div {...fade(6)} className="mt-6 mb-4">
            <DashboardQuickAccess converted={converted} mentorshipActive={mentorshipActive} />
          </motion.div>
        </div>
      </main>

      {/* Bottom nav - 4 items */}
      <DashboardBottomNav />
    </>
  );
}

// --- Helpers ---

function fmtLocal(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getWeekStart(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now);
  monday.setDate(diff);
  return fmtLocal(monday);
}
