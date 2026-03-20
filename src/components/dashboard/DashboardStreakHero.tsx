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

  // Determine today's index (0=Mon, 6=Sun)
  const now = new Date();
  const jsDay = now.getDay(); // 0=Sun
  const todayIdx = jsDay === 0 ? 6 : jsDay - 1;

  return (
    <div
      className="rounded-2xl p-5 relative overflow-hidden"
      style={{
        background: streak > 0
          ? "linear-gradient(135deg, hsl(30 60% 98%), hsl(25 80% 94%))"
          : "hsl(var(--secondary))",
      }}
    >
      {/* Fire + streak number */}
      <div className="flex items-center gap-3 mb-3">
        <div className={`flex items-center justify-center w-12 h-12 rounded-xl ${streak > 0 ? "bg-primary/15" : "bg-muted"}`}>
          <Flame className={`h-7 w-7 ${streak > 0 ? "text-primary animate-[pulse_2s_ease-in-out_infinite]" : "text-muted-foreground"}`} />
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
      <div className="flex gap-2">
        {weekly.map((done, i) => {
          const isToday = i === todayIdx;
          const isPast = i < todayIdx;
          const isFuture = i > todayIdx;

          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div
                className={`w-full aspect-square rounded-full flex items-center justify-center transition-all duration-300 ${
                  done
                    ? "bg-emerald-500 scale-100"
                    : isToday
                      ? "border-2 border-primary bg-primary/10"
                      : isPast
                        ? "bg-muted-foreground/15"
                        : "bg-muted/60"
                }`}
                style={done ? { animation: "pop 0.3s ease-out" } : undefined}
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

      <style>{`
        @keyframes pop {
          0% { transform: scale(0); }
          70% { transform: scale(1.15); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
