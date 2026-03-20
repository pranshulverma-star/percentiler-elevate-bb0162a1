import { Lightbulb, ArrowRight, GraduationCap, Users, BookOpen, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
}

const MENTORSHIP_LINK = "/mentorship";
const COURSES_LINK = "/cat-omet-courses";

export default function DashboardRecommendations({ practiceAttempts, converted, mentorshipActive, streakData }: Props) {
  const recommendations = useMemo(() => {
    const recs: Rec[] = [];
    const avgAccuracy = streakData?.avgAccuracy ?? 0;
    const currentStreak = streakData?.currentStreak ?? 0;
    const hasAttempts = practiceAttempts.length > 0;

    // Weak section workshop
    const weakWorkshop = getWeakSectionWorkshop(practiceAttempts);

    // 1. No practice attempts → promote course + mentorship
    if (!hasAttempts) {
      if (!converted) {
        recs.push({
          name: "CAT + OMET Complete",
          tagline: "Start your CAT journey with a structured course",
          type: "Course",
          icon: GraduationCap,
          to: COURSES_LINK,
          free: false,
          priority: 1,
        });
      }
      if (!mentorshipActive) {
        recs.push({
          name: "1-on-1 Mentorship",
          tagline: "Get a personalized strategy from an expert",
          type: "Mentorship",
          icon: Users,
          to: MENTORSHIP_LINK,
          free: false,
          priority: 2,
        });
      }
      recs.push({
        name: "Practice Lab",
        tagline: "Start with free section-wise quizzes",
        type: "Free",
        icon: Zap,
        to: "/practice-lab",
        free: true,
        priority: 3,
      });
      return recs.slice(0, 3);
    }

    // 2. Low accuracy (<50%) → mentorship + workshop
    if (avgAccuracy < 50) {
      if (!mentorshipActive) {
        recs.push({
          name: "1-on-1 Mentorship",
          tagline: `Your accuracy is ${avgAccuracy}% — a mentor can help`,
          type: "Mentorship",
          icon: Users,
          to: MENTORSHIP_LINK,
          free: false,
          priority: 1,
        });
      }
      if (weakWorkshop) {
        recs.push({
          name: weakWorkshop.name,
          tagline: `Boost your weakest section`,
          type: `₹${weakWorkshop.salePrice}`,
          icon: BookOpen,
          to: weakWorkshop.link,
          free: false,
          external: true,
          priority: 2,
        });
      }
    }

    // 3. Medium accuracy (50-70%) → workshop + course
    if (avgAccuracy >= 50 && avgAccuracy < 70) {
      if (weakWorkshop) {
        recs.push({
          name: weakWorkshop.name,
          tagline: `Target your weak area for 80%+`,
          type: `₹${weakWorkshop.salePrice}`,
          icon: BookOpen,
          to: weakWorkshop.link,
          free: false,
          external: true,
          priority: 1,
        });
      }
      if (!converted) {
        recs.push({
          name: "Full Course Access",
          tagline: "Structured prep to push past 90%ile",
          type: "Course",
          icon: GraduationCap,
          to: COURSES_LINK,
          free: false,
          priority: 2,
        });
      }
    }

    // 4. Good accuracy (>70%) but low streak → consistency coaching
    if (avgAccuracy >= 70 && currentStreak < 3 && !mentorshipActive) {
      recs.push({
        name: "Consistency Coaching",
        tagline: `${avgAccuracy}% accuracy but only ${currentStreak} day streak — stay on track`,
        type: "Mentorship",
        icon: Users,
        to: MENTORSHIP_LINK,
        free: false,
        priority: 1,
      });
    }

    // 5. Always include course if not converted
    if (!converted && !recs.some((r) => r.type === "Course")) {
      recs.push({
        name: "CAT + OMET Complete",
        tagline: "Unlock full course access for comprehensive prep",
        type: "Course",
        icon: GraduationCap,
        to: COURSES_LINK,
        free: false,
        priority: 10,
      });
    }

    // 6. Always include a free tool
    recs.push({
      name: "QA Flashcards",
      tagline: "Quick daily formula revision",
      type: "Free",
      icon: Zap,
      to: "/flashcards",
      free: true,
      priority: 20,
    });

    // Sort by priority and take top 3
    recs.sort((a, b) => a.priority - b.priority);
    // Deduplicate by name
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
      <p className="text-[11px] text-muted-foreground mb-3">Based on your progress</p>

      <div className="flex gap-3 overflow-x-auto scrollbar-none pb-1">
        {recommendations.map((rec) => {
          const Icon = rec.icon;
          const inner = (
            <div className="flex flex-col h-full">
              <div className="flex items-center gap-1.5 mb-2">
                <Icon className="h-3.5 w-3.5 text-primary shrink-0" />
                <p className="text-xs font-medium text-foreground line-clamp-1 leading-tight">{rec.name}</p>
              </div>
              <p className="text-[10px] text-muted-foreground leading-snug line-clamp-2 mb-auto">{rec.tagline}</p>
              <div className="flex items-center justify-between mt-2">
                <Badge variant={rec.free ? "secondary" : "outline"} className="text-[8px]">
                  {rec.free ? "Free" : rec.type}
                </Badge>
                <ArrowRight className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </div>
          );

          const cls = "shrink-0 w-40 rounded-xl border border-border/40 bg-card p-3 hover:border-primary/30 transition-colors group";

          return rec.external ? (
            <a key={rec.name} href={rec.to} target="_blank" rel="noopener noreferrer" className={cls}>
              {inner}
            </a>
          ) : (
            <Link key={rec.name} to={rec.to} className={cls}>
              {inner}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
