import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";

const scorecards = [
  { name: "Ananya S.", percentile: "99.4", college: "IIM Ahmedabad" },
  { name: "Rohan M.", percentile: "98.7", college: "IIM Bangalore" },
  { name: "Priya K.", percentile: "97.9", college: "IIM Calcutta" },
  { name: "Vikram D.", percentile: "96.5", college: "FMS Delhi" },
];

const HeroSection = () => (
  <section className="py-16 md:py-24 bg-background">
    <div className="container mx-auto px-4 md:px-6 grid md:grid-cols-2 gap-12 items-center">
      {/* Left */}
      <div className="space-y-6">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight text-foreground">
          From Preparation to 95+ Percentile — <span className="text-primary">With Structure.</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-lg">
          Proven CAT coaching + strategic planning tools to maximize your score.
        </p>
        <div className="flex flex-wrap gap-4 pt-2">
          <Button size="lg" asChild>
            <a href="#masterclass">
              Watch Free Masterclass <ArrowRight className="ml-1 h-4 w-4" />
            </a>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <a href="#tools">Try Free Study Planner</a>
          </Button>
        </div>
      </div>

      {/* Right — result scorecards mockup */}
      <div className="grid grid-cols-2 gap-4">
        {scorecards.map((s) => (
          <Card key={s.name} className="p-5 space-y-1 hover:shadow-md transition-shadow">
            <p className="text-3xl font-bold text-primary">{s.percentile}</p>
            <p className="text-xs text-muted-foreground">Percentile</p>
            <p className="font-semibold text-sm text-foreground pt-2">{s.name}</p>
            <p className="text-xs text-muted-foreground">{s.college}</p>
          </Card>
        ))}
      </div>
    </div>
  </section>
);

export default HeroSection;
