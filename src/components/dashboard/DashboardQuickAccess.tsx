import { GraduationCap, Users, ClipboardList, Wrench, BookOpen, Phone } from "lucide-react";
import { Link } from "react-router-dom";

interface Props {
  converted: boolean;
  mentorshipActive: boolean;
}

const tiles = [
  { icon: GraduationCap, label: "Courses", to: "/courses/cat-omet", color: "hsl(var(--primary))" },
  { icon: ClipboardList, label: "Test Series", to: "/test-series", color: "hsl(220 70% 55%)" },
  { icon: Users, label: "Mentorship", to: "/mentorship", color: "hsl(280 60% 55%)" },
  { icon: Wrench, label: "Workshops", to: "/workshops", color: "hsl(160 60% 45%)" },
  { icon: BookOpen, label: "Free Courses", to: "/free-courses", color: "hsl(45 93% 47%)" },
  { icon: Phone, label: "Strategy Call", to: "/mentorship", color: "hsl(340 65% 55%)" },
];

export default function DashboardQuickAccess({ converted: _converted, mentorshipActive: _mentorshipActive }: Props) {
  return (
    <div>
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Explore</p>
      <div className="grid grid-cols-3 gap-2">
        {tiles.map((t) => {
          const Icon = t.icon;
          return (
            <Link
              key={t.label}
              to={t.to}
              className="flex flex-col items-center gap-1.5 py-3.5 rounded-xl bg-card/60 backdrop-blur-sm border border-border/20 hover:border-primary/20 hover:bg-card/90 transition-all duration-200 group"
            >
              <Icon className="h-5 w-5 text-muted-foreground group-hover:scale-110 transition-transform" style={{ color: t.color }} />
              <span className="text-[10px] font-medium text-muted-foreground group-hover:text-foreground transition-colors text-center leading-tight">{t.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
