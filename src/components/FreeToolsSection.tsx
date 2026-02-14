import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays, BarChart3, ClipboardCheck } from "lucide-react";

const tools = [
  { icon: CalendarDays, name: "Daily Study Planner", benefit: "Organize your prep day-by-day with smart scheduling.", href: "#" },
  { icon: BarChart3, name: "Performance Tracker", benefit: "Track your mock scores and identify improvement areas.", href: "#" },
  { icon: ClipboardCheck, name: "CAT Readiness Assessment", benefit: "Get a structured performance report in 15 minutes — completely free.", href: "/free-cat-readiness-assessment" },
];

const FreeToolsSection = () => (
  <section id="tools" className="py-20 bg-secondary">
    <div className="container mx-auto px-4 md:px-6">
      <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-12">
        Extra Support for Serious Aspirants
      </h2>
      <div className="grid md:grid-cols-3 gap-6">
        {tools.map((t) => (
          <Card key={t.name} className="p-6 text-center">
            <t.icon className="h-8 w-8 mx-auto text-primary mb-4" />
            <h3 className="font-bold text-foreground mb-2">{t.name}</h3>
            <p className="text-sm text-muted-foreground mb-4">{t.benefit}</p>
            <Button variant="outline" size="sm" asChild>
              <a href={t.href}>Use Free Tool</a>
            </Button>
          </Card>
        ))}
      </div>
    </div>
  </section>
);

export default FreeToolsSection;
