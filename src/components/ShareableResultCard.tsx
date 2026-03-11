import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Share2, Download, Target, Crown, Zap, TrendingUp } from "lucide-react";
import { toPng } from "html-to-image";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

function estimatePercentile(correct: number, total: number): number {
  if (total === 0) return 0;
  const ratio = correct / total;
  const z = (ratio - 0.45) / 0.18;
  const cdf = 1 / (1 + Math.exp(-1.7 * z));
  return Math.round(Math.min(99.8, Math.max(1, cdf * 100)) * 10) / 10;
}

function getPercentileColor(p: number): string {
  if (p >= 95) return "#f59e0b";
  if (p >= 80) return "#10b981";
  if (p >= 50) return "#6366f1";
  return "#94a3b8";
}

function getPercentileLabel(p: number): { icon: string; text: string } {
  if (p >= 99) return { icon: "🔥", text: "Elite Performer" };
  if (p >= 95) return { icon: "💎", text: "Top 5% Club" };
  if (p >= 80) return { icon: "⚡", text: "Strong Contender" };
  if (p >= 50) return { icon: "📈", text: "Rising Star" };
  return { icon: "🎯", text: "Building Momentum" };
}

interface ShareableResultCardProps {
  correct: number;
  total: number;
  chapterName?: string;
  leaderboard?: { name: string; score: number; isMe: boolean }[];
  timeUsed?: number;
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
  const accentColor = getPercentileColor(percentile);

  const shareText = `🎯 CAT Practice Lab Results\n\nScore: ${correct}/${total} (${pct}%)\nEstimated Percentile: ${percentile}%ile\n${label.icon} ${label.text}\n\nCan you beat this? 👀\nTry → percentilers.in/practice-lab`;

  const handleShare = async () => {
    setSharing(true);
    try {
      if (navigator.share) {
        await navigator.share({ text: shareText });
      } else {
        await navigator.clipboard.writeText(shareText);
        toast({ title: "Copied to clipboard!", description: "Share it with your friends 🚀" });
      }
    } catch {
      // cancelled
    }
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
        className="relative overflow-hidden rounded-2xl"
        style={{
          background: "linear-gradient(160deg, #0f0f14 0%, #13131a 40%, #0d0d12 100%)",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {/* Accent glow top */}
        <div
          className="absolute -top-20 left-1/2 -translate-x-1/2 w-[280px] h-[180px] rounded-full blur-[80px] opacity-30 pointer-events-none"
          style={{ background: accentColor }}
        />
        {/* Accent glow bottom-right */}
        <div
          className="absolute -bottom-10 -right-10 w-[150px] h-[150px] rounded-full blur-[60px] opacity-15 pointer-events-none"
          style={{ background: accentColor }}
        />

        {/* Subtle dot grid */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.035]"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        <div className="relative z-10 p-5 md:p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <div className="flex items-center gap-2">
              <div
                className="w-7 h-7 md:w-8 md:h-8 rounded-lg flex items-center justify-center"
                style={{ background: `${accentColor}20` }}
              >
                <Target className="w-3.5 h-3.5 md:w-4 md:h-4" style={{ color: accentColor }} />
              </div>
              <div>
                <p className="text-[10px] md:text-[11px] font-bold uppercase tracking-[0.15em] text-white/40">
                  Practice Lab
                </p>
                {chapterName && (
                  <p className="text-[10px] md:text-xs text-white/25 truncate max-w-[140px] md:max-w-[200px]">
                    {chapterName}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[9px] md:text-[10px] font-mono text-white/30">percentilers.in</span>
            </div>
          </div>

          {/* Score hero */}
          <div className="text-center py-2 md:py-4">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5, ease: "backOut" }}
              className="relative inline-block"
            >
              <span className="text-6xl md:text-8xl font-black text-white tracking-tighter leading-none">
                {correct}
              </span>
              <span className="text-lg md:text-2xl font-medium text-white/30 ml-1">/{total}</span>
            </motion.div>

            {/* Percentile pill */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="mt-2 md:mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full"
              style={{
                background: `${accentColor}15`,
                border: `1px solid ${accentColor}30`,
              }}
            >
              <TrendingUp className="w-3 h-3" style={{ color: accentColor }} />
              <span className="text-sm md:text-base font-bold" style={{ color: accentColor }}>
                {percentile}%ile
              </span>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="mt-1.5 text-[11px] md:text-xs font-medium text-white/40"
            >
              {label.icon} {label.text}
            </motion.p>
          </div>

          {/* Progress bar */}
          <div className="mt-3 md:mt-4 space-y-1.5">
            <div className="flex justify-between text-[8px] md:text-[9px] font-mono text-white/20">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
            <div className="relative h-1.5 md:h-2 rounded-full bg-white/5 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, (percentile / 99.8) * 100)}%` }}
                transition={{ delay: 0.6, duration: 1.2, ease: "easeOut" }}
                className="absolute inset-y-0 left-0 rounded-full"
                style={{
                  background: `linear-gradient(90deg, ${accentColor}60, ${accentColor})`,
                  boxShadow: `0 0 12px ${accentColor}40`,
                }}
              />
            </div>
          </div>

          {/* Stats row */}
          {timeUsed !== undefined && (
            <div className="mt-4 md:mt-5 flex items-center justify-center gap-4 md:gap-6">
              <div className="text-center">
                <p className="text-lg md:text-xl font-bold text-white">{pct}%</p>
                <p className="text-[9px] md:text-[10px] text-white/30 uppercase tracking-wider">Accuracy</p>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div className="text-center">
                <p className="text-lg md:text-xl font-bold text-white">
                  {Math.floor(timeUsed / 60)}:{String(timeUsed % 60).padStart(2, "0")}
                </p>
                <p className="text-[9px] md:text-[10px] text-white/30 uppercase tracking-wider">Time</p>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div className="text-center">
                <p className="text-lg md:text-xl font-bold text-white">
                  {total > 0 ? Math.round(timeUsed / total) : 0}s
                </p>
                <p className="text-[9px] md:text-[10px] text-white/30 uppercase tracking-wider">Per Q</p>
              </div>
            </div>
          )}

          {/* Leaderboard */}
          {leaderboard && leaderboard.length > 0 && (
            <div className="mt-4 md:mt-5 space-y-1.5">
              <div className="flex items-center gap-1.5 mb-2">
                <Crown className="w-3 h-3 text-amber-400" />
                <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.15em] text-white/35">
                  Rankings
                </span>
              </div>
              {leaderboard.map((p, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between px-3 py-1.5 rounded-lg text-[11px] md:text-xs"
                  style={{
                    background: p.isMe ? `${accentColor}12` : "rgba(255,255,255,0.03)",
                    border: p.isMe ? `1px solid ${accentColor}25` : "1px solid transparent",
                  }}
                >
                  <span className="flex items-center gap-2">
                    <span className="font-mono text-white/30 w-4 text-[10px]">#{i + 1}</span>
                    <span className={`font-semibold truncate max-w-[100px] md:max-w-none ${p.isMe ? "text-white" : "text-white/60"}`}>
                      {p.name} {p.isMe && <span className="text-[9px]" style={{ color: accentColor }}>(You)</span>}
                    </span>
                  </span>
                  <span className="font-bold text-white">{p.score}%</span>
                </div>
              ))}
            </div>
          )}

          {/* Footer CTA */}
          <div className="mt-4 md:mt-6 pt-3 md:pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm font-bold text-white">Can you beat this? 👀</p>
                <p className="text-[9px] md:text-[10px] text-white/30">
                  Try → <span className="font-semibold" style={{ color: accentColor }}>percentilers.in/practice-lab</span>
                </p>
              </div>
              <Zap className="w-5 h-5 md:w-6 md:h-6 animate-pulse" style={{ color: accentColor }} />
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-center gap-2 mt-3 md:mt-4">
        <Button onClick={handleDownload} variant="outline" className="gap-2 font-bold px-4 text-sm" size="sm">
          <Download className="w-3.5 h-3.5" />
          Save Image
        </Button>
        <Button onClick={handleShare} disabled={sharing} className="gap-2 font-bold px-4 text-sm game-glow-pulse" size="sm">
          <Share2 className="w-3.5 h-3.5" />
          Share
        </Button>
      </div>
    </motion.div>
  );
}
