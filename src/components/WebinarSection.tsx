import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight, Play } from "lucide-react";
import { motion } from "framer-motion";
import { useLeadModal } from "@/components/LeadModalProvider";

const bullets = [
  "Study structure framework used by 99%ilers",
  "Mock analysis system to identify weak areas fast",
  "Strategy blueprint for 95+ percentile",
  "Common mistakes that cost 10+ marks",
];

const WebinarSection = () => {
  const { openModal } = useLeadModal();

  return (
  <section id="masterclass" className="py-20 md:py-28 bg-secondary relative overflow-hidden">
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute top-1/2 left-0 w-96 h-96 -translate-y-1/2 rounded-full bg-primary/[0.04] blur-3xl" />
    </div>

    <div className="container mx-auto px-4 md:px-6 max-w-3xl text-center relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        <span className="inline-block text-xs font-bold tracking-[0.3em] uppercase text-primary/60">Free Masterclass</span>
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary">
          <Play className="h-7 w-7 ml-0.5" />
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-foreground">
          Confused About CAT? Watch This <span className="text-primary">Free Masterclass.</span>
        </h2>
      </motion.div>

      <ul className="space-y-4 text-left inline-block my-10">
        {bullets.map((b, i) => (
          <motion.li
            key={b}
            className="flex items-start gap-3"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: i * 0.1 }}
          >
            <CheckCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <span className="text-foreground">{b}</span>
          </motion.li>
        ))}
      </ul>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3 }}
      >
        <Button size="lg" className="animate-pulse-glow text-base px-8 py-6 rounded-xl" onClick={() => {
          openModal("webinar_section_masterclass", () => {
            window.location.href = "/masterclass";
          });
        }}>
          Watch Free Masterclass <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      </motion.div>
    </div>
  </section>
  );
};

export default WebinarSection;
