import { X, Check, RotateCcw } from "lucide-react";

interface Props {
  onDidntKnow: () => void;
  onFlip: () => void;
  onKnewIt: () => void;
  flipped: boolean;
}

export default function ActionButtons({ onDidntKnow, onFlip, onKnewIt, flipped }: Props) {
  return (
    <div className="flex items-center justify-center gap-4 mt-6">
      <button
        onClick={onDidntKnow}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white active:scale-[0.96] transition-transform"
        style={{ background: "#EF4444", boxShadow: "0 4px 14px rgba(239,68,68,0.3)" }}
      >
        <X size={16} /> Didn't know
      </button>

      <button
        onClick={onFlip}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold border border-gray-300 text-[#141414] bg-white hover:bg-gray-50 active:scale-[0.96] transition-transform"
      >
        <RotateCcw size={16} /> {flipped ? "Unflip" : "Flip"}
      </button>

      <button
        onClick={onKnewIt}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white active:scale-[0.96] transition-transform"
        style={{ background: "#22C55E", boxShadow: "0 4px 14px rgba(34,197,94,0.3)" }}
      >
        <Check size={16} /> I knew it
      </button>
    </div>
  );
}
