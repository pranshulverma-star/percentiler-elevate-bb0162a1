import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { FlaskConical, Target, Flame, Calendar, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

interface Props {
  plannerData: any;
  loadingPlanner: boolean;
  practiceAttempts: any[];
  loadingPractice: boolean;
}

const sectionNames: Record<string, string> = { qa: "QA", lrdi: "LRDI", varc: "VARC" };

export default function DashboardProgress({ plannerData, loadingPlanner, practiceAttempts, loadingPractice }: Props) {
  const [tab, setTab] = useState<"practice" | "planner">("practice");

  return (
    <div className="space-y-3">
      {/* Tab switcher */}
      <div className="flex gap-1 bg-secondary/60 rounded-lg p-0.5">
        <button
          onClick={() => setTab("practice")}
          className={`flex-1 text-xs font-medium py-1.5 rounded-md transition-colors ${tab === "practice" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}
        >
          <FlaskConical className="h-3 w-3 inline mr-1" /> Practice
        </button>
        <button
          onClick={() => setTab("planner")}
          className={`flex-1 text-xs font-medium py-1.5 rounded-md transition-colors ${tab === "planner" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}
        >
          <Target className="h-3 w-3 inline mr-1" /> Planner
        </button>
      </div>

      {tab === "practice" ? (
        <PracticeTab attempts={practiceAttempts} loading={loadingPractice} />
      ) : (
        <PlannerTab data={plannerData} loading={loadingPlanner} />
      )}
    </div>
  );
}

function PracticeTab({ attempts, loading }: { attempts: any[]; loading: boolean }) {
  if (loading) return <Skeleton className="h-32 w-full rounded-xl" />;

  if (attempts.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border/60 p-6 text-center">
        <FlaskConical className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
        <p className="text-xs text-muted-foreground mb-3">No quizzes attempted yet</p>
        <Button asChild size="sm">
          <Link to="/practice-lab">Start Practicing <ArrowRight className="ml-1 h-3.5 w-3.5" /></Link>
        </Button>
      </div>
    );
  }

  const totalAttempts = attempts.length;
  const avgScore = Math.round(attempts.reduce((s, a) => s + a.score_pct, 0) / totalAttempts);
  const bestScore = Math.max(...attempts.map(a => a.score_pct));
  const recent = attempts.slice(0, 3);

  return (
    <div className="rounded-xl border border-border/60 bg-card p-4 space-y-3">
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-lg bg-secondary/50 py-2">
          <div className="text-lg font-bold text-primary">{bestScore}%</div>
          <p className="text-[9px] text-muted-foreground">Best</p>
        </div>
        <div className="rounded-lg bg-secondary/50 py-2">
          <div className="text-lg font-bold text-foreground">{avgScore}%</div>
          <p className="text-[9px] text-muted-foreground">Average</p>
        </div>
        <div className="rounded-lg bg-secondary/50 py-2">
          <div className="text-lg font-bold text-foreground">{totalAttempts}</div>
          <p className="text-[9px] text-muted-foreground">Attempts</p>
        </div>
      </div>

      <div>
        <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
          <span>Accuracy</span>
          <span>{avgScore}%</span>
        </div>
        <Progress value={avgScore} className="h-1.5" />
      </div>

      <div className="space-y-1">
        {recent.map((a, i) => (
          <div key={i} className="flex items-center justify-between text-[11px] py-1 border-b border-border/40 last:border-0">
            <div className="flex items-center gap-1.5">
              <Badge variant="outline" className="text-[8px] px-1 py-0">{sectionNames[a.section_id] || a.section_id}</Badge>
              <span className="text-muted-foreground capitalize truncate max-w-[120px]">{a.chapter_slug.replace(/-/g, " ")}</span>
            </div>
            <span className={`font-semibold ${a.score_pct >= 70 ? "text-emerald-500" : a.score_pct >= 40 ? "text-primary" : "text-destructive"}`}>
              {a.score_pct}%
            </span>
          </div>
        ))}
      </div>

      <Button asChild variant="outline" size="sm" className="w-full h-8 text-xs">
        <Link to="/practice-lab">Continue Practicing <ArrowRight className="ml-1 h-3 w-3" /></Link>
      </Button>
    </div>
  );
}

function PlannerTab({ data, loading }: { data: any; loading: boolean }) {
  if (loading) return <Skeleton className="h-32 w-full rounded-xl" />;

  if (!data?.stats) {
    return (
      <div className="rounded-xl border border-dashed border-border/60 p-6 text-center">
        <Calendar className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
        <p className="text-xs text-muted-foreground mb-3">Haven't started the Study Planner yet</p>
        <Button asChild size="sm">
          <Link to="/cat-daily-study-planner">Start Planning <ArrowRight className="ml-1 h-3.5 w-3.5" /></Link>
        </Button>
      </div>
    );
  }

  const { stats, heat, activeDaysThisWeek } = data;
  const heatScore = heat?.heat_score ?? 0;
  const category = heat?.lead_category ?? "Cold";
  const totalDays = heat?.total_active_days ?? 0;
  const consistency = heat?.consistency_score ?? 0;

  const categoryColor: Record<string, string> = {
    Hot: "bg-destructive text-destructive-foreground",
    Warm: "bg-primary text-primary-foreground",
    Cold: "bg-muted text-muted-foreground",
  };

  return (
    <div className="rounded-xl border border-border/60 bg-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-foreground">Study Planner</span>
        <Badge className={`text-[10px] ${categoryColor[category] || categoryColor.Cold}`}>{category}</Badge>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-lg bg-secondary/50 py-2">
          <div className="text-lg font-bold text-primary flex items-center justify-center gap-0.5">
            <Flame className="h-4 w-4" /> {heatScore}
          </div>
          <p className="text-[9px] text-muted-foreground">Heat</p>
        </div>
        <div className="rounded-lg bg-secondary/50 py-2">
          <div className="text-lg font-bold text-foreground">{totalDays}</div>
          <p className="text-[9px] text-muted-foreground">Active Days</p>
        </div>
        <div className="rounded-lg bg-secondary/50 py-2">
          <div className="text-lg font-bold text-foreground">{activeDaysThisWeek}/7</div>
          <p className="text-[9px] text-muted-foreground">This Week</p>
        </div>
      </div>

      <div>
        <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
          <span>Consistency</span>
          <span>{Math.round(consistency * 100)}%</span>
        </div>
        <Progress value={consistency * 100} className="h-1.5" />
      </div>

      {stats.current_phase && (
        <p className="text-[10px] text-muted-foreground">
          Phase: <span className="font-medium text-foreground">{stats.current_phase}</span>
          {stats.crash_mode && <Badge variant="outline" className="ml-1.5 text-[8px]">Crash</Badge>}
        </p>
      )}

      <Button asChild variant="outline" size="sm" className="w-full h-8 text-xs">
        <Link to="/cat-daily-study-planner">Continue Planning <ArrowRight className="ml-1 h-3 w-3" /></Link>
      </Button>
    </div>
  );
}
