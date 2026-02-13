import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";

const scorecards = [
  { name: "Ananya S.", percentile: "99.4", college: "IIM Ahmedabad" },
  { name: "Rohan M.", percentile: "98.7", college: "IIM Bangalore" },
  { name: "Priya K.", percentile: "97.9", college: "IIM Calcutta" },
  { name: "Vikram D.", percentile: "96.5", college: "FMS Delhi" },
];

const AnimatedNumber = ({ target }: { target: string }) => {
  const num = parseFloat(target);
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const animated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !animated.current) {
          animated.current = true;
          const duration = 1200;
          const start = Date.now();
          const tick = () => {
            const elapsed = Date.now() - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setValue(eased * num);
            if (progress < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [num]);

  return <div ref={ref}>{value.toFixed(1)}</div>;
};

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

const HeroSection = () => (
  <section className="py-16 md:py-24 bg-background overflow-hidden">
    <div className="container mx-auto px-4 md:px-6 grid md:grid-cols-2 gap-12 items-center">
      {/* Left */}
      <motion.div
        className="space-y-6"
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-1.5">
          <TrendingUp className="h-4 w-4 text-primary" />
          <span className="text-xs font-semibold text-primary">2,000+ students enrolled this cycle</span>
        </div>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight text-foreground">
          From Preparation to 95+ Percentile — <span className="text-primary">With Structure.</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-lg">
          Proven CAT coaching + strategic planning tools to maximize your score.
        </p>
        <div className="flex flex-wrap gap-4 pt-2">
          <Button size="lg" className="animate-pulse-glow" asChild>
            <a href="/masterclass">
              Watch Free Masterclass <ArrowRight className="ml-1 h-4 w-4" />
            </a>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <a href="#tools">Try Free Study Planner</a>
          </Button>
        </div>
      </motion.div>

      {/* Right — result scorecards */}
      <motion.div
        className="grid grid-cols-2 gap-4"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {scorecards.map((s) => (
          <motion.div key={s.name} variants={item}>
            <Card className="p-5 space-y-1 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-default group">
              <p className="text-3xl font-bold text-primary group-hover:scale-105 transition-transform origin-left">
                <AnimatedNumber target={s.percentile} />
              </p>
              <p className="text-xs text-muted-foreground">Percentile</p>
              <p className="font-semibold text-sm text-foreground pt-2">{s.name}</p>
              <p className="text-xs text-muted-foreground">{s.college}</p>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </div>
  </section>
);

export default HeroSection;
