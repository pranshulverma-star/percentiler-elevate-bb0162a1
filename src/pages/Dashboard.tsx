import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useLeadPhone } from "@/hooks/useLeadPhone";
import Navbar from "@/components/Navbar";
import DashboardProfile from "@/components/dashboard/DashboardProfile";
import DashboardPlanner from "@/components/dashboard/DashboardPlanner";
import DashboardMasterclass from "@/components/dashboard/DashboardMasterclass";
import DashboardCallCTA from "@/components/dashboard/DashboardCallCTA";
import DashboardPracticeLab from "@/components/dashboard/DashboardPracticeLab";
import DashboardStreaks from "@/components/dashboard/DashboardStreaks";
import DashboardCourses from "@/components/dashboard/DashboardCourses";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import SEO from "@/components/SEO";

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
    if (!email) return;
    setLoadingPlanner(true);
    const [statsRes, heatRes, activityRes] = await Promise.all([
      (supabase.from("planner_stats") as any).select("current_phase, start_date, target_year, crash_mode").eq("phone_number", email).maybeSingle(),
      (supabase.from("planner_heat_score") as any).select("heat_score, lead_category, total_active_days, consistency_score").eq("phone_number", email).maybeSingle(),
      (supabase.from("planner_activity") as any).select("date").eq("phone_number", email).gte("date", getWeekStart()),
    ]);
    setPlannerData({
      stats: statsRes.data,
      heat: heatRes.data,
      activeDaysThisWeek: new Set((activityRes.data || []).map((r: any) => r.date)).size,
    });
    setLoadingPlanner(false);
  };

  const fetchMasterclass = async () => {
    if (!email) return;
    setLoadingMasterclass(true);
    let { data } = await (supabase.from("webinar_engagement") as any)
      .select("watch_percentage, completed")
      .eq("phone_number", email)
      .maybeSingle();
    if (!data) {
      const phone = localStorage.getItem("percentilers_phone");
      if (phone) {
        const res = await (supabase.from("webinar_engagement") as any)
          .select("watch_percentage, completed")
          .eq("phone_number", phone)
          .maybeSingle();
        data = res.data;
      }
    }
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

    // Compute streaks from attempts
    setLoadingStreaks(true);
    if (attempts.length > 0) {
      const streaks = computeStreaks(attempts);
      setStreakData(streaks);
    }
    setLoadingStreaks(false);
    setLoadingPractice(false);
  };

  useEffect(() => {
    if (userId && email) {
      fetchLead();
      fetchPlanner();
      fetchMasterclass();
      fetchCampaign();
      fetchPractice();
    }
  }, [userId, email]);

  const firstName = lead?.name?.split(" ")[0] || user?.user_metadata?.full_name?.split(" ")[0] || "there";
  const converted = !!campaign?.converted_at;
  const mentorshipActive = !!campaign?.mentorship_active;

  return (
    <>
      <SEO title="Dashboard | Percentilers" description="Your personalized CAT preparation dashboard" canonical="https://percentilers.in/dashboard" />
      <Navbar />
      <main className="min-h-screen bg-background pt-4 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                Hey {firstName} 👋
              </h1>
              <p className="text-sm text-muted-foreground mt-1">Your CAT prep journey at a glance</p>
            </div>
            <Button variant="ghost" size="sm" onClick={signOut} className="text-muted-foreground">
              <LogOut className="h-4 w-4 mr-1" /> Sign out
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Profile & Call CTA */}
            <DashboardProfile lead={lead} loading={loadingLead} onPhoneUpdated={() => { fetchLead(); refetchPhone(); fetchCampaign(); }} />
            <DashboardCallCTA campaign={campaign} loading={loadingCampaign} />

            {/* Performance Streaks - full width */}
            <DashboardStreaks data={streakData} loading={loadingStreaks} />

            {/* Planner & Masterclass */}
            <DashboardPlanner data={plannerData} loading={loadingPlanner} />
            <DashboardMasterclass engagement={engagement} loading={loadingMasterclass} />

            {/* Practice Lab */}
            <DashboardPracticeLab attempts={practiceAttempts} loading={loadingPractice} />

            {/* Course, Mentorship, Test Series cards */}
            <DashboardCourses converted={converted} mentorshipActive={mentorshipActive} />
          </div>
        </div>
      </main>
    </>
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

  // Get unique dates (sorted desc)
  const dates = [...new Set(attempts.map((a: any) => a.created_at.split("T")[0]))].sort().reverse();

  // Current streak: consecutive days from today/yesterday
  const today = new Date().toISOString().split("T")[0];
  let currentStreak = 0;
  let checkDate = new Date();
  
  // Start from today, if no activity today, start from yesterday
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

  // Longest streak
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

  // Weekly activity (Mon-Sun)
  const weekStart = getWeekStart();
  const weeklyActivity: boolean[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    const ds = d.toISOString().split("T")[0];
    weeklyActivity.push(dates.includes(ds));
  }

  // Trend: compare last 5 vs previous 5
  let recentTrend: "up" | "down" | "stable" = "stable";
  if (attempts.length >= 10) {
    const recent5 = attempts.slice(0, 5).reduce((s: number, a: any) => s + a.score_pct, 0) / 5;
    const prev5 = attempts.slice(5, 10).reduce((s: number, a: any) => s + a.score_pct, 0) / 5;
    if (recent5 > prev5 + 5) recentTrend = "up";
    else if (recent5 < prev5 - 5) recentTrend = "down";
  }

  return { currentStreak, longestStreak, totalQuizzes, avgAccuracy, weeklyActivity, recentTrend };
}
