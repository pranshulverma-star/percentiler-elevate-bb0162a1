import { motion, AnimatePresence } from "framer-motion";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2 } from "lucide-react";
import { type SprintGoal, SUBJECTS, ACTIVITY_TYPES } from "@/lib/sprint-utils";

interface Props {
  goals: SprintGoal[];
  onToggle: (goalId: string, completed: boolean) => void;
  onDelete: (goalId: string) => void;
  readOnly?: boolean;
}

const subjectLabel = (v: string) => SUBJECTS.find((s) => s.value === v)?.label ?? v;
const activityLabel = (v: string) => ACTIVITY_TYPES.find((a) => a.value === v)?.label ?? v;

const subjectColor: Record<string, string> = {
  quants: "bg-blue-500/15 text-blue-700 dark:text-blue-400",
  lrdi: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  varc: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
};

export default function SprintGoalList({ goals, onToggle, onDelete, readOnly }: Props) {
  if (goals.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-6">
        No goals yet. Add your first goal for today!
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <AnimatePresence mode="popLayout">
        {goals.map((goal) => (
          <motion.div
            key={goal.id}
            layout
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className={`flex items-start gap-3 rounded-lg border p-3 transition-colors ${
              goal.completed
                ? "border-primary/30 bg-primary/5"
                : "border-border bg-card"
            }`}
          >
            {!readOnly && (
              <Checkbox
                checked={goal.completed}
                onCheckedChange={(checked) => onToggle(goal.id, !!checked)}
                className="mt-0.5"
              />
            )}
            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${subjectColor[goal.subject] ?? "bg-muted text-muted-foreground"}`}>
                  {subjectLabel(goal.subject)}
                </span>
                <span className="text-xs text-muted-foreground">
                  {activityLabel(goal.activity_type)}
                </span>
              </div>
              <p className={`text-sm ${goal.completed ? "line-through text-muted-foreground" : "text-foreground"}`}>
                {goal.description}
              </p>
            </div>
            {!readOnly && (
              <button
                onClick={() => onDelete(goal.id)}
                className="text-muted-foreground hover:text-destructive transition-colors p-1"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
            {readOnly && goal.completed && (
              <span className="text-xs text-primary font-medium">✓ Done</span>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
