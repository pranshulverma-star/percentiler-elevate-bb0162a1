import { motion } from "framer-motion";
import { XCircle, CheckCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLeadModal } from "@/components/LeadModalProvider";

const failures = [
  "Study without a structured CAT syllabus roadmap",
  "Give mocks without analysis",
  "Chase multiple YouTube strategies",
  "Burn out 3 months before CAT",
];

const solutions = [
  "Day-wise structured CAT preparation plan",
  "Psychology-backed consistency model",
  "Mock analysis framework",
  "Cut-off clarity for every IIM",
];

const WhyAspirantsFailSection = () => {
  const { openModal } = useLeadModal();

  return (
    <section className="py-14 md:py-24 bg-secondary/30 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full bg-primary/[0.03] blur-3xl" />
      </div>

      <div className="container mx-auto px-4 md:px-6 max-w-4xl relative z-10">
        <motion.div
          className="text-center mb-12 space-y-3"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className="inline-block text-xs font-bold tracking-[0.3em] uppercase text-primary/60">The Real Problem</span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Why Most CAT Aspirants Fail <span className="text-primary">(And How You Won't)</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <h3 className="font-bold text-foreground text-lg">Most students:</h3>
            <ul className="space-y-3">
              {failures.map((f, i) => (
                <motion.li
                  key={f}
                  className="flex items-start gap-3 text-muted-foreground"
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                >
                  <XCircle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
                  <span>{f}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <h3 className="font-bold text-foreground text-lg">Percentilers solves this with:</h3>
            <ul className="space-y-3">
              {solutions.map((s, i) => (
                <motion.li
                  key={s}
                  className="flex items-start gap-3 text-foreground"
                  initial={{ opacity: 0, x: 10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                >
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <span>{s}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>

        <motion.div
          className="text-center mt-10 space-y-3"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          <p className="text-muted-foreground">If you want more than motivation — you need structure.</p>
          <Button size="lg" className="animate-pulse-glow" onClick={() => {
            openModal("why_fail_masterclass", () => {
              window.location.href = "/masterclass";
            });
          }}>
            Watch the Free Masterclass <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default WhyAspirantsFailSection;
