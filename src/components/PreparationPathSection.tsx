import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, RotateCcw, Target, ArrowRight } from "lucide-react";

const paths = [
  {
    icon: BookOpen,
    title: "First-Time CAT Aspirant",
    description: "Build a strong foundation with structured guidance from day one.",
    scrollTo: "#masterclass",
  },
  {
    icon: RotateCcw,
    title: "Repeater Attempting Again",
    description: "Identify gaps, refine strategy, and push past your previous score.",
    scrollTo: "#courses",
  },
  {
    icon: Target,
    title: "Targeting 95+ Percentile",
    description: "Advanced techniques and mock strategies for top-tier performance.",
    scrollTo: "#masterclass",
  },
];

const PreparationPathSection = () => {
  const [selected, setSelected] = useState<number | null>(null);

  const handleSelect = (index: number, scrollTo: string) => {
    setSelected(index);
    setTimeout(() => {
      const el = document.querySelector(scrollTo);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 300);
  };

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            Choose Your Preparation Path
          </h2>
          <p className="text-muted-foreground text-lg">
            Different starting points require different strategies.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {paths.map((path, i) => {
            const Icon = path.icon;
            const isActive = selected === i;
            return (
              <Card
                key={path.title}
                onClick={() => handleSelect(i, path.scrollTo)}
                className={`p-8 cursor-pointer text-center transition-all duration-200 hover:-translate-y-1 hover:shadow-lg border-2 ${
                  isActive
                    ? "border-primary shadow-lg"
                    : "border-transparent hover:border-primary/40"
                }`}
              >
                <div
                  className={`inline-flex items-center justify-center w-14 h-14 rounded-full mb-5 transition-colors duration-200 ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-foreground"
                  }`}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">{path.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {path.description}
                </p>
              </Card>
            );
          })}
        </div>

        {/* Recommendation banner */}
        <div
          className={`max-w-2xl mx-auto mt-10 overflow-hidden transition-all duration-300 ${
            selected !== null ? "max-h-32 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-lg border border-primary/20 bg-secondary p-5">
            <p className="text-sm font-medium text-foreground text-center sm:text-left">
              Based on your selection, we recommend watching the Free Masterclass.
            </p>
            <Button size="sm" asChild className="shrink-0">
              <a href="#masterclass">
                Watch Free Masterclass <ArrowRight className="ml-1 h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PreparationPathSection;
