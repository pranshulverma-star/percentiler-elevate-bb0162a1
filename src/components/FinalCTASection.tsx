import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useLeadModal } from "@/components/LeadModalProvider";

const FinalCTASection = () => {
  const { openModal } = useLeadModal();

  return (
    <section id="contact" className="py-16 md:py-32 bg-foreground relative overflow-hidden">
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

          <h2 className="text-2xl md:text-5xl font-bold text-background leading-tight">
            Your CAT 2026 Attempt Can Be Random.<br />Or It Can Be <span className="text-primary">Structured.</span>
          </h2>
          <p className="text-background/60 text-lg max-w-md mx-auto">
            You decide. Start your structured CAT preparation journey today.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-3 pt-4 w-full max-w-md mx-auto">
            <Button size="lg" className="text-sm md:text-base px-6 py-5 md:px-8 md:py-6 rounded-xl animate-pulse-glow w-full sm:w-auto" onClick={() => {
              openModal("final_cta_masterclass", () => {
                window.location.href = "/masterclass";
              });
            }}>
              Watch Free CAT Masterclass <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-background/30 text-background bg-background/10 hover:bg-background hover:text-foreground text-sm md:text-base px-6 py-5 md:px-8 md:py-6 rounded-xl transition-all duration-300 w-full sm:w-auto"
              asChild
            >
              <a href="/cat-daily-study-planner">
                Try Free Planner
              </a>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FinalCTASection;
