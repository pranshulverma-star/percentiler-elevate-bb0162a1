import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

const stats = [
  { value: 200, suffix: "+", label: "95%ilers" },
  { value: 5000, suffix: "+", label: "Students Trained" },
  { value: 4.8, suffix: "★", label: "Student Rating", decimal: true },
  { value: 8, suffix: "+", label: "Years Experience" },
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
    <div ref={ref} className="text-3xl md:text-4xl font-bold text-foreground">
      {decimal ? count.toFixed(1) : Math.floor(count)}{suffix}
    </div>
  );
};

const TrustStrip = () => (
  <section className="border-y border-border py-10 bg-background">
    <div className="container mx-auto px-4 md:px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
      {stats.map((s, i) => (
        <motion.div
          key={s.label}
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: i * 0.1 }}
        >
          <Counter value={s.value} suffix={s.suffix} decimal={s.decimal} />
          <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
        </motion.div>
      ))}
    </div>
  </section>
);

export default TrustStrip;
