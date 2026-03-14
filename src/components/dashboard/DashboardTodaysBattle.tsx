import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Swords, Zap } from "lucide-react";
import { getTodaysSectionIndex } from "@/lib/todaySectionIndex";

const sectionLabels = [
  { name: "Quantitative Ability", icon: "⚔️", tag: "QA Mix · 10 Qs · 15 min" },
  { name: "LRDI", icon: "🧩", tag: "1 Set · 12 min" },
  { name: "VARC", icon: "📜", tag: "1 RC + 1 PJ · 15 min" },
];

export default function DashboardTodaysBattle() {
  const navigate = useNavigate();
  const idx = getTodaysSectionIndex();
  const info = sectionLabels[idx];

  return (
    <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 to-primary/[0.02]">
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-amber-400" />
      <div className="p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-lg shrink-0">
          <Swords className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            Quiz of the Day <Zap className="w-3.5 h-3.5 text-primary" />
          </h3>
          <p className="text-[11px] text-muted-foreground truncate">
            {info.icon} {info.name} · {info.tag}
          </p>
        </div>
        <Button
          size="sm"
          className="shrink-0 text-xs"
          onClick={() => navigate("/practice-lab?daily=true")}
        >
          Start
        </Button>
      </div>
    </Card>
  );
}
