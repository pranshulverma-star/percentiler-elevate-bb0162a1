import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Share2, Download, Zap, Swords, Flame } from "lucide-react";
import { toPng } from "html-to-image";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

function estimatePercentile(correct: number, total: number): number {
  if (total === 0) return 34;
  const ratio = correct / total;
  return Math.round((34 + ratio * (98.3 - 34)) * 10) / 10;
}

function getPercentileLabel(p: number): { emoji: string; text: string; vibe: string } {
  if (p >= 99) return { emoji: "🔥", text: "GOAT MODE", vibe: "You're literally him." };
  if (p >= 95) return { emoji: "💎", text: "TOP 5% CLUB", vibe: "Built different fr fr" };
  if (p >= 80) return { emoji: "⚡", text: "ABSOLUTE UNIT", vibe: "No cap, you cooked" };
  if (p >= 50) return { emoji: "📈", text: "RISING ARC", vibe: "Main character energy" };
  return { emoji: "🎯", text: "TRAINING ARC", vibe: "Glow up loading..." };
}

function getTierGradient(p: number): string {
  if (p >= 95) return "linear-gradient(135deg, #ff6b00 0%, #ff0844 40%, #ffb199 100%)";
  if (p >= 80) return "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)";
  if (p >= 50) return "linear-gradient(135deg, #0acffe 0%, #495aff 100%)";
  return "linear-gradient(135deg, #434343 0%, #000000 100%)";
}

function getTierAccent(p: number): string {
  if (p >= 95) return "#ff6b00";
  if (p >= 80) return "#764ba2";
  if (p >= 50) return "#495aff";
  return "#666";
}

interface ShareableResultCardProps {
  correct: number;
  total: number;
  chapterName?: string;
  leaderboard?: { name: string; score: number; isMe: boolean }[];
  timeUsed?: number;
  percentile?: number;
}

export default function ShareableResultCard({
  correct,
  total,
  chapterName,
  leaderboard,
  timeUsed,
}: ShareableResultCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [sharing, setSharing] = useState(false);
  const percentile = estimatePercentile(correct, total);
  const pct = Math.round((correct / total) * 100);
  const label = getPercentileLabel(percentile);
  const accent = getTierAccent(percentile);

  const shareText = `🎯 CAT Practice Lab Results\n\nScore: ${correct}/${total} (${pct}%)\nEstimated Percentile: ${percentile}%ile\n${label.emoji} ${label.text}\n\nCan you beat this? 👀\nTry → percentilers.in/practice-lab`;

  const handleShare = async () => {
    setSharing(true);
    try {
      if (navigator.share) {
        await navigator.share({ text: shareText });
      } else {
        await navigator.clipboard.writeText(shareText);
        toast({ title: "Copied to clipboard!", description: "Share it with your friends 🚀" });
      }
    } catch { /* cancelled */ }
    setSharing(false);
  };

  const handleDownload = async () => {
    if (!cardRef.current) return;
    try {
      await toPng(cardRef.current, { pixelRatio: 3, cacheBust: true });
      const dataUrl = await toPng(cardRef.current, { pixelRatio: 3, cacheBust: true });
      const link = document.createElement("a");
      link.download = `cat-result-${pct}pct.png`;
      link.href = dataUrl;
      link.click();
      toast({ title: "Image saved!", description: "Share it on Instagram or WhatsApp 🚀" });
    } catch {
      toast({ title: "Couldn't generate image", variant: "destructive" });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="w-full"
    >
      {/* === THE CARD === */}
      <div
        ref={cardRef}
        className="relative overflow-hidden rounded-3xl"
        style={{
          background: "#0a0a0f",
          border: "2px solid rgba(255,255,255,0.08)",
        }}
      >
        {/* Anime speed lines background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute"
              style={{
                top: `${8 + i * 8}%`,
                left: "-10%",
                width: "120%",
                height: "1px",
                background: `linear-gradient(90deg, transparent 0%, ${accent}15 ${20 + Math.random() * 30}%, transparent 100%)`,
                transform: `rotate(${-2 + Math.random() * 4}deg)`,
              }}
            />
          ))}
        </div>

        {/* Massive gradient blob top-left */}
        <div
          className="absolute -top-24 -left-24 w-[300px] h-[300px] rounded-full blur-[100px] opacity-40 pointer-events-none"
          style={{ background: getTierGradient(percentile) }}
        />
        {/* Secondary blob bottom-right */}
        <div
          className="absolute -bottom-16 -right-16 w-[200px] h-[200px] rounded-full blur-[80px] opacity-25 pointer-events-none"
          style={{ background: accent }}
        />

        {/* Manga halftone dots */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle, white 1.5px, transparent 1.5px)`,
            backgroundSize: "16px 16px",
          }}
        />

        <div className="relative z-10 p-5 md:p-7">
          {/* Top bar */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <motion.div
                animate={{ rotate: [0, -10, 10, -10, 0] }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                <Swords className="w-5 h-5" style={{ color: accent }} />
              </motion.div>
              <div>
                <p
                  className="text-[11px] font-black uppercase tracking-[0.2em]"
                  style={{ color: accent }}
                >
                  Practice Lab
                </p>
                {chapterName && (
                  <p className="text-[10px] text-white/30 truncate max-w-[160px] md:max-w-[220px]">
                    {chapterName}
                  </p>
                )}
              </div>
            </div>
            <div
              className="px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest"
              style={{
                background: `${accent}20`,
                color: accent,
                border: `1px solid ${accent}40`,
              }}
            >
              {label.text}
            </div>
          </div>

          {/* Big score */}
          <div className="text-center py-3">
            <motion.div
              initial={{ scale: 0, rotate: -15 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
              className="relative inline-block"
            >
              {/* Score shadow glow */}
              <div
                className="absolute inset-0 blur-2xl opacity-30 pointer-events-none"
                style={{ background: accent, borderRadius: "50%" }}
              />
              <span
                className="relative text-7xl md:text-[110px] font-black leading-none"
                style={{
                  background: getTierGradient(percentile),
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  filter: "drop-shadow(0 4px 20px rgba(0,0,0,0.5))",
                }}
              >
                {correct}
              </span>
              <span className="text-xl md:text-3xl font-bold text-white/25 ml-1">/{total}</span>
            </motion.div>

            {/* Percentile chip - anime badge style */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.7, type: "spring", stiffness: 300 }}
              className="mt-3 inline-flex items-center gap-2 px-4 py-1.5 rounded-xl"
              style={{
                background: getTierGradient(percentile),
                boxShadow: `0 0 30px ${accent}40, 0 0 60px ${accent}15`,
              }}
            >
              <Flame className="w-4 h-4 text-white" />
              <span className="text-base md:text-lg font-black text-white tracking-wide">
                {percentile}%ile
              </span>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="mt-2 text-xs md:text-sm font-medium text-white/40 italic"
            >
              "{label.vibe}"
            </motion.p>
          </div>

          {/* XP-style progress bar */}
          <div className="mt-4 space-y-1">
            <div className="flex justify-between text-[9px] font-mono text-white/25">
              <span>LVL 0</span>
              <span className="font-bold" style={{ color: accent }}>
                {pct}% ACCURACY
              </span>
              <span>LVL MAX</span>
            </div>
            <div className="relative h-3 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, (percentile / 99.8) * 100)}%` }}
                transition={{ delay: 0.6, duration: 1.5, ease: "easeOut" }}
                className="absolute inset-y-0 left-0 rounded-full"
                style={{
                  background: getTierGradient(percentile),
                  boxShadow: `0 0 16px ${accent}60`,
                }}
              />
              {/* Shimmer on bar */}
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: "200%" }}
                transition={{ delay: 1.5, duration: 1, ease: "easeInOut" }}
                className="absolute inset-y-0 w-1/3 pointer-events-none"
                style={{
                  background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
                }}
              />
            </div>
          </div>

          {/* Stats row - gaming HUD style */}
          {timeUsed !== undefined && (
            <div className="mt-5 grid grid-cols-3 gap-2">
              {[
                { val: `${pct}%`, label: "ACC", icon: "🎯" },
                { val: `${Math.floor(timeUsed / 60)}:${String(timeUsed % 60).padStart(2, "0")}`, label: "TIME", icon: "⏱️" },
                { val: `${total > 0 ? Math.round(timeUsed / total) : 0}s`, label: "PER Q", icon: "⚡" },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 + i * 0.1 }}
                  className="text-center py-2.5 rounded-xl"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <p className="text-xs mb-0.5">{stat.icon}</p>
                  <p className="text-base md:text-lg font-black text-white">{stat.val}</p>
                  <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-white/30">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          )}

          {/* Leaderboard */}
          {leaderboard && leaderboard.length > 0 && (
            <div className="mt-5 space-y-1.5">
              <div className="flex items-center gap-1.5 mb-2">
                <span className="text-sm">🏆</span>
                <span
                  className="text-[10px] font-black uppercase tracking-[0.2em]"
                  style={{ color: accent }}
                >
                  Leaderboard
                </span>
              </div>
              {leaderboard.map((p, i) => {
                const medals = ["🥇", "🥈", "🥉"];
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.2 + i * 0.08 }}
                    className="flex items-center justify-between px-3 py-2 rounded-xl text-xs"
                    style={{
                      background: p.isMe
                        ? `linear-gradient(135deg, ${accent}15, ${accent}08)`
                        : "rgba(255,255,255,0.03)",
                      border: p.isMe ? `1.5px solid ${accent}40` : "1px solid rgba(255,255,255,0.04)",
                    }}
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-sm w-5 text-center">{medals[i] || `#${i + 1}`}</span>
                      <span className={`font-bold truncate max-w-[100px] md:max-w-none ${p.isMe ? "text-white" : "text-white/60"}`}>
                        {p.name}
                        {p.isMe && (
                          <span
                            className="ml-1 text-[9px] font-black uppercase"
                            style={{ color: accent }}
                          >
                            (You)
                          </span>
                        )}
                      </span>
                    </span>
                    <span className="font-black text-white text-sm">{p.score}%</span>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Footer CTA - manga panel style */}
          <div
            className="mt-5 pt-4 flex items-center justify-between"
            style={{ borderTop: "2px solid rgba(255,255,255,0.06)" }}
          >
            <div>
              <p className="text-sm md:text-base font-black text-white">
                Can you beat this? 👊
              </p>
              <p className="text-[10px] text-white/35">
                Try →{" "}
                <span className="font-bold" style={{ color: accent }}>
                  percentilers.in/practice-lab
                </span>
              </p>
            </div>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              <Zap className="w-6 h-6 md:w-7 md:h-7" style={{ color: accent, filter: `drop-shadow(0 0 8px ${accent})` }} />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-center gap-2 mt-4">
        <Button onClick={handleDownload} variant="outline" className="gap-2 font-black px-5 text-sm rounded-xl" size="sm">
          <Download className="w-3.5 h-3.5" />
          Save
        </Button>
        <Button
          onClick={handleShare}
          disabled={sharing}
          className="gap-2 font-black px-5 text-sm rounded-xl game-glow-pulse"
          size="sm"
        >
          <Share2 className="w-3.5 h-3.5" />
          Share
        </Button>
      </div>
    </motion.div>
  );
}
