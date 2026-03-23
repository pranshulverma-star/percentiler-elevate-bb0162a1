import { useNavigate, Link } from "react-router-dom";
import { ArrowRight, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { getTodaysSectionIndex } from "@/lib/todaySectionIndex";
import { useState, useMemo } from "react";

const sectionLabels = [
  { name: "Quantitative Ability", tag: "QA Mix · 10 Qs · 15 min" },
  { name: "LRDI", tag: "1 Set · 12 min" },
  { name: "VARC", tag: "1 RC + 1 PJ · 15 min" },
];

interface Props {
  engagement: any;
  streakData: any;
  loadingStreaks: boolean;
  plannerData: any;
  loadingPlanner: boolean;
  practiceAttempts: any[];
  loadingPractice: boolean;
}

const fade = (i: number) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
});

// SVG circular progress ring
function CircularProgress({ pct, color, size = 52, stroke = 5 }: { pct: number; color: string; size?: number; stroke?: number }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <svg width={size} height={size} className="shrink-0">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#F0EBE6" strokeWidth={stroke} />
      <motion.circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={color} strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1, ease: "easeOut" }}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text x="50%" y="50%" textAnchor="middle" dy="0.35em" fontSize="11" fontWeight="800" fill={color}>
        {pct}%
      </text>
    </svg>
  );
}

const sectionPerf = [
  { name: "QA", pct: 75, quizzes: 8, color: "#FF6600", trend: "+5%" },
  { name: "VARC", pct: 68, quizzes: 6, color: "#8B5CF6", trend: "+2%" },
  { name: "LRDI", pct: 82, quizzes: 5, color: "#10B981", trend: "+8%" },
];

const sampleHistory = [
  { title: "QA Mix — Algebra & Numbers", date: "Mar 22", score: "8/10", time: "12:34", pct: 80, section: "QA", diff: "Medium" },
  { title: "VARC — RC Passage Set", date: "Mar 21", score: "6/10", time: "14:20", pct: 60, section: "VARC", diff: "Hard" },
  { title: "LRDI — Set Theory & Venn", date: "Mar 20", score: "9/10", time: "11:05", pct: 90, section: "LRDI", diff: "Easy" },
  { title: "QA — Geometry & Mensuration", date: "Mar 19", score: "7/10", time: "13:50", pct: 70, section: "QA", diff: "Hard" },
  { title: "VARC — Para Jumbles", date: "Mar 18", score: "9/10", time: "09:15", pct: 90, section: "VARC", diff: "Medium" },
];

const weeklyData = [
  { day: "Mon", quizzes: 3, acc: 78 },
  { day: "Tue", quizzes: 2, acc: 82 },
  { day: "Wed", quizzes: 4, acc: 75 },
  { day: "Thu", quizzes: 1, acc: 90 },
  { day: "Fri", quizzes: 0, acc: 0 },
  { day: "Sat", quizzes: 3, acc: 85 },
  { day: "Sun", quizzes: 0, acc: 0 },
];

const sectionColors: Record<string, { bg: string; text: string }> = {
  QA: { bg: "rgba(255,102,0,0.1)", text: "#FF6600" },
  VARC: { bg: "rgba(139,92,246,0.1)", text: "#8B5CF6" },
  LRDI: { bg: "rgba(16,185,129,0.1)", text: "#10B981" },
};

export default function PracticeTab({ streakData, practiceAttempts }: Props) {
  const navigate = useNavigate();
  const idx = getTodaysSectionIndex();
  const info = sectionLabels[idx];
  const [filter, setFilter] = useState("All");

  const quizHistory = useMemo(() => {
    // Use real data if available, else sample
    if (practiceAttempts && practiceAttempts.length > 0) {
      return practiceAttempts.slice(0, 5).map((a: any) => ({
        title: `${a.section_id?.toUpperCase() || "QA"} — ${a.chapter_slug?.replace(/-/g, " ") || "Mixed"}`,
        date: new Date(a.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        score: `${a.correct}/${a.total_questions}`,
        time: `${Math.floor((a.time_used_seconds || 0) / 60)}:${String((a.time_used_seconds || 0) % 60).padStart(2, "0")}`,
        pct: a.score_pct,
        section: a.section_id?.toUpperCase() || "QA",
        diff: a.score_pct >= 80 ? "Easy" : a.score_pct >= 60 ? "Medium" : "Hard",
      }));
    }
    return sampleHistory;
  }, [practiceAttempts]);

  const filteredHistory = filter === "All" ? quizHistory : quizHistory.filter(q => q.section === filter);
  const maxQuizzes = Math.max(...weeklyData.map(d => d.quizzes), 1);

  return (
    <div className="flex flex-col gap-3 dashboard-scroll overflow-y-auto h-full pb-4">
      {/* Section 1: Daily Quiz Hero */}
      <motion.div {...fade(0)}>
        <div className="relative overflow-hidden rounded-[20px] p-5" style={{ background: "linear-gradient(135deg, #FF6600 0%, #FF8A3D 50%, #FFAB5E 100%)" }}>
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-20" style={{ background: "radial-gradient(circle, white, transparent)" }} />
          <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full opacity-10" style={{ background: "radial-gradient(circle, white, transparent)" }} />
          <div className="flex items-center gap-3.5 mb-4 relative">
            <div className="w-11 h-11 rounded-[14px] flex items-center justify-center" style={{ background: "rgba(255,255,255,0.2)", backdropFilter: "blur(10px)" }}>
              <Zap className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-[800] text-white">Daily Quiz</h2>
              <p className="text-xs text-white/80">{info.name} · {info.tag}</p>
            </div>
          </div>
          <button
            onClick={() => navigate("/practice-lab?daily=true")}
            className="relative w-full h-12 text-[15px] font-[800] rounded-[14px] flex items-center justify-center gap-2 transition-all active:scale-[0.97]"
            style={{ background: "rgba(255,255,255,0.95)", color: "#FF6600", boxShadow: "0 4px 15px rgba(0,0,0,0.1)" }}
          >
            Start Today's Quiz <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </motion.div>

      {/* Section 2: Action Cards */}
      <motion.div {...fade(1)} className="flex flex-col gap-2">
        {[
          { emoji: "🎯", title: "Section Practice", desc: "Pick QA, LRDI or VARC to drill", to: "/practice-lab", color: "#FF6600" },
          { emoji: "🧠", title: "Flashcard Revision", desc: "12 cards due · Quick formula & concept review", to: "/flashcards", color: "#8B5CF6" },
        ].map((card) => (
          <Link key={card.title} to={card.to}>
            <div className="rounded-[16px] p-4 flex items-center gap-3.5 group transition-all hover:-translate-y-0.5" style={{ background: "#fff", border: "1px solid #F0EBE6" }}>
              <div className="w-11 h-11 rounded-[14px] flex items-center justify-center shrink-0" style={{ background: `${card.color}18` }}>
                <span className="text-xl">{card.emoji}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-bold" style={{ color: "#141414" }}>{card.title}</p>
                <p className="text-xs" style={{ color: "#8C7A6B" }}>{card.desc}</p>
              </div>
              <ArrowRight className="h-4 w-4 shrink-0" style={{ color: "#BFB3A8" }} />
            </div>
          </Link>
        ))}
      </motion.div>

      {/* Section 3: Stats Strip */}
      <motion.div {...fade(2)}>
        <div className="flex gap-2 overflow-x-auto dashboard-scroll pb-1">
          {[
            { emoji: "🔥", value: `${streakData?.currentStreak ?? 0} days`, label: "Streak", color: "#FF6600" },
            { emoji: "🏆", value: `${streakData?.longestStreak ?? 0} days`, label: "Best", color: "#FFB300" },
            { emoji: "📝", value: `${streakData?.totalQuizzes ?? 0}`, label: "Quizzes", color: "#8B5CF6" },
            { emoji: "🎯", value: `${streakData?.avgAccuracy ?? 0}%`, label: "Avg Acc", color: "#10B981" },
          ].map((s) => (
            <div key={s.label} className="flex flex-col items-center min-w-[80px] rounded-[16px] py-3 px-3.5" style={{ background: "#fff", border: "1px solid #F0EBE6" }}>
              <span className="text-lg">{s.emoji}</span>
              <p className="text-sm font-[800] mt-1" style={{ color: s.color }}>{s.value}</p>
              <p className="text-[10px] font-medium" style={{ color: "#8C7A6B" }}>{s.label}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Section 4: Section Performance */}
      <motion.div {...fade(3)}>
        <div className="rounded-[20px] p-4" style={{ background: "#fff", border: "1px solid #F0EBE6", boxShadow: "0 2px 12px rgba(0,0,0,0.03)" }}>
          <h3 className="text-base font-[800] mb-3" style={{ color: "#141414" }}>Section Performance</h3>
          <div className="space-y-3">
            {sectionPerf.map((s) => (
              <div key={s.name} className="flex items-center gap-3">
                <CircularProgress pct={s.pct} color={s.color} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-bold" style={{ color: "#141414" }}>{s.name}</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: `${s.color}15`, color: s.color }}>{s.trend}</span>
                  </div>
                  <p className="text-[10px]" style={{ color: "#8C7A6B" }}>{s.quizzes} quizzes completed</p>
                  <div className="w-full h-1 rounded-full mt-1" style={{ background: "#F0EBE6" }}>
                    <div className="h-full rounded-full" style={{ background: s.color, width: `${s.pct}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Section 5: Weekly Activity */}
      <motion.div {...fade(4)}>
        <div className="rounded-[20px] p-4" style={{ background: "#fff", border: "1px solid #F0EBE6", boxShadow: "0 2px 12px rgba(0,0,0,0.03)" }}>
          <h3 className="text-base font-[800] mb-3" style={{ color: "#141414" }}>Weekly Activity</h3>
          <div className="flex items-end justify-between gap-1.5 h-28">
            {weeklyData.map((d) => {
              const h = d.quizzes > 0 ? Math.max(16, (d.quizzes / maxQuizzes) * 100) : 8;
              return (
                <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[10px] font-bold" style={{ color: d.quizzes > 0 ? "#FF6600" : "#BFB3A8" }}>
                    {d.quizzes > 0 ? `${d.acc}%` : "—"}
                  </span>
                  <div
                    className="w-full max-w-[32px] rounded-lg"
                    style={{
                      height: `${h}%`,
                      background: d.quizzes > 0 ? "linear-gradient(180deg, #FF6600 0%, #FF8A3D 100%)" : "#F0EBE6",
                    }}
                  />
                  <span className="text-[11px] font-medium" style={{ color: "#8C7A6B" }}>{d.day}</span>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Section 6: Filter Pills */}
      <motion.div {...fade(5)}>
        <div className="flex gap-2">
          {["All", "QA", "VARC", "LRDI"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="px-4 py-2 rounded-full text-[13px] font-bold transition-all"
              style={{
                background: filter === f ? "#FF6600" : "#F5F0EB",
                color: filter === f ? "#fff" : "#8C7A6B",
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Section 7: Quiz History */}
      <motion.div {...fade(6)}>
        <h3 className="text-base font-[800] mb-2" style={{ color: "#141414" }}>Quiz History</h3>
        <div className="space-y-2">
          {filteredHistory.map((q, i) => {
            const ringColor = q.pct >= 80 ? "#10B981" : q.pct >= 60 ? "#FFB300" : "#EF4444";
            const sc = sectionColors[q.section] || sectionColors.QA;
            return (
              <div
                key={i}
                className="rounded-[16px] p-3.5 flex items-center gap-3 transition-all"
                style={{ background: "#fff", border: "1px solid #F0EBE6" }}
              >
                <CircularProgress pct={q.pct} color={ringColor} size={48} stroke={4} />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-bold truncate" style={{ color: "#141414" }}>{q.title}</p>
                  <p className="text-[10px]" style={{ color: "#8C7A6B" }}>{q.date} · {q.score} · {q.time}</p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: sc.bg, color: sc.text }}>{q.section}</span>
                  <span className="text-[9px]" style={{ color: "#BFB3A8" }}>{q.diff}</span>
                </div>
              </div>
            );
          })}
          {filteredHistory.length === 0 && (
            <p className="text-center text-xs py-6" style={{ color: "#8C7A6B" }}>No quizzes found for this filter.</p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
