import { motion } from "framer-motion";
import { BookOpen, BarChart3, Brain } from "lucide-react";
import { Card } from "@/components/ui/card";

const pillars = [
  {
    icon: BookOpen,
    title: "Structured Syllabus Completion",
    description: "No guessing. No random topic hopping. A clear, day-wise roadmap covering every CAT concept systematically.",
  },
  {
    icon: BarChart3,
    title: "Performance Tracking & Mock Strategy",
    description: "Every mock test builds percentile intelligence. Our analysis framework converts practice into measurable improvement.",
  },
  {
    icon: Brain,
    title: "Psychological Conditioning",
    description: "Most students don't fail CAT because of IQ. They fail because of burnout, inconsistency, and panic. We fix that.",
  },
];

const FrameworkSection = () => (
  <section className="py-14 md:py-24 bg-secondary/30 relative overflow-hidden">
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute top-1/2 left-0 w-96 h-96 -translate-y-1/2 rounded-full bg-primary/[0.03] blur-3xl" />
    </div>

    <div className="container mx-auto px-4 md:px-6 max-w-4xl relative z-10">
      <motion.div
        className="text-center mb-12 space-y-3"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <span className="inline-block text-xs font-bold tracking-[0.3em] uppercase text-primary/60">Our Method</span>
        <h2 className="text-3xl md:text-4xl font-bold text-foreground">
          From Confusion to Clarity — The <span className="text-primary">Percentilers Framework</span>
        </h2>
        <p className="text-muted-foreground text-base max-w-xl mx-auto">Our method focuses on three pillars:</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {pillars.map((p, i) => {
          const Icon = p.icon;
          return (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.12 }}
              whileHover={{ y: -6 }}
            >
              <Card className="p-6 h-full hover:shadow-lg transition-all duration-300 group relative overflow-hidden text-center">
                <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-foreground mb-2">{p.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{p.description}</p>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  </section>
);

export default FrameworkSection;
