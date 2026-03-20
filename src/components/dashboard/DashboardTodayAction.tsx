import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronDown, ChevronUp, Layers, BarChart3 } from "lucide-react";
import { getTodaysSectionIndex } from "@/lib/todaySectionIndex";

const sectionLabels = [
  { name: "Quantitative Ability", icon: "📝", tag: "QA Mix · 10 Qs · 15 min" },
  { name: "LRDI", icon: "🧩", tag: "1 Set · 12 min" },
  { name: "VARC", icon: "📜", tag: "1 RC + 1 PJ · 15 min" },
];

interface Props {
  engagement: { watch_percentage: number; completed: boolean } | null;
}

export default function DashboardTodayAction({ engagement }: Props) {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const idx = getTodaysSectionIndex();
  const info = sectionLabels[idx];

  return (
    <div className="relative overflow-hidden rounded-2xl bg-card/80 backdrop-blur-sm border border-border/40 p-5 shadow-[0_2px_16px_rgba(0,0,0,0.05)]">
      {/* Left accent */}
      <div className="absolute left-0 top-3 bottom-3 w-1 rounded-full bg-gradient-to-b from-primary via-primary/60 to-transparent" />

      <div className="flex items-start gap-3 mb-4 pl-2">
        <span className="text-2xl">{info.icon}</span>
        <div className="flex-1 min-w-0">
          <h2 className="text-base font-bold text-foreground">Daily Quiz</h2>
          <p className="text-xs text-muted-foreground">{info.name} · {info.tag}</p>
        </div>
      </div>

      <Button
        className="relative w-full h-12 text-sm font-semibold rounded-xl shadow-sm shadow-primary/15 active:scale-[0.98] transition-transform overflow-hidden"
        onClick={() => navigate("/practice-lab?daily=true")}
      >
        {/* Shimmer */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full animate-[shimmer_3s_ease-in-out_infinite]" />
        <span className="relative z-10 flex items-center">Start Today's Quiz <ArrowRight className="ml-2 h-4 w-4" /></span>
      </Button>

      {/* Expandable extra activities */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1 text-[11px] text-muted-foreground mt-3 mx-auto hover:text-foreground transition-colors"
      >
        {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        {expanded ? "Show less" : "+ 2 more activities available"}
      </button>

      {expanded && (
        <div className="mt-3 space-y-2">
          <button
            onClick={() => navigate("/flashcards")}
            className="w-full flex items-center gap-3 p-3 rounded-xl bg-secondary/60 hover:bg-secondary transition-colors text-left"
          >
            <Layers className="h-4 w-4 text-primary shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-foreground">Flashcard Practice</p>
              <p className="text-[10px] text-muted-foreground">Review key concepts</p>
            </div>
            <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
          </button>

          {engagement && !engagement.completed && (
            <button
              onClick={() => navigate("/masterclass")}
              className="w-full flex items-center gap-3 p-3 rounded-xl bg-secondary/60 hover:bg-secondary transition-colors text-left"
            >
              <BarChart3 className="h-4 w-4 text-primary shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground">Continue Masterclass</p>
                <p className="text-[10px] text-muted-foreground">{engagement.watch_percentage}% watched</p>
              </div>
              <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
            </button>
          )}

          {!engagement && (
            <button
              onClick={() => navigate("/masterclass")}
              className="w-full flex items-center gap-3 p-3 rounded-xl bg-secondary/60 hover:bg-secondary transition-colors text-left"
            >
              <BarChart3 className="h-4 w-4 text-primary shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground">Free Masterclass</p>
                <p className="text-[10px] text-muted-foreground">Learn the 95%ile strategy</p>
              </div>
              <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
            </button>
          )}
        </div>
      )}

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
