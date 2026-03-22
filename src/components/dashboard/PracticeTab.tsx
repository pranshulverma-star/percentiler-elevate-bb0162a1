import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { getTodaysSectionIndex } from "@/lib/todaySectionIndex";
import DashboardStatPills from "@/components/dashboard/DashboardStatPills";
import DashboardProgressCompact from "@/components/dashboard/DashboardProgressCompact";

const sectionLabels = [
  { name: "Quantitative Ability", icon: "📝", tag: "QA Mix · 10 Qs · 15 min" },
  { name: "LRDI", icon: "🧩", tag: "1 Set · 12 min" },
  { name: "VARC", icon: "📜", tag: "1 RC + 1 PJ · 15 min" },
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

export default function PracticeTab({ engagement: _engagement, streakData, loadingStreaks, plannerData, loadingPlanner, practiceAttempts, loadingPractice }: Props) {
  const navigate = useNavigate();
  const idx = getTodaysSectionIndex();
  const info = sectionLabels[idx];

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* Big Daily Quiz CTA */}
      <motion.div {...fade(0)}>
        <div className="relative overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/[0.08] to-card backdrop-blur-xl p-5 shadow-[0_4px_32px_rgba(0,0,0,0.08)]">
          <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-primary/15 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-8 -left-8 w-24 h-24 rounded-full bg-primary/10 blur-2xl pointer-events-none" />

          <div className="flex items-center gap-3 mb-4 relative">
            <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)]">
              <Zap className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Daily Quiz</h2>
              <p className="text-[11px] text-muted-foreground">{info.name} · {info.tag}</p>
            </div>
          </div>

          <Button
            className="relative w-full h-12 text-sm font-bold rounded-xl shadow-[0_0_20px_hsl(var(--primary)/0.3)] active:scale-[0.97] transition-all overflow-hidden"
            onClick={() => navigate("/practice-lab?daily=true")}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full animate-[shimmer_3s_ease-in-out_infinite]" />
            <span className="relative z-10 flex items-center gap-2">
              Start Today's Quiz <ArrowRight className="h-4 w-4" />
            </span>
          </Button>
        </div>
      </motion.div>

      {/* Stat Pills */}
      <motion.div {...fade(1)}>
        <DashboardStatPills streakData={streakData} loading={loadingStreaks} />
      </motion.div>

      {/* Progress Section */}
      <motion.div {...fade(2)} className="flex-1 min-h-0 overflow-y-auto scrollbar-none">
        <DashboardProgressCompact
          plannerData={plannerData}
          loadingPlanner={loadingPlanner}
          practiceAttempts={practiceAttempts}
          loadingPractice={loadingPractice}
        />
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
