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

  const [loadingLead, setLoadingLead] = useState(true);
  const [loadingPlanner, setLoadingPlanner] = useState(true);
  const [loadingMasterclass, setLoadingMasterclass] = useState(true);
  const [loadingCampaign, setLoadingCampaign] = useState(true);
  const [loadingPractice, setLoadingPractice] = useState(true);

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
    // planner tables use email as phone_number identifier
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
    // Try email first, then phone
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
      .select("call_booked_at, converted_at, workflow_status")
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
      .limit(20);
    setPracticeAttempts(data || []);
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
            <DashboardProfile lead={lead} loading={loadingLead} onPhoneUpdated={() => { fetchLead(); refetchPhone(); fetchCampaign(); }} />
            <DashboardCallCTA campaign={campaign} loading={loadingCampaign} />
            <DashboardPlanner data={plannerData} loading={loadingPlanner} />
            <DashboardMasterclass engagement={engagement} loading={loadingMasterclass} />
            <DashboardPracticeLab attempts={practiceAttempts} loading={loadingPractice} />
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
