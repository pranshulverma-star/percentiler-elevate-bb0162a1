import { Skeleton } from "@/components/ui/skeleton";
import { Flame, Trophy, Zap, TrendingUp, Calendar } from "lucide-react";

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  totalQuizzes: number;
  avgAccuracy: number;
  weeklyActivity: boolean[];
  recentTrend: "up" | "down" | "stable";
}

interface Props {
  streakData: StreakData | null;
  loading: boolean;
}

export default function DashboardStats({ streakData, loading }: Props) {
  if (loading) {
    return (
      <div className="flex gap-2">
        {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-16 flex-1 rounded-xl" />)}
      </div>
    );
  }

  if (!streakData || streakData.totalQuizzes === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border/60 p-4 text-center">
        <p className="text-xs text-muted-foreground">Complete your first practice quiz to see stats here</p>
      </div>
    );
  }

  const { currentStreak, longestStreak, totalQuizzes, avgAccuracy, weeklyActivity } = streakData;
  const dayLabels = ["M", "T", "W", "T", "F", "S", "S"];

  return (
    <div className="space-y-3">
      {/* Stat pills */}
      <div className="grid grid-cols-4 gap-2">
        <StatPill icon={<Flame className="h-3.5 w-3.5 text-orange-500" />} value={currentStreak} label="Streak" />
        <StatPill icon={<Trophy className="h-3.5 w-3.5 text-amber-500" />} value={longestStreak} label="Best" />
        <StatPill icon={<Zap className="h-3.5 w-3.5 text-primary" />} value={totalQuizzes} label="Quizzes" />
        <StatPill icon={<TrendingUp className="h-3.5 w-3.5 text-emerald-500" />} value={`${avgAccuracy}%`} label="Accuracy" />
      </div>

      {/* Weekly heatmap dots */}
      <div className="flex items-center gap-2">
        <Calendar className="h-3 w-3 text-muted-foreground shrink-0" />
        <div className="flex gap-1.5 flex-1">
          {weeklyActivity.map((active, i) => (
            <div key={i} className="flex flex-col items-center gap-0.5 flex-1">
              <div
                className={`w-full h-2 rounded-full transition-colors ${
                  active
                    ? "bg-primary shadow-sm shadow-primary/20"
                    : "bg-muted/60"
                }`}
              />
              <span className="text-[8px] text-muted-foreground">{dayLabels[i]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatPill({ icon, value, label }: { icon: React.ReactNode; value: string | number; label: string }) {
  return (
    <div className="rounded-xl bg-card border border-border/60 backdrop-blur-sm p-2.5 text-center">
      <div className="flex items-center justify-center gap-1">
        {icon}
        <span className="text-base font-bold text-foreground">{value}</span>
      </div>
      <p className="text-[9px] text-muted-foreground mt-0.5">{label}</p>
    </div>
  );
}
