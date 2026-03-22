import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap, Target, Brain, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { getTodaysSectionIndex } from "@/lib/todaySectionIndex";
import DashboardStatPills from "@/components/dashboard/DashboardStatPills";

const sectionLabels = [
  { name: "Quantitative Ability", icon: "📝", tag: "QA Mix · 10 Qs · 15 min" },
  { name: "LRDI", icon: "🧩", tag: "1 Set · 12 min" },
  { name: "VARC", icon: "📜", tag: "1 RC + 1 PJ · 15 min" },
];

const actionCards = [
  { title: "Section Practice", desc: "Pick QA, LRDI or VARC to drill", icon: Target, to: "/practice-lab", color: "hsl(var(--primary))" },
  { title: "Flashcard Revision", desc: "Quick formula & concept cards", icon: Brain, to: "/flashcards", color: "hsl(280 60% 55%)" },
  { title: "Study Planner", desc: "Continue your daily plan", icon: Calendar, to: "/cat-daily-study-planner", color: "hsl(160 60% 45%)" },
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
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: i * 0.06, duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
});

export default function PracticeTab({ streakData, loadingStreaks }: Props) {
  const navigate = useNavigate();
  const idx = getTodaysSectionIndex();
  const info = sectionLabels[idx];

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* Big Daily Quiz CTA */}
      <motion.div {...fade(0)}>
        <div className="relative overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/[0.10] via-card to-primary/[0.04] backdrop-blur-xl p-6 shadow-[0_4px_32px_rgba(0,0,0,0.08)]">
          <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-primary/15 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-28 h-28 rounded-full bg-primary/10 blur-2xl pointer-events-none" />

          <div className="flex items-center gap-4 mb-5 relative">
            <div className="relative w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center shrink-0 shadow-[0_0_24px_hsl(var(--primary)/0.3)]">
              <div className="absolute inset-0 rounded-2xl border-2 border-primary/20 animate-[pulse_2.5s_ease-in-out_infinite]" />
              <Zap className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Daily Quiz</h2>
              <p className="text-xs text-muted-foreground mt-0.5">{info.name} · {info.tag}</p>
            </div>
          </div>

          <Button
            className="relative w-full h-14 text-base font-bold rounded-xl shadow-[0_0_24px_hsl(var(--primary)/0.3)] active:scale-[0.97] transition-all overflow-hidden"
            onClick={() => navigate("/practice-lab?daily=true")}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full animate-[shimmer_3s_ease-in-out_infinite]" />
            <span className="relative z-10 flex items-center gap-2">
              Start Today's Quiz <ArrowRight className="h-5 w-5" />
            </span>
          </Button>
        </div>
      </motion.div>

      {/* Stat Pills */}
      <motion.div {...fade(1)}>
        <DashboardStatPills streakData={streakData} loading={loadingStreaks} />
      </motion.div>

      {/* Guided Action Cards */}
      <motion.div {...fade(2)} className="flex-1 min-h-0 flex flex-col gap-2.5">
        {actionCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link key={card.title} to={card.to}>
              <div className="relative overflow-hidden rounded-xl border border-border/40 bg-card/80 backdrop-blur-xl p-4 flex items-center gap-3.5 group hover:border-primary/30 transition-all shadow-sm">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${card.color}18` }}>
                  <Icon className="h-5 w-5" style={{ color: card.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-foreground">{card.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{card.desc}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
              </div>
            </Link>
          );
        })}
      </motion.div>

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
