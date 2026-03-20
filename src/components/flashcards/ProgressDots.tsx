interface Props {
  total: number;
  current: number; // 0-indexed
  color: string;
}

export default function ProgressDots({ total, current, color }: Props) {
  return (
    <div className="flex items-center justify-center gap-2 mb-6">
      {Array.from({ length: total }).map((_, i) => {
        const isDone = i < current;
        const isActive = i === current;
        return (
          <div
            key={i}
            className="w-3 h-3 rounded-full transition-all duration-300"
            style={{
              background: isDone ? "#22C55E" : isActive ? color : "#E5E7EB",
              transform: isActive ? "scale(1.3)" : "scale(1)",
            }}
          />
        );
      })}
    </div>
  );
}
