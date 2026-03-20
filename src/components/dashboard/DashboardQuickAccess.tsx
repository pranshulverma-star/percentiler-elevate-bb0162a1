import { GraduationCap, Users, ClipboardList, Wrench, BookOpen, Phone } from "lucide-react";
import { Link } from "react-router-dom";

interface Props {
  converted: boolean;
  mentorshipActive: boolean;
}

const tiles = [
  { icon: GraduationCap, label: "Courses", to: "/courses/cat-omet" },
  { icon: ClipboardList, label: "Test Series", to: "/test-series" },
  { icon: Users, label: "Mentorship", to: "/mentorship" },
  { icon: Wrench, label: "Workshops", to: "/workshops" },
  { icon: BookOpen, label: "Free Courses", to: "/free-courses" },
  { icon: Phone, label: "Strategy Call", to: "/mentorship" },
];

export default function DashboardQuickAccess({ converted, mentorshipActive }: Props) {
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
              className="flex flex-col items-center gap-1.5 py-3 rounded-xl hover:bg-secondary/60 transition-colors group"
            >
              <Icon className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              <span className="text-[10px] font-medium text-muted-foreground group-hover:text-foreground transition-colors text-center leading-tight">{t.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
