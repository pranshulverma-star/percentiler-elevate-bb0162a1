import { Home, Zap, Compass } from "lucide-react";

export type DashboardTab = "home" | "practice" | "explore";

const navItems: { icon: typeof Home; label: string; tab: DashboardTab }[] = [
  { icon: Home, label: "Home", tab: "home" },
  { icon: Zap, label: "Practice", tab: "practice" },
  { icon: Compass, label: "Explore", tab: "explore" },
];

interface Props {
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
}

export default function DashboardBottomNav({ activeTab, onTabChange }: Props) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-xl border-t border-border/30">
      <div className="mx-auto max-w-lg">
        <div className="flex">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.tab;
            return (
              <button
                key={item.tab}
                onClick={() => onTabChange(item.tab)}
                className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 transition-all ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <div className="relative">
                  <Icon className={`h-5 w-5 transition-transform ${isActive ? "scale-110" : ""}`} />
                  {isActive && (
                    <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary shadow-[0_0_6px_hsl(var(--primary))]" />
                  )}
                </div>
                <span className={`text-[10px] font-medium ${isActive ? "font-semibold" : ""}`}>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
