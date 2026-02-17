import { motion } from "framer-motion";
import { CheckCircle, ArrowRight } from "lucide-react";

const points = [
  "95+ percentile roadmap",
  "Section-wise mastery system (VARC | LRDI | QA)",
  "Targeted IIM cut-off strategy",
  "Personalized study scheduling",
];

const links = [
  { label: "CAT Syllabus", href: "https://percentilers.in/cat-syllabus/" },
  { label: "CAT Cut Off for IIM", href: "https://percentilers.in/cat-cut-off-for-iim/" },
  { label: "IIM Kozhikode Cutoff", href: "https://percentilers.in/iim-kozhikode-cutoff/" },
  { label: "CAT Percentile Predictor", href: "https://percentilers.in/cat-percentile-predictor/" },
];

const ProvenCoachingSection = () => (
  <section className="py-14 md:py-24 bg-background relative overflow-hidden">
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-primary/[0.02] blur-3xl" />
    </div>

    <div className="container mx-auto px-4 md:px-6 max-w-4xl relative z-10">
      <motion.div
        className="text-center mb-12 space-y-3"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <span className="inline-block text-xs font-bold tracking-[0.3em] uppercase text-primary/60">Our Approach</span>
        <h2 className="text-3xl md:text-4xl font-bold text-foreground">
          Proven CAT Coaching That Delivers <span className="text-primary">Results</span>
        </h2>
        <p className="text-muted-foreground text-base max-w-xl mx-auto">
          We don't sell "hope". We build predictable outcomes.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto mb-10">
        {points.map((p, i) => (
          <motion.div
            key={p}
            className="flex items-start gap-3"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
          >
            <CheckCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <span className="text-foreground font-medium">{p}</span>
          </motion.div>
        ))}
      </div>

      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
      >
        <p className="text-sm text-muted-foreground mb-4">Explore more:</p>
        <div className="flex flex-wrap justify-center gap-3">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {link.label} <ArrowRight className="h-3 w-3" />
            </a>
          ))}
        </div>
      </motion.div>
    </div>
  </section>
);

export default ProvenCoachingSection;
