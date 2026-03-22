import { useNavigate } from "react-router-dom";
import { Flame, BookOpen, FlaskConical, CalendarCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useInView } from "@/hooks/useInView";
import { useAuth } from "@/hooks/useAuth";

const features = [
  { icon: Flame, label: "Daily Streaks" },
  { icon: BookOpen, label: "Flashcards" },
  { icon: FlaskConical, label: "Practice Lab" },
  { icon: CalendarCheck, label: "Study Planner" },
];

export default function DashboardCTASection() {
  const navigate = useNavigate();
  const { ref, inView } = useInView<HTMLElement>();
  const { isAuthenticated } = useAuth();

  return (
    <section
      ref={ref}
      className="relative overflow-hidden py-16 sm:py-20 md:py-24 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent"
    >
      {/* decorative blobs */}
      <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full bg-primary/8 blur-3xl pointer-events-none" />

      <div
        className="container mx-auto px-4 md:px-6 max-w-3xl text-center relative z-10 transition-all duration-700"
        style={{
          opacity: inView ? 1 : 0,
          transform: inView ? "translateY(0)" : "translateY(28px)",
        }}
      >
        <p className="text-primary font-semibold text-sm tracking-wide uppercase mb-3">
          100% Free — No Card Needed
        </p>

        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground leading-tight mb-4">
          Your Free CAT Command Center Awaits
        </h2>

        <p className="text-muted-foreground text-sm sm:text-base md:text-lg max-w-xl mx-auto mb-8">
          Sign in and instantly unlock streaks, flashcards, a practice lab, and a personalized study plan — all built for serious CAT aspirants.
        </p>

        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {features.map(({ icon: Icon, label }) => (
            <span
              key={label}
              className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm font-medium text-foreground"
            >
              <Icon size={16} className="text-primary" />
              {label}
            </span>
          ))}
        </div>

        <Button
          size="lg"
          onClick={() => navigate("/dashboard")}
          className="px-10 py-3 text-base font-semibold rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-shadow"
        >
          {isAuthenticated ? "Go to Dashboard" : "Sign Up Free & Start Learning"}
        </Button>
      </div>
    </section>
  );
}
