import { useState, useEffect } from "react";
import { Users2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import SprintGoalList from "./SprintGoalList";
import { getBuddyGoals, type SprintGoal } from "@/lib/sprint-utils";
import { getActiveBuddy, getBuddyName, getBuddyId, type BuddyPair } from "@/lib/buddy-utils";

interface Props {
  userId: string;
}

export default function SprintBuddyView({ userId }: Props) {
  const [pair, setPair] = useState<BuddyPair | null>(null);
  const [goals, setGoals] = useState<SprintGoal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const activePair = await getActiveBuddy(userId);
        if (!activePair) { setLoading(false); return; }
        setPair(activePair);
        const buddyId = getBuddyId(activePair, userId);
        const buddyGoals = await getBuddyGoals(buddyId);
        setGoals(buddyGoals);
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [userId]);

  if (loading) return null;

  if (!pair) {
    return (
      <Card className="border-border bg-secondary/30">
        <CardContent className="p-5 text-center space-y-3">
          <Users2 className="h-6 w-6 text-muted-foreground mx-auto" />
          <p className="text-sm text-muted-foreground">
            Pair with a Study Buddy to see their daily sprint and stay accountable!
          </p>
          <Button variant="outline" size="sm" asChild>
            <Link to="/study-buddy">Find a Buddy</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const buddyName = getBuddyName(pair, userId);

  return (
    <Card className="border-border">
      <CardContent className="p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Users2 className="h-4 w-4 text-primary" />
          <p className="text-sm font-semibold text-foreground">{buddyName}'s Sprint</p>
          {goals.length > 0 && (
            <span className="ml-auto text-xs text-muted-foreground">
              {goals.filter((g) => g.completed).length}/{goals.length} done
            </span>
          )}
        </div>
        {goals.length === 0 ? (
          <p className="text-xs text-muted-foreground">{buddyName} hasn't set goals yet today.</p>
        ) : (
          <SprintGoalList goals={goals} onToggle={() => {}} onDelete={() => {}} readOnly />
        )}
      </CardContent>
    </Card>
  );
}
