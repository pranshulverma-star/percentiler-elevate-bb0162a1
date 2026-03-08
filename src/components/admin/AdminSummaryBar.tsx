import { Card, CardContent } from "@/components/ui/card";
import { Users, Flame, TrendingUp, BookOpen, Tv, Target } from "lucide-react";

interface SummaryData {
  total_leads: number;
  hot_leads: number;
  warm_leads: number;
  conversions: number;
  active_planners: number;
  webinar_completed: number;
  total_practice_attempts: number;
}

const stats = (d: SummaryData) => [
  { label: "Total Leads", value: d.total_leads, icon: Users, color: "text-blue-500" },
  { label: "Hot Leads", value: d.hot_leads, icon: Flame, color: "text-red-500" },
  { label: "Warm Leads", value: d.warm_leads, icon: TrendingUp, color: "text-orange-400" },
  { label: "Conversions", value: d.conversions, icon: Target, color: "text-green-500" },
  { label: "Active Planners", value: d.active_planners, icon: BookOpen, color: "text-purple-500" },
  { label: "Webinar Done", value: d.webinar_completed, icon: Tv, color: "text-cyan-500" },
  { label: "Practice Attempts", value: d.total_practice_attempts, icon: BookOpen, color: "text-amber-500" },
];

export default function AdminSummaryBar({ data }: { data: SummaryData }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
      {stats(data).map((s) => (
        <Card key={s.label} className="border-border/50">
          <CardContent className="p-4 flex flex-col items-center text-center gap-1">
            <s.icon className={`h-5 w-5 ${s.color}`} />
            <span className="text-2xl font-bold text-foreground">{s.value}</span>
            <span className="text-xs text-muted-foreground">{s.label}</span>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
