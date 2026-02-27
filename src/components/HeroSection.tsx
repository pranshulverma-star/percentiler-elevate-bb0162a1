import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, TrendingUp, GraduationCap, Target, Phone, Award } from "lucide-react";
import { useEffect, useRef, lazy, Suspense } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useLeadModal } from "@/components/LeadModalProvider";
import { supabase } from "@/integrations/supabase/client";
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

const AnimatedProgressBar = ({ percentile, delay }: { percentile: number; delay: number }) => {
  const ref = useRef<HTMLDivElement>(null);
  const animated = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !animated.current) {
          animated.current = true;
          setTimeout(() => {
            el.style.width = `${percentile}%`;
          }, delay * 1000);
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [percentile, delay]);

  return (
    <div
      ref={ref}
      className="h-full bg-primary rounded-full transition-[width] duration-[1200ms] ease-out"
      style={{ width: 0 }}
    />
  );
};

const collegeNames = ["IIM A", "IIM B", "IIM C", "FMS Delhi", "XLRI", "SP Jain", "IIT Bombay", "JBIMS"];

const HeroCollegeMarquee = () => (
  <div className="md:hidden relative overflow-hidden rounded-lg border border-border/50 bg-secondary/30 py-2">
    <p className="text-center text-[9px] font-semibold tracking-[0.2em] uppercase text-muted-foreground mb-1.5">
      <Award className="inline h-3 w-3 mr-1 -mt-0.5" />Students in
    </p>
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-y-0 left-0 w-8 z-10 bg-gradient-to-r from-secondary/30 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-8 z-10 bg-gradient-to-l from-secondary/30 to-transparent" />
      <div className="flex animate-scroll-x items-center gap-5 w-max">
        {[...collegeNames, ...collegeNames].map((name, i) => (
          <span
            key={`${name}-${i}`}
            className="shrink-0 text-xs font-bold tracking-wide text-foreground/80 whitespace-nowrap px-2.5 py-1 rounded-full bg-primary/8 border border-primary/15"
          >
            {name}
          </span>
        ))}
      </div>
    </div>
  </div>
);

const HeroSection = () => {
  const { openContentGate, openPhoneModal } = useLeadModal();
  const [plannerOpen, setPlannerOpen] = useState(false);

  const handleStrategyCall = () => {
    const phone = localStorage.getItem("percentilers_phone") || "";
    if (phone) {
      supabase.functions.invoke("mark-lead-hot", {
        body: { phone_number: phone, source: "hero_strategy_call", name: localStorage.getItem("percentilers_name") || null },
      }).catch(() => {});
      window.location.href = "tel:+919911928071";
    } else {
      openPhoneModal("hero_strategy_call", () => {
        const newPhone = localStorage.getItem("percentilers_phone") || "";
        if (newPhone) {
          supabase.functions.invoke("mark-lead-hot", {
            body: { phone_number: newPhone, source: "hero_strategy_call", name: localStorage.getItem("percentilers_name") || null },
          }).catch(() => {});
        }
        window.location.href = "tel:+919911928071";
      });
    }
  };
  return (
    <section className="pt-6 pb-10 md:pt-10 md:pb-16 bg-background overflow-hidden relative">
      <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-primary/[0.04] blur-[100px] pointer-events-none" />
      <div className="container mx-auto px-4 md:px-6 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-1.5 animate-shimmer bg-gradient-to-r from-primary/5 via-primary/15 to-primary/5 bg-[length:200%_100%]">
            <TrendingUp className="h-4 w-4 text-primary" />
            <span className="text-xs font-semibold text-primary">2,000+ students enrolled this cycle</span>
          </div>
          <h1 className="text-3xl md:text-5xl lg:text-7xl font-bold leading-tight tracking-[-0.02em] text-foreground">
            From CAT Preparation to 95+ Percentile : <span className="text-primary">With Structure.</span>
          </h1>
          {/* Desktop: paragraph | Mobile: college marquee */}
          <p className="hidden md:block text-lg text-muted-foreground max-w-lg">
            Proven CAT coaching + strategic planning tools to help you prepare smarter for CAT 2026 and beyond.
          </p>
          <HeroCollegeMarquee />
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button size="lg" className="animate-pulse-glow text-sm md:text-base font-bold px-6 py-5 md:px-8 md:py-6 rounded-xl shadow-lg w-full sm:w-auto" onClick={() => setPlannerOpen(true)}>
              <Target className="mr-1 h-5 w-5" /> Evaluate My Profile <ArrowRight className="ml-1 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="text-sm md:text-base font-bold px-6 py-5 md:px-8 md:py-6 rounded-xl border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all w-full sm:w-auto" onClick={handleStrategyCall}>
              <Phone className="mr-1 h-5 w-5" /> Book Free Strategy Call
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 md:gap-4">
          {scorecards.map((s, i) => (
            <a href={s.linkedin} target="_blank" rel="noopener noreferrer" key={s.name} className="hover:-translate-y-1.5 hover:scale-[1.03] transition-transform">
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
                  <AnimatedProgressBar percentile={parseFloat(s.percentile)} delay={i * 0.15} />
                </div>
              </Card>
            </a>
          ))}
        </div>
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
