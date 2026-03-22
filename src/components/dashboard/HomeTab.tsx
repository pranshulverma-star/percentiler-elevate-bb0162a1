import { Link } from "react-router-dom";
import { Flame, Layers, CalendarCheck, Users2, Crown, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import BuddyMiniWidget from "@/components/buddy/BuddyMiniWidget";

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  weeklyActivity: boolean[];
  totalQuizzes: number;
  avgAccuracy: number;
}

interface Props {
  firstName: string;
  streakData: StreakData;
  loadingStreaks: boolean;
  sprintGoals: { total: number; done: number } | null;
}

const dayLabels = ["M", "T", "W", "T", "F", "S", "S"];

const leaderboardData = [
  { rank: 1, name: "Aarav M.", xp: 980, badge: "👑", bg: "bg-amber-500/10" },
  { rank: 2, name: "Priya S.", xp: 945, badge: "💎", bg: "bg-sky-500/10" },
  { rank: 3, name: "Rohan K.", xp: 920, badge: "🥇", bg: "bg-emerald-500/10" },
];
const yourRow = { rank: 12, name: "You", xp: 650, badge: "🎯" };

const fade = (i: number) => ({
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: i * 0.06, duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
});

export default function HomeTab({ firstName, streakData, loadingStreaks, sprintGoals }: Props) {
  const streak = streakData?.currentStreak ?? 0;
  const weekly = streakData?.weeklyActivity ?? Array(7).fill(false);
  const now = new Date();
  const jsDay = now.getDay();
  const todayIdx = jsDay === 0 ? 6 : jsDay - 1;
  const hasGoals = sprintGoals && sprintGoals.total > 0;

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* Streak Hero — expanded */}
      <motion.div {...fade(0)}>
        <div className="relative overflow-hidden rounded-2xl p-4 border border-primary/20 bg-gradient-to-br from-card via-card to-primary/[0.06] backdrop-blur-xl shadow-[0_4px_24px_rgba(0,0,0,0.08)]">
          <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-primary/12 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/0 via-primary/30 to-primary/0" />

          <div className="flex items-center gap-3.5 mb-3 relative">
            <div className={`relative flex items-center justify-center w-12 h-12 rounded-xl ${streak > 0 ? "bg-primary/15" : "bg-muted"}`}>
              {streak > 0 && <div className="absolute inset-0 rounded-xl border-2 border-primary/30 animate-[pulse_2s_ease-in-out_infinite]" />}
              <Flame className={`h-6 w-6 ${streak > 0 ? "text-primary" : "text-muted-foreground"}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-base font-bold text-foreground leading-tight">
                {streak > 0 ? `${streak} Day Streak 🔥` : "Start a streak!"}
              </p>
              <p className="text-xs text-muted-foreground">Hey {firstName} — let's keep going</p>
            </div>
          </div>

          <div className="flex gap-2">
            {weekly.map((done, i) => {
              const isToday = i === todayIdx;
              const isPast = i < todayIdx;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className={`w-full aspect-square max-w-[34px] rounded-full flex items-center justify-center transition-all ${
                    done ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                      : isToday ? "border-2 border-primary bg-primary/10"
                      : isPast ? "bg-muted-foreground/15" : "bg-muted/50"
                  }`}>
                    {done && <span className="text-white text-[10px]">✓</span>}
                    {isToday && !done && <span className="text-primary text-[10px] font-bold">!</span>}
                  </div>
                  <span className={`text-[9px] font-medium ${isToday ? "text-primary" : "text-muted-foreground"}`}>{dayLabels[i]}</span>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Quick Action Row — expanded */}
      <motion.div {...fade(1)} className="grid grid-cols-2 gap-3">
        <Link to="/flashcards">
          <div className="relative overflow-hidden rounded-xl border border-border/40 bg-gradient-to-br from-amber-500/[0.06] to-card backdrop-blur-xl p-4 group hover:border-amber-500/30 transition-all shadow-sm h-full">
            <div className="absolute -top-6 -right-6 w-16 h-16 rounded-full bg-amber-500/10 blur-xl pointer-events-none" />
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center shrink-0">
                <Layers className="h-5 w-5 text-amber-500" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-foreground">Flashcards</p>
                <p className="text-[10px] text-muted-foreground">5 cards · 2 min</p>
              </div>
            </div>
          </div>
        </Link>

        <Link to="/daily-sprint">
          <div className="relative overflow-hidden rounded-xl border border-border/40 bg-gradient-to-br from-primary/[0.06] to-card backdrop-blur-xl p-4 group hover:border-primary/30 transition-all shadow-sm h-full">
            <div className="absolute -bottom-6 -left-6 w-16 h-16 rounded-full bg-primary/10 blur-xl pointer-events-none" />
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                <CalendarCheck className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-foreground">
                  {hasGoals ? "Sprint" : "Set Goals"}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {hasGoals ? `${sprintGoals!.done}/${sprintGoals!.total} done` : "Plan today"}
                </p>
              </div>
            </div>
          </div>
        </Link>
      </motion.div>

      {/* Buddy Widget — expanded */}
      <motion.div {...fade(2)}>
        <BuddyMiniWidget />
        <Link to="/study-buddy" className="block">
          <div className="relative overflow-hidden rounded-xl border border-primary/20 bg-gradient-to-r from-primary/[0.06] to-card backdrop-blur-xl p-3.5 flex items-center gap-3 group hover:border-primary/40 transition-all">
            <div className="absolute -right-8 -top-8 w-20 h-20 rounded-full bg-primary/8 blur-2xl pointer-events-none" />
            <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
              <Users2 className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-foreground">Study Buddy</p>
              <p className="text-[10px] text-muted-foreground">Pair up & compete together</p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
          </div>
        </Link>
      </motion.div>

      {/* Leaderboard — flex-1 fills remaining */}
      <motion.div {...fade(3)} className="flex-1 min-h-0">
        <div className="rounded-xl border border-border/40 bg-card/80 backdrop-blur-xl overflow-hidden shadow-sm h-full flex flex-col">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/30">
            <div className="flex items-center gap-2">
              <Crown className="h-4 w-4 text-primary" />
              <span className="text-sm font-bold text-foreground">Leaderboard</span>
            </div>
            <span className="text-[10px] text-muted-foreground font-medium">This Week</span>
          </div>
          <div className="flex-1 flex flex-col justify-center">
            {leaderboardData.map((entry) => (
              <div key={entry.rank} className={`flex items-center gap-2.5 px-4 py-2.5 border-b border-border/20 last:border-0`}>
                <div className={`w-7 h-7 rounded-lg ${entry.bg} flex items-center justify-center`}>
                  <span className="text-sm">{entry.badge}</span>
                </div>
                <p className="text-sm font-medium text-foreground flex-1 truncate">{entry.name}</p>
                <span className="text-sm font-bold text-primary tabular-nums">{entry.xp}</span>
                <span className="text-[9px] text-muted-foreground font-medium">XP</span>
              </div>
            ))}
            {/* Your row */}
            <div className="flex items-center gap-2.5 px-4 py-2.5 bg-primary/[0.06] border-l-2 border-primary">
              <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                <span className="text-sm">{yourRow.badge}</span>
              </div>
              <p className="text-sm font-bold text-primary flex-1 truncate">#{yourRow.rank} {yourRow.name}</p>
              <span className="text-sm font-bold text-primary tabular-nums">{yourRow.xp}</span>
              <span className="text-[9px] text-muted-foreground font-medium">XP</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
