import { motion } from "framer-motion";
import { CheckCircle, ArrowRight, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  "Sectional mastery across VARC, LRDI & QA",
  "Advanced LRDI sets & high-difficulty practice",
  "CAT exam strategy refinement",
  "Interview readiness guidance",
];

const GuaranteeTrackSection = () => (
  <section className="py-14 md:py-24 bg-secondary/50 relative overflow-hidden">
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute top-0 right-1/4 w-[400px] h-[400px] rounded-full bg-primary/[0.04] blur-3xl" />
    </div>

    <div className="container mx-auto px-4 md:px-6 max-w-3xl text-center relative z-10">
      <motion.div
        className="space-y-3 mb-10"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 text-primary mb-2">
          <Trophy className="h-7 w-7" />
        </div>
        <span className="inline-block text-xs font-bold tracking-[0.3em] uppercase text-primary/60">Flagship Program</span>
        <h2 className="text-3xl md:text-4xl font-bold text-foreground">
          95+ Percentile <span className="text-primary">Guarantee Track</span>
        </h2>
        <p className="text-muted-foreground text-base max-w-xl mx-auto">
          Our flagship program is built for aspirants targeting top IIMs.
        </p>
      </motion.div>

      <div className="flex flex-col gap-3 max-w-md mx-auto mb-8 text-left">
        {features.map((f, i) => (
          <motion.div
            key={f}
            className="flex items-start gap-3"
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
          >
            <CheckCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <span className="text-foreground font-medium">{f}</span>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3 }}
      >
        <Button size="lg" className="animate-pulse-glow" asChild>
          <a href="https://percentilers.in/95-percentile-guarantee-course/" target="_blank" rel="noopener noreferrer">
            Explore the 95 Percentile Guarantee Course <ArrowRight className="ml-1 h-4 w-4" />
          </a>
        </Button>
      </motion.div>
    </div>
  </section>
);

export default GuaranteeTrackSection;
