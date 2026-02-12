import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight } from "lucide-react";

const bullets = [
  "Study structure framework used by 99%ilers",
  "Mock analysis system to identify weak areas fast",
  "Strategy blueprint for 95+ percentile",
  "Common mistakes that cost 10+ marks",
];

const WebinarSection = () => (
  <section id="masterclass" className="py-20 bg-secondary">
    <div className="container mx-auto px-4 md:px-6 max-w-3xl text-center">
      <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
        Confused About CAT? Watch This Free Masterclass.
      </h2>
      <ul className="space-y-4 text-left inline-block mb-10">
        {bullets.map((b) => (
          <li key={b} className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <span className="text-foreground">{b}</span>
          </li>
        ))}
      </ul>
      <div>
        <Button size="lg" asChild>
          <a href="#">
            Watch Free Masterclass <ArrowRight className="ml-1 h-4 w-4" />
          </a>
        </Button>
      </div>
    </div>
  </section>
);

export default WebinarSection;
