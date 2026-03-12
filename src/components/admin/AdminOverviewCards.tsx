import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import {
  Users, UserPlus, Activity, Target, Flame, TrendingUp,
  FlaskConical, Swords, BarChart3, Zap
} from "lucide-react";

interface SummaryData {
  total_leads: number;
  total_leads_all: number;
  new_users_today: number;
  active_users_today: number;
  hot_leads: number;
  warm_leads: number;
  conversions: number;
  active_planners: number;
  webinar_completed: number;
  total_practice_attempts: number;
  unique_practice_users: number;
  avg_score: number;
  total_battles: number;
  total_battle_players: number;
  avg_battle_score: number;
  total_readiness_quizzes: number;
  total_profile_assessments: number;
}

const cardDefs = (d: SummaryData) => [
  { label: "Total Users", value: d.total_leads_all, icon: Users, accent: "from-blue-500/20 to-blue-600/5", iconColor: "text-blue-500" },
  { label: "New Today", value: d.new_users_today, icon: UserPlus, accent: "from-emerald-500/20 to-emerald-600/5", iconColor: "text-emerald-500" },
  { label: "Active Today", value: d.active_users_today, icon: Activity, accent: "from-violet-500/20 to-violet-600/5", iconColor: "text-violet-500" },
  { label: "Quiz Attempts", value: d.total_practice_attempts, icon: FlaskConical, accent: "from-amber-500/20 to-amber-600/5", iconColor: "text-amber-500" },
  { label: "Avg Score", value: `${d.avg_score}%`, icon: BarChart3, accent: "from-cyan-500/20 to-cyan-600/5", iconColor: "text-cyan-500" },
  { label: "Battles Played", value: d.total_battles, icon: Swords, accent: "from-rose-500/20 to-rose-600/5", iconColor: "text-rose-500" },
  { label: "Conversions", value: d.conversions, icon: Target, accent: "from-green-500/20 to-green-600/5", iconColor: "text-green-500" },
  { label: "Hot Leads", value: d.hot_leads, icon: Flame, accent: "from-red-500/20 to-red-600/5", iconColor: "text-red-500" },
  { label: "Warm Leads", value: d.warm_leads, icon: TrendingUp, accent: "from-orange-500/20 to-orange-600/5", iconColor: "text-orange-400" },
  { label: "Active Planners", value: d.active_planners, icon: Zap, accent: "from-purple-500/20 to-purple-600/5", iconColor: "text-purple-500" },
];

export default function AdminOverviewCards({ data }: { data: SummaryData }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {cardDefs(data).map((s, i) => (
        <motion.div
          key={s.label}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.04, duration: 0.3 }}
        >
          <Card className="border-border/40 bg-gradient-to-br hover:border-border/80 transition-colors group overflow-hidden relative">
            <div className={`absolute inset-0 bg-gradient-to-br ${s.accent} opacity-60 group-hover:opacity-100 transition-opacity`} />
            <CardContent className="p-4 relative">
              <div className="flex items-center justify-between mb-2">
                <s.icon className={`h-4 w-4 ${s.iconColor}`} />
              </div>
              <div className="text-2xl font-bold text-foreground tracking-tight">{s.value}</div>
              <p className="text-[11px] text-muted-foreground mt-0.5">{s.label}</p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
