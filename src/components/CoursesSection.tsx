import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const courses = [
  {
    name: "CAT Complete Program",
    highlights: ["Full syllabus coverage with 200+ hours", "Weekly mock tests with detailed analysis", "1-on-1 mentor sessions"],
  },
  {
    name: "CAT Crash Course",
    highlights: ["Intensive 90-day structured program", "Focus on high-weightage topics", "Daily practice sets + strategy calls"],
  },
  {
    name: "CAT Test Series",
    highlights: ["30 full-length mocks (latest pattern)", "Sectional tests for targeted practice", "Percentile predictor + analytics dashboard"],
  },
];

const CoursesSection = () => (
  <section id="courses" className="py-20 bg-background">
    <div className="container mx-auto px-4 md:px-6">
      <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-12">
        Our Programs
      </h2>
      <div className="grid md:grid-cols-3 gap-6">
        {courses.map((c) => (
          <Card key={c.name} className="p-6 flex flex-col justify-between h-full">
            <div>
              <h3 className="text-xl font-bold text-foreground mb-4">{c.name}</h3>
              <ul className="space-y-2 mb-6">
                {c.highlights.map((h) => (
                  <li key={h} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-primary font-bold">•</span> {h}
                  </li>
                ))}
              </ul>
            </div>
            <Button variant="outline" className="w-full" asChild>
              <a href="#">Explore Program</a>
            </Button>
          </Card>
        ))}
      </div>
    </div>
  </section>
);

export default CoursesSection;
