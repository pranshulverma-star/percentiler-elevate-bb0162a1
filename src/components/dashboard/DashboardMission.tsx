import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Play, FlaskConical, ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

interface Props {
  engagement: { watch_percentage: number; completed: boolean } | null;
  loadingMasterclass: boolean;
}

export default function DashboardMission({ engagement, loadingMasterclass }: Props) {
  if (loadingMasterclass) {
    return <Skeleton className="h-28 w-full rounded-xl" />;
  }

  const watchPct = engagement?.watch_percentage ?? 0;
  const completed = engagement?.completed ?? false;

  // If masterclass not started, that's the primary mission
  if (watchPct === 0 && !completed) {
    return (
      <div className="rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 to-primary/[0.02] p-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-[10px] font-semibold tracking-wider uppercase text-primary">Recommended</span>
          </div>
          <h3 className="text-base font-bold text-foreground mb-1">Watch the Free Masterclass</h3>
          <p className="text-xs text-muted-foreground mb-4">Learn the complete 95%ile strategy in 90 minutes — free.</p>
          <Button asChild size="sm" className="gap-1.5">
            <Link to="/masterclass">
              <Play className="h-3.5 w-3.5" /> Watch Now
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  // Masterclass in progress or done → practice is the mission
  return (
    <div className="rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 to-primary/[0.02] p-5 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
      <div className="relative space-y-3">
        {!completed && watchPct > 0 && (
          <div>
            <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
              <span>Masterclass</span>
              <span>{watchPct}%</span>
            </div>
            <Progress value={watchPct} className="h-1.5" />
            <div className="mt-2">
              <Button asChild variant="outline" size="sm" className="h-7 text-xs gap-1">
                <Link to="/masterclass">
                  <Play className="h-3 w-3" /> Continue Watching
                </Link>
              </Button>
            </div>
          </div>
        )}
        {completed && (
          <div className="flex items-center gap-2 text-xs text-emerald-600 font-medium">
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/10">✓</span>
            Masterclass completed
          </div>
        )}
        <div className="pt-1">
          <h3 className="text-base font-bold text-foreground mb-1 flex items-center gap-2">
            <FlaskConical className="h-4 w-4 text-primary" /> Daily Practice
          </h3>
          <p className="text-xs text-muted-foreground mb-3">Keep your streak alive — attempt today's quiz.</p>
          <Button asChild size="sm" className="gap-1.5">
            <Link to="/practice-lab">
              Start Practicing <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
