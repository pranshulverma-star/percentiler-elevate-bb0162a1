import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Share2, Download, Target, Flame, Crown } from "lucide-react";
import { toPng } from "html-to-image";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

function estimatePercentile(correct: number, total: number): number {
  if (total === 0) return 0;
  const ratio = correct / total;
  const mean = 0.45;
  const sd = 0.18;
  const z = (ratio - mean) / sd;
  const cdf = 1 / (1 + Math.exp(-1.7 * z));
  const percentile = Math.min(99.8, Math.max(1, cdf * 100));
  return Math.round(percentile * 10) / 10;
}

function getPercentileColor(p: number): string {
  if (p >= 95) return "text-amber-400";
  if (p >= 80) return "text-emerald-400";
  if (p >= 50) return "text-primary";
  return "text-muted-foreground";
}

function getPercentileLabel(p: number): string {
  if (p >= 99) return "🔥 Elite";
  if (p >= 95) return "💎 Top 5%";
  if (p >= 80) return "⚡ Strong";
  if (p >= 50) return "📈 Rising";
  return "🎯 Building";
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

  const shareText = `🎯 CAT Practice Lab Results\n\nScore: ${correct}/${total} (${pct}%)\nEstimated Percentile: ${percentile}%ile\n${percentile >= 95 ? "🔥 " : ""}${getPercentileLabel(percentile)}\n\nCan you beat this? 👀\nTry the quiz → percentilers.in/practice-lab`;

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
      // User cancelled share
    }
    setSharing(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="w-full"
    >
      <div
        ref={cardRef}
        className="relative overflow-hidden rounded-xl border border-border"
        style={{
          background: "linear-gradient(145deg, hsl(var(--card)) 0%, hsl(0 0% 6%) 100%)",
        }}
      >
        {/* Ambient glow — smaller on mobile */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 md:w-80 h-24 md:h-40 bg-[radial-gradient(ellipse,hsl(var(--primary)/0.15)_0%,transparent_70%)] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-32 md:w-60 h-32 md:h-60 bg-[radial-gradient(circle,hsl(25_100%_50%/0.06)_0%,transparent_70%)] pointer-events-none" />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage: "linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        <div className="relative z-10 p-4 md:p-8 space-y-3 md:space-y-5">
          {/* Header — compact on mobile */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 md:gap-2">
              <div className="w-6 h-6 md:w-8 md:h-8 rounded-md md:rounded-lg bg-primary/15 flex items-center justify-center">
                <Target className="w-3 h-3 md:w-4 md:h-4 text-primary" />
              </div>
              <div>
                <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.12em] md:tracking-[0.15em] text-muted-foreground">CAT Practice Lab</p>
                {chapterName && <p className="text-[10px] md:text-xs text-muted-foreground/60 truncate max-w-[120px] md:max-w-[180px]">{chapterName}</p>}
              </div>
            </div>
            <p className="text-[9px] md:text-[10px] font-mono text-muted-foreground/50">percentilers.in</p>
          </div>

          {/* Main score — tighter on mobile */}
          <div className="text-center space-y-0.5 md:space-y-1 py-1 md:py-2">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5, ease: "backOut" }}
              className="text-5xl md:text-7xl font-black text-foreground tracking-tighter leading-none"
            >
              {correct}<span className="text-xl md:text-2xl text-muted-foreground font-medium">/{total}</span>
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className={`text-2xl md:text-4xl font-black leading-tight ${getPercentileColor(percentile)}`}
            >
              {percentile}<span className="text-sm md:text-lg font-medium">%ile</span>
            </motion.div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="text-[10px] md:text-xs font-semibold text-muted-foreground"
            >
              {getPercentileLabel(percentile)}
            </motion.p>
          </div>

          {/* Percentile bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-[8px] md:text-[9px] text-muted-foreground/50 font-mono">
              <span>0%ile</span>
              <span>50%ile</span>
              <span>99.8%ile</span>
            </div>
            <div className="relative h-1.5 md:h-2 rounded-full bg-secondary overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, (percentile / 99.8) * 100)}%` }}
                transition={{ delay: 0.6, duration: 1, ease: "easeOut" }}
                className="absolute inset-y-0 left-0 rounded-full"
                style={{
                  background: "linear-gradient(90deg, hsl(var(--primary) / 0.4), hsl(var(--primary)), hsl(45 100% 50%))",
                }}
              />
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.6 }}
                className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 md:w-3 md:h-3 rounded-full border-2 border-background bg-primary shadow-lg shadow-primary/40"
                style={{ left: `${Math.min(97, (percentile / 99.8) * 100)}%` }}
              />
            </div>
          </div>

          {/* Leaderboard (battle mode) */}
          {leaderboard && leaderboard.length > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <Crown className="w-3 h-3 md:w-3.5 md:h-3.5 text-primary" />
                <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Rankings</span>
              </div>
              <div className="space-y-0.5 md:space-y-1">
                {leaderboard.map((p, i) => (
                  <div
                    key={i}
                    className={`flex items-center justify-between px-2.5 md:px-3 py-1 md:py-1.5 rounded-md md:rounded-lg text-[11px] md:text-xs ${
                      p.isMe ? "bg-primary/10 border border-primary/20" : "bg-secondary/50"
                    }`}
                  >
                    <span className="flex items-center gap-1.5 md:gap-2">
                      <span className="font-mono text-muted-foreground w-3 md:w-4 text-[10px] md:text-xs">#{i + 1}</span>
                      <span className={`font-semibold truncate max-w-[100px] md:max-w-none ${p.isMe ? "text-primary" : "text-foreground"}`}>
                        {p.name} {p.isMe && "(You)"}
                      </span>
                    </span>
                    <span className="font-black text-foreground">{p.score}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="pt-2 border-t border-border/50">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs md:text-sm font-bold text-foreground">Can you beat this? 👀</p>
                <p className="text-[9px] md:text-[10px] text-muted-foreground truncate">Try the quiz → <span className="text-primary font-semibold">percentilers.in/practice-lab</span></p>
              </div>
              <Flame className="w-5 h-5 md:w-6 md:h-6 text-primary animate-pulse shrink-0" />
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-center gap-2 mt-3 md:mt-4">
        <Button
          onClick={async () => {
            if (!cardRef.current) return;
            try {
              // Run toPng twice for better quality (first pass warms up fonts)
              await toPng(cardRef.current, { pixelRatio: 3, cacheBust: true });
              const dataUrl = await toPng(cardRef.current, { pixelRatio: 3, cacheBust: true });
              const link = document.createElement("a");
              link.download = `cat-practice-result-${pct}pct.png`;
              link.href = dataUrl;
              link.click();
              toast({ title: "Image saved!", description: "Share it on Instagram or WhatsApp 🚀" });
            } catch {
              toast({ title: "Couldn't generate image", description: "Try again", variant: "destructive" });
            }
          }}
          variant="outline"
          className="gap-2 font-bold px-4 md:px-5 text-sm"
          size="sm"
        >
          <Download className="w-3.5 h-3.5 md:w-4 md:h-4" />
          Save Image
        </Button>
        <Button
          onClick={handleShare}
          disabled={sharing}
          className="gap-2 font-bold px-4 md:px-5 text-sm game-glow-pulse"
          size="sm"
        >
          <Share2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
          Share
        </Button>
      </div>
    </motion.div>
  );
}
