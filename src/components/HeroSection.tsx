import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, TrendingUp, GraduationCap, Target } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useRef, lazy, Suspense } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useLeadModal } from "@/components/LeadModalProvider";
import studentAayushiJha from "@/assets/student-aayushi-jha.jpeg";
import studentAayushiRana from "@/assets/student-aayushi-rana.jpeg";
import studentVishwajeet from "@/assets/student-vishwajeet.jpeg";
import studentSaloni from "@/assets/student-saloni.jpeg";

const PercentilePlannerModal = lazy(() => import("@/components/PercentilePlannerModal"));

const scorecards = [
  { name: "Aayushi Jha", percentile: "99.7", college: "FMS Delhi", initials: "AJ", photo: studentAayushiJha, linkedin: "https://www.linkedin.com/in/ayushi-jha-fms/" },
  { name: "Vishwajeet", percentile: "99.89", college: "XLRI Jamshedpur", initials: "VJ", photo: studentVishwajeet, linkedin: "https://www.linkedin.com/in/vishwajeet-saharan-22120553/" },
  { name: "Aayushi Rana", percentile: "98.6", college: "XLRI Jamshedpur", initials: "AR", photo: studentAayushiRana, linkedin: "https://www.linkedin.com/in/aayushi-rana-9a44a5352/" },
  { name: "Saloni Hindocha", percentile: "98.3", college: "IIT Bombay", initials: "SH", photo: studentSaloni, linkedin: "https://www.linkedin.com/in/saloni-hindocha/" },
];

const AnimatedNumber = ({ target }: { target: string }) => {
  const num = parseFloat(target);
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const animated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !animated.current) {
          animated.current = true;
          const duration = 1200;
          const start = Date.now();
          const tick = () => {
            const elapsed = Date.now() - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setValue(eased * num);
            if (progress < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [num]);

  return <div ref={ref}>{value.toFixed(1)}</div>;
};

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

const HeroSection = () => {
  const { openContentGate } = useLeadModal();
  const [plannerOpen, setPlannerOpen] = useState(false);

  return (
    <section className="pt-20 pb-10 md:pt-24 md:pb-16 bg-background overflow-hidden relative">
      <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-primary/[0.04] blur-[100px] pointer-events-none" />
      <div className="container mx-auto px-4 md:px-6 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-1.5 animate-shimmer bg-gradient-to-r from-primary/5 via-primary/15 to-primary/5 bg-[length:200%_100%]">
            <TrendingUp className="h-4 w-4 text-primary" />
            <span className="text-xs font-semibold text-primary">2,000+ students enrolled this cycle</span>
          </div>
          <h1 className="text-3xl md:text-5xl lg:text-7xl font-bold leading-tight tracking-[-0.02em] text-foreground">
            From CAT Preparation to 95+ Percentile : <span className="text-primary">With Structure.</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-lg">
            Proven CAT coaching + strategic planning tools to help you prepare smarter for CAT 2026 and beyond.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button size="lg" className="animate-pulse-glow text-sm md:text-base font-bold px-6 py-5 md:px-8 md:py-6 rounded-xl shadow-lg w-full sm:w-auto" onClick={() => setPlannerOpen(true)}>
              <Target className="mr-1 h-5 w-5" /> Evaluate My Profile <ArrowRight className="ml-1 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="text-sm md:text-base font-bold px-6 py-5 md:px-8 md:py-6 rounded-xl border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all w-full sm:w-auto" onClick={() => {
              openContentGate("hero_masterclass", () => {
                window.location.href = "/masterclass";
              });
            }}>
              Watch Free Masterclass
            </Button>
          </div>
        </motion.div>

        <motion.div className="grid grid-cols-2 gap-3 md:gap-4" variants={container} initial="hidden" animate="show">
          {scorecards.map((s, i) => (
            <motion.a href={s.linkedin} target="_blank" rel="noopener noreferrer" key={s.name} variants={item} whileHover={{ y: -6, scale: 1.03 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
              <Card className="p-3 md:p-5 space-y-2 md:space-y-3 hover:shadow-xl transition-shadow duration-300 cursor-pointer group relative overflow-hidden bg-card/80 backdrop-blur-sm border-border/40">
                <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 rounded-bl-full" />
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 md:h-14 md:w-14 ring-2 ring-primary/20 group-hover:ring-primary/50 transition-all bg-muted overflow-hidden">
                    <AvatarImage src={s.photo} alt={s.name} width={56} height={56} className="object-cover object-top scale-[1.6] translate-y-[10%]" />
                    <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">{s.initials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-sm text-foreground">{s.name}</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <GraduationCap className="h-3 w-3" />
                      {s.college}
                    </div>
                  </div>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <p className="text-2xl md:text-3xl font-bold text-primary group-hover:scale-105 transition-transform origin-left">
                    <AnimatedNumber target={s.percentile} />
                  </p>
                  <span className="text-xs font-medium text-muted-foreground">%ile</span>
                </div>
                <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                  <motion.div className="h-full bg-primary rounded-full" initial={{ width: 0 }} whileInView={{ width: `${parseFloat(s.percentile)}%` }} viewport={{ once: true }} transition={{ duration: 1.2, delay: i * 0.15, ease: "easeOut" }} />
                </div>
              </Card>
            </motion.a>
          ))}
        </motion.div>
      </div>
      {plannerOpen && (
        <Suspense fallback={null}>
          <PercentilePlannerModal open={plannerOpen} onOpenChange={setPlannerOpen} />
        </Suspense>
      )}
    </section>
  );
};

export default HeroSection;
