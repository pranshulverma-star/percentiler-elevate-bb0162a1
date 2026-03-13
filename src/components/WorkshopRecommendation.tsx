import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, TrendingUp, BookOpen } from "lucide-react";
import { motion } from "framer-motion";

interface Workshop {
  name: string;
  tag: string;
  salePrice: number;
  originalPrice: number;
  link: string;
  trending?: boolean;
}

const ALL_WORKSHOPS: Workshop[] = [
  { name: "LRDI Booster Course", tag: "LRDI", salePrice: 1499, originalPrice: 2599, link: "https://online.percentilers.in/courses/LRDI-BOOSTER-COURSE-FOR-CAT-61406e420cf25c0a56daf457", trending: true },
  { name: "Arithmetic Workshop", tag: "QA", salePrice: 999, originalPrice: 2000, link: "https://online.percentilers.in/courses/Arithmetic-Workshop-610272d40cf2ba896eaf2e57", trending: true },
  { name: "Geometry Workshop", tag: "QA", salePrice: 799, originalPrice: 1699, link: "https://online.percentilers.in/courses/Geometryworkshop-60e55a660cf24f6d1fed932d", trending: true },
  { name: "Algebra Workshop", tag: "QA", salePrice: 899, originalPrice: 2499, link: "https://online.percentilers.in/courses/Algebra-Workshop-5f4e9b880cf244357e6515cc" },
  { name: "RC & Critical Reasoning Workshop", tag: "VARC", salePrice: 999, originalPrice: 2899, link: "https://online.percentilers.in/courses/Reading-Comprehension--Critical-Reasoning-Workshop-5f5f9d1a0cf20a7044de3af9", trending: true },
  { name: "Modern Maths Workshop", tag: "QA", salePrice: 699, originalPrice: 1553, link: "https://online.percentilers.in/courses/Modern-Maths-Workshop-CAT-613e3e330cf2f7bcf9666501" },
  { name: "OMET Booster Course", tag: "OMET", salePrice: 1899, originalPrice: 6599, link: "https://online.percentilers.in/courses/BOOSTER-COURSE--SNAP--NMAT--IIFT--TISS-MAT--CMAT-5fb8ba110cf291a16ac22abd" },
];

// Keywords in chapter slugs/names mapped to workshop indices
const QA_KEYWORD_MAP: Record<string, number[]> = {
  arithmetic: [1],
  percentage: [1],
  ratio: [1],
  profit: [1],
  "time-speed": [1],
  "time-work": [1],
  averages: [1],
  mixtures: [1],
  geometry: [2],
  triangle: [2],
  circle: [2],
  mensuration: [2],
  coordinate: [2],
  algebra: [3],
  equation: [3],
  inequalit: [3],
  quadratic: [3],
  function: [3, 5],
  logarithm: [3],
  progression: [3],
  "modern-maths": [5],
  "number-system": [3],
  permutation: [5],
  combination: [5],
  probability: [5],
  "set-theory": [5],
};

/**
 * Get recommended workshops based on section + chapter context.
 * Returns 1-2 most relevant workshops.
 */
export function getWorkshopRecommendations(
  sectionId: string,
  chapterSlug?: string,
): Workshop[] {
  const slug = (chapterSlug || "").toLowerCase();

  if (sectionId === "lrdi") return [ALL_WORKSHOPS[0]];
  if (sectionId === "varc") return [ALL_WORKSHOPS[4]];

  // QA — match by keywords
  if (sectionId === "qa") {
    const matchedIndices = new Set<number>();
    for (const [keyword, indices] of Object.entries(QA_KEYWORD_MAP)) {
      if (slug.includes(keyword)) {
        indices.forEach(i => matchedIndices.add(i));
      }
    }
    if (matchedIndices.size > 0) {
      return [...matchedIndices].slice(0, 2).map(i => ALL_WORKSHOPS[i]);
    }
    // Default QA: recommend Arithmetic (highest weight)
    return [ALL_WORKSHOPS[1]];
  }

  return [ALL_WORKSHOPS[1]]; // fallback
}

/**
 * Get workshop recommendations based on weakest section from attempts data.
 * Analyzes accuracy per section and recommends for the weakest.
 */
export function getWeakSectionWorkshop(
  attempts: { section_id: string; chapter_slug: string; score_pct: number }[],
): Workshop | null {
  if (attempts.length === 0) return null;

  const sectionScores: Record<string, { total: number; count: number }> = {};
  for (const a of attempts) {
    if (!sectionScores[a.section_id]) sectionScores[a.section_id] = { total: 0, count: 0 };
    sectionScores[a.section_id].total += a.score_pct;
    sectionScores[a.section_id].count++;
  }

  // Find weakest section (lowest avg)
  let weakest = "";
  let lowestAvg = 101;
  for (const [sid, data] of Object.entries(sectionScores)) {
    const avg = data.total / data.count;
    if (avg < lowestAvg) {
      lowestAvg = avg;
      weakest = sid;
    }
  }

  if (!weakest || lowestAvg > 70) return null; // Don't recommend if scoring well

  // Find weakest chapter within that section
  const sectionAttempts = attempts.filter(a => a.section_id === weakest);
  const chapterScores: Record<string, { total: number; count: number }> = {};
  for (const a of sectionAttempts) {
    if (!chapterScores[a.chapter_slug]) chapterScores[a.chapter_slug] = { total: 0, count: 0 };
    chapterScores[a.chapter_slug].total += a.score_pct;
    chapterScores[a.chapter_slug].count++;
  }

  let weakestChapter = "";
  let lowestChapterAvg = 101;
  for (const [slug, data] of Object.entries(chapterScores)) {
    const avg = data.total / data.count;
    if (avg < lowestChapterAvg) {
      lowestChapterAvg = avg;
      weakestChapter = slug;
    }
  }

  const recs = getWorkshopRecommendations(weakest, weakestChapter);
  return recs[0] || null;
}

function discount(original: number, sale: number) {
  return Math.round(((original - sale) / original) * 100);
}

/**
 * Renders a workshop recommendation card. Used in results, battle results, and dashboard.
 */
export default function WorkshopRecommendation({
  workshops,
  title = "Recommended Workshop",
  subtitle,
}: {
  workshops: Workshop[];
  title?: string;
  subtitle?: string;
}) {
  if (workshops.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.35 }}
      className="space-y-2"
    >
      <div className="flex items-center gap-1.5">
        <BookOpen className="w-4 h-4 text-primary" />
        <h3 className="text-sm md:text-base font-bold text-foreground">{title}</h3>
      </div>
      {subtitle && <p className="text-[10px] md:text-xs text-muted-foreground">{subtitle}</p>}

      <div className={`grid gap-2 ${workshops.length > 1 ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"}`}>
        {workshops.map((w) => (
          <Card key={w.name} className="p-3 md:p-4 border border-primary/15 bg-primary/[0.02] space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <h4 className="text-xs md:text-sm font-bold text-foreground truncate">{w.name}</h4>
                <Badge variant="secondary" className="text-[8px] tracking-wider uppercase shrink-0">{w.tag}</Badge>
                {w.trending && (
                  <Badge className="bg-primary text-primary-foreground text-[7px] tracking-wider uppercase shrink-0 gap-0.5">
                    <TrendingUp className="h-2.5 w-2.5" /> Trending
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-baseline gap-1.5">
                <span className="text-sm md:text-base font-bold text-primary">₹{w.salePrice}</span>
                <span className="text-[10px] text-muted-foreground line-through">₹{w.originalPrice}</span>
                <Badge variant="secondary" className="text-[7px]">{discount(w.originalPrice, w.salePrice)}% OFF</Badge>
              </div>
              <Button size="sm" className="h-7 text-[10px] md:text-xs gap-1" asChild>
                <a href={w.link} target="_blank" rel="noopener noreferrer">
                  Enroll <ExternalLink className="h-3 w-3" />
                </a>
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </motion.div>
  );
}
