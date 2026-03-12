import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2, ShieldAlert, LogIn, RefreshCw, Download,
  LayoutDashboard, Users, FlaskConical, Swords, Megaphone
} from "lucide-react";
import AdminOverviewCards from "@/components/admin/AdminOverviewCards";
import AdminActiveUsers from "@/components/admin/AdminActiveUsers";
import AdminDailyChart from "@/components/admin/AdminDailyChart";
import AdminLeadsTable from "@/components/admin/AdminLeadsTable";
import AdminLeadSourcesChart from "@/components/admin/AdminLeadSourcesChart";
import AdminQuizAnalytics from "@/components/admin/AdminQuizAnalytics";
import AdminBattleAnalytics from "@/components/admin/AdminBattleAnalytics";
import AdminPlannerStats from "@/components/admin/AdminPlannerStats";
import AdminCampaignPipeline from "@/components/admin/AdminCampaignPipeline";

const ADMIN_EMAILS = ["pranshul.verma1992@gmail.com"];
const RANGES = [
  { value: "today", label: "Today" },
  { value: "7d", label: "7 Days" },
  { value: "30d", label: "30 Days" },
  { value: "all", label: "All Time" },
] as const;

const REFRESH_INTERVAL = 30000; // 30s

export default function AdminDashboard() {
  const { user, loading: authLoading, isAuthenticated, signIn } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [range, setRange] = useState<string>("all");
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const isAdmin = user?.email && ADMIN_EMAILS.includes(user.email.toLowerCase());

  const fetchData = useCallback(async (selectedRange: string, silent = false) => {
    if (!silent) setLoading(true);
    else setIsRefreshing(true);
    setError(null);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      if (!token) throw new Error("No session");

      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const res = await fetch(
        `https://${projectId}.supabase.co/functions/v1/get-admin-analytics?range=${selectedRange}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `HTTP ${res.status}`);
      }

      setData(await res.json());
      setLastRefresh(new Date());
    } catch (err: any) {
      console.error("Admin fetch error:", err);
      if (!silent) setError(err.message);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!isAdmin) {
      setLoading(false);
      return;
    }
    fetchData(range);
  }, [authLoading, isAdmin, range, fetchData]);

  // Auto-refresh
  useEffect(() => {
    if (!isAdmin) return;
    const interval = setInterval(() => fetchData(range, true), REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [isAdmin, range, fetchData]);

  const handleExport = () => {
    if (!data) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `admin-analytics-${range}-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Auth still loading
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  // Not logged in
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-5">
        <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5">
          <ShieldAlert className="h-12 w-12 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">Admin Console</h1>
        <p className="text-muted-foreground text-sm max-w-xs text-center">
          Sign in with your authorized Google account to access the dashboard.
        </p>
        <Button size="lg" onClick={() => signIn("/admin")} className="gap-2">
          <LogIn className="h-4 w-4" />
          Sign in with Google
        </Button>
      </div>
    );
  }

  // Not admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-3">
        <ShieldAlert className="h-12 w-12 text-destructive" />
        <h1 className="text-xl font-bold text-foreground">Access Denied</h1>
        <p className="text-muted-foreground text-sm">You don't have admin privileges.</p>
        <p className="text-xs text-muted-foreground">Signed in as: {user?.email}</p>
      </div>
    );
  }

  // Loading
  if (loading || !data) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
        <p className="text-sm text-muted-foreground">Loading analytics…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-3">
        <p className="text-destructive font-medium">Error: {error}</p>
        <Button variant="outline" onClick={() => fetchData(range)}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1400px] mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Real-time platform analytics
              {lastRefresh && (
                <span className="ml-2 text-[10px] text-muted-foreground/60">
                  Updated {lastRefresh.toLocaleTimeString()}
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {/* Range filter */}
            <div className="flex items-center bg-secondary rounded-lg p-0.5">
              {RANGES.map((r) => (
                <button
                  key={r.value}
                  onClick={() => setRange(r.value)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                    range === r.value
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchData(range, true)}
              disabled={isRefreshing}
              className="gap-1.5"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport} className="gap-1.5">
              <Download className="h-3.5 w-3.5" />
              Export
            </Button>
            {isRefreshing && (
              <Badge variant="secondary" className="text-[10px] animate-pulse">Syncing…</Badge>
            )}
          </div>
        </div>

        {/* Overview Cards */}
        <AdminOverviewCards data={data.summary} />

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="bg-secondary/50 flex-wrap h-auto p-1 gap-0.5">
            {[
              { value: "overview", icon: LayoutDashboard, label: "Overview" },
              { value: "users", icon: Users, label: `Users (${data.summary.total_leads_all})` },
              { value: "quizzes", icon: FlaskConical, label: "Quizzes" },
              { value: "battles", icon: Swords, label: "Battles" },
              { value: "campaign", icon: Megaphone, label: "Campaign" },
            ].map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value} className="gap-1.5 text-xs data-[state=active]:bg-background">
                <tab.icon className="h-3.5 w-3.5" />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <AnimatePresence mode="wait">
            <TabsContent value="overview" className="space-y-4">
              <div className="grid gap-4 lg:grid-cols-3">
                <div className="lg:col-span-2">
                  <AdminDailyChart data={data.daily_chart || []} />
                </div>
                <AdminLeadSourcesChart data={data.lead_sources || []} />
              </div>
              <AdminQuizAnalytics
                byChapter={data.practice_by_chapter || []}
                bySection={data.practice_by_section || []}
                scoreDistribution={data.score_distribution || []}
              />
            </TabsContent>

            <TabsContent value="users" className="space-y-4">
              <AdminLeadsTable leads={data.leads || []} />
              <AdminPlannerStats heatScores={data.heat_scores || []} />
            </TabsContent>

            <TabsContent value="quizzes" className="space-y-4">
              <AdminQuizAnalytics
                byChapter={data.practice_by_chapter || []}
                bySection={data.practice_by_section || []}
                scoreDistribution={data.score_distribution || []}
              />
            </TabsContent>

            <TabsContent value="battles" className="space-y-4">
              <AdminBattleAnalytics
                summary={{
                  total_battles: data.summary.total_battles,
                  total_battle_players: data.summary.total_battle_players,
                  avg_battle_score: data.summary.avg_battle_score,
                }}
                battlesByStatus={data.battles_by_status || {}}
                topBattlers={data.top_battlers || []}
              />
            </TabsContent>

            <TabsContent value="campaign" className="space-y-4">
              <AdminCampaignPipeline
                pipeline={data.campaign_pipeline || {}}
                campaigns={data.campaigns || []}
              />
            </TabsContent>
          </AnimatePresence>
        </Tabs>
      </div>
    </div>
  );
}
