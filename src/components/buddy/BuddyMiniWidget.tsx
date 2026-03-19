import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { getActiveBuddy, getBuddyProgress, getBuddyName, syncDailyActivity, type BuddyPair, type BuddyActivity } from "@/lib/buddy-utils";
import { Users2 } from "lucide-react";
import { Link } from "react-router-dom";

export default function BuddyMiniWidget() {
  const { user, isAuthenticated } = useAuth();
  const [pair, setPair] = useState<BuddyPair | null>(null);
  const [buddyActivity, setBuddyActivity] = useState<BuddyActivity | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      setLoaded(true);
      return;
    }

    const load = async () => {
      try {
        const activePair = await getActiveBuddy(user.id);
        if (!activePair) {
          setLoaded(true);
          return;
        }
        setPair(activePair);

        // Sync own activity
        const email = user.email || "";
        await syncDailyActivity(activePair.id, user.id, email).catch(() => {});

        // Get buddy's activity
        const progress = await getBuddyProgress(activePair.id);
        const buddyId = activePair.student_a_id === user.id ? activePair.student_b_id : activePair.student_a_id;
        const buddy = progress.find((p) => p.user_id === buddyId);
        setBuddyActivity(buddy ?? null);
      } catch {
        // silently fail
      } finally {
        setLoaded(true);
      }
    };

    load();
  }, [isAuthenticated, user]);

  if (!loaded || !pair || !user) return null;

  const buddyName = getBuddyName(pair, user.id);
  const hasActivity = buddyActivity?.planner_completed || buddyActivity?.quiz_attempted;

  return (
    <Link to="/study-buddy">
      <Card className="border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer mb-4">
        <CardContent className="p-3 flex items-center gap-3">
          <Users2 className="h-5 w-5 text-primary shrink-0" />
          <p className="text-sm text-foreground">
            {hasActivity ? (
              <>Your buddy <strong>{buddyName}</strong> {buddyActivity?.planner_completed ? "completed their planner goals" : "attempted a quiz"} today. Don't fall behind! 💪</>
            ) : (
              <>Your buddy <strong>{buddyName}</strong> hasn't started today yet. Be the first! 🔥</>
            )}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
