import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import SEO from "@/components/SEO";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { useBackToDashboard } from "@/hooks/useBackToDashboard";
import { useStreaks } from "@/hooks/useStreaks";
import { useBuddyRealtimeToast } from "@/hooks/useBuddyRealtimeToast";
import { Button } from "@/components/ui/button";
import { ArrowRight, CalendarCheck, Flame, Target } from "lucide-react";
import SprintGoalForm from "@/components/sprint/SprintGoalForm";
import SprintGoalList from "@/components/sprint/SprintGoalList";

import SprintBuddyView from "@/components/sprint/SprintBuddyView";
import { getActiveBuddy, getBuddyId, getBuddyName } from "@/lib/buddy-utils";
import SprintWeeklySummary from "@/components/sprint/SprintWeeklySummary";
import {
  getTodayGoals,
  getWeeklyGoals,
  getSprintHistory,
  addGoal,
  toggleGoal,
  deleteGoal,
  calculateSprintStreak,
  type SprintGoal,
} from "@/lib/sprint-utils";

const fadeUp = { initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5 } };
const MAX_GOALS = 5;

function LandingState({ onSignIn }: { onSignIn: () => void }) {
  const features = [
    { icon: CalendarCheck, title: "Daily Goals", desc: "Set 3–5 focused study targets each day. Your plan, your pace." },
    { icon: Target, title: "Track & Complete", desc: "Check off goals as you finish. See your progress in real-time." },
    { icon: Flame, title: "Streaks & Points", desc: "Earn 10 pts per goal, bonus for completing all. Keep your streak alive!" },
  ];

  return (
    <motion.div {...fadeUp} className="max-w-3xl mx-auto space-y-10 text-center">
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
          <CalendarCheck className="h-4 w-4" /> Daily Sprint
        </div>
        <h1 className="text-3xl md:text-5xl font-black tracking-tight text-foreground">
          Your Daily <span className="text-primary">Study Sprint</span>
        </h1>
        <p className="text-muted-foreground text-base md:text-lg max-w-xl mx-auto">
          Set focused goals every day. Check them off. Build unstoppable momentum.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {features.map((f) => (
          <div key={f.title} className="rounded-lg border border-border bg-card p-5 text-left space-y-3">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
              <f.icon className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-bold text-foreground">{f.title}</h3>
            <p className="text-sm text-muted-foreground">{f.desc}</p>
          </div>
        ))}
      </div>

      <Button size="lg" onClick={onSignIn} className="gap-2">
        Get Started — Sign in with Google <ArrowRight className="h-4 w-4" />
      </Button>
    </motion.div>
  );
}

function SprintDashboard({ userId }: { userId: string }) {
  const { recordActivity } = useStreaks();
  const [goals, setGoals] = useState<SprintGoal[]>([]);
  const [weeklyGoals, setWeeklyGoals] = useState<SprintGoal[]>([]);
  const [historyGoals, setHistoryGoals] = useState<SprintGoal[]>([]);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [buddyId, setBuddyId] = useState<string | null>(null);
  const [buddyName, setBuddyName] = useState("Your Buddy");

  const loadData = useCallback(async () => {
    try {
      const [todayGoals, currentStreak, weekly] = await Promise.all([
        getTodayGoals(userId),
        calculateSprintStreak(userId),
        getWeeklyGoals(userId),
      ]);
      setGoals(todayGoals);
      setStreak(currentStreak);
      setWeeklyGoals(weekly);
    } catch {
      toast.error("Failed to load goals. Please refresh.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { loadData(); }, [loadData]);

  // Resolve buddy for realtime toasts
  useEffect(() => {
    (async () => {
      try {
        const pair = await getActiveBuddy(userId);
        if (pair) {
          setBuddyId(getBuddyId(pair, userId));
          setBuddyName(getBuddyName(pair, userId));
        }
      } catch {}
    })();
  }, [userId]);

  useBuddyRealtimeToast(buddyId, buddyName);

  const loadHistory = async () => {
    setLoadingHistory(true);
    try {
      const history = await getSprintHistory(userId, 14);
      setHistoryGoals(history);
    } catch {
      toast.error("Failed to load history.");
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleAdd = async (subject: string, activityType: string, description: string) => {
    if (goals.length >= MAX_GOALS) {
      toast.error("Maximum 5 goals per day.");
      return;
    }
    try {
      const newGoal = await addGoal(userId, subject, activityType, description, goals.length);
      setGoals((prev) => [...prev, newGoal]);
      toast.success("Goal added! 🎯");
    } catch {
      toast.error("Failed to add goal.");
    }
  };

  const handleToggle = async (goalId: string, completed: boolean) => {
    setGoals((prev) => prev.map((g) => g.id === goalId ? { ...g, completed, completed_at: completed ? new Date().toISOString() : null } : g));
    try {
      await toggleGoal(goalId, completed);
      if (completed) {
        toast.success("Nice work! ✅");
        // Check if all goals are now completed
        const updatedGoals = goals.map(g => g.id === goalId ? { ...g, completed } : g);
        if (updatedGoals.length > 0 && updatedGoals.every(g => g.completed)) {
          recordActivity("sprint").catch(() => {});
        }
      }
    } catch {
      setGoals((prev) => prev.map((g) => g.id === goalId ? { ...g, completed: !completed } : g));
      toast.error("Failed to update goal.");
    }
  };

  const handleDelete = async (goalId: string) => {
    const prev = goals;
    setGoals((g) => g.filter((x) => x.id !== goalId));
    try {
      await deleteGoal(goalId);
    } catch {
      setGoals(prev);
      toast.error("Failed to delete goal.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const today = new Date();
  const dayName = today.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "short" });

  return (
    <motion.div {...fadeUp} className="max-w-2xl mx-auto space-y-4 md:space-y-6">
      <div className="text-center space-y-0.5">
        <h1 className="text-xl md:text-3xl font-black text-foreground">Today's Sprint</h1>
        <p className="text-xs md:text-sm text-muted-foreground">{dayName}</p>
      </div>

      <SprintWeeklySummary
        weeklyGoals={weeklyGoals}
        streak={streak}
        historyGoals={historyGoals}
        loadingHistory={loadingHistory}
        onLoadHistory={loadHistory}
      />

      <div className="space-y-4">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">My Goals</h2>
        <SprintGoalList goals={goals} onToggle={handleToggle} onDelete={handleDelete} />
        {goals.length < MAX_GOALS && (
          <SprintGoalForm onAdd={handleAdd} disabled={goals.length >= MAX_GOALS} />
        )}
        {goals.length >= MAX_GOALS && (
          <p className="text-xs text-muted-foreground text-center">Maximum 5 goals reached for today.</p>
        )}
      </div>

      <div className="pt-4 space-y-4">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Study Buddy</h2>
        <SprintBuddyView userId={userId} />
      </div>
    </motion.div>
  );
}

export default function DailySprint() {
  useBackToDashboard();
  const { user, isAuthenticated, loading: authLoading, signIn } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Daily Sprint — Set Daily CAT Study Goals | Percentilers"
        description="Set 3–5 focused study goals daily, track completion, earn streaks, and pair with a study buddy for accountability."
        canonical="https://percentilers.in/daily-sprint"
      />
      <Navbar />
      <main className="pt-4 pb-12 px-4 md:px-6">
        <div className="max-w-5xl mx-auto py-4 md:py-16">
          {authLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : !isAuthenticated ? (
            <LandingState onSignIn={() => signIn("/daily-sprint")} />
          ) : (
            <SprintDashboard userId={user!.id} />
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
