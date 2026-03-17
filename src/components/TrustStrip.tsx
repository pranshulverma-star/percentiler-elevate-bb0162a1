import { useEffect, useRef, useState } from "react";
import { Users, Award, Star, Clock } from "lucide-react";
import { useInView } from "@/hooks/useInView";

const stats = [
  { value: 2000, suffix: "+", label: "95+ Percentilers Produced", icon: Award },
  { value: 10000, suffix: "+", label: "Students Trained for CAT & OMETs", icon: Users },
  { value: 4.8, suffix: "★", label: "Average Student Rating", decimal: true, icon: Star },
  { value: 8, suffix: "+", label: "Years of CAT Coaching Experience", icon: Clock },
];

const Counter = ({ value, suffix, decimal }: { value: number; suffix: string; decimal?: boolean }) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const animated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !animated.current) {
          animated.current = true;
          const duration = 1500;
          const start = Date.now();
          const tick = () => {
            const elapsed = Date.now() - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(eased * value);
            if (progress < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value]);

  return (
    <div ref={ref} className="text-3xl md:text-5xl font-extrabold text-foreground border-b-2 border-primary/20 pb-1 inline-block">
      {decimal ? count.toFixed(1) : Math.floor(count)}<span className="text-primary">{suffix}</span>
    </div>
  );
};

const TrustStrip = () => {
  const { ref, inView } = useInView();

  return (
    <section className="py-8 md:py-14 bg-background relative">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full bg-primary/[0.03] blur-3xl" />
      </div>
      <div ref={ref} className="container mx-auto px-4 md:px-6 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10 text-center relative z-10">
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className={`space-y-2 fade-in-up ${inView ? "in-view" : ""}`}
              style={{ transitionDelay: inView ? `${i * 100}ms` : "0ms" }}
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-2">
                <Icon className="h-5 w-5" />
              </div>
              <Counter value={s.value} suffix={s.suffix} decimal={s.decimal} />
              <p className="text-sm font-medium text-muted-foreground">{s.label}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default TrustStrip;
