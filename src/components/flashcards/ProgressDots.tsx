import { motion } from "framer-motion";

interface Props {
  total: number;
  current: number;
  color: string;
}

export default function ProgressDots({ total, current, color }: Props) {
  return (
    <div className="flex flex-col items-center gap-2 mb-6">
      <div className="flex items-center justify-center gap-2">
        {Array.from({ length: total }).map((_, i) => {
          const isDone = i < current;
          const isActive = i === current;
          return isDone ? (
            <div
              key={i}
              className="w-2.5 h-2.5 rounded-full"
              style={{ background: color, boxShadow: `0 0 8px ${color}66` }}
            />
          ) : isActive ? (
            <motion.div
              key={i}
              className="w-2.5 h-2.5 rounded-full"
              style={{ border: `2px solid ${color}`, background: "transparent" }}
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            />
          ) : (
            <div
              key={i}
              className="w-2.5 h-2.5 rounded-full"
              style={{ background: "rgba(255,255,255,0.15)" }}
            />
          );
        })}
      </div>
      <span className="text-xs text-white/40">{current + 1} / {total}</span>
    </div>
  );
}
