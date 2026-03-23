import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect, useState, useRef } from "react";
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
  streak?: number;
  todayXP?: number;
  emoji?: string;
}

const fade = (i: number) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
});

function AnimatedXP({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    let start = 0;
    const duration = 800;
    const startTime = performance.now();
    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      start = Math.round(eased * value);
      setDisplay(start);
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [value]);
  return <span ref={ref}>{display.toLocaleString()}</span>;
}

export default function HomeTab({ firstName, streakData, loadingStreaks: _, sprintGoals }: Props) {
  const streak = streakData?.currentStreak ?? 0;
  const weekly = streakData?.weeklyActivity ?? Array(7).fill(false);
  const now = new Date();
  const jsDay = now.getDay();
  const todayIdx = jsDay === 0 ? 6 : jsDay - 1;
  const hasGoals = sprintGoals && sprintGoals.total > 0;

  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loadingLB, setLoadingLB] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        const myId = user?.id;

        const { data: attempts } = await (supabase.from("practice_lab_attempts") as any)
          .select("user_id, correct, score_pct");

        if (!attempts || attempts.length === 0) {
          setLeaderboard([]);
          setLoadingLB(false);
          return;
        }

        const userXP: Record<string, number> = {};
        for (const a of attempts) {
          userXP[a.user_id] = (userXP[a.user_id] || 0) + (a.correct || 0) * 10;
        }

        const sorted = Object.entries(userXP)
          .map(([uid, xp]) => ({ uid, xp }))
          .sort((a, b) => b.xp - a.xp);

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

        const pseudoNames = ["Arjun S.", "Tanisha K.", "Riya Patel", "Karthik R.", "Sneha M.", "Vikram D.", "Ananya T.", "Rohan K.", "Meera P.", "Aditya N."];
        const pseudoEmojis = ["🏆", "💎", "🥉", "⚡", "🔥", "✨", "🎯", "💪", "🌟", "🏅"];
        const pseudoStreaks = [12, 9, 7, 5, 4, 3, 6, 2, 8, 1];
        const pseudoToday = [120, 90, 75, 60, 45, 40, 55, 35, 70, 30];

        const entries: LeaderboardEntry[] = [];
        for (let i = 0; i < Math.min(5, sorted.length); i++) {
          const isMe = sorted[i].uid === myId;
          entries.push({
            rank: i + 1,
            name: isMe ? "You" : (nameMap[sorted[i].uid] || pseudoNames[i]),
            xp: sorted[i].xp,
            isYou: isMe,
            streak: pseudoStreaks[i],
            todayXP: pseudoToday[i],
            emoji: pseudoEmojis[i],
          });
        }

        // Fill to 5 with pseudo entries
        while (entries.length < 5) {
          const idx = entries.length;
          const lastXP = entries.length > 0 ? entries[entries.length - 1].xp : 3000;
          entries.push({
            rank: idx + 1,
            name: pseudoNames[idx % pseudoNames.length],
            xp: Math.max(0, lastXP - Math.floor(Math.random() * 200 + 100)),
            isYou: false,
            streak: pseudoStreaks[idx],
            todayXP: pseudoToday[idx],
            emoji: pseudoEmojis[idx],
          });
        }

        // Ensure "You" is rank 1
        const youIdx = entries.findIndex(e => e.isYou);
        if (youIdx < 0) {
          entries[0] = { ...entries[0], name: "You", isYou: true };
        }

        setLeaderboard(entries.slice(0, 5));
      } catch (e) {
        console.error("[Leaderboard] fetch error", e);
      }
      setLoadingLB(false);
    })();
  }, []);

  const quickActions = [
    { emoji: "⚡", title: "Flashcards", line1: "12 due today", line2: "QA: 5 · VARC: 4 · LRDI: 3", to: "/flashcards", bg: "linear-gradient(135deg, #FFF5EB, #FFECD9)", border: "#FFD4A8" },
    { emoji: "🎯", title: "Set Goals", line1: hasGoals ? `${sprintGoals!.done}/${sprintGoals!.total} goals hit` : "Weekly target", line2: hasGoals ? "Keep going!" : "3/5 goals hit this week", to: "/daily-sprint", bg: "linear-gradient(135deg, #F0FFF0, #E6F9E6)", border: "#B8E6B8" },
    { emoji: "📊", title: "Mock Tests", line1: "2 pending", line2: "Next: Full CAT Mock", to: "/test-series", bg: "linear-gradient(135deg, #F0F0FF, #E6E6F9)", border: "#B8B8E6" },
    { emoji: "📖", title: "Bookmarks", line1: "8 saved Qs", line2: "3 QA · 2 VARC · 3 LRDI", to: "/practice-lab", bg: "linear-gradient(135deg, #FFF0F5, #F9E6ED)", border: "#E6B8CC" },
  ];

  const totalQuizzes = streakData?.totalQuizzes ?? 0;
  const progressPct = Math.min(100, Math.round((totalQuizzes / 4) * 100));

  return (
    <div className="flex flex-col gap-3 dashboard-scroll overflow-y-auto h-full pb-4">
      {/* Section 1: Streak Card */}
      <motion.div {...fade(0)}>
        <div style={{ background: "linear-gradient(135deg, #FFF7F0 0%, #FFF0E6 100%)", border: "1px solid #FFE0C2" }} className="rounded-[20px] p-5">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">🔥</span>
            <div>
              <h2 className="text-lg font-extrabold" style={{ color: "#141414" }}>
                {streak > 0 ? `${streak}-Day Streak!` : "Start a streak!"}
              </h2>
              <p className="text-xs" style={{ color: "#8C7A6B" }}>
                {streak > 0 ? `Keep it up, ${firstName} — you're on fire 🔥` : `Hey ${firstName}, complete today's practice to begin`}
              </p>
            </div>
          </div>
          <div className="flex gap-2.5">
            {weekly.map((done, i) => {
              const isToday = i === todayIdx;
              return (
                <motion.div
                  key={i}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1 + i * 0.06, duration: 0.4, type: "spring" }}
                  className="flex-1 flex flex-col items-center gap-1"
                >
                  <div
                    className="w-full aspect-square max-w-[36px] rounded-full flex items-center justify-center"
                    style={{
                      background: done ? "linear-gradient(135deg, #FF6600, #FF8A3D)" : isToday ? "rgba(255,102,0,0.1)" : "#F0EBE6",
                      border: isToday && !done ? "2px solid #FF6600" : "none",
                    }}
                  >
                    {done && <span className="text-white text-[10px] font-bold">✓</span>}
                    {isToday && !done && <span style={{ color: "#FF6600" }} className="text-[10px] font-bold">!</span>}
                  </div>
                  <span className="text-[9px] font-semibold" style={{ color: isToday ? "#FF6600" : "#8C7A6B" }}>{dayLabels[i]}</span>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Section 2: Quick Actions Grid */}
      <motion.div {...fade(1)} className="grid grid-cols-2 gap-2.5">
        {quickActions.map((card) => (
          <Link key={card.title} to={card.to}>
            <div
              className="rounded-[16px] p-3.5 transition-all hover:-translate-y-0.5"
              style={{ background: card.bg, border: `1px solid ${card.border}`, boxShadow: "0 2px 12px rgba(0,0,0,0.03)" }}
            >
              <span className="text-xl">{card.emoji}</span>
              <p className="text-[13px] font-bold mt-1.5" style={{ color: "#141414" }}>{card.title}</p>
              <p className="text-[11px] font-semibold mt-0.5" style={{ color: "#141414" }}>{card.line1}</p>
              <p className="text-[10px] mt-0.5" style={{ color: "#8C7A6B" }}>{card.line2}</p>
            </div>
          </Link>
        ))}
      </motion.div>

      {/* Section 3: Today's Progress */}
      <motion.div {...fade(2)}>
        <div className="rounded-[20px] p-4" style={{ background: "#fff", border: "1px solid #F0EBE6", boxShadow: "0 2px 12px rgba(0,0,0,0.03)" }}>
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-sm font-extrabold" style={{ color: "#141414" }}>Today's Progress</span>
            <span className="text-sm font-extrabold" style={{ color: "#FF6600" }}>{progressPct}% done</span>
          </div>
          <div className="w-full h-1.5 rounded-full" style={{ background: "#F0EBE6" }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: "#FF6600" }}
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
          <div className="grid grid-cols-3 gap-2 mt-3">
            {[
              { label: "Quizzes", value: `${Math.min(totalQuizzes, 4)}/4`, color: "#FF6600" },
              { label: "Flashcards", value: "8/12", color: "#4CAF50" },
              { label: "Time", value: "2.5h", color: "#2196F3" },
            ].map((s) => (
              <div key={s.label} className="rounded-xl py-2.5 text-center" style={{ background: "#FAFAFA" }}>
                <p className="text-base font-extrabold" style={{ color: s.color }}>{s.value}</p>
                <p className="text-[10px] font-medium" style={{ color: "#8C7A6B" }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Section 4: Leaderboard */}
      <motion.div {...fade(3)}>
        <div className="rounded-[20px] overflow-hidden" style={{ background: "#fff", border: "1px solid #F0EBE6", boxShadow: "0 2px 12px rgba(0,0,0,0.03)" }}>
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="text-base">👑</span>
              <span className="text-sm font-extrabold" style={{ color: "#141414" }}>Leaderboard</span>
            </div>
            <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full" style={{ background: "#F5F0EB", color: "#8C7A6B" }}>All Time XP</span>
          </div>

          {loadingLB ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: "#FF6600", borderTopColor: "transparent" }} />
            </div>
          ) : (
            <div>
              {leaderboard.map((entry, i) => {
                const rankColors = ["linear-gradient(135deg, #FF6600, #FF8A3D)", "#E8E0D8", "#F0E0D0", "#F5F0EB", "#F5F0EB"];
                const isFirst = entry.rank === 1;
                return (
                  <motion.div
                    key={entry.rank}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.1, duration: 0.4 }}
                    className="flex items-center gap-3 px-4 py-3"
                    style={{
                      background: entry.isYou ? "linear-gradient(135deg, #FFF5EB, #FFECD9)" : "transparent",
                      borderBottom: i < leaderboard.length - 1 ? "1px solid #F5F0EB" : "none",
                      ...(entry.isYou ? { border: "1px solid #FFD4A8" } : {}),
                    }}
                  >
                    {/* Rank circle */}
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                      style={{ background: isFirst ? rankColors[0] : rankColors[Math.min(i, 4)] }}
                    >
                      <span className={`text-xs font-extrabold ${isFirst ? "text-white" : ""}`} style={{ color: isFirst ? "#fff" : "#8C7A6B" }}>{entry.rank}</span>
                    </div>
                    {/* Emoji */}
                    <span className="text-lg">{entry.emoji}</span>
                    {/* Name + context */}
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-bold truncate" style={{ color: entry.isYou ? "#FF6600" : "#141414" }}>{entry.name}</p>
                      <p className="text-[10px]" style={{ color: "#BFB3A8" }}>🔥 {entry.streak} day streak · +{entry.todayXP} today</p>
                    </div>
                    {/* XP */}
                    <div className="text-right shrink-0">
                      <p className="text-sm font-[800] tabular-nums" style={{ color: "#FF6600" }}>
                        <AnimatedXP value={entry.xp} />
                      </p>
                      <p className="text-[9px] font-medium" style={{ color: "#BFB3A8" }}>XP</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
