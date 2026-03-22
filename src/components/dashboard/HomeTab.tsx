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
  { rank: 1, name: "Aarav M.", xp: 980, badge: "👑" },
  { rank: 2, name: "Priya S.", xp: 945, badge: "💎" },
  { rank: 3, name: "Rohan K.", xp: 920, badge: "🥇" },
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
      {/* Greeting + Streak Hero Compact */}
      <motion.div {...fade(0)}>
        <div className="relative overflow-hidden rounded-2xl p-3.5 border border-primary/20 bg-gradient-to-br from-card via-card to-primary/[0.04] backdrop-blur-xl shadow-[0_4px_24px_rgba(0,0,0,0.08)]">
          <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full bg-primary/10 blur-3xl pointer-events-none" />

          <div className="flex items-center gap-3 mb-2.5 relative">
            <div className={`relative flex items-center justify-center w-10 h-10 rounded-xl ${streak > 0 ? "bg-primary/15" : "bg-muted"}`}>
              {streak > 0 && <div className="absolute inset-0 rounded-xl border-2 border-primary/30 animate-[pulse_2s_ease-in-out_infinite]" />}
              <Flame className={`h-5 w-5 ${streak > 0 ? "text-primary" : "text-muted-foreground"}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-foreground leading-tight">
                {streak > 0 ? `${streak} Day Streak 🔥` : "Start a streak!"}
              </p>
              <p className="text-[10px] text-muted-foreground">Hey {firstName} — let's keep going</p>
            </div>
          </div>

          {/* Compact weekly dots */}
          <div className="flex gap-1.5">
            {weekly.map((done, i) => {
              const isToday = i === todayIdx;
              const isPast = i < todayIdx;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                  <div className={`w-full aspect-square max-w-[28px] rounded-full flex items-center justify-center transition-all ${
                    done ? "bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]"
                      : isToday ? "border-2 border-primary bg-primary/10"
                      : isPast ? "bg-muted-foreground/15" : "bg-muted/50"
                  }`}>
                    {done && <span className="text-white text-[8px]">✓</span>}
                    {isToday && !done && <span className="text-primary text-[8px] font-bold">!</span>}
                  </div>
                  <span className={`text-[8px] font-medium ${isToday ? "text-primary" : "text-muted-foreground"}`}>{dayLabels[i]}</span>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Quick Action Row: Flashcards + Sprint */}
      <motion.div {...fade(1)} className="grid grid-cols-2 gap-2.5">
        <Link to="/flashcards">
          <div className="relative overflow-hidden rounded-xl border border-border/40 bg-card/80 backdrop-blur-xl p-3 group hover:border-amber-500/30 transition-all shadow-sm h-full">
            <div className="absolute -top-4 -right-4 w-12 h-12 rounded-full bg-amber-500/10 blur-xl pointer-events-none" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center shrink-0">
                <Layers className="h-4 w-4 text-amber-500" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-foreground">Flashcards</p>
                <p className="text-[9px] text-muted-foreground">5 cards · 2 min</p>
              </div>
            </div>
          </div>
        </Link>

        <Link to="/daily-sprint">
          <div className="relative overflow-hidden rounded-xl border border-border/40 bg-card/80 backdrop-blur-xl p-3 group hover:border-primary/30 transition-all shadow-sm h-full">
            <div className="absolute -bottom-4 -left-4 w-12 h-12 rounded-full bg-primary/10 blur-xl pointer-events-none" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                <CalendarCheck className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-foreground">
                  {hasGoals ? "Sprint" : "Set Goals"}
                </p>
                <p className="text-[9px] text-muted-foreground">
                  {hasGoals ? `${sprintGoals!.done}/${sprintGoals!.total} done` : "Plan today"}
                </p>
              </div>
            </div>
          </div>
        </Link>
      </motion.div>

      {/* Buddy Widget (compact) */}
      <motion.div {...fade(2)}>
        <BuddyMiniWidget />
        <Link to="/study-buddy" className="block">
          <div className="rounded-xl border border-primary/20 bg-primary/[0.04] backdrop-blur-xl p-2.5 flex items-center gap-2.5 group hover:border-primary/40 transition-all">
            <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
              <Users2 className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-foreground">Study Buddy</p>
              <p className="text-[9px] text-muted-foreground">Pair up & compete</p>
            </div>
            <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
          </div>
        </Link>
      </motion.div>

      {/* Leaderboard Snapshot */}
      <motion.div {...fade(3)} className="flex-1">
        <div className="rounded-xl border border-border/40 bg-card/80 backdrop-blur-xl overflow-hidden shadow-sm h-full flex flex-col">
          <div className="flex items-center justify-between px-3 py-2 border-b border-border/30">
            <div className="flex items-center gap-1.5">
              <Crown className="h-3.5 w-3.5 text-primary" />
              <span className="text-[11px] font-semibold text-foreground">Leaderboard</span>
            </div>
            <span className="text-[9px] text-muted-foreground">This Week</span>
          </div>
          <div className="flex-1">
            {leaderboardData.map((entry) => (
              <div key={entry.rank} className="flex items-center gap-2 px-3 py-1.5 border-b border-border/20 last:border-0">
                <span className="text-xs w-4 text-center">{entry.badge}</span>
                <p className="text-[11px] font-medium text-foreground flex-1 truncate">{entry.name}</p>
                <span className="text-[11px] font-bold text-primary">{entry.xp}</span>
                <span className="text-[8px] text-muted-foreground">XP</span>
              </div>
            ))}
            {/* Your row */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/[0.04] border-l-2 border-primary">
              <span className="text-xs w-4 text-center">{yourRow.badge}</span>
              <p className="text-[11px] font-semibold text-primary flex-1 truncate">#{yourRow.rank} {yourRow.name}</p>
              <span className="text-[11px] font-bold text-primary">{yourRow.xp}</span>
              <span className="text-[8px] text-muted-foreground">XP</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
