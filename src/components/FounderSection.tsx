import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const FounderSection = () => (
  <section className="py-20 bg-secondary">
    <div className="container mx-auto px-4 md:px-6 grid md:grid-cols-2 gap-12 items-center">
      {/* Image placeholder */}
      <div className="flex justify-center">
        <Avatar className="h-48 w-48">
          <AvatarFallback className="text-4xl font-bold bg-background text-foreground">
            RG
          </AvatarFallback>
        </Avatar>
      </div>

      {/* Story */}
      <div>
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
          The Vision Behind Percentilers
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          Percentilers was founded with a single belief: every serious CAT aspirant deserves a clear, structured
          path to a top percentile. After coaching 5,000+ students over 8 years, our founder saw that most
          students didn't lack talent — they lacked direction. That's why we built a system that combines
          expert mentorship, data-driven mock analysis, and disciplined study planning. The result? Over 200
          students scoring 95+ percentile and converting top B-school calls.
        </p>
      </div>
    </div>
  </section>
);

export default FounderSection;
