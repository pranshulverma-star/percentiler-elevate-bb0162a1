import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useLeadModal } from "@/components/LeadModalProvider";

const FinalCTASection = () => {
  const { openModal } = useLeadModal();

  return (
    <section id="contact" className="py-24 md:py-32 bg-foreground relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="container mx-auto px-4 md:px-6 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <motion.div
            className="inline-flex items-center gap-2 rounded-full bg-primary/20 px-4 py-1.5"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-xs font-semibold text-primary">Start Your Journey Today</span>
          </motion.div>

          <h2 className="text-3xl md:text-5xl font-bold text-background leading-tight">
            Ready to Improve Your<br /><span className="text-primary">Percentile?</span>
          </h2>
          <p className="text-background/60 text-lg max-w-md mx-auto">
            Take the first step toward your dream B-school today.
          </p>

          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <Button size="lg" className="text-base px-8 py-6 rounded-xl animate-pulse-glow" asChild>
              <a href="/masterclass">
                Watch Free Masterclass <ArrowRight className="ml-1 h-4 w-4" />
              </a>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-background/30 text-background bg-background/10 hover:bg-background hover:text-foreground text-base px-8 py-6 rounded-xl transition-all duration-300"
              onClick={() => openModal("final_cta_strategy_call")}
            >
              Book Free Strategy Call
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FinalCTASection;
