import { Flame } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  weeklyActivity: boolean[];
}

interface Props {
  streakData: StreakData | null;
  loading: boolean;
}

const dayLabels = ["M", "T", "W", "T", "F", "S", "S"];

export default function DashboardStreakHero({ streakData, loading }: Props) {
  if (loading) {
    return <Skeleton className="h-36 w-full rounded-2xl" />;
  }

  const streak = streakData?.currentStreak ?? 0;
  const best = streakData?.longestStreak ?? 0;
  const weekly = streakData?.weeklyActivity ?? Array(7).fill(false);

  const now = new Date();
  const jsDay = now.getDay();
  const todayIdx = jsDay === 0 ? 6 : jsDay - 1;

  return (
    <div className="relative overflow-hidden rounded-2xl p-5 border border-border/30 bg-card/80 backdrop-blur-sm shadow-[0_2px_20px_rgba(0,0,0,0.06)]">
      {/* Gradient glow orbs */}
      {streak > 0 && (
        <>
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-primary/5 blur-2xl pointer-events-none" />
        </>
      )}

      {/* Fire + streak number */}
      <div className="flex items-center gap-3 mb-3 relative">
        <div className={`relative flex items-center justify-center w-12 h-12 rounded-xl ${streak > 0 ? "bg-primary/15" : "bg-muted"}`}>
          {streak > 0 && (
            <div className="absolute inset-0 rounded-xl border-2 border-primary/30 animate-[pulse_2s_ease-in-out_infinite]" />
          )}
          <Flame className={`h-7 w-7 ${streak > 0 ? "text-primary" : "text-muted-foreground"}`} />
        </div>
        <div>
          <div className="text-2xl font-bold text-foreground leading-none">
            {streak > 0 ? `${streak} Day Streak` : "Start a streak!"}
          </div>
          {best > 0 && (
            <p className="text-xs text-muted-foreground mt-0.5">
              Your best: {best} days
            </p>
          )}
          {streak === 0 && (
            <p className="text-xs text-muted-foreground mt-0.5">
              Complete today's practice to begin
            </p>
          )}
        </div>
      </div>

      {/* Weekly calendar */}
      <div className="flex gap-2 relative">
        {weekly.map((done, i) => {
          const isToday = i === todayIdx;
          const isPast = i < todayIdx;

          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div
                className={`w-full aspect-square rounded-full flex items-center justify-center transition-all duration-300 ${
                  done
                    ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"
                    : isToday
                      ? "border-2 border-primary bg-primary/10"
                      : isPast
                        ? "bg-muted-foreground/15"
                        : "bg-muted/60"
                }`}
              >
                {done && <span className="text-white text-[10px]">✓</span>}
                {isToday && !done && <span className="text-primary text-[10px] font-bold">!</span>}
              </div>
              <span className={`text-[9px] font-medium ${isToday ? "text-primary" : "text-muted-foreground"}`}>
                {dayLabels[i]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
