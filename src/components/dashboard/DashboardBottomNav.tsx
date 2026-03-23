export type DashboardTab = "home" | "practice" | "explore" | "plan";

const navItems: { emoji: string; label: string; tab: DashboardTab }[] = [
  { emoji: "🏠", label: "Home", tab: "home" },
  { emoji: "⚡", label: "Practice", tab: "practice" },
  { emoji: "🧭", label: "Explore", tab: "explore" },
  { emoji: "📅", label: "Plan", tab: "plan" },
];

interface Props {
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
}

export default function DashboardBottomNav({ activeTab, onTabChange }: Props) {
  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-40"
      style={{
        background: "rgba(255,255,255,0.95)",
        backdropFilter: "blur(20px)",
        borderTop: "1px solid #F0EBE6",
        boxShadow: "0 -2px 20px rgba(0,0,0,0.04)",
      }}
    >
      <div className="mx-auto max-w-lg">
        <div className="flex" style={{ paddingBottom: "env(safe-area-inset-bottom, 8px)" }}>
          {navItems.map((item) => {
            const isActive = activeTab === item.tab;
            return (
              <button
                key={item.tab}
                onClick={() => onTabChange(item.tab)}
                className="flex-1 flex flex-col items-center gap-0.5 py-2.5 transition-all"
              >
                <div className="relative">
                  <span className={`text-lg ${isActive ? "" : "grayscale opacity-50"}`}>{item.emoji}</span>
                  {isActive && (
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full" style={{ background: "#FF6600" }} />
                  )}
                </div>
                <span
                  className="text-[10px]"
                  style={{
                    color: isActive ? "#FF6600" : "#BFB3A8",
                    fontWeight: isActive ? 800 : 600,
                  }}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
