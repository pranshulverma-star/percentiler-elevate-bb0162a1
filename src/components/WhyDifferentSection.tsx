import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";

const points = [
  "Execution discipline",
  "Mock-to-percentile conversion",
  "Psychological consistency",
  "Structured syllabus sequencing",
  "IIM cut-off clarity",
];

const WhyDifferentSection = () => (
  <section className="py-10 md:py-16 bg-secondary/30 relative overflow-hidden">
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute top-0 left-1/3 w-[400px] h-[400px] rounded-full bg-primary/[0.03] blur-3xl" />
    </div>

    <div className="container mx-auto px-4 md:px-6 max-w-3xl relative z-10">
      <motion.div
        className="text-center mb-10 space-y-3"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <span className="inline-block text-xs font-bold tracking-[0.3em] uppercase text-primary/60">Our Approach</span>
        <h2 className="text-3xl md:text-4xl font-bold text-foreground">
          Why Percentilers Is Different From <span className="text-primary">Typical CAT Coaching</span>
        </h2>
        <p className="text-muted-foreground text-base md:text-lg">
          Most CAT coaching focuses on content coverage. <strong className="text-foreground">Percentilers focuses on:</strong>
        </p>
      </motion.div>

      <ul className="space-y-4 max-w-md mx-auto mb-10">
        {points.map((point, i) => (
          <motion.li
            key={point}
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: i * 0.08 }}
          >
            <CheckCircle className="h-5 w-5 text-primary shrink-0" />
            <span className="text-foreground font-medium">{point}</span>
          </motion.li>
        ))}
      </ul>

      <motion.p
        className="text-center text-muted-foreground text-sm md:text-base font-medium"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4 }}
      >
        This is performance-focused CAT preparation — <span className="text-primary font-semibold">not just classes.</span>
      </motion.p>
    </div>
  </section>
);

export default WhyDifferentSection;
