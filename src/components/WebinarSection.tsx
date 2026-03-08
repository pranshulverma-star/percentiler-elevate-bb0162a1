import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight, Play, Phone } from "lucide-react";
import { motion } from "framer-motion";
import { useLeadModal } from "@/components/LeadModalProvider";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";

const bullets = [
  "CAT eligibility criteria and the ideal timeline to begin preparation",
  "How to build a strong foundation in Quant, VARC & LRDI",
  "Profile building strategy for IIMs and top MBA colleges",
  "MBA entrance exams beyond CAT (XAT, SNAP & others)",
  "How to evaluate and choose the right CAT coaching",
  "Understanding cut-offs and realistic target percentiles",
];

const WebinarSection = () => {
  const { openPhoneModal } = useLeadModal();
  const [showCallDialog, setShowCallDialog] = useState(false);

  // CTA Type: Phone-only
  // Handles: Scenario 1 (no phone → modal), 2 (N/A), 3 (phone exists → proceed), 4 (cleared → modal)
  const handleStrategyCall = () => {
    const phone = localStorage.getItem("percentilers_phone") || "";
    if (/^\d{10}$/.test(phone)) {
      supabase.functions.invoke("mark-lead-hot", {
        body: { phone_number: phone, source: "webinar_strategy_call", name: localStorage.getItem("percentilers_name") || null },
      }).catch(() => {});
      setShowCallDialog(true);
    } else {
      openPhoneModal("webinar_strategy_call", () => {
        const newPhone = localStorage.getItem("percentilers_phone") || "";
        if (newPhone) {
          supabase.functions.invoke("mark-lead-hot", {
            body: { phone_number: newPhone, source: "webinar_strategy_call", name: localStorage.getItem("percentilers_name") || null },
          }).catch(() => {});
        }
        setShowCallDialog(true);
      });
    }
  };

  return (
  <section id="masterclass" className="py-10 md:py-16 bg-secondary relative overflow-hidden">
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
          CAT Demystified: The Strategy <span className="text-primary">Serious Aspirants Follow.</span>
        </h2>
        <p className="text-muted-foreground max-w-xl mx-auto mt-3">A structured session for students who want clarity, direction, and a realistic roadmap to top B-schools.</p>
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
        <Button size="lg" className="animate-pulse-glow text-base px-8 py-6 rounded-xl" onClick={handleStrategyCall}>
          Book Free Strategy Call <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
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

export default WebinarSection;
