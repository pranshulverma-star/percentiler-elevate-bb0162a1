import { useState } from "react";
import { Crown, Flame, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const leaderboardData = [
  { rank: 1, name: "Aarav M.", xp: 980, streak: 12, badge: "👑" },
  { rank: 2, name: "Priya S.", xp: 945, streak: 10, badge: "💎" },
  { rank: 3, name: "Rohan K.", xp: 920, streak: 9, badge: "🥇" },
  { rank: 4, name: "Ananya D.", xp: 890, streak: 8, badge: "🥈" },
  { rank: 5, name: "Karthik N.", xp: 870, streak: 7, badge: "🥈" },
];

// Simulated "You" row
const yourRow = { rank: 12, name: "You", xp: 650, streak: 4, badge: "🎯" };

export default function DashboardLeaderboardCompact() {
  const [expanded, setExpanded] = useState(false);
  const visibleRows = expanded ? leaderboardData : leaderboardData.slice(0, 3);

  return (
    <div className="rounded-2xl bg-card border border-border/40 shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/40">
        <div className="flex items-center gap-2">
          <Crown className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">Leaderboard</span>
        </div>
        <span className="text-[10px] text-muted-foreground">This Week</span>
      </div>

      {/* Rows */}
      <div>
        <AnimatePresence initial={false}>
          {visibleRows.map((entry, i) => (
            <motion.div
              key={entry.rank}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ delay: i * 0.06, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center gap-3 px-4 py-2.5 border-b border-border/30 last:border-0"
            >
              <span className="text-sm w-5 text-center">{entry.badge}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground truncate">{entry.name}</p>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <Flame className="w-2.5 h-2.5 text-primary" />
                <span>{entry.streak}</span>
              </div>
              <div className="text-right min-w-[50px]">
                <span className="text-xs font-bold text-primary">{entry.xp}</span>
                <span className="text-[8px] text-muted-foreground ml-0.5">XP</span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Your row - always visible, highlighted */}
        <div className="flex items-center gap-3 px-4 py-2.5 bg-primary/[0.04] border-l-2 border-primary">
          <span className="text-sm w-5 text-center">{yourRow.badge}</span>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-primary truncate">{yourRow.rank}. {yourRow.name}</p>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <Flame className="w-2.5 h-2.5 text-primary" />
            <span>{yourRow.streak}</span>
          </div>
          <div className="text-right min-w-[50px]">
            <span className="text-xs font-bold text-primary">{yourRow.xp}</span>
            <span className="text-[8px] text-muted-foreground ml-0.5">XP</span>
          </div>
        </div>
      </div>

      {/* Expand toggle */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-center gap-1 py-2 text-[11px] text-muted-foreground hover:text-foreground transition-colors border-t border-border/30"
      >
        {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        {expanded ? "Show less" : "See Full Leaderboard"}
      </button>
    </div>
  );
}
