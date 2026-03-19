import { GraduationCap, Users, ClipboardList, Wrench, BookOpen, CalendarCheck, UserCheck } from "lucide-react";
import { Link } from "react-router-dom";

interface Props {
  converted: boolean;
  mentorshipActive: boolean;
}

const tiles = [
  { icon: CalendarCheck, label: "Daily Sprint", to: "/daily-sprint", color: "text-primary" },
  { icon: UserCheck, label: "Study Buddy", to: "/study-buddy", color: "text-amber-500" },
  { icon: GraduationCap, label: "Course", to: "/courses/cat-omet", color: "text-primary" },
  { icon: Users, label: "Mentorship", to: "/mentorship", color: "text-amber-500" },
  { icon: ClipboardList, label: "Test Series", to: "/test-series", color: "text-primary" },
  { icon: Wrench, label: "Workshops", to: "/workshops", color: "text-primary" },
  { icon: BookOpen, label: "Free Courses", to: "/free-courses", color: "text-emerald-500" },
];

export default function DashboardExplore({ converted, mentorshipActive }: Props) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-xl border-t border-border shadow-[0_-2px_10px_0_rgb(0,0,0,0.06)]">
      <div className="container mx-auto max-w-lg px-3 py-2">
        <div className="flex gap-1.5 overflow-x-auto scrollbar-none">
          {tiles.map((t) => {
            const Icon = t.icon;
            const showBadge = (t.label === "Course" && converted) || (t.label === "Mentorship" && mentorshipActive);
            return (
              <Link
                key={t.label}
                to={t.to}
                className="flex flex-col items-center gap-1 min-w-[56px] rounded-lg bg-card hover:bg-accent/50 transition-colors p-2 text-center group"
              >
                <div className="relative">
                  <Icon className={`h-4 w-4 ${t.color} group-hover:scale-110 transition-transform`} />
                  {showBadge && (
                    <span className="absolute -top-1 -right-2 w-2 h-2 rounded-full bg-emerald-500" />
                  )}
                </div>
                <span className="text-[9px] font-medium text-muted-foreground group-hover:text-foreground transition-colors leading-tight">{t.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
