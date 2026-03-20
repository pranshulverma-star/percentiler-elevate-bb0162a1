import { Home, FlaskConical, BarChart3, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const navItems = [
  { icon: Home, label: "Home", to: "/dashboard" },
  { icon: FlaskConical, label: "Practice", to: "/practice-lab" },
  { icon: BarChart3, label: "Progress", to: "/cat-daily-study-planner" },
  { icon: User, label: "Profile", to: "/dashboard?tab=profile" },
];

export default function DashboardBottomNav() {
  const { pathname } = useLocation();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-sm border-t border-border/40 md:hidden">
      <div className="mx-auto max-w-lg">
        <div className="flex">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.to || (item.to === "/dashboard" && pathname === "/dashboard");
            return (
              <Link
                key={item.label}
                to={item.to}
                className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 transition-colors ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
