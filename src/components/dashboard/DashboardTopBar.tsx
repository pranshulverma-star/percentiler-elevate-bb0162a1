import { Flame, Bell, LogOut } from "lucide-react";
import { Link } from "react-router-dom";

interface Props {
  firstName: string;
  streakCount: number;
  onSignOut: () => void;
}

export default function DashboardTopBar({ firstName, streakCount, onSignOut }: Props) {
  const initials = firstName.charAt(0).toUpperCase();

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/40">
      <div className="mx-auto max-w-lg px-4 h-14 flex items-center justify-between">
        {/* Left: Logo */}
        <Link to="/" className="text-sm font-bold text-foreground tracking-tight">
          Percentilers
        </Link>

        {/* Right: Streak + Avatar + Sign out */}
        <div className="flex items-center gap-3">
          {/* Streak badge */}
          <div className="flex items-center gap-1 text-sm font-semibold text-primary">
            <Flame className={`h-4 w-4 ${streakCount > 0 ? "animate-[pulse_2s_ease-in-out_infinite]" : "text-muted-foreground"}`} />
            <span className={streakCount > 0 ? "text-primary" : "text-muted-foreground"}>{streakCount}</span>
          </div>

          {/* Avatar */}
          <div className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 border border-primary/20">
            <span className="text-[11px] font-bold text-primary">{initials}</span>
          </div>

          {/* Sign out */}
          <button onClick={onSignOut} className="text-muted-foreground hover:text-foreground transition-colors">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
