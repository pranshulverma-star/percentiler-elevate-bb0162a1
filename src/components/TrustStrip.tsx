import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Users, Award, Star, Clock } from "lucide-react";

const stats = [
  { value: 2000, suffix: "+", label: "95+ Percentilers Produced", icon: Award },
  { value: 5000, suffix: "+", label: "Students Trained for CAT & OMETs", icon: Users },
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
    <div ref={ref} className="text-3xl md:text-5xl font-bold text-foreground">
      {decimal ? count.toFixed(1) : Math.floor(count)}<span className="text-primary">{suffix}</span>
    </div>
  );
};

const TrustStrip = () => (
  <section className="py-10 md:py-20 bg-background relative">
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full bg-primary/[0.03] blur-3xl" />
    </div>
    <div className="container mx-auto px-4 md:px-6 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10 text-center relative z-10">
      {stats.map((s, i) => {
        const Icon = s.icon;
        return (
          <motion.div
            key={s.label}
            className="space-y-2"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
          >
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary mb-2">
              <Icon className="h-5 w-5" />
            </div>
            <Counter value={s.value} suffix={s.suffix} decimal={s.decimal} />
            <p className="text-sm font-medium text-muted-foreground">{s.label}</p>
          </motion.div>
        );
      })}
    </div>
  </section>
);

export default TrustStrip;
