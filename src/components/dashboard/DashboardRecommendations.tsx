import { Lightbulb, ArrowRight, GraduationCap, Users, BookOpen, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { getWeakSectionWorkshop } from "@/components/WorkshopRecommendation";
import { useMemo } from "react";

interface Props {
  practiceAttempts: any[];
  converted?: boolean;
  mentorshipActive?: boolean;
  streakData?: { currentStreak: number; avgAccuracy: number };
}

interface Rec {
  name: string;
  tagline: string;
  type: string;
  icon: typeof Zap;
  to: string;
  free: boolean;
  external?: boolean;
  priority: number;
  accentColor: string;
}

const MENTORSHIP_LINK = "/mentorship";
const COURSES_LINK = "/cat-omet-courses";

export default function DashboardRecommendations({ practiceAttempts, converted, mentorshipActive, streakData }: Props) {
  const recommendations = useMemo(() => {
    const recs: Rec[] = [];
    const avgAccuracy = streakData?.avgAccuracy ?? 0;
    const currentStreak = streakData?.currentStreak ?? 0;
    const hasAttempts = practiceAttempts.length > 0;
    const weakWorkshop = getWeakSectionWorkshop(practiceAttempts);

    if (!hasAttempts) {
      if (!converted) {
        recs.push({ name: "CAT + OMET Complete", tagline: "Start your CAT journey with a structured course", type: "Course", icon: GraduationCap, to: COURSES_LINK, free: false, priority: 1, accentColor: "hsl(var(--primary))" });
      }
      if (!mentorshipActive) {
        recs.push({ name: "1-on-1 Mentorship", tagline: "Get a personalized strategy from an expert", type: "Mentorship", icon: Users, to: MENTORSHIP_LINK, free: false, priority: 2, accentColor: "hsl(280 60% 55%)" });
      }
      recs.push({ name: "Practice Lab", tagline: "Start with free section-wise quizzes", type: "Free", icon: Zap, to: "/practice-lab", free: true, priority: 3, accentColor: "hsl(160 60% 45%)" });
      return recs.slice(0, 3);
    }

    if (avgAccuracy < 50) {
      if (!mentorshipActive) {
        recs.push({ name: "1-on-1 Mentorship", tagline: `Your accuracy is ${avgAccuracy}% — a mentor can help`, type: "Mentorship", icon: Users, to: MENTORSHIP_LINK, free: false, priority: 1, accentColor: "hsl(280 60% 55%)" });
      }
      if (weakWorkshop) {
        recs.push({ name: weakWorkshop.name, tagline: `Boost your weakest section`, type: `₹${weakWorkshop.salePrice}`, icon: BookOpen, to: weakWorkshop.link, free: false, external: true, priority: 2, accentColor: "hsl(220 70% 55%)" });
      }
    }

    if (avgAccuracy >= 50 && avgAccuracy < 70) {
      if (weakWorkshop) {
        recs.push({ name: weakWorkshop.name, tagline: `Target your weak area for 80%+`, type: `₹${weakWorkshop.salePrice}`, icon: BookOpen, to: weakWorkshop.link, free: false, external: true, priority: 1, accentColor: "hsl(220 70% 55%)" });
      }
      if (!converted) {
        recs.push({ name: "Full Course Access", tagline: "Structured prep to push past 90%ile", type: "Course", icon: GraduationCap, to: COURSES_LINK, free: false, priority: 2, accentColor: "hsl(var(--primary))" });
      }
    }

    if (avgAccuracy >= 70 && currentStreak < 3 && !mentorshipActive) {
      recs.push({ name: "Consistency Coaching", tagline: `${avgAccuracy}% accuracy but only ${currentStreak} day streak — stay on track`, type: "Mentorship", icon: Users, to: MENTORSHIP_LINK, free: false, priority: 1, accentColor: "hsl(280 60% 55%)" });
    }

    if (!converted && !recs.some((r) => r.type === "Course")) {
      recs.push({ name: "CAT + OMET Complete", tagline: "Unlock full course access for comprehensive prep", type: "Course", icon: GraduationCap, to: COURSES_LINK, free: false, priority: 10, accentColor: "hsl(var(--primary))" });
    }

    recs.push({ name: "QA Flashcards", tagline: "Quick daily formula revision", type: "Free", icon: Zap, to: "/flashcards", free: true, priority: 20, accentColor: "hsl(160 60% 45%)" });

    recs.sort((a, b) => a.priority - b.priority);
    const seen = new Set<string>();
    return recs.filter((r) => { if (seen.has(r.name)) return false; seen.add(r.name); return true; }).slice(0, 3);
  }, [practiceAttempts, converted, mentorshipActive, streakData]);

  if (recommendations.length === 0) return null;

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Lightbulb className="h-4 w-4 text-primary" />
        <span className="text-sm font-semibold text-foreground">Recommended for you</span>
      </div>

      <div className="flex gap-3 overflow-x-auto scrollbar-none pb-1">
        {recommendations.map((rec) => {
          const Icon = rec.icon;
          const inner = (
            <div className="relative overflow-hidden rounded-xl border border-border/40 bg-card/80 backdrop-blur-sm p-4 w-48 shrink-0 group hover:border-primary/30 hover:shadow-lg transition-all duration-300">
              {/* Top accent line */}
              <div className="absolute top-0 left-0 right-0 h-1 rounded-t-xl" style={{ background: rec.accentColor }} />
              {/* Glow */}
              <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full blur-xl opacity-20 pointer-events-none" style={{ background: rec.accentColor }} />

              <div className="flex items-center gap-1.5 mb-2 mt-1">
                <Icon className="h-4 w-4 shrink-0" style={{ color: rec.accentColor }} />
                <p className="text-xs font-semibold text-foreground line-clamp-1 leading-tight">{rec.name}</p>
              </div>
              <p className="text-[11px] text-muted-foreground leading-snug line-clamp-2 mb-3">{rec.tagline}</p>

              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${rec.free ? "bg-emerald-500/15 text-emerald-600" : "bg-primary/10 text-primary"}`}>
                  {rec.free ? "Free" : rec.type}
                </span>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
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
    </div>
  );
}
