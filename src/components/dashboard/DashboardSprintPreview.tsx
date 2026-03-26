import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { CalendarCheck, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function DashboardSprintPreview() {
  const { user } = useAuth();
  const [goals, setGoals] = useState<{ total: number; done: number } | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    const today = new Date().toISOString().slice(0, 10);
    (async () => {
      const { data } = await supabase.from("daily_sprint_goals")
        .select("completed")
        .eq("user_id", user.id)
        .eq("sprint_date", today);
      if (data && data.length > 0) {
        setGoals({ total: data.length, done: data.filter((g: any) => g.completed).length });
      }
    })();
  }, [user?.id]);

  const hasGoals = goals && goals.total > 0;
  const pct = hasGoals ? Math.round((goals.done / goals.total) * 100) : 0;
  const r = 18;
  const c = 2 * Math.PI * r;
  const offset = c - (c * pct) / 100;

  return (
    <Link to="/daily-sprint" className="block">
      <div className="relative overflow-hidden rounded-2xl border border-border/40 bg-card/80 backdrop-blur-sm p-4 group hover:border-primary/30 transition-all duration-300 shadow-sm">
        <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-primary/5 blur-xl pointer-events-none" />

        <div className="flex items-center gap-3 relative">
          {hasGoals ? (
            <div className="relative w-11 h-11 shrink-0">
              <svg viewBox="0 0 44 44" className="w-11 h-11 -rotate-90">
                <circle cx="22" cy="22" r={r} fill="none" stroke="hsl(var(--muted))" strokeWidth="3" />
                <circle
                  cx="22" cy="22" r={r} fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={c}
                  strokeDashoffset={offset}
                  className="transition-all duration-700"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-foreground">
                {goals.done}/{goals.total}
              </span>
            </div>
          ) : (
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-secondary shrink-0">
              <CalendarCheck className="h-5 w-5 text-muted-foreground" />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground">
              {hasGoals ? "Today's Sprint" : "Set Today's Goals"}
            </p>
            <p className="text-[11px] text-muted-foreground leading-snug">
              {hasGoals
                ? `${goals.done} of ${goals.total} goals completed`
                : "Plan your study tasks for today"}
            </p>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
        </div>
      </div>
    </Link>
  );
}
