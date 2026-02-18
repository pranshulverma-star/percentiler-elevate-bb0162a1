import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Phone, Rocket, RefreshCw, Target, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLeadModal } from "@/components/LeadModalProvider";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";

type Level = "beginner" | "repeater" | "advanced";

const pills: { id: Level; label: string; icon: typeof Rocket }[] = [
  { id: "beginner", label: "Starting from scratch", icon: Rocket },
  { id: "repeater", label: "Attempted before", icon: RefreshCw },
  { id: "advanced", label: "Targeting 95+", icon: Target },
];

const recommendations: Record<Level, { headline: string; text: string; tag: string }> = {
  beginner: {
    headline: "Start With the Right Roadmap",
    text: "Avoid common beginner mistakes. Understand what to study, when to start, and how to structure your preparation properly.",
    tag: "Recommended for you",
  },
  repeater: {
    headline: "Fix the Gaps. Improve Your Strategy.",
    text: "Identify where you're losing marks, improve mock performance, and push beyond your previous percentile.",
    tag: "Level up your prep",
  },
  advanced: {
    headline: "Build a 95+ Percentile Strategy",
    text: "Advanced mock approach, profile positioning, and top B-school targeting — designed for serious aspirants.",
    tag: "For serious aspirants",
  },
};

const PreparationPathSection = () => {
  const [selected, setSelected] = useState<Level | null>(null);
  const [showCallDialog, setShowCallDialog] = useState(false);
  const { openContentGate, openPhoneModal } = useLeadModal();

  const markLeadHot = (phone: string) => {
    // Fire-and-forget — don't block UI
    supabase.functions.invoke("mark-lead-hot", {
      body: { phone_number: phone, source: "homepage_selector_call", name: localStorage.getItem("percentilers_name") || null },
    }).catch(() => {});
  };

  const handlePrimaryCTA = (level: Level) => {
    if (level === "beginner") {
      openContentGate("homepage_selector_masterclass", () => {
        window.location.href = "/masterclass";
      });
    } else if (level === "repeater") {
      openContentGate("homepage_selector_readiness", () => {
        window.location.href = "/free-cat-readiness-assessment";
      });
    } else {
      openContentGate("homepage_selector_evaluate", () => {
        const section = document.getElementById("profile-evaluator");
        if (section) section.scrollIntoView({ behavior: "smooth" });
      });
    }
  };

  const handleSecondaryCTA = () => {
    const phone = localStorage.getItem("percentilers_phone") || "";
    if (phone) {
      markLeadHot(phone);
      setShowCallDialog(true);
    } else {
      openPhoneModal("homepage_selector_call", () => {
        const newPhone = localStorage.getItem("percentilers_phone") || "";
        if (newPhone) markLeadHot(newPhone);
        setShowCallDialog(true);
      });
    }
  };

  return (
    <>
    <section className="py-10 md:py-16 bg-background relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary/[0.03] blur-3xl" />
      </div>

      <div className="container mx-auto px-4 md:px-6 max-w-3xl relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="text-center mb-12">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-4">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
            </span>
            Interactive Guide
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">Where Are You in Your CAT Journey?</h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">Whether you're starting from scratch or targeting 95+ percentile, your CAT preparation needs a different strategy.</p>
        </motion.div>

        <div className="flex items-center justify-center gap-2 mb-8">
          {pills.map((pill, i) => (
            <div key={pill.id} className="flex items-center gap-2">
              <motion.div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors duration-300 ${
                  selected === pill.id ? "bg-primary text-primary-foreground" : selected && pills.findIndex(p => p.id === selected) > i ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                }`}
                whileTap={{ scale: 0.95 }}
              >
                {i + 1}
              </motion.div>
              {i < pills.length - 1 && (
                <div className={`w-8 md:w-16 h-0.5 rounded transition-colors duration-300 ${selected && pills.findIndex(p => p.id === selected) > i ? "bg-primary/30" : "bg-muted"}`} />
              )}
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3 sm:gap-4">
          {pills.map((pill, i) => {
            const Icon = pill.icon;
            const isSelected = selected === pill.id;
            return (
              <div key={pill.id}>
                <motion.button
                  onClick={() => setSelected(isSelected ? null : pill.id)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.3 }}
                  className={`w-full group relative flex items-center gap-3 px-5 py-4 rounded-2xl text-sm font-medium border-2 transition-all duration-300 cursor-pointer text-left ${
                    isSelected ? "bg-primary/10 text-primary border-primary/40 shadow-lg shadow-primary/10" : "bg-background text-foreground border-border hover:border-primary/40 hover:shadow-md"
                  }`}
                >
                  <span className={`flex items-center justify-center w-10 h-10 rounded-xl transition-colors duration-300 shrink-0 ${isSelected ? "bg-primary/20 text-primary" : "bg-muted group-hover:bg-primary/10"}`}>
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="flex-1">{pill.label}</span>
                  <ChevronRight className={`h-4 w-4 transition-transform duration-300 shrink-0 ${isSelected ? "rotate-90" : "group-hover:translate-x-0.5"}`} />
                </motion.button>

                <AnimatePresence mode="wait">
                  {isSelected && (
                    <motion.div
                      key={pill.id}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="mt-3 rounded-2xl border border-border bg-secondary/60 backdrop-blur-sm p-6 md:p-8 text-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-[3rem]" />
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary mb-3">
                          {recommendations[pill.id].tag}
                        </span>
                        <h3 className="text-lg md:text-xl font-bold text-foreground mb-2">{recommendations[pill.id].headline}</h3>
                        <p className="text-muted-foreground mb-6 max-w-lg mx-auto leading-relaxed text-sm">{recommendations[pill.id].text}</p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                          <Button size="lg" onClick={() => handlePrimaryCTA(pill.id)} className="shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-shadow">
                            {pill.id === "repeater" ? "Take CAT Readiness Test" : pill.id === "advanced" ? "Evaluate My Profile" : "Watch Free Masterclass"} <ArrowRight className="ml-1 h-4 w-4" />
                          </Button>
                          <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all" onClick={handleSecondaryCTA}>
                            <Phone className="mr-1.5 h-4 w-4" /> Book Free Counseling Call
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>

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
    </>
  );
};

export default PreparationPathSection;
