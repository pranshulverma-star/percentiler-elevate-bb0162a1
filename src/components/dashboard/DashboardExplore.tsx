import { GraduationCap, Users, ClipboardList, Wrench, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";

interface Props {
  converted: boolean;
  mentorshipActive: boolean;
}

const tiles = [
  { icon: GraduationCap, label: "Course", to: "/courses/cat-omet", color: "text-primary" },
  { icon: Users, label: "Mentorship", to: "/mentorship", color: "text-amber-500" },
  { icon: ClipboardList, label: "Test Series", to: "/test-series", color: "text-primary" },
  { icon: Wrench, label: "Workshops", to: "/workshops", color: "text-primary" },
  { icon: BookOpen, label: "Free Courses", to: "/free-courses", color: "text-emerald-500" },
];

export default function DashboardExplore({ converted, mentorshipActive }: Props) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
      {tiles.map((t) => {
        const Icon = t.icon;
        const showBadge = (t.label === "Course" && converted) || (t.label === "Mentorship" && mentorshipActive);
        return (
          <Link
            key={t.label}
            to={t.to}
            className="flex flex-col items-center gap-1.5 min-w-[64px] rounded-xl border border-border/60 bg-card hover:border-primary/30 transition-colors p-3 text-center group"
          >
            <div className="relative">
              <Icon className={`h-5 w-5 ${t.color} group-hover:scale-110 transition-transform`} />
              {showBadge && (
                <span className="absolute -top-1 -right-2 w-2 h-2 rounded-full bg-emerald-500" />
              )}
            </div>
            <span className="text-[10px] font-medium text-muted-foreground group-hover:text-foreground transition-colors">{t.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
