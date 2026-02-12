import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Target } from "lucide-react";
import PercentilePlannerModal from "./PercentilePlannerModal";

export default function PercentilePlannerSection() {
  const [open, setOpen] = useState(false);

  return (
    <section className="w-full bg-background py-16 md:py-20">
      <div className="max-w-3xl mx-auto px-4 text-center space-y-4">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground">
          Not Sure What Percentile You Should Target?
        </h2>
        <p className="text-muted-foreground text-base md:text-lg">
          Evaluate your profile and understand what CAT percentile you realistically need.
        </p>
        <div className="pt-4">
          <Button
            onClick={() => setOpen(true)}
            size="lg"
            className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 text-base px-8 py-6 rounded-xl shadow-md"
          >
            <Target className="w-5 h-5" />
            Evaluate My Profile
          </Button>
        </div>
      </div>
      <PercentilePlannerModal open={open} onOpenChange={setOpen} />
    </section>
  );
}
