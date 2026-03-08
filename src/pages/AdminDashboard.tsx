import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, ShieldAlert, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import AdminSummaryBar from "@/components/admin/AdminSummaryBar";
import AdminLeadsTable from "@/components/admin/AdminLeadsTable";
import AdminPlannerStats from "@/components/admin/AdminPlannerStats";
import AdminPracticeStats from "@/components/admin/AdminPracticeStats";
import AdminCampaignPipeline from "@/components/admin/AdminCampaignPipeline";

const ADMIN_EMAILS = ["pranshul.verma1992@gmail.com"];

export default function AdminDashboard() {
  const { user, loading: authLoading, isAuthenticated, signIn } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = user?.email && ADMIN_EMAILS.includes(user.email.toLowerCase());

  useEffect(() => {
    if (authLoading) return;
    if (!isAdmin) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData?.session?.access_token;
        if (!token) throw new Error("No session");

        const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
        const res = await fetch(
          `https://${projectId}.supabase.co/functions/v1/get-admin-analytics`,
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
      } catch (err: any) {
        console.error("Admin fetch error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [authLoading, isAdmin]);

  // Auth still loading
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  // Not logged in — show login page
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-5">
        <ShieldAlert className="h-14 w-14 text-muted-foreground" />
        <h1 className="text-2xl font-bold text-foreground">Admin Login</h1>
        <p className="text-muted-foreground text-sm max-w-xs text-center">
          Sign in with your authorized Google account to access the admin dashboard.
        </p>
        <Button size="lg" onClick={() => signIn("/admin")} className="gap-2">
          <LogIn className="h-4 w-4" />
          Sign in with Google
        </Button>
      </div>
    );
  }

  // Logged in but not admin
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

  // Data still loading or null
  if (loading || !data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }


  if (error) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-3">
        <p className="text-destructive font-medium">Error: {error}</p>
        <button onClick={() => window.location.reload()} className="text-sm text-primary underline">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground">Master overview of all platform activity</p>
        </div>

        <AdminSummaryBar data={data.summary} />

        <Tabs defaultValue="leads" className="space-y-4">
          <TabsList className="flex-wrap">
            <TabsTrigger value="leads">Leads ({data.summary.total_leads})</TabsTrigger>
            <TabsTrigger value="planner">Planner</TabsTrigger>
            <TabsTrigger value="practice">Practice Lab</TabsTrigger>
            <TabsTrigger value="campaign">Campaign</TabsTrigger>
          </TabsList>

          <TabsContent value="leads">
            <AdminLeadsTable leads={data.leads} />
          </TabsContent>

          <TabsContent value="planner">
            <AdminPlannerStats heatScores={data.heat_scores} />
          </TabsContent>

          <TabsContent value="practice">
            <AdminPracticeStats chapters={data.practice_by_chapter} />
          </TabsContent>

          <TabsContent value="campaign">
            <AdminCampaignPipeline pipeline={data.campaign_pipeline} campaigns={data.campaigns} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
