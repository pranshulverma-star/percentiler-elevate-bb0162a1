import { LogOut } from "lucide-react";
import { Link } from "react-router-dom";

interface Props {
  firstName: string;
  streakCount: number;
  onSignOut: () => void;
}

export default function DashboardTopBar({ firstName, streakCount, onSignOut }: Props) {
  const initials = firstName.charAt(0).toUpperCase();

  return (
    <div className="fixed top-0 left-0 right-0 z-50" style={{ background: "#FAFAF7", borderBottom: "1px solid #F0EBE6" }}>
      <div className="mx-auto max-w-lg px-4 h-14 flex items-center justify-between">
        <Link to="/" className="text-xl font-[900] tracking-[-0.5px]" style={{ color: "#141414" }}>
          Percentilers
        </Link>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-sm font-semibold" style={{ color: "#FF6600" }}>
            <span>🔥</span>
            <span>{streakCount}</span>
          </div>

          <div
            className="flex items-center justify-center w-8 h-8 rounded-full text-white text-[12px] font-bold"
            style={{ background: "linear-gradient(135deg, #FF6600, #FF8A3D)", boxShadow: "0 2px 8px rgba(255,102,0,0.25)" }}
          >
            {initials}
          </div>

          <button onClick={onSignOut} className="transition-colors" style={{ color: "#BFB3A8" }}>
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
