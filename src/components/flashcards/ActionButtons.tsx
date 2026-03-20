import { X, Check, RotateCcw } from "lucide-react";

interface Props {
  onDidntKnow: () => void;
  onFlip: () => void;
  onKnewIt: () => void;
  flipped: boolean;
}

export default function ActionButtons({ onDidntKnow, onFlip, onKnewIt, flipped }: Props) {
  return (
    <div className="flex items-center justify-center gap-3 mt-6">
      {/* Didn't know */}
      <button
        onClick={onDidntKnow}
        className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white
          active:scale-[0.95] transition-all duration-200
          shadow-[0_4px_16px_rgba(239,68,68,0.25)] hover:shadow-[0_6px_24px_rgba(239,68,68,0.35)]"
        style={{ background: "linear-gradient(135deg, hsl(0 84% 60%), hsl(0 72% 51%))" }}
      >
        <X size={16} strokeWidth={2.5} />
        <span className="hidden min-[380px]:inline">Didn't know</span>
      </button>

      {/* Flip — circular icon button */}
      <button
        onClick={onFlip}
        className="flex items-center justify-center w-11 h-11 rounded-full
          border border-border/60 bg-card text-muted-foreground
          hover:bg-secondary hover:text-foreground
          active:scale-[0.93] transition-all duration-200
          shadow-[0_2px_8px_rgba(0,0,0,0.06)]"
      >
        <RotateCcw size={18} strokeWidth={2} />
      </button>

      {/* Knew it */}
      <button
        onClick={onKnewIt}
        className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white
          active:scale-[0.95] transition-all duration-200
          shadow-[0_4px_16px_rgba(34,197,94,0.25)] hover:shadow-[0_6px_24px_rgba(34,197,94,0.35)]"
        style={{ background: "linear-gradient(135deg, hsl(142 71% 45%), hsl(142 76% 36%))" }}
      >
        <Check size={16} strokeWidth={2.5} />
        <span className="hidden min-[380px]:inline">I knew it</span>
      </button>
    </div>
  );
}
