import { Flame, Trophy, Zap, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

interface Props {
  streakData: {
    currentStreak: number;
    longestStreak: number;
    totalQuizzes: number;
    avgAccuracy: number;
  } | null;
  loading: boolean;
}

const pills: { key: string; icon: typeof Flame; iconColor: string; field: string; label: string; suffix?: string }[] = [
  { key: "streak", icon: Flame, iconColor: "text-primary", field: "currentStreak", label: "Streak" },
  { key: "best", icon: Trophy, iconColor: "text-amber-500", field: "longestStreak", label: "Best" },
  { key: "quizzes", icon: Zap, iconColor: "text-primary", field: "totalQuizzes", label: "Quizzes" },
  { key: "accuracy", icon: TrendingUp, iconColor: "text-emerald-500", field: "avgAccuracy", label: "Accuracy", suffix: "%" },
];

export default function DashboardStatPills({ streakData, loading }: Props) {
  if (loading) {
    return (
      <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
        {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-9 w-24 rounded-full shrink-0" />)}
      </div>
    );
  }

  if (!streakData || streakData.totalQuizzes === 0) {
    return (
      <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
        {pills.map(p => (
          <div key={p.key} className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-secondary/70 shrink-0">
            <p.icon className={`h-3.5 w-3.5 text-muted-foreground`} />
            <span className="text-xs font-medium text-muted-foreground">0</span>
            <span className="text-[10px] text-muted-foreground">{p.label}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
      {pills.map((p, i) => {
        const Icon = p.icon;
        const val = streakData[p.field as keyof typeof streakData];
        return (
          <motion.div
            key={p.key}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.35, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-secondary/70 shrink-0"
          >
            <Icon className={`h-3.5 w-3.5 ${p.iconColor}`} />
            <span className="text-xs font-semibold text-foreground">{val}{p.suffix || ""}</span>
            <span className="text-[10px] text-muted-foreground">{p.label}</span>
          </motion.div>
        );
      })}
    </div>
  );
}
