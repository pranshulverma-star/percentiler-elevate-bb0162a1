import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Flame, Zap, Trophy, TrendingUp, Calendar } from "lucide-react";

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  totalQuizzes: number;
  avgAccuracy: number;
  weeklyActivity: boolean[]; // last 7 days, true = active
  recentTrend: "up" | "down" | "stable";
}

interface Props {
  data: StreakData | null;
  loading: boolean;
}

export default function DashboardStreaks({ data, loading }: Props) {
  if (loading) {
    return (
      <Card className="md:col-span-2">
        <CardHeader><Skeleton className="h-6 w-48" /></CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!data || data.totalQuizzes === 0) {
    return null;
  }

  const { currentStreak, longestStreak, totalQuizzes, avgAccuracy, weeklyActivity, recentTrend } = data;
  const dayLabels = ["M", "T", "W", "T", "F", "S", "S"];

  return (
    <Card className="md:col-span-2 border-primary/10 bg-gradient-to-br from-card to-primary/[0.02]">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-lg">
          <span className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-primary" /> Performance Streaks
          </span>
          {recentTrend === "up" && (
            <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
              <TrendingUp className="h-3 w-3 mr-1" /> Improving
            </Badge>
          )}
          {recentTrend === "down" && (
            <Badge variant="outline" className="text-destructive border-destructive/20">
              Needs Focus
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats row */}
        <div className="grid grid-cols-4 gap-2 text-center">
          <div className="rounded-xl bg-secondary/60 p-3">
            <div className="flex items-center justify-center gap-1">
              <Flame className="h-4 w-4 text-orange-500" />
              <span className="text-2xl font-bold text-foreground">{currentStreak}</span>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1 leading-tight">Current Streak</p>
          </div>
          <div className="rounded-xl bg-secondary/60 p-3">
            <div className="flex items-center justify-center gap-1">
              <Trophy className="h-4 w-4 text-amber-500" />
              <span className="text-2xl font-bold text-foreground">{longestStreak}</span>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1 leading-tight">Best Streak</p>
          </div>
          <div className="rounded-xl bg-secondary/60 p-3">
            <div className="flex items-center justify-center gap-1">
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-2xl font-bold text-foreground">{totalQuizzes}</span>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1 leading-tight">Total Quizzes</p>
          </div>
          <div className="rounded-xl bg-secondary/60 p-3">
            <div className="flex items-center justify-center gap-1">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
              <span className="text-2xl font-bold text-foreground">{avgAccuracy}%</span>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1 leading-tight">Avg Accuracy</p>
          </div>
        </div>

        {/* Weekly activity heatmap */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground font-medium">This Week's Activity</span>
          </div>
          <div className="flex gap-1.5">
            {weeklyActivity.map((active, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className={`w-full h-8 rounded-md transition-colors ${
                    active
                      ? "bg-primary/80 shadow-sm shadow-primary/20"
                      : "bg-muted/40 border border-border/50"
                  }`}
                />
                <span className="text-[10px] text-muted-foreground">{dayLabels[i]}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
