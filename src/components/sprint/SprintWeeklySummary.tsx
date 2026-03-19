import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, Target, Flame, ChevronDown, ChevronUp, CheckCircle2, Circle } from "lucide-react";
import { type SprintGoal, calculatePoints } from "@/lib/sprint-utils";
import { Button } from "@/components/ui/button";

interface Props {
  weeklyGoals: SprintGoal[];
  streak: number;
  historyGoals: SprintGoal[];
  loadingHistory: boolean;
  onLoadHistory: () => void;
}

export default function SprintWeeklySummary({ weeklyGoals, streak, historyGoals, loadingHistory, onLoadHistory }: Props) {
  const [showHistory, setShowHistory] = useState(false);

  // Weekly stats
  const totalGoals = weeklyGoals.length;
  const completedGoals = weeklyGoals.filter((g) => g.completed).length;
  const completionRate = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;
  const weeklyPoints = calculatePoints(weeklyGoals);

  // Group by date
  const byDate = new Map<string, SprintGoal[]>();
  for (const g of weeklyGoals) {
    const arr = byDate.get(g.sprint_date) ?? [];
    arr.push(g);
    byDate.set(g.sprint_date, arr);
  }
  // Count perfect days
  let perfectDays = 0;
  byDate.forEach((goals) => {
    if (goals.length > 0 && goals.every((g) => g.completed)) perfectDays++;
  });

  const handleToggleHistory = () => {
    if (!showHistory && historyGoals.length === 0) {
      onLoadHistory();
    }
    setShowHistory((v) => !v);
  };

  // Group history by date
  const historyByDate = new Map<string, SprintGoal[]>();
  for (const g of historyGoals) {
    const arr = historyByDate.get(g.sprint_date) ?? [];
    arr.push(g);
    historyByDate.set(g.sprint_date, arr);
  }

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
  };

  return (
    <div className="space-y-3">
      {/* Weekly summary card */}
      <div className="rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">This Week</h3>
          <span className="text-xs text-muted-foreground">{perfectDays} perfect day{perfectDays !== 1 ? "s" : ""}</span>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="text-center space-y-0.5">
            <TrendingUp className="h-4 w-4 text-primary mx-auto" />
            <p className="text-lg font-black text-foreground">{weeklyPoints}</p>
            <p className="text-[10px] text-muted-foreground">Points</p>
          </div>
          <div className="text-center space-y-0.5">
            <Target className="h-4 w-4 text-primary mx-auto" />
            <p className="text-lg font-black text-foreground">{completionRate}%</p>
            <p className="text-[10px] text-muted-foreground">Completion</p>
          </div>
          <div className="text-center space-y-0.5">
            <Flame className={`h-4 w-4 mx-auto ${streak > 0 ? "text-orange-500" : "text-muted-foreground"}`} />
            <p className="text-lg font-black text-foreground">{streak}</p>
            <p className="text-[10px] text-muted-foreground">Day Streak</p>
          </div>
        </div>

        {/* Mini progress bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>{completedGoals} of {totalGoals} goals</span>
            <span>{completionRate}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>
      </div>

      {/* History toggle */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleToggleHistory}
        className="w-full text-xs text-muted-foreground hover:text-foreground gap-1.5"
      >
        {showHistory ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        {showHistory ? "Hide History" : "View Past Sprints"}
      </Button>

      {/* History panel */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden space-y-3"
          >
            {loadingHistory ? (
              <div className="flex justify-center py-4">
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : historyByDate.size === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-3">No past sprints yet. Start today!</p>
            ) : (
              [...historyByDate.entries()].map(([date, goals]) => {
                const allDone = goals.every((g) => g.completed);
                const doneCount = goals.filter((g) => g.completed).length;
                return (
                  <div key={date} className="rounded-lg border border-border bg-card p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-foreground">{formatDate(date)}</span>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${allDone ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground"}`}>
                        {doneCount}/{goals.length} done
                      </span>
                    </div>
                    <div className="space-y-1">
                      {goals.map((g) => (
                        <div key={g.id} className="flex items-center gap-2 text-xs">
                          {g.completed ? (
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                          ) : (
                            <Circle className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          )}
                          <span className={`${g.completed ? "text-muted-foreground line-through" : "text-foreground"}`}>
                            {g.subject.toUpperCase()} · {g.description}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
