import { useEffect, useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
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
import DashboardBuddyCTA from "@/components/dashboard/DashboardBuddyCTA";
import DashboardSprintPreview from "@/components/dashboard/DashboardSprintPreview";
import BuddyMiniWidget from "@/components/buddy/BuddyMiniWidget";
import SEO from "@/components/SEO";
import { motion } from "framer-motion";
import { Layers, ArrowRight } from "lucide-react";

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

  const practiceStats = useMemo(() => {
    if (practiceAttempts.length === 0) return null;
    const totalQuizzes = practiceAttempts.length;
    const avgAccuracy = Math.round(practiceAttempts.reduce((s, a) => s + a.score_pct, 0) / totalQuizzes);
    return { totalQuizzes, avgAccuracy };
  }, [practiceAttempts]);

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

      <DashboardTopBar
        firstName={firstName}
        streakCount={streakData.currentStreak}
        onSignOut={handleSignOut}
      />

      <main className="min-h-screen bg-background pt-16 pb-24 relative">
        {/* Subtle gradient mesh */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-20 -right-20 w-80 h-80 rounded-full bg-primary/[0.04] blur-[100px]" />
          <div className="absolute bottom-40 -left-20 w-60 h-60 rounded-full bg-primary/[0.03] blur-[80px]" />
        </div>

        <div className="mx-auto px-4 max-w-lg relative">

          {/* 1. Greeting + Streak Hero */}
          <motion.div {...fade(0)} className="mt-4">
            <h1 className="text-xl font-bold text-foreground tracking-tight leading-tight">
              Hey {firstName} 👋
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5 mb-4">Let's keep the momentum going</p>
            <DashboardStreakHero streakData={streakData} loading={loadingStreaks} />
          </motion.div>

          {/* 2. Study Buddy */}
          <motion.div {...fade(1)} className="mt-5">
            <BuddyMiniWidget />
            <DashboardBuddyCTA />
          </motion.div>

          {/* 3. Today's Action */}
          <motion.div {...fade(2)} className="mt-5">
            <DashboardTodayAction engagement={engagement} />
          </motion.div>

          {/* 4. Flashcard Quick Card */}
          <motion.div {...fade(3)} className="mt-5">
            <Link to="/flashcards" className="block">
              <div className="relative overflow-hidden rounded-2xl border border-border/40 bg-card/80 backdrop-blur-sm p-4 group hover:border-primary/30 transition-all duration-300 shadow-sm">
                <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-amber-500/10 blur-2xl pointer-events-none" />
                <div className="flex items-center gap-3 relative">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-amber-500/15 shrink-0">
                    <Layers className="h-5 w-5 text-amber-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">Daily Flashcards</p>
                    <p className="text-[11px] text-muted-foreground leading-snug">Review 5 cards in 2 min — build retention</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                </div>
              </div>
            </Link>
          </motion.div>

          {/* 5. Sprint Preview */}
          <motion.div {...fade(4)} className="mt-5">
            <DashboardSprintPreview />
          </motion.div>

          {/* 6. Stat Pills */}
          <motion.div {...fade(5)} className="mt-5">
            <DashboardStatPills streakData={streakData} loading={loadingStreaks} />
          </motion.div>

          {/* 7. Progress */}
          <motion.div {...fade(6)} className="mt-5">
            <DashboardProgressCompact
              plannerData={plannerData}
              loadingPlanner={loadingPlanner}
              practiceAttempts={practiceAttempts}
              loadingPractice={loadingPractice}
            />
          </motion.div>

          {/* 8. Recommendations */}
          <motion.div {...fade(7)} className="mt-5">
            <DashboardRecommendations practiceAttempts={practiceAttempts} converted={converted} mentorshipActive={mentorshipActive} streakData={streakData} />
          </motion.div>

          {/* 9. Leaderboard */}
          <motion.div {...fade(8)} className="mt-5">
            <DashboardLeaderboardCompact />
          </motion.div>

          {/* 10. Quick Access */}
          <motion.div {...fade(9)} className="mt-5 mb-4">
            <DashboardQuickAccess converted={converted} mentorshipActive={mentorshipActive} />
          </motion.div>
        </div>
      </main>

      <DashboardBottomNav />
    </>
  );
}

function getWeekStart(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now);
  monday.setDate(diff);
  const y = monday.getFullYear();
  const m = String(monday.getMonth() + 1).padStart(2, "0");
  const d = String(monday.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
