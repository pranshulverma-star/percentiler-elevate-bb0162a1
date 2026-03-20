import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, TrendingUp, TrendingDown } from "lucide-react";
import { Link } from "react-router-dom";

interface Props {
  plannerData: any;
  loadingPlanner: boolean;
  practiceAttempts: any[];
  loadingPractice: boolean;
}

const sectionNames: Record<string, string> = { qa: "QA", lrdi: "LRDI", varc: "VARC" };

export default function DashboardProgressCompact({ plannerData, loadingPlanner, practiceAttempts, loadingPractice }: Props) {
  const [tab, setTab] = useState<"practice" | "planner">("practice");

  return (
    <div className="rounded-2xl bg-card border border-border/40 shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-hidden">
      {/* Tab toggle */}
      <div className="flex border-b border-border/40">
        <button
          onClick={() => setTab("practice")}
          className={`flex-1 text-xs font-medium py-2.5 transition-colors ${tab === "practice" ? "text-foreground border-b-2 border-primary" : "text-muted-foreground"}`}
        >
          Practice
        </button>
        <button
          onClick={() => setTab("planner")}
          className={`flex-1 text-xs font-medium py-2.5 transition-colors ${tab === "planner" ? "text-foreground border-b-2 border-primary" : "text-muted-foreground"}`}
        >
          Planner
        </button>
      </div>

      <div className="p-4">
        {tab === "practice" ? (
          <PracticeContent attempts={practiceAttempts} loading={loadingPractice} />
        ) : (
          <PlannerContent data={plannerData} loading={loadingPlanner} />
        )}
      </div>
    </div>
  );
}

function PracticeContent({ attempts, loading }: { attempts: any[]; loading: boolean }) {
  if (loading) return <Skeleton className="h-28 w-full rounded-xl" />;

  if (attempts.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-xs text-muted-foreground mb-3">No quizzes attempted yet</p>
        <Button asChild size="sm" className="rounded-xl">
          <Link to="/practice-lab">Start Practicing <ArrowRight className="ml-1 h-3.5 w-3.5" /></Link>
        </Button>
      </div>
    );
  }

  const totalAttempts = attempts.length;
  const avgScore = Math.round(attempts.reduce((s, a) => s + a.score_pct, 0) / totalAttempts);

  // Trend: compare first 5 vs next 5
  let trendPct = 0;
  if (attempts.length >= 10) {
    const recent5 = attempts.slice(0, 5).reduce((s: number, a: any) => s + a.score_pct, 0) / 5;
    const prev5 = attempts.slice(5, 10).reduce((s: number, a: any) => s + a.score_pct, 0) / 5;
    trendPct = Math.round(recent5 - prev5);
  }

  // Section breakdown
  const sectionScores: Record<string, { total: number; count: number }> = {};
  for (const a of attempts) {
    if (!sectionScores[a.section_id]) sectionScores[a.section_id] = { total: 0, count: 0 };
    sectionScores[a.section_id].total += a.score_pct;
    sectionScores[a.section_id].count++;
  }

  return (
    <div className="space-y-4">
      {/* Headline stat */}
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold text-foreground">{avgScore}%</span>
        <span className="text-xs text-muted-foreground">Overall Accuracy</span>
        {trendPct !== 0 && (
          <Badge variant="secondary" className={`text-[10px] gap-0.5 ml-auto ${trendPct > 0 ? "text-emerald-600" : "text-destructive"}`}>
            {trendPct > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {trendPct > 0 ? "+" : ""}{trendPct}% this week
          </Badge>
        )}
      </div>

      {/* Section bars */}
      <div className="space-y-2.5">
        {Object.entries(sectionScores).map(([sid, data]) => {
          const avg = Math.round(data.total / data.count);
          return (
            <div key={sid}>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-muted-foreground font-medium">{sectionNames[sid] || sid}</span>
                <span className="text-foreground font-semibold">{avg}%</span>
              </div>
              <Progress value={avg} className="h-1" />
            </div>
          );
        })}
      </div>

      <Button asChild variant="ghost" size="sm" className="w-full text-xs text-muted-foreground hover:text-foreground">
        <Link to="/practice-lab">See Full Analytics <ArrowRight className="ml-1 h-3 w-3" /></Link>
      </Button>
    </div>
  );
}

function PlannerContent({ data, loading }: { data: any; loading: boolean }) {
  if (loading) return <Skeleton className="h-28 w-full rounded-xl" />;

  if (!data?.stats) {
    return (
      <div className="text-center py-6">
        <p className="text-xs text-muted-foreground mb-3">Haven't started the Study Planner yet</p>
        <Button asChild size="sm" className="rounded-xl">
          <Link to="/cat-daily-study-planner">Start Planning <ArrowRight className="ml-1 h-3.5 w-3.5" /></Link>
        </Button>
      </div>
    );
  }

  const { heat, activeDaysThisWeek } = data;
  const heatScore = heat?.heat_score ?? 0;
  const consistency = heat?.consistency_score ?? 0;
  const totalDays = heat?.total_active_days ?? 0;

  return (
    <div className="space-y-4">
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold text-foreground">{Math.round(consistency <= 1 ? consistency * 100 : consistency)}%</span>
        <span className="text-xs text-muted-foreground">Consistency</span>
        <Badge variant="secondary" className="text-[10px] ml-auto">
          {activeDaysThisWeek}/7 this week
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-secondary/50 p-3 text-center">
          <div className="text-lg font-bold text-foreground">{heatScore}</div>
          <p className="text-[10px] text-muted-foreground">Heat Score</p>
        </div>
        <div className="rounded-xl bg-secondary/50 p-3 text-center">
          <div className="text-lg font-bold text-foreground">{totalDays}</div>
          <p className="text-[10px] text-muted-foreground">Active Days</p>
        </div>
      </div>

      <Button asChild variant="ghost" size="sm" className="w-full text-xs text-muted-foreground hover:text-foreground">
        <Link to="/cat-daily-study-planner">Continue Planning <ArrowRight className="ml-1 h-3 w-3" /></Link>
      </Button>
    </div>
  );
}
