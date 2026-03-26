import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import SprintBuddyView from "@/components/sprint/SprintBuddyView";
import { Target, ArrowRight, Plus } from "lucide-react";

interface SprintGoal {
  id: string;
  description: string;
  subject: string;
  activity_type: string;
  completed: boolean;
  position: number;
}

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

const subjectEmoji: Record<string, string> = {
  QA: "📚", VARC: "📖", LRDI: "🧩", DILR: "🧩", Quant: "📚", General: "🎯",
};

const subjectColor: Record<string, string> = {
  QA: "#FF6600", VARC: "#8B5CF6", LRDI: "#10B981", DILR: "#10B981", Quant: "#FF6600", General: "#2196F3",
};

const todayStr = new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

export default function PlanTab({ plannerData, loadingPlanner, userId }: Props) {
  const heat = plannerData?.heat;
  const stats = plannerData?.stats;
  const heatScore = heat?.heat_score ?? 0;
  const totalDays = heat?.total_active_days ?? 0;
  const consistency = heat?.consistency_score ?? 0;
  const category = heat?.lead_category ?? "Cold";

  const [goals, setGoals] = useState<SprintGoal[]>([]);
  const [loadingGoals, setLoadingGoals] = useState(true);

  useEffect(() => {
    if (!userId) { setLoadingGoals(false); return; }
    (async () => {
      setLoadingGoals(true);
      const today = new Date().toISOString().slice(0, 10);
      try {
        const { data } = await supabase.from("daily_sprint_goals")
          .select("id, description, subject, activity_type, completed, position")
          .eq("user_id", userId)
          .eq("sprint_date", today)
          .order("position", { ascending: true });
        setGoals(data || []);
      } catch (e) {
        console.error("[PlanTab] fetchGoals error", e);
      }
      setLoadingGoals(false);
    })();
  }, [userId]);

  const doneCount = goals.filter(g => g.completed).length;

  return (
    <div className="flex flex-col gap-3 dashboard-scroll overflow-y-auto h-full pb-4">
      {/* Section 1: Study Planner Hero */}
      {(stats || plannerData?.heat) && (
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
                { emoji: "✅", value: goals.length > 0 ? `${doneCount}/${goals.length}` : "0", label: "Today", color: "#10B981" },
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
                <span>{Math.min(100, Math.round(consistency * 100))}%</span>
              </div>
              <div className="w-full h-1.5 rounded-full" style={{ background: "#F0EBE6" }}>
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: "#FF6600" }}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, consistency * 100)}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Section 2: Today's Plan Timeline — real goals */}
      <motion.div {...fade(1)}>
        <div className="rounded-[20px] p-4" style={{ background: "#fff", border: "1px solid #F0EBE6", boxShadow: "0 2px 12px rgba(0,0,0,0.03)" }}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-[800]" style={{ color: "#141414" }}>Today's Plan</h3>
            <span className="text-[11px] font-medium" style={{ color: "#8C7A6B" }}>{todayStr}</span>
          </div>

          {loadingGoals ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: "#FF6600", borderTopColor: "transparent" }} />
            </div>
          ) : goals.length === 0 ? (
            /* Empty state */
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <Target className="h-10 w-10 mb-3" style={{ color: "#BFB3A8" }} />
              <p className="text-sm font-semibold mb-1" style={{ color: "#141414" }}>You haven't set any goals yet</p>
              <p className="text-xs mb-4" style={{ color: "#8C7A6B" }}>Set daily targets and track your progress here</p>
              <Link to="/daily-sprint">
                <button
                  className="flex items-center gap-2 px-5 py-2.5 text-[13px] font-[800] text-white rounded-[12px]"
                  style={{ background: "#FF6600", boxShadow: "0 4px 12px rgba(255,102,0,0.25)" }}
                >
                  <Plus className="h-4 w-4" /> Set Your Goals
                </button>
              </Link>
            </div>
          ) : (
            /* Real goals timeline */
            <div className="space-y-0">
              {goals.map((goal, i) => {
                const isDone = goal.completed;
                const emoji = subjectEmoji[goal.subject] || "🎯";
                const color = subjectColor[goal.subject] || "#FF6600";
                const prevDone = i > 0 && goals[i - 1].completed;

                return (
                  <div key={goal.id} className="flex gap-3">
                    {/* Timeline column */}
                    <div className="flex flex-col items-center w-6 shrink-0">
                      {i > 0 && (
                        <div className="w-0.5 h-2" style={{ background: prevDone ? "#10B981" : "#F0EBE6" }} />
                      )}
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[10px]"
                        style={{
                          background: isDone ? "#10B981" : "#F0EBE6",
                          color: isDone ? "#fff" : "#BFB3A8",
                        }}
                      >
                        {isDone ? "✓" : ""}
                      </div>
                      {i < goals.length - 1 && (
                        <div className="w-0.5 flex-1 min-h-[8px]" style={{ background: isDone ? "#10B981" : "#F0EBE6" }} />
                      )}
                    </div>

                    {/* Task card */}
                    <div
                      className="flex-1 rounded-[14px] p-3 mb-2 relative"
                      style={{
                        background: isDone ? "#FAFAFA" : "linear-gradient(135deg, #FFF5EB, #FFECD9)",
                        border: isDone ? "none" : "1px solid #FFD4A8",
                        opacity: isDone ? 0.7 : 1,
                      }}
                    >
                      <span className="absolute top-2.5 right-2.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: `${color}15`, color }}>
                        {goal.subject}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{emoji}</span>
                        <span className={`text-[13px] font-bold ${isDone ? "line-through" : ""}`} style={{ color: "#141414" }}>{goal.description}</span>
                        {isDone && <span className="text-xs">✅</span>}
                      </div>
                      <p className="text-[10px] mt-1" style={{ color: "#8C7A6B" }}>{goal.activity_type}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </motion.div>

      {/* Study Buddy */}
      <motion.div {...fade(2)}>
        <SprintBuddyView userId={userId} />
      </motion.div>
    </div>
  );
}
