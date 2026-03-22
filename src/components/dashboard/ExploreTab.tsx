import { GraduationCap, Users, ClipboardList, Wrench, BookOpen, Phone, Compass, Lightbulb, ArrowRight, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useMemo } from "react";
import { getWeakSectionWorkshop } from "@/components/WorkshopRecommendation";

const tiles = [
  { icon: GraduationCap, label: "Courses", to: "/courses/cat-omet", color: "hsl(var(--primary))" },
  { icon: ClipboardList, label: "Test Series", to: "/test-series", color: "hsl(220 70% 55%)" },
  { icon: Users, label: "Mentorship", to: "/mentorship", color: "hsl(280 60% 55%)" },
  { icon: Wrench, label: "Workshops", to: "/workshops", color: "hsl(160 60% 45%)" },
  { icon: BookOpen, label: "Free Courses", to: "/free-courses", color: "hsl(45 93% 47%)" },
  { icon: Phone, label: "Strategy Call", to: "/mentorship", color: "hsl(340 65% 55%)" },
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
      if (!converted) recs.push({ name: "CAT + OMET Complete", tagline: "Start your CAT journey", type: "Course", icon: GraduationCap, to: "/cat-omet-courses", free: false, accentColor: "hsl(var(--primary))" });
      if (!mentorshipActive) recs.push({ name: "1-on-1 Mentorship", tagline: "Get expert strategy", type: "Mentorship", icon: Users, to: "/mentorship", free: false, accentColor: "hsl(280 60% 55%)" });
      recs.push({ name: "Practice Lab", tagline: "Free section-wise quizzes", type: "Free", icon: Zap, to: "/practice-lab", free: true, accentColor: "hsl(160 60% 45%)" });
    } else {
      if (avgAccuracy < 50 && !mentorshipActive) recs.push({ name: "1-on-1 Mentorship", tagline: `Accuracy ${avgAccuracy}% — a mentor helps`, type: "Mentorship", icon: Users, to: "/mentorship", free: false, accentColor: "hsl(280 60% 55%)" });
      if (weakWorkshop) recs.push({ name: weakWorkshop.name, tagline: "Boost your weak section", type: `₹${weakWorkshop.salePrice}`, icon: BookOpen, to: weakWorkshop.link, free: false, external: true, accentColor: "hsl(220 70% 55%)" });
      if (!converted) recs.push({ name: "Full Course Access", tagline: "Structured prep for 90%ile+", type: "Course", icon: GraduationCap, to: "/cat-omet-courses", free: false, accentColor: "hsl(var(--primary))" });
      if (avgAccuracy >= 70 && currentStreak < 3 && !mentorshipActive) recs.push({ name: "Consistency Coaching", tagline: "Stay on track daily", type: "Mentorship", icon: Users, to: "/mentorship", free: false, accentColor: "hsl(280 60% 55%)" });
      recs.push({ name: "QA Flashcards", tagline: "Quick formula revision", type: "Free", icon: Zap, to: "/flashcards", free: true, accentColor: "hsl(160 60% 45%)" });
    }

    const seen = new Set<string>();
    return recs.filter(r => { if (seen.has(r.name)) return false; seen.add(r.name); return true; }).slice(0, 3);
  }, [practiceAttempts, converted, mentorshipActive, streakData]);

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Recommended for You */}
      {recommendations.length > 0 && (
        <motion.div {...fade(0)}>
          <div className="flex items-center gap-1.5 mb-2">
            <Lightbulb className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-semibold text-foreground">Recommended</span>
          </div>
          <div className="flex gap-2.5 overflow-x-auto scrollbar-none pb-1">
            {recommendations.map((rec) => {
              const Icon = rec.icon;
              const inner = (
                <div className="relative overflow-hidden rounded-xl border border-border/40 bg-card/80 backdrop-blur-xl p-3 w-40 shrink-0 group hover:border-primary/30 transition-all">
                  <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-xl" style={{ background: rec.accentColor }} />
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Icon className="h-3.5 w-3.5 shrink-0" style={{ color: rec.accentColor }} />
                    <p className="text-[11px] font-semibold text-foreground line-clamp-1">{rec.name}</p>
                  </div>
                  <p className="text-[9px] text-muted-foreground leading-snug line-clamp-2 mb-2">{rec.tagline}</p>
                  <div className="flex items-center justify-between">
                    <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full ${rec.free ? "bg-emerald-500/15 text-emerald-600" : "bg-primary/10 text-primary"}`}>
                      {rec.free ? "Free" : rec.type}
                    </span>
                    <ArrowRight className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors" />
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

      {/* Explore Grid */}
      <motion.div {...fade(1)} className="flex-1">
        <div className="flex items-center gap-1.5 mb-2">
          <Compass className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-semibold text-foreground">Explore</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {tiles.map((t) => {
            const Icon = t.icon;
            return (
              <Link
                key={t.label}
                to={t.to}
                className="flex flex-col items-center gap-1.5 py-3.5 rounded-xl bg-card/80 backdrop-blur-xl border border-border/30 hover:border-primary/20 hover:shadow-lg transition-all group"
              >
                <Icon className="h-5 w-5 group-hover:scale-110 transition-transform" style={{ color: t.color }} />
                <span className="text-[10px] font-medium text-muted-foreground group-hover:text-foreground transition-colors text-center leading-tight">{t.label}</span>
              </Link>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
