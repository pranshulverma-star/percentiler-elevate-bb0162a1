import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Flame, Target, Calendar, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

interface PlannerData {
  stats: { current_phase: string | null; start_date: string; target_year: number; crash_mode: boolean } | null;
  heat: { heat_score: number; lead_category: string; total_active_days: number; consistency_score: number } | null;
  activeDaysThisWeek: number;
}

interface Props {
  data: PlannerData | null;
  loading: boolean;
}

export default function DashboardPlanner({ data, loading }: Props) {
  if (loading) {
    return (
      <Card>
        <CardHeader><Skeleton className="h-6 w-40" /></CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-4 w-32" />
        </CardContent>
      </Card>
    );
  }

  if (!data?.stats) {
    return (
      <Card className="border-dashed border-muted-foreground/30">
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <Calendar className="h-10 w-10 text-muted-foreground/50 mb-3" />
          <p className="text-sm text-muted-foreground mb-3">You haven't started the Daily Study Planner yet</p>
          <Button asChild size="sm">
            <Link to="/cat-daily-study-planner">Start Planning <ArrowRight className="ml-1 h-4 w-4" /></Link>
          </Button>
        </CardContent>
      </Card>
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
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-lg">
          <span className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" /> Study Planner
          </span>
          <Badge className={categoryColor[category] || categoryColor.Cold}>{category}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="rounded-lg bg-secondary p-3">
            <div className="flex items-center justify-center gap-1 text-xl font-bold text-primary">
              <Flame className="h-5 w-5" /> {heatScore}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Heat Score</p>
          </div>
          <div className="rounded-lg bg-secondary p-3">
            <div className="text-xl font-bold text-foreground">{totalDays}</div>
            <p className="text-xs text-muted-foreground mt-1">Active Days</p>
          </div>
          <div className="rounded-lg bg-secondary p-3">
            <div className="text-xl font-bold text-foreground">{activeDaysThisWeek}/7</div>
            <p className="text-xs text-muted-foreground mt-1">This Week</p>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Consistency</span>
            <span>{Math.round(consistency * 100)}%</span>
          </div>
          <Progress value={consistency * 100} className="h-2" />
        </div>

        {stats.current_phase && (
          <p className="text-xs text-muted-foreground">
            Phase: <span className="font-medium text-foreground">{stats.current_phase}</span>
            {stats.crash_mode && <Badge variant="outline" className="ml-2 text-xs">Crash Mode</Badge>}
          </p>
        )}

        <Button asChild variant="outline" size="sm" className="w-full">
          <Link to="/cat-daily-study-planner">Continue Planning <ArrowRight className="ml-1 h-4 w-4" /></Link>
        </Button>
      </CardContent>
    </Card>
  );
}
