import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useStreaks } from "@/hooks/useStreaks";
import { supabase } from "@/integrations/supabase/client";
import DashboardTopBar from "@/components/dashboard/DashboardTopBar";
import DashboardBottomNav, { type DashboardTab } from "@/components/dashboard/DashboardBottomNav";
import HomeTab from "@/components/dashboard/HomeTab";
import PracticeTab from "@/components/dashboard/PracticeTab";
import ExploreTab from "@/components/dashboard/ExploreTab";
import PlanTab from "@/components/dashboard/PlanTab";
import SEO from "@/components/SEO";
import { useBackToDashboard } from "@/hooks/useBackToDashboard";

export default function Dashboard() {
  useBackToDashboard();
  const { user, signOut } = useAuth();
  const userId = user?.id || "";
  const { currentStreak, longestStreak, weeklyActivity, loading: loadingStreaks } = useStreaks();

  const [activeTab, setActiveTab] = useState<DashboardTab>("home");
  const [lead, setLead] = useState<any>(null);
  const [plannerData, setPlannerData] = useState<any>(null);
  const [engagement, setEngagement] = useState<any>(null);
  const [campaign, setCampaign] = useState<any>(null);
  const [practiceAttempts, setPracticeAttempts] = useState<any[]>([]);
  const [sprintGoals, setSprintGoals] = useState<{ total: number; done: number } | null>(null);

  const [, setLoadingLead] = useState(true);
  const [loadingPlanner, setLoadingPlanner] = useState(true);
  const [loadingPractice, setLoadingPractice] = useState(true);

  useEffect(() => {
    if (!userId) return;

    // Fetch lead
    (async () => {
      setLoadingLead(true);
      try {
        const { data } = await (supabase.from("leads") as any).select("name, email, phone_number").eq("user_id", userId).maybeSingle();
        setLead(data);
      } catch (e) { console.error("[Dashboard] fetchLead ERROR", e); }
      setLoadingLead(false);
    })();

    // Fetch planner
    (async () => {
      const phone = localStorage.getItem("percentilers_phone");
      if (!phone) { setLoadingPlanner(false); return; }
      setLoadingPlanner(true);
      try {
        const [statsRes, heatRes, activityRes] = await Promise.all([
          (supabase.from("planner_stats") as any).select("current_phase, start_date, target_year, crash_mode").eq("phone_number", phone).maybeSingle(),
          (supabase.from("planner_heat_score") as any).select("heat_score, lead_category, total_active_days, consistency_score").eq("phone_number", phone).maybeSingle(),
          (supabase.from("planner_activity") as any).select("date").eq("phone_number", phone).gte("date", getWeekStart()),
        ]);
        setPlannerData({ stats: statsRes.data, heat: heatRes.data, activeDaysThisWeek: new Set((activityRes.data || []).map((r: any) => r.date)).size });
      } catch (e) { console.error("[Dashboard] fetchPlanner ERROR", e); }
      setLoadingPlanner(false);
    })();

    // Fetch practice
    (async () => {
      setLoadingPractice(true);
      try {
        const { data } = await (supabase.from("practice_lab_attempts") as any)
          .select("section_id, chapter_slug, score_pct, total_questions, correct, time_used_seconds, created_at")
          .eq("user_id", userId).order("created_at", { ascending: false }).limit(50);
        setPracticeAttempts((data || []).slice(0, 20));
      } catch (e) { console.error("[Dashboard] fetchPractice ERROR", e); }
      setLoadingPractice(false);
    })();

    // Fetch sprint goals
    (async () => {
      const today = new Date().toISOString().slice(0, 10);
      try {
        const { data } = await (supabase.from("daily_sprint_goals") as any).select("completed").eq("user_id", userId).eq("sprint_date", today);
        if (data && data.length > 0) setSprintGoals({ total: data.length, done: data.filter((g: any) => g.completed).length });
      } catch (e) { console.error("[Dashboard] fetchSprint ERROR", e); }
    })();

    // Fetch campaign
    (async () => {
      const phone = localStorage.getItem("percentilers_phone");
      if (!phone) { setCampaign(null); return; }
      try {
        const { data } = await (supabase.from("campaign_state") as any).select("call_booked_at, converted_at, workflow_status, mentorship_active").eq("phone_number", phone).maybeSingle();
        setCampaign(data);
      } catch (e) { console.error("[Dashboard] fetchCampaign ERROR", e); }
    })();

    // Fetch masterclass
    (async () => {
      const phone = localStorage.getItem("percentilers_phone");
      if (!phone) { setEngagement(null); return; }
      try {
        const { data } = await (supabase.from("webinar_engagement") as any).select("watch_percentage, completed").eq("phone_number", phone).maybeSingle();
        setEngagement(data);
      } catch (e) { console.error("[Dashboard] fetchMasterclass ERROR", e); }
    })();
  }, [userId]);

  const practiceStats = useMemo(() => {
    if (practiceAttempts.length === 0) return null;
    const totalQuizzes = practiceAttempts.length;
    const avgAccuracy = Math.round(practiceAttempts.reduce((s, a) => s + a.score_pct, 0) / totalQuizzes);
    return { totalQuizzes, avgAccuracy };
  }, [practiceAttempts]);

  const streakData = useMemo(() => ({
    currentStreak, longestStreak, weeklyActivity,
    totalQuizzes: practiceStats?.totalQuizzes ?? 0,
    avgAccuracy: practiceStats?.avgAccuracy ?? 0,
  }), [currentStreak, longestStreak, weeklyActivity, practiceStats]);

  const navigate = useNavigate();
  const firstName = lead?.name?.split(" ")[0] || user?.user_metadata?.full_name?.split(" ")[0] || "there";
  const converted = !!campaign?.converted_at;
  const mentorshipActive = !!campaign?.mentorship_active;

  const handleSignOut = async () => { await signOut(); navigate("/"); };

  return (
    <>
      <SEO title="Dashboard | Percentilers" description="Your personalized CAT preparation dashboard" canonical="https://percentilers.in/dashboard" />

      <DashboardTopBar firstName={firstName} streakCount={streakData.currentStreak} onSignOut={handleSignOut} />

      <main className="h-screen overflow-hidden flex flex-col pt-14 pb-[56px]" style={{ background: "#FAFAF7" }}>
        <div className="flex-1 mx-auto px-4 max-w-[420px] w-full py-3 overflow-hidden">
          {activeTab === "home" && (
            <HomeTab
              firstName={firstName}
              streakData={streakData}
              loadingStreaks={loadingStreaks}
              sprintGoals={sprintGoals}
            />
          )}
          {activeTab === "practice" && (
            <PracticeTab
              engagement={engagement}
              streakData={streakData}
              loadingStreaks={loadingStreaks}
              plannerData={plannerData}
              loadingPlanner={loadingPlanner}
              practiceAttempts={practiceAttempts}
              loadingPractice={loadingPractice}
            />
          )}
          {activeTab === "explore" && (
            <ExploreTab
              practiceAttempts={practiceAttempts}
              converted={converted}
              mentorshipActive={mentorshipActive}
              streakData={streakData}
            />
          )}
          {activeTab === "plan" && (
            <PlanTab
              plannerData={plannerData}
              loadingPlanner={loadingPlanner}
              userId={userId}
            />
          )}
        </div>
      </main>

      <DashboardBottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </>
  );
}

function getWeekStart(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now);
  monday.setDate(diff);
  return `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, "0")}-${String(monday.getDate()).padStart(2, "0")}`;
}
