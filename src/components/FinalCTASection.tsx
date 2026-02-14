import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useLeadModal } from "@/components/LeadModalProvider";

const FinalCTASection = () => {
  const { openModal } = useLeadModal();

  return (
    <section id="contact" className="py-20 bg-foreground relative overflow-hidden">
      <div className="absolute -top-32 -right-32 w-64 h-64 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute -bottom-32 -left-32 w-64 h-64 rounded-full bg-primary/5 blur-3xl" />
      <div className="container mx-auto px-4 md:px-6 text-center relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
          <h2 className="text-3xl md:text-4xl font-bold text-background mb-4">
            Ready to Improve Your Percentile?
          </h2>
          <p className="text-background/70 mb-8">
            Take the first step toward your dream B-school today.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" asChild>
              <a href="/masterclass">
                Watch Free Masterclass <ArrowRight className="ml-1 h-4 w-4" />
              </a>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-background text-background bg-background/10 hover:bg-background hover:text-foreground"
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
