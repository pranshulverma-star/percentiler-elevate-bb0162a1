import { useState, useEffect, useCallback } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import SEO from "@/components/SEO";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { useBackToDashboard } from "@/hooks/useBackToDashboard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import SprintGoalList from "@/components/sprint/SprintGoalList";
import { getBuddyGoals, type SprintGoal } from "@/lib/sprint-utils";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Users2,
  Eye,
  Flame,
  Bell,
  ArrowRight,
  Loader2,
} from "lucide-react";
import BuddyInviteCard from "@/components/buddy/BuddyInviteCard";
import BuddyProgressCard from "@/components/buddy/BuddyProgressCard";
import BuddyNudgeButton from "@/components/buddy/BuddyNudgeButton";
import {
  getActiveBuddy,
  getPendingInvite,
  getInviteByCode,
  acceptInvite,
  dissolvePair,
  getBuddyProgress,
  syncDailyActivity,
  calculateBuddyStreak,
  getBuddyName,
  getBuddyId,
  hasReceivedNudge,
  type BuddyPair,
  type BuddyInvite,
  type BuddyActivity,
} from "@/lib/buddy-utils";

const fadeUp = { initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5 } };

// ─── State 1: Landing (Not logged in) ───
function LandingState({ onSignIn }: { onSignIn: () => void }) {
  const features = [
    { icon: Eye, title: "Shared Progress", desc: "See your buddy's daily planner and quiz activity in real-time." },
    { icon: Flame, title: "2x Streak Bonus", desc: "Both active today? Double the points for both of you." },
    { icon: Bell, title: "Gentle Nudges", desc: "Get notified when your buddy needs a little motivation." },
  ];

  return (
    <motion.div {...fadeUp} className="max-w-3xl mx-auto space-y-10 text-center">
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
          <Users2 className="h-4 w-4" /> New Feature
        </div>
        <h1 className="text-3xl md:text-5xl font-black tracking-tight text-foreground">
          Find Your CAT <span className="text-primary">Study Buddy</span>
        </h1>
        <p className="text-muted-foreground text-base md:text-lg max-w-xl mx-auto">
          Pair up with a friend. Track each other's daily progress. Stay accountable together.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {features.map((f) => (
          <Card key={f.title} className="text-left border-border">
            <CardContent className="p-5 space-y-3">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                <f.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-bold text-foreground">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-3">
        <Button size="lg" onClick={onSignIn} className="gap-2">
          Get Started — Sign in with Google <ArrowRight className="h-4 w-4" />
        </Button>
        <p className="text-xs text-muted-foreground">Already have an invite link? It will auto-pair you after sign-in.</p>
      </div>
    </motion.div>
  );
}

// ─── State 3: Dashboard (Buddy paired) ───
function DashboardState({
  pair,
  userId,
  userEmail,
  userName,
}: {
  pair: BuddyPair;
  userId: string;
  userEmail: string;
  userName: string;
}) {
  const [myActivity, setMyActivity] = useState<BuddyActivity | null>(null);
  const [buddyActivityData, setBuddyActivityData] = useState<BuddyActivity | null>(null);
  const [buddyStreak, setBuddyStreak] = useState(0);
  const [buddyGoals, setBuddyGoals] = useState<SprintGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [dissolveOpen, setDissolveOpen] = useState(false);
  const [dissolving, setDissolving] = useState(false);
  const [nudgeReceived, setNudgeReceived] = useState(false);

  const buddyName = getBuddyName(pair, userId);
  const buddyId = getBuddyId(pair, userId);

  useEffect(() => {
    const load = async () => {
      try {
        await syncDailyActivity(pair.id, userId, userEmail).catch(() => {});
        const [progress, streak, gotNudge, goals] = await Promise.all([
          getBuddyProgress(pair.id),
          calculateBuddyStreak(pair.id),
          hasReceivedNudge(pair.id, buddyId),
          getBuddyGoals(buddyId),
        ]);
        const mine = progress.find((p) => p.user_id === userId) ?? null;
        const buddy = progress.find((p) => p.user_id === buddyId) ?? null;
        setMyActivity(mine);
        setBuddyActivityData(buddy);
        setBuddyStreak(streak);
        setNudgeReceived(gotNudge);
        setBuddyGoals(goals);
      } catch {
        toast.error("Failed to load progress. Please refresh.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [pair.id, userId, userEmail, buddyId]);

  const handleDissolve = async () => {
    setDissolving(true);
    try {
      await dissolvePair(pair.id);
      toast.success("Partnership dissolved. You can invite a new buddy anytime.");
      window.location.reload();
    } catch {
      toast.error("Failed to dissolve partnership.");
    } finally {
      setDissolving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const buildProgress = (activity: BuddyActivity | null, name: string, isBonus: boolean) => ({
    name,
    plannerCompleted: activity?.planner_completed ?? false,
    quizAttempted: activity?.quiz_attempted ?? false,
    streak: activity?.streak_count ?? 0,
    points: ((activity?.planner_completed ? 10 : 0) + (activity?.quiz_attempted ? 10 : 0)) * (isBonus ? 2 : 1),
    bonusEarned: isBonus,
  });

  const bothActive =
    (myActivity?.planner_completed || myActivity?.quiz_attempted) &&
    (buddyActivityData?.planner_completed || buddyActivityData?.quiz_attempted);

  const myProgress = buildProgress(myActivity, userName, !!bothActive);
  const buddyProgress = buildProgress(buddyActivityData, buddyName, !!bothActive);

  const buddyIsActive = !!(buddyActivityData?.planner_completed || buddyActivityData?.quiz_attempted);

  return (
    <motion.div {...fadeUp} className="max-w-2xl mx-auto space-y-6">
      {nudgeReceived && (
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 rounded-lg border border-primary/30 bg-primary/10 px-4 py-3"
        >
          <Bell className="h-5 w-5 text-primary shrink-0" />
          <p className="text-sm font-medium text-foreground">
            {buddyName} nudged you! Time to get started 💪
          </p>
          <button
            onClick={() => setNudgeReceived(false)}
            className="ml-auto text-muted-foreground hover:text-foreground text-xs"
          >
            ✕
          </button>
        </motion.div>
      )}
      <BuddyProgressCard
        pair={pair}
        currentUserId={userId}
        myProgress={myProgress}
        buddyProgress={buddyProgress}
        
      />

      <div className="flex justify-center">
        <BuddyNudgeButton
          pairId={pair.id}
          userId={userId}
          buddyName={buddyName}
          buddyIsActive={buddyIsActive}
        />
      </div>

      {/* Buddy's Sprint Goals */}
      <Card className="border-border">
        <CardContent className="p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Flame className="h-4 w-4 text-primary" />
            <p className="text-sm font-semibold text-foreground">{buddyName}'s Daily Sprint</p>
            {buddyGoals.length > 0 && (
              <span className="ml-auto text-xs text-muted-foreground">
                {buddyGoals.filter((g) => g.completed).length}/{buddyGoals.length} done
              </span>
            )}
          </div>
          {buddyGoals.length === 0 ? (
            <p className="text-xs text-muted-foreground">{buddyName} hasn't set sprint goals yet today.</p>
          ) : (
            <SprintGoalList goals={buddyGoals} onToggle={() => {}} onDelete={() => {}} readOnly />
          )}
        </CardContent>
      </Card>

      {/* Daily Sprint CTA */}
      <Button variant="outline" asChild className="w-full gap-2">
        <Link to="/daily-sprint">
          Go to Daily Sprint <ArrowRight className="h-4 w-4" />
        </Link>
      </Button>

      {/* Course CTA */}
      <Card className="border-border bg-secondary/30">
        <CardContent className="p-5 text-center space-y-3">
          <p className="text-sm text-muted-foreground">
            Want structured CAT prep with daily assignments and mock analysis?
          </p>
          <Button variant="outline" asChild className="gap-2">
            <a href="/#courses">
              Explore CAT 2026 Course <ArrowRight className="h-4 w-4" />
            </a>
          </Button>
        </CardContent>
      </Card>

      <div className="text-center">
        <button
          onClick={() => setDissolveOpen(true)}
          className="text-xs text-muted-foreground hover:text-destructive transition-colors underline"
        >
          Dissolve Partnership
        </button>
      </div>

      <Dialog open={dissolveOpen} onOpenChange={setDissolveOpen}>
        <DialogContent className="max-w-sm">
          <DialogTitle>Dissolve Partnership?</DialogTitle>
          <DialogDescription>
            Your shared streak history will be preserved but you'll need to invite a new buddy.
          </DialogDescription>
          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setDissolveOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" className="flex-1" onClick={handleDissolve} disabled={dissolving}>
              {dissolving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Dissolve"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

// ─── Main Page ───
export default function StudyBuddy() {
  const [searchParams] = useSearchParams();
  const { user, isAuthenticated, loading: authLoading, signIn } = useAuth();
  const inviteParam = searchParams.get("invite");

  const [pair, setPair] = useState<BuddyPair | null>(null);
  const [pendingInvite, setPendingInvite] = useState<BuddyInvite | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [joiningInvite, setJoiningInvite] = useState(false);

  const userName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split("@")[0] || "Aspirant";
  const userEmail = user?.email || "";

  const loadState = useCallback(async () => {
    if (!user) {
      setPageLoading(false);
      return;
    }
    try {
      const activePair = await getActiveBuddy(user.id);
      if (activePair) {
        setPair(activePair);
        setPageLoading(false);
        return;
      }

      // Handle invite param
      if (inviteParam) {
        setJoiningInvite(true);
        try {
          const inv = await getInviteByCode(inviteParam);
          if (!inv) {
            setInviteError("Invalid invite code.");
          } else if (inv.status !== "pending") {
            setInviteError("This invite has expired or was already used.");
          } else if (new Date(inv.expires_at) < new Date()) {
            setInviteError("This invite has expired. Ask your friend for a new link.");
          } else if (inv.inviter_id === user.id) {
            setInviteError("You can't accept your own invite!");
          } else {
            const newPair = await acceptInvite(inv, user.id, userName);
            setPair(newPair);
            toast.success("You're now study buddies! 🎉");
          }
        } catch (err: any) {
          setInviteError(err.message || "Failed to accept invite.");
        } finally {
          setJoiningInvite(false);
        }
      } else {
        const pending = await getPendingInvite(user.id);
        setPendingInvite(pending);
      }
    } catch {
      toast.error("Something went wrong. Please refresh.");
    } finally {
      setPageLoading(false);
    }
  }, [user, inviteParam, userName]);

  useEffect(() => {
    if (authLoading) return;
    loadState();
  }, [authLoading, loadState]);

  const handleSignIn = () => {
    const redirectPath = inviteParam
      ? `/study-buddy?invite=${inviteParam}`
      : "/study-buddy";
    signIn(redirectPath);
  };

  const isLoading = authLoading || pageLoading || joiningInvite;

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Study Buddy — Find Your CAT Accountability Partner | Percentilers"
        description="Pair up with a friend for CAT preparation. Track daily progress, earn streak bonuses, and stay accountable together."
        canonical="https://percentilers.in/study-buddy"
      />
      <Navbar />
      <main className="pt-6 pb-16 px-4 md:px-6">
        <div className="max-w-5xl mx-auto py-8 md:py-16">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : !isAuthenticated ? (
            inviteParam ? (
              <motion.div {...fadeUp} className="max-w-md mx-auto text-center space-y-6">
                <div className="space-y-3">
                  <Users2 className="h-10 w-10 text-primary mx-auto" />
                  <h1 className="text-2xl font-bold text-foreground">Join as a Study Buddy</h1>
                  <p className="text-muted-foreground">Sign in to join your friend's study group.</p>
                </div>
                <Button size="lg" onClick={handleSignIn} className="gap-2">
                  Sign in with Google <ArrowRight className="h-4 w-4" />
                </Button>
              </motion.div>
            ) : (
              <LandingState onSignIn={handleSignIn} />
            )
          ) : inviteError ? (
            <motion.div {...fadeUp} className="max-w-md mx-auto text-center space-y-6">
              <div className="space-y-3">
                <h2 className="text-xl font-bold text-foreground">Oops!</h2>
                <p className="text-muted-foreground">{inviteError}</p>
              </div>
              <Button onClick={() => { setInviteError(null); window.history.replaceState({}, "", "/study-buddy"); }}>
                Go to Study Buddy
              </Button>
            </motion.div>
          ) : pair ? (
            <DashboardState
              pair={pair}
              userId={user!.id}
              userEmail={userEmail}
              userName={userName}
            />
          ) : (
            <div className="max-w-md mx-auto">
              <BuddyInviteCard
                userId={user!.id}
                userName={userName}
                pendingInvite={pendingInvite}
                onPaired={() => loadState()}
              />
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
