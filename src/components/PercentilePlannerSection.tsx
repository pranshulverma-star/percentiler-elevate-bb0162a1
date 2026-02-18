import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Target } from "lucide-react";
import { motion } from "framer-motion";
import PercentilePlannerModal from "./PercentilePlannerModal";

export default function PercentilePlannerSection() {
  const [open, setOpen] = useState(false);

  return (
    <section id="profile-evaluator" className="w-full bg-background py-14 md:py-24 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 right-0 w-96 h-96 -translate-y-1/2 rounded-full bg-primary/[0.03] blur-3xl" />
      </div>

      <div className="max-w-3xl mx-auto px-4 text-center space-y-5 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="space-y-3"
        >
          <span className="inline-block text-xs font-bold tracking-[0.3em] uppercase text-primary/60">Profile Evaluator</span>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">
            Not Sure What CAT Percentile You Should <span className="text-primary">Target?</span>
          </h2>
          <p className="text-muted-foreground text-base md:text-lg max-w-xl mx-auto">
            Evaluate your academic profile and understand what CAT percentile you realistically need for top IIMs and B-schools.
          </p>
        </motion.div>

        <motion.div
          className="pt-4"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          <Button
            onClick={() => setOpen(true)}
            size="lg"
            className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 text-base px-8 py-6 rounded-xl shadow-md animate-pulse-glow"
          >
            <Target className="w-5 h-5" />
            Evaluate My Profile
          </Button>
        </motion.div>
      </div>
      <PercentilePlannerModal open={open} onOpenChange={setOpen} />
    </section>
  );
}
