import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Flame, CheckCircle2, Clock, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import type { BuddyPair } from "@/lib/buddy-utils";

interface UserProgress {
  name: string;
  plannerCompleted: boolean;
  plannerGoals?: string; // e.g. "3/3"
  quizAttempted: boolean;
  quizScore?: string; // e.g. "8/10"
  streak: number;
  points: number;
  bonusEarned: boolean;
}

interface Props {
  pair: BuddyPair;
  currentUserId: string;
  myProgress: UserProgress;
  buddyProgress: UserProgress;
}

function ProgressColumn({ data, isYou }: { data: UserProgress; isYou: boolean }) {
  return (
    <div className="flex-1 space-y-3 md:space-y-4 p-3 md:p-5">
      <div className="flex items-center gap-2">
        <span className="text-sm font-bold text-foreground truncate">
          {isYou ? "YOU" : "YOUR BUDDY"}
        </span>
        <span className="text-xs text-muted-foreground truncate">({data.name})</span>
      </div>

      {/* Streak */}
      <div className="flex items-center gap-1.5">
        <Flame className="h-4 w-4 text-primary" />
        <span className="text-sm font-semibold text-foreground">{data.streak}-day streak</span>
      </div>

      {/* Planner */}
      <div className="space-y-1">
        <span className="text-xs font-medium text-muted-foreground">Daily Planner:</span>
        <div className="flex items-center gap-1.5">
          {data.plannerCompleted ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          ) : (
            <Clock className="h-4 w-4 text-muted-foreground" />
          )}
          <span className={`text-sm font-medium ${data.plannerCompleted ? "text-emerald-600" : "text-muted-foreground"}`}>
            {data.plannerCompleted ? (data.plannerGoals || "Done ✅") : "Not yet started"}
          </span>
        </div>
      </div>

      {/* Quiz */}
      <div className="space-y-1">
        <span className="text-xs font-medium text-muted-foreground">Quiz of the Day:</span>
        <div className="flex items-center gap-1.5">
          {data.quizAttempted ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          ) : (
            <span className="text-destructive text-xs">❌</span>
          )}
          <span className={`text-sm font-medium ${data.quizAttempted ? "text-emerald-600" : "text-muted-foreground"}`}>
            {data.quizAttempted ? (data.quizScore || "Attempted ✅") : "Not attempted yet"}
          </span>
        </div>
      </div>

      {/* Points */}
      <div className="pt-1">
        <span className="text-xs font-medium text-muted-foreground">Today's Points:</span>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-lg font-bold text-foreground">{data.points} pts</span>
          {data.bonusEarned && (
            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-[10px]">
              <Sparkles className="h-3 w-3 mr-0.5" /> 2x bonus!
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}

export default function BuddyProgressCard({ pair, currentUserId, myProgress, buddyProgress }: Props) {
  const daysTogether = Math.max(1, Math.floor((Date.now() - new Date(pair.created_at).getTime()) / 86400000));
  const bothActive = myProgress.plannerCompleted || myProgress.quizAttempted
    ? buddyProgress.plannerCompleted || buddyProgress.quizAttempted
    : false;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <Card className="overflow-hidden border-primary/20">
        <CardContent className="p-0">
          <div className="bg-primary/5 px-3 md:px-4 py-2.5 md:py-3 border-b border-border">
            <h3 className="text-xs md:text-sm font-bold text-foreground flex items-center gap-2">
              📊 Today's Progress
            </h3>
          </div>

          <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-border">
            <ProgressColumn data={myProgress} isYou={true} />
            <ProgressColumn data={buddyProgress} isYou={false} />
          </div>

          <div className="bg-secondary/50 px-3 md:px-4 py-2.5 md:py-3 border-t border-border text-center space-y-0.5 md:space-y-1">
            {bothActive ? (
              <p className="text-xs md:text-sm font-semibold text-primary">🎯 Both active today = 2x streak bonus!</p>
            ) : (
              <p className="text-xs md:text-sm text-muted-foreground">🎯 Both active today = 2x streak bonus!</p>
            )}
            <p className="text-[10px] md:text-xs text-muted-foreground">
              Buddy since {new Date(pair.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })} · {daysTogether} day{daysTogether !== 1 ? "s" : ""} together
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
