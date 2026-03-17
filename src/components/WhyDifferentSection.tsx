import { CheckCircle } from "lucide-react";
import { useInView } from "@/hooks/useInView";

const points = [
  "Execution discipline",
  "Mock-to-percentile conversion",
  "Psychological consistency",
  "Structured syllabus sequencing",
  "IIM cut-off clarity",
];

const WhyDifferentSection = () => {
  const { ref: headerRef, inView: headerInView } = useInView();
  const { ref: listRef, inView: listInView } = useInView<HTMLUListElement>();
  const { ref: footerRef, inView: footerInView } = useInView();

  return (
    <section className="py-10 md:py-16 bg-secondary/30 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/3 w-[400px] h-[400px] rounded-full bg-primary/[0.03] blur-3xl" />
      </div>

      <div className="container mx-auto px-4 md:px-6 max-w-3xl relative z-10">
        <div
          ref={headerRef}
          className={`text-center mb-10 space-y-3 fade-in-up ${headerInView ? "in-view" : ""}`}
        >
          <span className="inline-block text-xs font-bold tracking-[0.3em] uppercase text-primary/60">Our Approach</span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Why Percentilers Is Different From <span className="text-primary">Typical CAT Coaching</span>
          </h2>
          <p className="text-muted-foreground text-base md:text-lg">
            Most CAT coaching focuses on content coverage. <strong className="text-foreground">Percentilers focuses on:</strong>
          </p>
        </div>

        <ul ref={listRef} className="space-y-4 max-w-md mx-auto mb-10 border-l-2 border-primary/20 pl-4">
          {points.map((point, i) => (
            <li
              key={point}
              className={`flex items-center gap-3 fade-in-left ${listInView ? "in-view" : ""}`}
              style={{ transitionDelay: listInView ? `${i * 80}ms` : "0ms" }}
            >
              <div className="bg-primary/10 rounded-full p-1 shrink-0">
                <CheckCircle className="h-4 w-4 text-primary" />
              </div>
              <span className="text-foreground font-medium">{point}</span>
            </li>
          ))}
        </ul>

        <p
          ref={footerRef}
          className={`text-center text-muted-foreground text-sm md:text-base font-medium fade-in ${footerInView ? "in-view" : ""}`}
          style={{ transitionDelay: "400ms" }}
        >
          This is performance-focused CAT preparation — <span className="text-primary font-semibold">not just classes.</span>
        </p>
      </div>
    </section>
  );
};

export default WhyDifferentSection;
