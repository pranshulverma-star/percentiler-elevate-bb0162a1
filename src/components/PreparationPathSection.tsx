import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Phone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type Level = "beginner" | "repeater" | "advanced";

const pills: { id: Level; label: string }[] = [
  { id: "beginner", label: "I'm starting from scratch" },
  { id: "repeater", label: "I've attempted before but need improvement" },
  { id: "advanced", label: "I'm targeting 95+ percentile & top B-schools" },
];

const recommendations: Record<Level, { headline: string; text: string }> = {
  beginner: {
    headline: "Start With the Right Roadmap",
    text: "Avoid common beginner mistakes. Understand what to study, when to start, and how to structure your preparation properly.",
  },
  repeater: {
    headline: "Fix the Gaps. Improve Your Strategy.",
    text: "Identify where you're losing marks, improve mock performance, and push beyond your previous percentile.",
  },
  advanced: {
    headline: "Build a 95+ Percentile Strategy",
    text: "Advanced mock approach, profile positioning, and top B-school targeting — designed for serious aspirants.",
  },
};

const currentYear = new Date().getFullYear();
const targetYears = [currentYear, currentYear + 1, currentYear + 2].map(String);

const PreparationPathSection = () => {
  const [selected, setSelected] = useState<Level | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [ctaSource, setCtaSource] = useState<"masterclass" | "call">("masterclass");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [targetYear, setTargetYear] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const handleCTA = (source: "masterclass" | "call") => {
    const storedPhone = localStorage.getItem("percentilers_phone");
    if (storedPhone) {
      redirect(source);
    } else {
      setCtaSource(source);
      setModalOpen(true);
    }
  };

  const redirect = (source: "masterclass" | "call") => {
    if (source === "masterclass") {
      window.location.href = "/masterclass";
    } else {
      // Scroll to tools section for counseling call
      const el = document.getElementById("tools");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{10}$/.test(phone)) {
      toast({ title: "Invalid phone number", description: "Please enter a valid 10-digit phone number.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const source = ctaSource === "masterclass"
        ? "homepage_selector_masterclass"
        : "homepage_selector_call";

      const { error } = await supabase.from("leads").upsert(
        {
          phone_number: phone,
          name,
          target_year: targetYear || null,
          prep_level: selected || null,
          source,
        },
        { onConflict: "phone_number" }
      );
      if (error) throw error;

      localStorage.setItem("percentilers_phone", phone);
      localStorage.setItem("percentilers_name", name);

      setModalOpen(false);
      setName("");
      setPhone("");
      setTargetYear("");
      redirect(ctaSource);
    } catch {
      toast({ title: "Something went wrong", description: "Please try again later.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4 md:px-6 max-w-3xl">
        {/* Title */}
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            Where Are You in Your CAT Journey?
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Different starting points need different strategies. Tell us where you are — we'll guide you correctly.
          </p>
        </div>

        {/* Pill Selector */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
          {pills.map((pill) => (
            <button
              key={pill.id}
              onClick={() => setSelected(pill.id)}
              className={`px-5 py-3 rounded-full text-sm font-medium border transition-all duration-200 cursor-pointer ${
                selected === pill.id
                  ? "bg-primary text-primary-foreground border-primary shadow-md"
                  : "bg-background text-foreground border-border hover:border-primary/50"
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>

        {/* Recommendation Panel */}
        <AnimatePresence mode="wait">
          {selected && (
            <motion.div
              key={selected}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="rounded-xl border border-border bg-secondary p-8 text-center"
            >
              <h3 className="text-xl md:text-2xl font-bold text-foreground mb-2">
                {recommendations[selected].headline}
              </h3>
              <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
                {recommendations[selected].text}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button size="lg" onClick={() => handleCTA("masterclass")}>
                  Watch Free Masterclass <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                  onClick={() => handleCTA("call")}
                >
                  <Phone className="mr-1 h-4 w-4" /> Book Free Counseling Call
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Lead Capture Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Quick Details</DialogTitle>
            <DialogDescription>
              Share your details so we can personalize your experience.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <Input
              placeholder="Your Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Input
              placeholder="Phone Number (10 digits)"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
              required
            />
            <Select value={targetYear} onValueChange={setTargetYear}>
              <SelectTrigger>
                <SelectValue placeholder="Target CAT Year" />
              </SelectTrigger>
              <SelectContent>
                {targetYears.map((y) => (
                  <SelectItem key={y} value={y}>CAT {y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Submitting…" : "Continue"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default PreparationPathSection;
