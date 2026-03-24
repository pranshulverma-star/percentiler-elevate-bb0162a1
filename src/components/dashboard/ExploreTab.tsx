import { GraduationCap, Users, ClipboardList, Wrench, BookOpen, Phone, Compass, Lightbulb, ArrowRight, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useMemo } from "react";
import { getWeakSectionWorkshop } from "@/components/WorkshopRecommendation";

const tiles = [
  { icon: GraduationCap, label: "Courses", to: "/courses/cat-omet", color: "hsl(var(--primary))", bg: "from-primary/10 to-primary/[0.02]" },
  { icon: ClipboardList, label: "Test Series", to: "/test-series", color: "hsl(220 70% 55%)", bg: "from-blue-500/10 to-blue-500/[0.02]" },
  { icon: Users, label: "Mentorship", to: "/mentorship", color: "hsl(280 60% 55%)", bg: "from-purple-500/10 to-purple-500/[0.02]" },
  { icon: Wrench, label: "Workshops", to: "/workshops", color: "hsl(160 60% 45%)", bg: "from-emerald-500/10 to-emerald-500/[0.02]" },
  { icon: BookOpen, label: "Free Courses", to: "/free-courses", color: "hsl(45 93% 47%)", bg: "from-amber-500/10 to-amber-500/[0.02]" },
  { icon: Phone, label: "Strategy Call", to: "/mentorship", color: "hsl(340 65% 55%)", bg: "from-pink-500/10 to-pink-500/[0.02]" },
];

interface Props {
  practiceAttempts: any[];
  converted: boolean;
  mentorshipActive: boolean;
  streakData: any;
}

const fade = (i: number) => ({
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: i * 0.06, duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
});

interface Rec {
  name: string;
  tagline: string;
  type: string;
  icon: typeof Zap;
  to: string;
  free: boolean;
  external?: boolean;
  accentColor: string;
}

export default function ExploreTab({ practiceAttempts, converted, mentorshipActive, streakData }: Props) {
  const recommendations = useMemo(() => {
    const recs: Rec[] = [];
    const avgAccuracy = streakData?.avgAccuracy ?? 0;
    const currentStreak = streakData?.currentStreak ?? 0;
    const hasAttempts = practiceAttempts.length > 0;
    const weakWorkshop = getWeakSectionWorkshop(practiceAttempts);

    if (!hasAttempts) {
      if (!converted) recs.push({ name: "CAT + OMET Complete", tagline: "Start your CAT journey with full access", type: "Course", icon: GraduationCap, to: "/cat-omet-courses", free: false, accentColor: "hsl(var(--primary))" });
      if (!mentorshipActive) recs.push({ name: "1-on-1 Mentorship", tagline: "Get expert strategy & guidance", type: "Mentorship", icon: Users, to: "/mentorship", free: false, accentColor: "hsl(280 60% 55%)" });
      recs.push({ name: "Practice Lab", tagline: "Free section-wise quizzes to start", type: "Free", icon: Zap, to: "/practice-lab", free: true, accentColor: "hsl(160 60% 45%)" });
    } else {
      if (avgAccuracy < 50 && !mentorshipActive) recs.push({ name: "1-on-1 Mentorship", tagline: `Accuracy ${avgAccuracy}% — a mentor helps`, type: "Mentorship", icon: Users, to: "/mentorship", free: false, accentColor: "hsl(280 60% 55%)" });
      if (weakWorkshop) recs.push({ name: weakWorkshop.name, tagline: "Boost your weak section fast", type: `₹${weakWorkshop.salePrice}`, icon: BookOpen, to: weakWorkshop.link, free: false, external: true, accentColor: "hsl(220 70% 55%)" });
      if (!converted) recs.push({ name: "Full Course Access", tagline: "Structured prep for 90%ile+", type: "Course", icon: GraduationCap, to: "/cat-omet-courses", free: false, accentColor: "hsl(var(--primary))" });
      recs.push({ name: "Study Planner", tagline: "Your personalized daily study plan", type: "Free", icon: BookOpen, to: "/cat-daily-study-planner", free: true, accentColor: "hsl(25 95% 53%)" });
      if (avgAccuracy >= 70 && currentStreak < 3 && !mentorshipActive) recs.push({ name: "Consistency Coaching", tagline: "Stay on track daily", type: "Mentorship", icon: Users, to: "/mentorship", free: false, accentColor: "hsl(280 60% 55%)" });
      recs.push({ name: "QA Flashcards", tagline: "Quick formula revision anytime", type: "Free", icon: Zap, to: "/flashcards", free: true, accentColor: "hsl(160 60% 45%)" });
    }

    const seen = new Set<string>();
    return recs.filter(r => { if (seen.has(r.name)) return false; seen.add(r.name); return true; }).slice(0, 3);
  }, [practiceAttempts, converted, mentorshipActive, streakData]);

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Recommended for You — full-width stacked cards */}
      {recommendations.length > 0 && (
        <motion.div {...fade(0)}>
          <div className="flex items-center gap-2 mb-2.5">
            <Lightbulb className="h-4 w-4 text-primary" />
            <span className="text-sm font-bold text-foreground">Recommended for You</span>
          </div>
          <div className="space-y-2.5">
            {recommendations.map((rec) => {
              const Icon = rec.icon;
              const inner = (
                <div className="relative overflow-hidden rounded-xl border border-border/40 bg-gradient-to-r from-card via-card to-background backdrop-blur-xl p-4 group hover:border-primary/30 transition-all shadow-sm">
                  <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl" style={{ background: rec.accentColor }} />
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${rec.accentColor}20` }}>
                      <Icon className="h-5 w-5" style={{ color: rec.accentColor }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-foreground">{rec.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{rec.tagline}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${rec.free ? "bg-emerald-500/15 text-emerald-600" : "bg-primary/10 text-primary"}`}>
                        {rec.free ? "Free" : rec.type}
                      </span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </div>
                </div>
              );
              return rec.external ? (
                <a key={rec.name} href={rec.to} target="_blank" rel="noopener noreferrer">{inner}</a>
              ) : (
                <Link key={rec.name} to={rec.to}>{inner}</Link>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Explore Grid — flex-1, bigger tiles */}
      <motion.div {...fade(1)} className="flex-1 min-h-0">
        <div className="flex items-center gap-2 mb-2.5">
          <Compass className="h-4 w-4 text-primary" />
          <span className="text-sm font-bold text-foreground">Explore</span>
        </div>
        <div className="grid grid-cols-3 gap-2.5 h-[calc(100%-28px)]">
          {tiles.map((t) => {
            const Icon = t.icon;
            return (
              <Link
                key={t.label}
                to={t.to}
                className={`flex flex-col items-center justify-center gap-2 rounded-xl bg-gradient-to-br ${t.bg} backdrop-blur-xl border border-border/30 hover:border-primary/20 hover:shadow-lg transition-all group`}
              >
                <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: `${t.color}15` }}>
                  <Icon className="h-6 w-6 group-hover:scale-110 transition-transform" style={{ color: t.color }} />
                </div>
                <span className="text-xs font-semibold text-muted-foreground group-hover:text-foreground transition-colors text-center leading-tight">{t.label}</span>
              </Link>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
