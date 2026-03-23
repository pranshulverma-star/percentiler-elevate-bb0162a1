import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import BuddyMiniWidget from "@/components/buddy/BuddyMiniWidget";
import SprintBuddyView from "@/components/sprint/SprintBuddyView";

interface Props {
  plannerData: any;
  loadingPlanner: boolean;
  userId: string;
}

const fade = (i: number) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
});

const tasks = [
  { time: "8:00 AM", emoji: "📚", name: "QA — Number Systems", dur: "45 min", xp: 30, status: "done" as const },
  { time: "9:00 AM", emoji: "⚡", name: "Daily Quiz — QA Mix", dur: "15 min", xp: 50, status: "done" as const },
  { time: "10:00 AM", emoji: "🎯", name: "VARC — RC Practice", dur: "60 min", xp: 40, status: "current" as const },
  { time: "11:30 AM", emoji: "📚", name: "LRDI — Arrangements", dur: "45 min", xp: 30, status: "upcoming" as const },
  { time: "1:00 PM", emoji: "🧠", name: "Flashcard Revision", dur: "20 min", xp: 20, status: "upcoming" as const },
  { time: "2:00 PM", emoji: "📊", name: "Mock Test — Sectional", dur: "60 min", xp: 100, status: "upcoming" as const },
];

const todayStr = new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

export default function PlanTab({ plannerData, loadingPlanner, userId }: Props) {
  const heat = plannerData?.heat;
  const stats = plannerData?.stats;
  const heatScore = heat?.heat_score ?? 55;
  const totalDays = heat?.total_active_days ?? 10;
  const consistency = heat?.consistency_score ?? 0.6;
  const category = heat?.lead_category ?? "Hot";

  const doneCount = tasks.filter(t => t.status === "done").length;

  return (
    <div className="flex flex-col gap-3 dashboard-scroll overflow-y-auto h-full pb-4">
      {/* Section 1: Study Planner Hero */}
      <motion.div {...fade(0)}>
        <div className="relative rounded-[20px] p-5 overflow-hidden" style={{ background: "linear-gradient(135deg, #FFF7F0 0%, #FFF0E6 100%)", border: "1px solid #FFE0C2" }}>
          <span className="absolute top-2 right-2 text-[80px] opacity-[0.06] pointer-events-none">📅</span>
          <div className="flex items-center justify-between mb-1.5 relative">
            <h2 className="text-base font-[800]" style={{ color: "#141414" }}>Study Planner</h2>
            <span className="text-[11px] font-bold px-3 py-1 rounded-full text-white" style={{ background: "linear-gradient(135deg, #FF6600, #FF8A3D)", boxShadow: "0 2px 8px rgba(255,102,0,0.3)" }}>
              🔥 {category === "Hot" ? "Very Hot" : category}
            </span>
          </div>
          <p className="text-xs font-bold mb-3" style={{ color: "#FF6600" }}>
            Phase: {stats?.current_phase || "Foundation Phase"}
          </p>

          <div className="grid grid-cols-3 gap-2 mb-3">
            {[
              { emoji: "🔥", value: heatScore, label: "Heat Score", color: "#FF6600" },
              { emoji: "📅", value: totalDays, label: "Active Days", color: "#2196F3" },
              { emoji: "✅", value: `${doneCount}/${tasks.length}`, label: "Today", color: "#10B981" },
            ].map((s) => (
              <div key={s.label} className="rounded-[14px] py-2.5 text-center" style={{ background: "rgba(255,255,255,0.8)", backdropFilter: "blur(10px)" }}>
                <span className="text-sm">{s.emoji}</span>
                <p className="text-base font-[800]" style={{ color: s.color }}>{s.value}</p>
                <p className="text-[10px] font-medium" style={{ color: "#8C7A6B" }}>{s.label}</p>
              </div>
            ))}
          </div>

          <div className="mb-2">
            <div className="flex justify-between text-[10px] font-medium mb-1" style={{ color: "#8C7A6B" }}>
              <span>Consistency</span>
              <span>{Math.round(consistency * 100)}%</span>
            </div>
            <div className="w-full h-1.5 rounded-full" style={{ background: "#F0EBE6" }}>
              <motion.div
                className="h-full rounded-full"
                style={{ background: "#FF6600" }}
                initial={{ width: 0 }}
                animate={{ width: `${consistency * 100}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium" style={{ color: "#8C7A6B" }}>XP Earned: 80 / 270</span>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(255,102,0,0.1)", color: "#FF6600" }}>+80 XP</span>
          </div>
        </div>
      </motion.div>

      {/* Section 2: Today's Plan Timeline */}
      <motion.div {...fade(1)}>
        <div className="rounded-[20px] p-4" style={{ background: "#fff", border: "1px solid #F0EBE6", boxShadow: "0 2px 12px rgba(0,0,0,0.03)" }}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-[800]" style={{ color: "#141414" }}>Today's Plan</h3>
            <span className="text-[11px] font-medium" style={{ color: "#8C7A6B" }}>{todayStr}</span>
          </div>

          <div className="space-y-0">
            {tasks.map((task, i) => {
              const isDone = task.status === "done";
              const isCurrent = task.status === "current";
              const isUpcoming = task.status === "upcoming";
              const prevDone = i > 0 && tasks[i - 1].status === "done";

              return (
                <div key={i} className="flex gap-3">
                  {/* Timeline column */}
                  <div className="flex flex-col items-center w-6 shrink-0">
                    {i > 0 && (
                      <div className="w-0.5 h-2" style={{ background: prevDone ? "#10B981" : "#F0EBE6" }} />
                    )}
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[10px]"
                      style={{
                        background: isDone ? "#10B981" : isCurrent ? "#FF6600" : "#F0EBE6",
                        color: isDone || isCurrent ? "#fff" : "#BFB3A8",
                        ...(isCurrent ? { animation: "pulse-dot 2s ease-in-out infinite" } : {}),
                      }}
                    >
                      {isDone ? "✓" : isCurrent ? "▶" : ""}
                    </div>
                    {i < tasks.length - 1 && (
                      <div className="w-0.5 flex-1 min-h-[8px]" style={{ background: isDone ? "#10B981" : "#F0EBE6" }} />
                    )}
                  </div>

                  {/* Task card */}
                  <div
                    className="flex-1 rounded-[14px] p-3 mb-2 relative"
                    style={{
                      background: isCurrent ? "linear-gradient(135deg, #FFF5EB, #FFECD9)" : "#FAFAFA",
                      border: isCurrent ? "1px solid #FFD4A8" : "none",
                      opacity: isDone ? 0.7 : 1,
                    }}
                  >
                    <span className="absolute top-2.5 right-2.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: "rgba(255,102,0,0.1)", color: "#FF6600" }}>
                      +{task.xp} XP
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{task.emoji}</span>
                      <span className="text-[13px] font-bold" style={{ color: "#141414" }}>{task.name}</span>
                      {isDone && <span className="text-xs">✅</span>}
                    </div>
                    <p className="text-[10px] mt-1" style={{ color: "#8C7A6B" }}>{task.time} · {task.dur}</p>
                    {isCurrent && (
                      <Link to="/practice-lab">
                        <button
                          className="w-full mt-2.5 py-2 text-[13px] font-[800] text-white rounded-[10px] flex items-center justify-center gap-1.5"
                          style={{ background: "#FF6600", boxShadow: "0 4px 12px rgba(255,102,0,0.25)" }}
                        >
                          Continue →
                        </button>
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Section 3: Study Buddy CTA */}
      <motion.div {...fade(2)}>
        <div className="rounded-[20px] p-5 text-center" style={{ background: "linear-gradient(135deg, #F8F4FF, #F0E6FF)", border: "1px solid #E0D0F0" }}>
          <span className="text-4xl">👥</span>
          <h3 className="text-base font-[800] mt-2" style={{ color: "#141414" }}>Study Buddy</h3>
          <p className="text-xs leading-relaxed mt-1.5 mx-auto max-w-[260px]" style={{ color: "#8C7A6B" }}>
            Pair with a buddy to see their daily sprint and stay accountable together!
          </p>
          <Link to="/study-buddy">
            <button className="mt-3 px-5 py-2.5 text-[13px] font-[800] text-white rounded-[14px]" style={{ background: "#8B5CF6", boxShadow: "0 4px 15px rgba(139,92,246,0.3)" }}>
              Find a Buddy
            </button>
          </Link>
        </div>
      </motion.div>

      {/* Existing widgets */}
      <motion.div {...fade(3)}>
        <BuddyMiniWidget />
        <div className="mt-3">
          <SprintBuddyView userId={userId} />
        </div>
      </motion.div>

      <style>{`
        @keyframes pulse-dot {
          0%, 100% { box-shadow: 0 0 0 4px rgba(255,102,0,0.15); }
          50% { box-shadow: 0 0 0 8px rgba(255,102,0,0.08); }
        }
      `}</style>
    </div>
  );
}
