import { Users2, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function DashboardBuddyCTA() {
  return (
    <Link to="/study-buddy" className="block">
      <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-primary/5 backdrop-blur-sm p-4 group hover:border-primary/40 transition-all duration-300">
        {/* Glow orb */}
        <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-primary/10 blur-2xl pointer-events-none" />

        <div className="flex items-center gap-3 relative">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/15 shrink-0">
            <Users2 className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground">Find a Study Buddy</p>
            <p className="text-[11px] text-muted-foreground leading-snug">Pair up for mutual accountability & compete daily</p>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
        </div>
      </div>
    </Link>
  );
}
