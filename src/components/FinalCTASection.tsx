import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const FinalCTASection = () => (
  <section id="contact" className="py-20 bg-foreground">
    <div className="container mx-auto px-4 md:px-6 text-center">
      <h2 className="text-3xl md:text-4xl font-bold text-background mb-4">
        Ready to Improve Your Percentile?
      </h2>
      <p className="text-background/70 mb-8">
        Take the first step toward your dream B-school today.
      </p>
      <div className="flex flex-wrap justify-center gap-4">
        <Button size="lg" asChild>
          <a href="#masterclass">
            Watch Free Masterclass <ArrowRight className="ml-1 h-4 w-4" />
          </a>
        </Button>
        <Button size="lg" variant="outline" className="border-background text-background hover:bg-background hover:text-foreground" asChild>
          <a href="#">Book Free Strategy Call</a>
        </Button>
      </div>
    </div>
  </section>
);

export default FinalCTASection;
