import { useInView } from "@/hooks/useInView";
import mentorImg from "@/assets/founder-pranshul.webp";

const FounderSection = () => {
  const { ref: headerRef, inView: headerInView } = useInView();
  const { ref: imgRef, inView: imgInView } = useInView();
  const { ref: textRef, inView: textInView } = useInView();

  return (
    <section className="py-10 md:py-16 bg-secondary/50 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-primary/[0.03] blur-3xl" />
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div
          ref={headerRef}
          className={`text-center mb-4 fade-in-up ${headerInView ? "in-view" : ""}`}
        >
          <span className="inline-block text-xs font-bold tracking-[0.3em] uppercase text-primary/60 mb-2">Meet Your Mentor</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 md:gap-16 items-center max-w-5xl mx-auto">
          <div
            ref={imgRef}
            className={`md:col-span-2 flex justify-center fade-in-scale ${imgInView ? "in-view" : ""}`}
          >
            <div className="relative group">
              <div className="absolute -inset-3 rounded-2xl bg-primary/10 blur-xl group-hover:bg-primary/15 transition-colors duration-500" />
              <img
                src={mentorImg}
                alt="Pranshul Verma – 7x CAT 100 percentiler and founder of Percentilers online CAT coaching"
                width={256}
                height={256}
                className="relative w-56 h-56 md:w-64 md:h-64 object-cover object-top rounded-2xl shadow-xl transition-all duration-700 ring-4 ring-primary/20 ring-offset-4 ring-offset-background"
                loading="lazy"
              />
              <div
                className={`absolute -bottom-4 -right-4 bg-gradient-to-r from-primary to-amber-500 text-primary-foreground px-4 py-2 rounded-xl text-sm font-bold shadow-lg fade-in-up ${imgInView ? "in-view" : ""}`}
                style={{ transitionDelay: "400ms" }}
              >
                7x 100%iler
              </div>
            </div>
          </div>

          <div
            ref={textRef}
            className={`md:col-span-3 space-y-5 fade-in-right ${textInView ? "in-view" : ""}`}
            style={{ transitionDelay: "200ms" }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground leading-tight">
              The Vision Behind <span className="text-primary">Percentilers</span>
            </h2>
            <p className="text-muted-foreground leading-relaxed text-base md:text-lg">
              Founded by <strong className="text-foreground">Pranshul Verma</strong>, a 7-time CAT 100 percentiler, Percentilers was built on a simple belief: serious CAT aspirants deserve structured preparation — not random effort.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              After mentoring 5,000+ students over 8+ years, the system combines expert strategy, disciplined planning, and data-driven mock analysis.
            </p>
            <div className="flex gap-6 md:gap-8 pt-2 flex-wrap">
              {[
                { num: "5000+", label: "Students Mentored" },
                { num: "200+", label: "95+ Percentilers" },
                { num: "8+", label: "Years Teaching" },
              ].map((s) => (
                <div key={s.label}>
                  <p className="text-2xl font-bold text-primary">{s.num}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FounderSection;
