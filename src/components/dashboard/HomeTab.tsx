import { useState } from "react";
import { Link } from "react-router-dom";
import { Flame, Layers, CalendarCheck, Crown, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";


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

interface LeaderboardEntry {
  rank: number;
  name: string;
  xp: number;
  isYou: boolean;
}

const fade = (i: number) => ({
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: i * 0.06, duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
});

const rankBadges = ["👑", "💎", "🥇", "🏅", "⭐"];
const rankBgs = ["bg-amber-500/10", "bg-sky-500/10", "bg-emerald-500/10", "bg-purple-500/10", "bg-pink-500/10"];

export default function HomeTab({ firstName, streakData, loadingStreaks: _, sprintGoals }: Props) {
  const streak = streakData?.currentStreak ?? 0;
  const weekly = streakData?.weeklyActivity ?? Array(7).fill(false);
  const now = new Date();
  const jsDay = now.getDay();
  const todayIdx = jsDay === 0 ? 6 : jsDay - 1;
  const hasGoals = sprintGoals && sprintGoals.total > 0;

  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loadingLB, setLoadingLB] = useState(true);
  const [lbExpanded, setLbExpanded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        const myId = user?.id;

        // Get all attempts, aggregate by user
        const { data: attempts } = await (supabase.from("practice_lab_attempts") as any)
          .select("user_id, correct, score_pct");

        if (!attempts || attempts.length === 0) {
          setLeaderboard([]);
          setLoadingLB(false);
          return;
        }

        // Aggregate XP per user: correct answers * 10
        const userXP: Record<string, number> = {};
        for (const a of attempts) {
          userXP[a.user_id] = (userXP[a.user_id] || 0) + (a.correct || 0) * 10;
        }

        const sorted = Object.entries(userXP)
          .map(([uid, xp]) => ({ uid, xp }))
          .sort((a, b) => b.xp - a.xp);

        // Get profile names for top users
        const topIds = sorted.slice(0, 5).map(s => s.uid);
        if (myId && !topIds.includes(myId)) topIds.push(myId);

        const { data: profiles } = await (supabase.from("profiles") as any)
          .select("id, name")
          .in("id", topIds);

        const nameMap: Record<string, string> = {};
        for (const p of (profiles || [])) {
          const n = p.name || "Student";
          nameMap[p.id] = n.split(" ")[0] + (n.split(" ")[1] ? " " + n.split(" ")[1][0] + "." : "");
        }

        const entries: LeaderboardEntry[] = [];
        // Top 3
        for (let i = 0; i < Math.min(10, sorted.length); i++) {
          entries.push({
            rank: i + 1,
            name: nameMap[sorted[i].uid] || "Student",
            xp: sorted[i].xp,
            isYou: sorted[i].uid === myId,
          });
        }

        // Add current user if not in top 3
        if (myId) {
          const myIdx = sorted.findIndex(s => s.uid === myId);
          if (myIdx >= 10) {
            entries.push({
              rank: myIdx + 1,
              name: "You",
              xp: sorted[myIdx].xp,
              isYou: true,
            });
          }
        }

        setLeaderboard(entries);
      } catch (e) {
        console.error("[Leaderboard] fetch error", e);
      }
      setLoadingLB(false);
    })();
  }, []);

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* Streak Hero — dramatic animated version */}
      <motion.div {...fade(0)}>
        <div className="relative overflow-hidden rounded-2xl p-4 border border-primary/20 bg-gradient-to-br from-card via-card to-primary/[0.06] backdrop-blur-xl shadow-[0_4px_24px_rgba(0,0,0,0.08)]">
          {/* Animated gradient band */}
          {streak > 0 && (
            <>
              <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/[0.08] to-primary/0 animate-[streakShimmer_4s_ease-in-out_infinite] pointer-events-none" />
              <div className="absolute -top-12 -right-12 w-36 h-36 rounded-full bg-primary/15 blur-3xl pointer-events-none animate-[pulse_3s_ease-in-out_infinite]" />
              <div className="absolute -bottom-8 -left-8 w-24 h-24 rounded-full bg-primary/10 blur-2xl pointer-events-none animate-[pulse_4s_ease-in-out_infinite_0.5s]" />
            </>
          )}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/0 via-primary/30 to-primary/0" />

          <div className="flex items-center gap-3.5 mb-3 relative">
            <div className={`relative flex items-center justify-center w-12 h-12 rounded-xl ${streak > 0 ? "bg-gradient-to-br from-orange-500/20 to-red-500/20" : "bg-muted"}`}>
              {streak > 0 && (
                <>
                  <div className="absolute inset-0 rounded-xl border-2 border-orange-400/40 animate-[pulse_2s_ease-in-out_infinite]" />
                  <div className="absolute inset-[-4px] rounded-2xl bg-orange-500/20 blur-md animate-[pulse_2.5s_ease-in-out_infinite]" />
                </>
              )}
              <Flame className={`h-6 w-6 relative z-10 ${streak > 0 ? "text-orange-500 drop-shadow-[0_0_6px_rgba(249,115,22,0.6)]" : "text-muted-foreground"}`} />
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
                    done ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.6)]"
                      : isToday ? "border-2 border-primary bg-primary/10 shadow-[0_0_8px_hsl(var(--primary)/0.3)]"
                      : isPast ? "bg-muted-foreground/15" : "bg-muted/50"
                  }`}>
                    {done && <span className="text-white text-[10px] font-bold">✓</span>}
                    {isToday && !done && <span className="text-primary text-[10px] font-bold">!</span>}
                  </div>
                  <span className={`text-[9px] font-medium ${isToday ? "text-primary" : "text-muted-foreground"}`}>{dayLabels[i]}</span>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Quick Action Row */}
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


      {/* Dynamic Leaderboard */}
      <motion.div {...fade(3)}>
        <div className="rounded-xl border border-border/40 bg-card/80 backdrop-blur-xl overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/30">
            <div className="flex items-center gap-2">
              <Crown className="h-4 w-4 text-primary" />
              <span className="text-sm font-bold text-foreground">Leaderboard</span>
            </div>
            <span className="text-[10px] text-muted-foreground font-medium">All Time XP</span>
          </div>

          {loadingLB ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-5 w-5 text-muted-foreground animate-spin" />
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="flex items-center justify-center px-4 py-6">
              <p className="text-xs text-muted-foreground text-center">Complete quizzes to appear on the leaderboard!</p>
            </div>
          ) : (
            <>
              <div>
                {(lbExpanded ? leaderboard : leaderboard.slice(0, 5)).map((entry, i) => (
                  <motion.div
                    key={entry.rank}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.08, duration: 0.4 }}
                    className={`flex items-center gap-2.5 px-4 py-2.5 border-b border-border/20 last:border-0 ${
                      entry.isYou ? "bg-primary/[0.06] border-l-2 border-l-primary" : ""
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-lg ${rankBgs[Math.min(i, rankBgs.length - 1)]} flex items-center justify-center`}>
                      <span className="text-sm">{rankBadges[Math.min(entry.rank - 1, rankBadges.length - 1)]}</span>
                    </div>
                    <p className={`text-sm font-medium flex-1 truncate ${entry.isYou ? "font-bold text-primary" : "text-foreground"}`}>
                      {entry.isYou ? `#${entry.rank} You` : entry.name}
                    </p>
                    <span className="text-sm font-bold text-primary tabular-nums">{entry.xp}</span>
                    <span className="text-[9px] text-muted-foreground font-medium">XP</span>
                  </motion.div>
                ))}
              </div>
              {leaderboard.length > 5 && (
                <button
                  onClick={() => setLbExpanded(!lbExpanded)}
                  className="w-full flex items-center justify-center gap-1 py-2 text-[11px] text-muted-foreground hover:text-foreground transition-colors border-t border-border/30"
                >
                  {lbExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                  {lbExpanded ? "Show less" : "See Full Leaderboard"}
                </button>
              )}
            </>
          )}
        </div>
      </motion.div>

      <style>{`
        @keyframes streakShimmer {
          0%, 100% { opacity: 0; transform: translateX(-100%); }
          50% { opacity: 1; transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
