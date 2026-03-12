/**
 * Runtime patches for question metadata corrections.
 * Applied at import time in practiceLabQuestions.ts.
 *
 * Why a patch file instead of editing the JSON?
 * • The JSON contains unicode math symbols that break search-replace tooling.
 * • A separate patch file is auditable, diffable, and easy to extend.
 */

// ── Topic / subtopic overrides keyed by question ID ────────────────────────

export interface TopicOverride {
  topic?: string;
  subtopic?: string;
}

/**
 * Corrections identified in the March 2026 audit:
 *  • Misclassified topics (e.g. averages filed under Mixtures)
 *  • Standalone topics that should nest under a parent (Combinatorics → Number Systems)
 *  • Generic "CAT 2024 Quant" subtopic replaced with meaningful labels
 *  • "Speed, Time & Distance" normalised to "Speed, Distance & Time"
 */
export const topicOverrides: Record<number, TopicOverride> = {
  // ── Averages misclassified as Mixtures & Alligations ──
  2:   { topic: "Averages" },
  11:  { topic: "Averages" },
  140: { topic: "Arithmetic", subtopic: "Averages" },

  // ── Ratios misclassified as Mixtures ──
  142: { topic: "Arithmetic", subtopic: "Ratios & Proportions" },

  // ── "CAT 2024 Quant" subtopic → meaningful subtopics ──
  128: { subtopic: "Coordinate Geometry" },
  129: { subtopic: "Indices & Surds" },
  130: { subtopic: "Permutations & Combinations" },
  131: { subtopic: "Work & Time" },
  132: { subtopic: "Number Theory" },
  133: { subtopic: "Mensuration" },
  134: { subtopic: "Logarithms" },
  135: { subtopic: "Surds" },
  136: { subtopic: "Linear Equations" },
  137: { subtopic: "Quadratic Equations" },
  139: { subtopic: "Profit & Loss" },
  143: { subtopic: "Triangles" },
  144: { subtopic: "Quadratic Equations" },
  145: { topic: "Arithmetic", subtopic: "Percentages" },
  147: { subtopic: "Replacement" },
  149: { subtopic: "Remainders" },

  // ── Standalone topics → nested under parent ──
  // (138 Combinatorics and 141 Simple Interest already fixed in JSON)
  // (146 Progressions and 148 Speed, Time & Distance already fixed in JSON)

  // ── Inequalities standalone → Algebra parent ──
  150: { topic: "Algebra", subtopic: "Inequalities" },
  151: { topic: "Algebra", subtopic: "Inequalities" },
  152: { topic: "Algebra", subtopic: "Inequalities" },
  153: { topic: "Algebra", subtopic: "Inequalities" },
  154: { topic: "Algebra", subtopic: "Inequalities" },
  155: { topic: "Algebra", subtopic: "Inequalities" },
};

// ── Difficulty tags ─────────────────────────────────────────────────────────

export type Difficulty = "Easy" | "Medium" | "Hard";

/** Assign difficulty based on subtopic pattern, with per-question overrides. */
const difficultyOverrides: Record<number, Difficulty> = {
  // Specific hard problems identified in audit
  12: "Hard", 36: "Hard", 37: "Hard", 38: "Hard", 39: "Hard", 40: "Hard",
  61: "Hard", 62: "Hard", 63: "Hard", 64: "Hard", 65: "Hard",
  94: "Hard", 95: "Hard", 96: "Hard", 97: "Hard", 98: "Hard",
  114: "Hard", 115: "Hard", 116: "Hard", 117: "Hard", 321: "Hard",
  128: "Hard", 129: "Hard", 130: "Medium", 131: "Medium", 132: "Hard",
  133: "Hard", 134: "Hard", 135: "Hard", 136: "Medium", 137: "Hard",
  138: "Hard", 139: "Medium", 140: "Medium", 141: "Medium", 142: "Medium",
  143: "Hard", 144: "Hard", 145: "Hard", 146: "Hard", 147: "Medium",
  148: "Hard", 149: "Medium", 150: "Hard", 151: "Hard", 152: "Hard",
  153: "Hard", 154: "Hard", 155: "Hard",
  287: "Hard", 288: "Hard", 289: "Hard", 290: "Medium", 291: "Hard",
  292: "Hard", 293: "Hard", 294: "Medium", 295: "Hard", 296: "Hard",
  297: "Hard", 298: "Hard", 299: "Hard", 300: "Hard", 301: "Medium",
  302: "Hard", 303: "Hard", 304: "Medium", 305: "Hard", 306: "Hard",
  307: "Medium", 308: "Medium", 309: "Hard", 310: "Hard", 311: "Hard",
  312: "Hard", 313: "Hard", 314: "Medium", 315: "Hard", 316: "Hard",
  317: "Hard", 318: "Medium", 319: "Hard", 320: "Hard",
};

export function getDifficulty(id: number, subtopic: string): Difficulty {
  if (difficultyOverrides[id]) return difficultyOverrides[id];

  const s = subtopic.toLowerCase();
  if (s.includes("worked example") || s.includes("e1") || s.includes("e2") || s.includes("e3")) return "Easy";
  if (s.includes("mini revision")) return "Easy";
  if (s.includes("challenge")) return "Hard";
  if (s.includes("top cat")) return "Hard";

  // LRDI and VARC CAT-level questions
  if (s.includes("cat2018") || s.includes("cat2024") || s.includes("cat 2024")) return "Hard";

  return "Medium";
}

// ── Concept tags ────────────────────────────────────────────────────────────

const conceptTagMap: Record<string, string[]> = {
  "Mixtures & Alligations": ["mixtures", "alligation-rule", "weighted-average"],
  "Averages": ["averages", "weighted-average", "mean"],
  "Profit, Loss & Discounts": ["profit-loss", "cost-price", "selling-price", "discount"],
  "Speed, Distance & Time": ["speed-distance-time", "relative-speed", "average-speed"],
  "Speed, Time & Distance": ["speed-distance-time", "relative-speed", "average-speed"],
  "Work & Time": ["work-rate", "efficiency", "time-work"],
  "Algebra": ["algebra", "equations"],
  "Geometry": ["geometry", "spatial-reasoning"],
  "Number Systems": ["number-theory", "divisibility"],
  "Arithmetic": ["arithmetic", "calculation"],
  "Logical Reasoning": ["logical-reasoning", "deduction", "constraints"],
  "Data Interpretation": ["data-interpretation", "charts", "calculation"],
  "Reading Comprehension": ["reading-comprehension", "inference", "critical-reading"],
  "Para Jumbles": ["para-jumbles", "sentence-ordering", "coherence"],
  "Sentence Placement": ["sentence-placement", "paragraph-structure", "coherence"],
  "Summary": ["summarisation", "main-idea", "passage-analysis"],
};

const subtopicConceptTags: Record<string, string[]> = {
  "Pipes & Cisterns": ["pipes-cisterns", "flow-rate"],
  "Coordinate Geometry": ["coordinate-geometry", "area", "circles"],
  "Indices & Surds": ["indices", "surds", "exponents"],
  "Permutations & Combinations": ["combinatorics", "counting"],
  "Logarithms": ["logarithms", "log-rules"],
  "Quadratic Equations": ["quadratic", "roots", "discriminant"],
  "Linear Equations": ["linear-equations", "simultaneous"],
  "Progressions": ["AP", "GP", "sequences"],
  "Inequalities": ["inequalities", "AM-GM", "optimization"],
  "Mensuration": ["mensuration", "volume", "surface-area"],
  "Triangles": ["triangles", "similarity", "congruence"],
  "Circles": ["circles", "tangent", "chord"],
  "Quadrilaterals": ["quadrilaterals", "rectangle", "parallelogram"],
  "Functions": ["functions", "min-max", "composition"],
  "Set Theory": ["set-theory", "venn-diagram", "union-intersection"],
  "Percentages": ["percentages", "percentage-change"],
  "Ratios & Proportions": ["ratios", "proportions"],
  "Averages": ["averages", "weighted-average"],
  "Remainders": ["remainders", "modular-arithmetic"],
  "Number Theory": ["number-theory", "floor-function"],
  "Simple & Compound Interest": ["interest", "compounding"],
  "Surds": ["surds", "radicals"],
  "Replacement": ["replacement", "successive-dilution"],
  "Work & Time": ["work-rate", "efficiency"],
  "Profit & Loss": ["profit-loss", "cost-price", "selling-price"],
  "Profit, Loss & Discounts": ["profit-loss", "discount", "markup"],
  "Speed, Distance & Time": ["speed-distance-time", "relative-speed"],
  "Recruitment Scores": ["data-tables", "composite-scores"],
  "Candlestick Charts": ["candlestick", "stock-data", "variability"],
  "Elections & Campaigns": ["elections", "voting", "percentages"],
  "Fuel Contamination": ["constraints", "sequencing", "levels"],
  "Committees": ["committees", "distribution", "constraints"],
  "Round Robin": ["round-robin", "scheduling", "tournament"],
  "Main Idea": ["main-idea", "central-argument"],
  "Inference": ["inference", "implied-meaning"],
  "Detail": ["detail", "textual-evidence"],
  "Summary": ["summarisation", "passage-essence"],
};

export function getConceptTags(topic: string, subtopic: string): string[] {
  const topicTags = conceptTagMap[topic] || [topic.toLowerCase().replace(/\s+/g, "-")];
  const subTags = subtopicConceptTags[subtopic] || [];
  // Merge unique, limit to 5
  const merged = [...new Set([...topicTags, ...subTags])];
  return merged.slice(0, 5);
}

// ── Skill tags ──────────────────────────────────────────────────────────────

const topicSkillMap: Record<string, string[]> = {
  "Mixtures & Alligations": ["alligation", "ratio-manipulation"],
  "Averages": ["weighted-mean", "algebraic-formulation"],
  "Profit, Loss & Discounts": ["percentage-calculation", "successive-discounts"],
  "Speed, Distance & Time": ["unit-conversion", "relative-motion"],
  "Speed, Time & Distance": ["unit-conversion", "relative-motion"],
  "Work & Time": ["rate-calculation", "fraction-arithmetic"],
  "Algebra": ["equation-solving", "algebraic-manipulation"],
  "Geometry": ["spatial-visualization", "theorem-application"],
  "Number Systems": ["number-properties", "pattern-recognition"],
  "Arithmetic": ["calculation", "problem-modeling"],
  "Logical Reasoning": ["logical-deduction", "constraint-satisfaction"],
  "Data Interpretation": ["data-analysis", "calculation-speed"],
  "Reading Comprehension": ["reading-speed", "inference", "vocabulary"],
  "Para Jumbles": ["sentence-linking", "logical-flow"],
  "Sentence Placement": ["contextual-understanding", "paragraph-coherence"],
  "Summary": ["distillation", "main-idea-extraction"],
};

export function getSkillTags(topic: string, subtopic: string): string[] {
  const base = topicSkillMap[topic] || ["problem-solving"];
  const extras: string[] = [];

  const s = subtopic.toLowerCase();
  if (s.includes("challenge") || s.includes("top cat")) extras.push("advanced-reasoning");
  if (s.includes("train") || s.includes("boat") || s.includes("race")) extras.push("relative-motion");
  if (s.includes("pipe") || s.includes("cistern")) extras.push("flow-rate-analysis");
  if (s.includes("log")) extras.push("log-manipulation");
  if (s.includes("quadratic")) extras.push("factorization");
  if (s.includes("inequalit")) extras.push("optimization");
  if (s.includes("progression")) extras.push("sequence-analysis");
  if (s.includes("coordinate")) extras.push("graphing");

  const merged = [...new Set([...base, ...extras])];
  return merged.slice(0, 4);
}

// ── QA Chapter Mapping ─────────────────────────────────────────────────────
// Maps every QA question to one of the official syllabus chapters.

/** Ordered list of QA chapters as they should appear in the UI. */
export const QA_CHAPTER_ORDER: string[] = [
  // Arithmetic
  "Percentages",
  "Ratios, Proportions and Variation",
  "Average and Alligation",
  "Profit & Loss",
  "SI-CI",
  "TSD",
  "T&W",
  // Number System
  "Number System",
  // Geometry
  "Geometry",
  // Algebra
  "Simple Equations",
  "Quadratic Equations",
  "Sequence & Series",
  "Modulus & Inequalities",
  "Max/Min",
  // Modern Maths
  "Permutation & Combination",
  "Probability",
  "Functions",
  "Indices & Surds",
  "Logs",
];

/** Subtopic → chapter mapping (checked first, most specific). */
const subtopicToChapter: Record<string, string> = {
  // Arithmetic subtopics
  "Percentages": "Percentages",
  "Ratios & Proportions": "Ratios, Proportions and Variation",
  "Averages": "Average and Alligation",
  "Replacement": "Average and Alligation",
  "Mixtures & Alligations": "Average and Alligation",
  "Profit & Loss": "Profit & Loss",
  "Profit, Loss & Discounts": "Profit & Loss",
  "Simple & Compound Interest": "SI-CI",
  "Simple Interest": "SI-CI",
  "Compound Interest": "SI-CI",
  "Time, Speed & Distance": "TSD",
  "Speed, Distance & Time": "TSD",
  "Speed, Time & Distance": "TSD",
  "Pipes & Cisterns": "T&W",
  "Work & Time": "T&W",
  "Time & Work": "T&W",
  // Number System subtopics
  "Number Theory": "Number System",
  "Remainders": "Number System",
  "Indices & Powers": "Number System",
  // Algebra subtopics
  "Coordinate Geometry": "Geometry",
  "Linear Equations": "Simple Equations",
  "Quadratic Equations": "Quadratic Equations",
  "Progressions": "Sequence & Series",
  "Inequalities": "Modulus & Inequalities",
  "Indices & Surds": "Indices & Surds",
  "Surds": "Indices & Surds",
  "Surds & Indices": "Indices & Surds",
  "Classification of Numbers": "Number System",
  "Factors": "Number System",
  "Logarithms": "Logs",
  "Functions": "Functions",
  // Geometry subtopics
  "Triangles": "Geometry",
  "Circles": "Geometry",
  "Quadrilaterals": "Geometry",
  "Mensuration": "Geometry",
  // Modern Maths subtopics
  "Permutations & Combinations": "Permutation & Combination",
  "Permutation & Combination": "Permutation & Combination",
  "Set Theory": "Permutation & Combination",
  "Probability": "Probability",
};

/** Topic-level fallback mapping (used when subtopic doesn't match). */
const topicToChapter: Record<string, string> = {
  "Mixtures & Alligations": "Average and Alligation",
  "Averages": "Average and Alligation",
  "Profit, Loss & Discounts": "Profit & Loss",
  "Speed, Distance & Time": "TSD",
  "Speed, Time & Distance": "TSD",
  "Work & Time": "T&W",
  "Inequalities": "Modulus & Inequalities",
  "Number Systems": "Number System",
  "Geometry": "Geometry",
  "Algebra": "Simple Equations",
  "Arithmetic": "Percentages", // fallback for unmapped Arithmetic subtopics
};

/**
 * Given the effective topic & subtopic (after overrides), return the
 * canonical QA chapter name the question should appear under.
 */
export function getQAChapter(topic: string, subtopic: string): string {
  // 1. Try subtopic first (most specific)
  if (subtopicToChapter[subtopic]) return subtopicToChapter[subtopic];

  // 2. Fall back to topic
  if (topicToChapter[topic]) return topicToChapter[topic];

  // 3. Ultimate fallback
  return "Number System";
}
