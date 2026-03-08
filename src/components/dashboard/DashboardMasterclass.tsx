import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play, BookOpen, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

interface Props {
  engagement: { watch_percentage: number; completed: boolean } | null;
  loading: boolean;
}

export default function DashboardMasterclass({ engagement, loading }: Props) {
  if (loading) {
    return (
      <Card>
        <CardHeader><Skeleton className="h-6 w-40" /></CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    );
  }

  const watchPct = engagement?.watch_percentage ?? 0;
  const completed = engagement?.completed ?? false;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-lg">
          <span className="flex items-center gap-2">
            <Play className="h-5 w-5 text-primary" /> Masterclass & Courses
          </span>
          {completed && <Badge className="bg-green-600 text-white">Completed</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {watchPct > 0 ? (
          <div>
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Masterclass Progress</span>
              <span>{watchPct}%</span>
            </div>
            <Progress value={watchPct} className="h-2" />
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">You haven't started the free masterclass yet.</p>
        )}

        <div className="grid grid-cols-2 gap-2">
          <Button asChild size="sm" className="w-full">
            <Link to="/masterclass">
              <Play className="mr-1 h-4 w-4" /> {watchPct > 0 ? "Continue" : "Watch Free"}
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="w-full">
            <Link to="/free-courses">
              <BookOpen className="mr-1 h-4 w-4" /> Free Courses
            </Link>
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link to="/practice-lab">Practice Lab <ArrowRight className="ml-1 h-3 w-3" /></Link>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link to="/test-series">Test Series <ArrowRight className="ml-1 h-3 w-3" /></Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
