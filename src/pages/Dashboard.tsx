import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useLeadPhone } from "@/hooks/useLeadPhone";
import Navbar from "@/components/Navbar";
import DashboardHero from "@/components/dashboard/DashboardHero";
import DashboardStats from "@/components/dashboard/DashboardStats";
import DashboardMission from "@/components/dashboard/DashboardMission";
import DashboardProgress from "@/components/dashboard/DashboardProgress";
import DashboardLevelUp from "@/components/dashboard/DashboardLevelUp";
import DashboardExplore from "@/components/dashboard/DashboardExplore";
import WorkshopRecommendation, { getWeakSectionWorkshop } from "@/components/WorkshopRecommendation";
import DashboardTodaysBattle from "@/components/dashboard/DashboardTodaysBattle";
import SEO from "@/components/SEO";
import { motion } from "framer-motion";

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const { refetch: refetchPhone } = useLeadPhone();
  const email = user?.email || "";
  const userId = user?.id || "";

  const [lead, setLead] = useState<any>(null);
  const [plannerData, setPlannerData] = useState<any>(null);
  const [engagement, setEngagement] = useState<any>(null);
  const [campaign, setCampaign] = useState<any>(null);
  const [practiceAttempts, setPracticeAttempts] = useState<any[]>([]);
  const [streakData, setStreakData] = useState<any>(null);

  const [loadingLead, setLoadingLead] = useState(true);
  const [loadingPlanner, setLoadingPlanner] = useState(true);
  const [loadingMasterclass, setLoadingMasterclass] = useState(true);
  const [loadingCampaign, setLoadingCampaign] = useState(true);
  const [loadingPractice, setLoadingPractice] = useState(true);
  const [loadingStreaks, setLoadingStreaks] = useState(true);

  const fetchLead = async () => {
    if (!userId) return;
    setLoadingLead(true);
    const { data } = await (supabase.from("leads") as any)
      .select("name, email, phone_number")
      .eq("user_id", userId)
      .maybeSingle();
    setLead(data);
    setLoadingLead(false);
  };

  const fetchPlanner = async () => {
    const phone = localStorage.getItem("percentilers_phone");
    if (!phone) { setLoadingPlanner(false); return; }
    setLoadingPlanner(true);
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
    setLoadingPlanner(false);
  };

  const fetchMasterclass = async () => {
    const phone = localStorage.getItem("percentilers_phone");
    if (!phone) { setLoadingMasterclass(false); return; }
    setLoadingMasterclass(true);
    const { data } = await (supabase.from("webinar_engagement") as any)
      .select("watch_percentage, completed")
      .eq("phone_number", phone)
      .maybeSingle();
    setEngagement(data);
    setLoadingMasterclass(false);
  };

  const fetchCampaign = async () => {
    const phone = localStorage.getItem("percentilers_phone");
    if (!phone) { setLoadingCampaign(false); setCampaign(null); return; }
    setLoadingCampaign(true);
    const { data } = await (supabase.from("campaign_state") as any)
      .select("call_booked_at, converted_at, workflow_status, mentorship_active")
      .eq("phone_number", phone)
      .maybeSingle();
    setCampaign(data);
    setLoadingCampaign(false);
  };

  const fetchPractice = async () => {
    if (!userId) { setLoadingPractice(false); return; }
    setLoadingPractice(true);
    const { data } = await (supabase.from("practice_lab_attempts") as any)
      .select("section_id, chapter_slug, score_pct, total_questions, correct, time_used_seconds, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50);
    const attempts = data || [];
    setPracticeAttempts(attempts.slice(0, 20));

    setLoadingStreaks(true);
    if (attempts.length > 0) {
      const streaks = computeStreaks(attempts);
      setStreakData(streaks);
    }
    setLoadingStreaks(false);
    setLoadingPractice(false);
  };

  useEffect(() => {
    if (userId) {
      fetchLead();
      fetchPlanner();
      fetchMasterclass();
      fetchCampaign();
      fetchPractice();
    }
  }, [userId]); // eslint-disable-line react-hooks/exhaustive-deps

  const firstName = lead?.name?.split(" ")[0] || user?.user_metadata?.full_name?.split(" ")[0] || "there";
  const converted = !!campaign?.converted_at;
  const mentorshipActive = !!campaign?.mentorship_active;

  const stageVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.4, ease: [0, 0, 0.2, 1] as const },
    }),
  };

  return (
    <>
      <SEO title="Dashboard | Percentilers" description="Your personalized CAT preparation dashboard" canonical="https://percentilers.in/dashboard" />
      <Navbar />
      <main className="min-h-screen bg-background pt-4 pb-16">
        <div className="container mx-auto px-4 max-w-lg">

          {/* Hero */}
          <motion.div custom={0} initial="hidden" animate="visible" variants={stageVariants}>
            <DashboardHero
              firstName={firstName}
              lead={lead}
              loadingLead={loadingLead}
              streakData={streakData}
              onSignOut={signOut}
              onPhoneUpdated={() => { fetchLead(); refetchPhone(); fetchCampaign(); }}
            />
          </motion.div>

          {/* Journey stages with connectors */}
          <div className="relative mt-6">
            {/* Vertical connector line */}
            <div className="absolute left-5 top-0 bottom-0 w-px bg-border hidden md:block" />

            {/* Stage 1: Stats */}
            <motion.div custom={1} initial="hidden" animate="visible" variants={stageVariants} className="relative mb-8">
              <StageLabel number={1} label="YOUR STATS" />
              <DashboardStats streakData={streakData} loading={loadingStreaks} />
            </motion.div>

            {/* Quiz of the Day */}
            <motion.div custom={2} initial="hidden" animate="visible" variants={stageVariants} className="relative mb-8">
              <StageLabel number={2} label="QUIZ OF THE DAY" />
              <DashboardTodaysBattle />
            </motion.div>

            {/* Stage 3: Today's Mission */}
            <motion.div custom={3} initial="hidden" animate="visible" variants={stageVariants} className="relative mb-8">
              <StageLabel number={3} label="TODAY'S MISSION" />
              <DashboardMission engagement={engagement} loadingMasterclass={loadingMasterclass} />
            </motion.div>

            {/* Stage 4: Progress */}
            <motion.div custom={4} initial="hidden" animate="visible" variants={stageVariants} className="relative mb-8">
              <StageLabel number={4} label="PROGRESS" />
              <DashboardProgress
                plannerData={plannerData}
                loadingPlanner={loadingPlanner}
                practiceAttempts={practiceAttempts}
                loadingPractice={loadingPractice}
              />
            </motion.div>

            {/* Weak Area (between Progress and Level Up) */}
            {(() => {
              const weakWorkshop = getWeakSectionWorkshop(practiceAttempts);
              return weakWorkshop ? (
                <motion.div custom={3.5} initial="hidden" animate="visible" variants={stageVariants} className="relative mb-8">
                  <WorkshopRecommendation
                    workshops={[weakWorkshop]}
                    title="Improve Your Weak Area"
                    subtitle="Based on your practice history:"
                  />
                </motion.div>
              ) : null;
            })()}

            {/* Stage 5: Level Up */}
            <motion.div custom={5} initial="hidden" animate="visible" variants={stageVariants} className="relative mb-8">
              <StageLabel number={5} label="LEVEL UP" />
              <DashboardLevelUp />
            </motion.div>

            {/* Stage 6: Explore */}
            <motion.div custom={6} initial="hidden" animate="visible" variants={stageVariants} className="relative">
              <StageLabel number={6} label="EXPLORE" />
              <DashboardExplore converted={converted} mentorshipActive={mentorshipActive} />
            </motion.div>
          </div>
        </div>
      </main>
    </>
  );
}

function StageLabel({ number, label }: { number: number; label: string }) {
  return (
    <div className="flex items-center gap-3 mb-3 md:ml-0">
      <div className="relative z-10 flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 border border-primary/20">
        <span className="text-xs font-bold text-primary">{number}</span>
      </div>
      <span className="text-[10px] font-semibold tracking-[0.15em] uppercase text-muted-foreground">{label}</span>
    </div>
  );
}

function getWeekStart(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now);
  monday.setDate(diff);
  return monday.toISOString().split("T")[0];
}

function computeStreaks(attempts: any[]) {
  const totalQuizzes = attempts.length;
  const avgAccuracy = Math.round(attempts.reduce((s: number, a: any) => s + a.score_pct, 0) / totalQuizzes);
  const dates = [...new Set(attempts.map((a: any) => a.created_at.split("T")[0]))].sort().reverse();
  const today = new Date().toISOString().split("T")[0];
  let currentStreak = 0;
  let checkDate = new Date();
  if (dates[0] !== today) {
    checkDate.setDate(checkDate.getDate() - 1);
  }
  for (let i = 0; i < 365; i++) {
    const dateStr = checkDate.toISOString().split("T")[0];
    if (dates.includes(dateStr)) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }
  let longestStreak = 0;
  let tempStreak = 1;
  const sortedDates = [...dates].sort();
  for (let i = 1; i < sortedDates.length; i++) {
    const prev = new Date(sortedDates[i - 1]);
    const curr = new Date(sortedDates[i]);
    const diffDays = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
    if (diffDays === 1) {
      tempStreak++;
    } else {
      longestStreak = Math.max(longestStreak, tempStreak);
      tempStreak = 1;
    }
  }
  longestStreak = Math.max(longestStreak, tempStreak);
  const weekStart = getWeekStart();
  const weeklyActivity: boolean[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    const ds = d.toISOString().split("T")[0];
    weeklyActivity.push(dates.includes(ds));
  }
  let recentTrend: "up" | "down" | "stable" = "stable";
  if (attempts.length >= 10) {
    const recent5 = attempts.slice(0, 5).reduce((s: number, a: any) => s + a.score_pct, 0) / 5;
    const prev5 = attempts.slice(5, 10).reduce((s: number, a: any) => s + a.score_pct, 0) / 5;
    if (recent5 > prev5 + 5) recentTrend = "up";
    else if (recent5 < prev5 - 5) recentTrend = "down";
  }
  return { currentStreak, longestStreak, totalQuizzes, avgAccuracy, weeklyActivity, recentTrend };
}
