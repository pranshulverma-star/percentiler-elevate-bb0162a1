import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BookOpen, Users, Swords } from "lucide-react";

const ctas = [
  {
    icon: BookOpen,
    title: "Access Our CAT Courses",
    description: "Courses curated by top IIM Faculties and 7 Times CAT 100%iler",
    link: "/courses/cat-omet",
    label: "Checkout Now",
  },
  {
    icon: Users,
    title: "Mentorship Programs",
    description: "The right mentorship makes the difference between a 90 and a 99%iler.",
    link: "/mentorship",
    label: "Explore Mentorship",
  },
  {
    icon: Swords,
    title: "Practice Lab — Battle Mode",
    description: "Topic Tests just got an upgrade. Invite friends to a challenge and ace topics together.",
    link: "/practice-lab",
    label: "Start Practicing",
  },
];

/** Mid-article CTA inserted after ~50% of content */
export const MidArticleCTA = () => (
  <div className="my-8 rounded-xl bg-primary/5 border border-primary/20 p-5 text-center">
    <p className="text-lg font-bold text-foreground mb-1">Your CAT Course is waiting for you! 🎯</p>
    <p className="text-sm text-muted-foreground mb-3">
      Join thousands of aspirants preparing with India's top CAT mentors.
    </p>
    <Button asChild size="sm">
      <Link to="/courses/cat-omet">Check Courses</Link>
    </Button>
  </div>
);

/** Bottom CTA cards matching old site pattern */
const BlogCTABanner = () => (
  <section className="mt-10 pt-8 border-t border-border">
    <h2 className="text-xl font-bold text-foreground mb-5">Stay Up to Date in Your CAT Journey</h2>
    <div className="grid gap-4 sm:grid-cols-3">
      {ctas.map((cta) => (
        <Link
          key={cta.link}
          to={cta.link}
          className="group flex flex-col gap-2 rounded-xl border border-border bg-card p-5 hover:shadow-lg transition-shadow"
        >
          <cta.icon className="h-6 w-6 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">{cta.title}</h3>
          <p className="text-xs text-muted-foreground flex-1">{cta.description}</p>
          <span className="text-xs font-medium text-primary group-hover:underline mt-1">{cta.label} →</span>
        </Link>
      ))}
    </div>
  </section>
);

export default BlogCTABanner;
