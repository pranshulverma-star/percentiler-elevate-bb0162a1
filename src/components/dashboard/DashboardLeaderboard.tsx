import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, Flame } from "lucide-react";

const leaderboardData = [
  { rank: 1, name: "Aarav M.", xp: 980, streak: 12, badge: "👑" },
  { rank: 2, name: "Priya S.", xp: 945, streak: 10, badge: "💎" },
  { rank: 3, name: "Rohan K.", xp: 920, streak: 9, badge: "🥇" },
  { rank: 4, name: "Ananya D.", xp: 890, streak: 8, badge: "🥈" },
  { rank: 5, name: "Karthik N.", xp: 870, streak: 7, badge: "🥈" },
];

export default function DashboardLeaderboard() {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Crown className="w-4 h-4 text-primary" />
        <h2 className="text-sm font-bold text-foreground tracking-tight">Daily Leaderboard</h2>
        <Badge variant="secondary" className="text-[10px] ml-auto">This Week</Badge>
      </div>
      <Card className="border overflow-hidden">
        <div className="divide-y divide-border">
          {leaderboardData.map((entry, i) => (
            <div
              key={entry.rank}
              className={`flex items-center gap-3 px-3 py-2.5 transition-colors hover:bg-secondary/50 ${
                entry.rank <= 3 ? "bg-primary/[0.03]" : ""
              }`}
            >
              <span className="text-lg w-6 text-center">{entry.badge}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-foreground truncate">{entry.name}</p>
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <Flame className="w-2.5 h-2.5 text-primary" />
                  <span>{entry.streak}-day streak</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-primary">{entry.xp}</p>
                <p className="text-[9px] text-muted-foreground uppercase tracking-wider">XP</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
