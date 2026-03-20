import { X, Check, RotateCcw } from "lucide-react";

interface Props {
  onDidntKnow: () => void;
  onFlip: () => void;
  onKnewIt: () => void;
  flipped: boolean;
}

export default function ActionButtons({ onDidntKnow, onFlip, onKnewIt, flipped: _flipped }: Props) {
  return (
    <div className="flex items-center justify-center gap-3 mt-6">
      {/* Didn't know */}
      <button
        onClick={onDidntKnow}
        className="flex items-center gap-2 px-7 py-3.5 rounded-[14px] text-sm font-medium
          active:scale-[0.95] transition-all duration-200"
        style={{
          background: "rgba(239, 68, 68, 0.15)",
          border: "1px solid rgba(239, 68, 68, 0.3)",
          color: "#EF4444",
        }}
      >
        <X size={16} strokeWidth={2.5} />
        <span className="hidden min-[380px]:inline">Didn't know</span>
      </button>

      {/* Flip */}
      <button
        onClick={onFlip}
        className="flex items-center justify-center w-12 h-12 rounded-full
          active:scale-[0.93] transition-all duration-200"
        style={{
          background: "rgba(255, 255, 255, 0.06)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        <RotateCcw size={18} strokeWidth={2} className="text-white/50" />
      </button>

      {/* Knew it */}
      <button
        onClick={onKnewIt}
        className="flex items-center gap-2 px-7 py-3.5 rounded-[14px] text-sm font-medium
          active:scale-[0.95] transition-all duration-200"
        style={{
          background: "rgba(34, 197, 94, 0.15)",
          border: "1px solid rgba(34, 197, 94, 0.3)",
          color: "#22C55E",
        }}
      >
        <Check size={16} strokeWidth={2.5} />
        <span className="hidden min-[380px]:inline">I knew it</span>
      </button>
    </div>
  );
}
