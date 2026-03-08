import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { FlaskConical, ArrowRight, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";

interface AttemptSummary {
  section_id: string;
  chapter_slug: string;
  score_pct: number;
  total_questions: number;
  correct: number;
  time_used_seconds: number;
  created_at: string;
}

interface Props {
  attempts: AttemptSummary[];
  loading: boolean;
}

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

const sectionNames: Record<string, string> = {
  qa: "QA",
  lrdi: "LRDI",
  varc: "VARC",
};

export default function DashboardPracticeLab({ attempts, loading }: Props) {
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

  if (attempts.length === 0) {
    return (
      <Card className="border-dashed border-muted-foreground/30">
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <FlaskConical className="h-10 w-10 text-muted-foreground/50 mb-3" />
          <p className="text-sm text-muted-foreground mb-3">No practice quizzes attempted yet</p>
          <Button asChild size="sm">
            <Link to="/practice-lab">Start Practicing <ArrowRight className="ml-1 h-4 w-4" /></Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const totalAttempts = attempts.length;
  const avgScore = Math.round(attempts.reduce((s, a) => s + a.score_pct, 0) / totalAttempts);
  const bestScore = Math.max(...attempts.map(a => a.score_pct));
  const uniqueChapters = new Set(attempts.map(a => `${a.section_id}/${a.chapter_slug}`)).size;

  // Recent 5
  const recent = attempts.slice(0, 5);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-lg">
          <span className="flex items-center gap-2">
            <FlaskConical className="h-5 w-5 text-primary" /> Practice Lab
          </span>
          <Badge variant="secondary" className="text-xs">{totalAttempts} attempts</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="rounded-lg bg-secondary p-3">
            <div className="text-xl font-bold text-primary">{bestScore}%</div>
            <p className="text-xs text-muted-foreground mt-1">Best Score</p>
          </div>
          <div className="rounded-lg bg-secondary p-3">
            <div className="text-xl font-bold text-foreground">{avgScore}%</div>
            <p className="text-xs text-muted-foreground mt-1">Average</p>
          </div>
          <div className="rounded-lg bg-secondary p-3">
            <div className="text-xl font-bold text-foreground">{uniqueChapters}</div>
            <p className="text-xs text-muted-foreground mt-1">Chapters</p>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Overall Accuracy</span>
            <span>{avgScore}%</span>
          </div>
          <Progress value={avgScore} className="h-2" />
        </div>

        {/* Recent attempts */}
        <div className="space-y-1.5">
          <p className="text-xs text-muted-foreground font-medium">Recent Quizzes</p>
          {recent.map((a, i) => (
            <div key={i} className="flex items-center justify-between text-xs py-1.5 border-b border-border last:border-0">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[10px] px-1.5 py-0">{sectionNames[a.section_id] || a.section_id}</Badge>
                <span className="text-muted-foreground capitalize">{a.chapter_slug.replace(/-/g, " ")}</span>
              </div>
              <span className={`font-semibold ${a.score_pct >= 70 ? "text-emerald-500" : a.score_pct >= 40 ? "text-primary" : "text-destructive"}`}>
                {a.score_pct}%
              </span>
            </div>
          ))}
        </div>

        <Button asChild variant="outline" size="sm" className="w-full">
          <Link to="/practice-lab">Continue Practicing <ArrowRight className="ml-1 h-4 w-4" /></Link>
        </Button>
      </CardContent>
    </Card>
  );
}
