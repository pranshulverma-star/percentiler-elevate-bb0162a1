import { Flame, Zap, Target } from "lucide-react";
import { type SprintGoal, calculatePoints } from "@/lib/sprint-utils";

interface Props {
  goals: SprintGoal[];
  streak: number;
}

export default function SprintStats({ goals, streak }: Props) {
  const completed = goals.filter((g) => g.completed).length;
  const total = goals.length;
  const points = calculatePoints(goals);
  const allDone = total > 0 && completed === total;

  return (
    <div className="grid grid-cols-3 gap-3">
      <div className="rounded-lg border border-border bg-card p-3 text-center space-y-1">
        <Target className="h-5 w-5 text-primary mx-auto" />
        <p className="text-lg font-bold text-foreground">{completed}/{total}</p>
        <p className="text-xs text-muted-foreground">Goals Done</p>
      </div>
      <div className="rounded-lg border border-border bg-card p-3 text-center space-y-1">
        <Zap className={`h-5 w-5 mx-auto ${points > 0 ? "text-primary" : "text-muted-foreground"}`} />
        <p className="text-lg font-bold text-foreground">{points}</p>
        <p className="text-xs text-muted-foreground">Points</p>
      </div>
      <div className="rounded-lg border border-border bg-card p-3 text-center space-y-1">
        <Flame className={`h-5 w-5 mx-auto ${streak > 0 ? "text-orange-500" : "text-muted-foreground"}`} />
        <p className="text-lg font-bold text-foreground">{streak}</p>
        <p className="text-xs text-muted-foreground">Day Streak</p>
      </div>
      {allDone && (
        <div className="col-span-3 text-center py-2">
          <p className="text-sm font-semibold text-primary">🎉 All goals smashed! +20 bonus points</p>
        </div>
      )}
    </div>
  );
}
