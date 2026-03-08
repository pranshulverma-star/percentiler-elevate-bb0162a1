import { useState } from "react";
import { trackLead, trackInitiateCheckout } from "@/lib/tracking";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Phone } from "lucide-react";
import { motion } from "framer-motion";
import { useLeadModal } from "@/components/LeadModalProvider";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";

const FinalCTASection = () => {
  const { openContentGate, openPhoneModal } = useLeadModal();
  const [showCallDialog, setShowCallDialog] = useState(false);

  const markLeadHot = (phone: string, source: string) => {
    // Fire-and-forget — don't block UI
    supabase.functions.invoke("mark-lead-hot", {
      body: { phone_number: phone, source, name: localStorage.getItem("percentilers_name") || null },
    }).catch(() => {});
  };

  // CTA Type: Phone-only
  // Handles: Scenario 1 (no phone → modal), 2 (N/A), 3 (phone exists → proceed), 4 (cleared → modal)

  const handleStrategyCall = () => {
    trackInitiateCheckout("final_cta_strategy_call");
    const phone = localStorage.getItem("percentilers_phone") || "";
    if (phone) {
      markLeadHot(phone, "final_cta_strategy_call");
      setShowCallDialog(true);
    } else {
      openPhoneModal("final_cta_strategy_call", () => {
        const newPhone = localStorage.getItem("percentilers_phone") || "";
        if (newPhone) markLeadHot(newPhone, "final_cta_strategy_call");
        setShowCallDialog(true);
      });
    }
  };

  return (
    <section id="contact" className="py-12 md:py-20 bg-foreground relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl" />
        {/* Dot grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, hsl(0 0% 100%) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
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

          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-background leading-tight">
            Ready to Improve Your<br /><span className="text-primary">Percentile?</span>
          </h2>
          <p className="text-background/60 text-lg max-w-md mx-auto">
            Take the first step toward your dream B-school today.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-3 pt-4 w-full max-w-md mx-auto">
            <Button size="lg" className="text-sm md:text-base px-6 py-5 md:px-8 md:py-6 rounded-xl animate-pulse-glow w-full sm:w-auto" onClick={handleStrategyCall}>
              Book Free Strategy Call <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      </div>

      {/* Call Confirmation Dialog */}
      <Dialog open={showCallDialog} onOpenChange={setShowCallDialog}>
        <DialogContent className="max-w-sm text-center">
          <DialogTitle className="sr-only">Book a Call</DialogTitle>
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10">
              <Phone className="h-7 w-7 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-foreground">You're In! 🎉</h3>
            <p className="text-muted-foreground text-sm">
              Our counselor will connect with you shortly to discuss the 95%ile Guarantee Batch.
            </p>
            <div className="w-full space-y-3 pt-2">
              <Button size="lg" className="w-full" asChild>
                <a href="tel:+919911928071">
                  <Phone className="mr-2 h-4 w-4" /> Call Now — +91 99119 28071
                </a>
              </Button>
              <Button variant="outline" className="w-full" onClick={() => setShowCallDialog(false)}>
                I'll wait for the call
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default FinalCTASection;
