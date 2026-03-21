import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, TrendingUp, TrendingDown, FlaskConical, Target, Flame, BarChart3, CalendarCheck, BookOpen } from "lucide-react";
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
    <div className="rounded-2xl overflow-hidden shadow-[0_2px_16px_rgba(0,0,0,0.06)]">
      {/* Tab toggle */}
      <div className="flex">
        <button
          onClick={() => setTab("practice")}
          className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold py-3 transition-all duration-300 ${
            tab === "practice"
              ? "bg-card text-foreground shadow-sm"
              : "bg-muted/40 text-muted-foreground hover:text-foreground"
          }`}
        >
          <FlaskConical className="h-3.5 w-3.5" />
          Practice
        </button>
        <button
          onClick={() => setTab("planner")}
          className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold py-3 transition-all duration-300 ${
            tab === "planner"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "bg-muted/40 text-muted-foreground hover:text-foreground"
          }`}
        >
          <Target className="h-3.5 w-3.5" />
          Planner
        </button>
      </div>

      <div className={`p-5 transition-colors duration-300 ${tab === "planner" ? "bg-primary/[0.06] border border-primary/20 rounded-b-2xl" : "bg-card border border-border/40 rounded-b-2xl"}`}>
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
        <div className="mx-auto w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center mb-3">
          <FlaskConical className="h-7 w-7 text-muted-foreground" />
        </div>
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

  const sectionIcons: Record<string, typeof BarChart3> = { qa: BarChart3, lrdi: BookOpen, varc: BookOpen };

  return (
    <div className="space-y-4">
      {/* Headline stat with icon */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center shrink-0">
          <FlaskConical className="h-6 w-6 text-foreground" />
        </div>
        <div className="flex-1">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-foreground">{avgScore}%</span>
            <span className="text-xs text-muted-foreground">Accuracy</span>
          </div>
          <p className="text-[10px] text-muted-foreground">{totalAttempts} quizzes completed</p>
        </div>
        {trendPct !== 0 && (
          <Badge variant="secondary" className={`text-[10px] gap-0.5 ${trendPct > 0 ? "text-emerald-600" : "text-destructive"}`}>
            {trendPct > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {trendPct > 0 ? "+" : ""}{trendPct}%
          </Badge>
        )}
      </div>

      {/* Section bars with icons */}
      <div className="space-y-2.5">
        {Object.entries(sectionScores).map(([sid, data]) => {
          const avg = Math.round(data.total / data.count);
          const Icon = sectionIcons[sid] || BarChart3;
          return (
            <div key={sid}>
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                  <Icon className="h-3 w-3" />
                  {sectionNames[sid] || sid}
                </span>
                <span className="text-foreground font-semibold">{avg}%</span>
              </div>
              <Progress value={avg} className="h-1.5" />
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
        <div className="mx-auto w-14 h-14 rounded-2xl bg-primary/15 flex items-center justify-center mb-3">
          <CalendarCheck className="h-7 w-7 text-primary" />
        </div>
        <p className="text-xs text-muted-foreground mb-3">Haven't started the Study Planner yet</p>
        <Button asChild size="sm" className="rounded-xl bg-primary hover:bg-primary/90">
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
      {/* Headline with flame icon */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-primary/15 flex items-center justify-center shrink-0">
          <Flame className="h-6 w-6 text-primary" />
        </div>
        <div className="flex-1">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-foreground">{Math.min(100, Math.round(consistency <= 1 ? consistency * 100 : consistency))}%</span>
            <span className="text-xs text-muted-foreground">Consistency</span>
          </div>
          <p className="text-[10px] text-muted-foreground">{activeDaysThisWeek}/7 days active this week</p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-primary/10 p-3 text-center">
          <div className="flex items-center justify-center gap-1">
            <Flame className="h-4 w-4 text-primary" />
            <span className="text-lg font-bold text-foreground">{heatScore}</span>
          </div>
          <p className="text-[10px] text-muted-foreground mt-0.5">Heat Score</p>
        </div>
        <div className="rounded-xl bg-primary/10 p-3 text-center">
          <div className="flex items-center justify-center gap-1">
            <CalendarCheck className="h-4 w-4 text-primary" />
            <span className="text-lg font-bold text-foreground">{totalDays}</span>
          </div>
          <p className="text-[10px] text-muted-foreground mt-0.5">Active Days</p>
        </div>
      </div>

      <Button asChild variant="ghost" size="sm" className="w-full text-xs text-muted-foreground hover:text-foreground">
        <Link to="/cat-daily-study-planner">Continue Planning <ArrowRight className="ml-1 h-3 w-3" /></Link>
      </Button>
    </div>
  );
}
