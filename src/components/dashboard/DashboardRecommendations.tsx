import { Lightbulb, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { getWeakSectionWorkshop } from "@/components/WorkshopRecommendation";

interface Props {
  practiceAttempts: any[];
}

const staticRecs: { name: string; type: string; to: string; free: boolean; external?: boolean }[] = [
  { name: "QA Formulas", type: "Flashcard", to: "/flashcards", free: true },
  { name: "VARC Practice", type: "Practice", to: "/practice-lab", free: true },
];

export default function DashboardRecommendations({ practiceAttempts }: Props) {
  const weakWorkshop = getWeakSectionWorkshop(practiceAttempts);

  const recommendations = [
    ...(weakWorkshop
      ? [{ name: weakWorkshop.name, type: `₹${weakWorkshop.salePrice}`, to: weakWorkshop.link, free: false, external: true }]
      : []),
    ...staticRecs,
  ].slice(0, 3);

  if (recommendations.length === 0) return null;

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Lightbulb className="h-4 w-4 text-primary" />
        <span className="text-sm font-semibold text-foreground">Recommended for you</span>
      </div>
      <p className="text-[11px] text-muted-foreground mb-3">Based on your recent quizzes</p>

      <div className="flex gap-3 overflow-x-auto scrollbar-none pb-1">
        {recommendations.map((rec) => (
          rec.external ? (
            <a
              key={rec.name}
              href={rec.to}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 w-36 rounded-xl border border-border/40 bg-card p-3 hover:border-primary/30 transition-colors group"
            >
              <RecContent name={rec.name} type={rec.type} free={rec.free} />
            </a>
          ) : (
            <Link
              key={rec.name}
              to={rec.to}
              className="shrink-0 w-36 rounded-xl border border-border/40 bg-card p-3 hover:border-primary/30 transition-colors group"
            >
              <RecContent name={rec.name} type={rec.type} free={rec.free} />
            </Link>
          )
        ))}
      </div>
    </div>
  );
}

function RecContent({ name, type, free }: { name: string; type: string; free: boolean }) {
  return (
    <>
      <p className="text-xs font-medium text-foreground mb-1.5 line-clamp-2 leading-tight">{name}</p>
      <div className="flex items-center justify-between">
        <Badge variant={free ? "secondary" : "outline"} className="text-[8px]">
          {free ? "Free" : type}
        </Badge>
        <ArrowRight className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors" />
      </div>
    </>
  );
}
