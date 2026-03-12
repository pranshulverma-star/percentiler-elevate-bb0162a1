/**
 * Separate metadata file for question difficulty, concept tags, and skill tags.
 * Keyed by question ID. Used alongside questions_full.json.
 *
 * This file is populated section-by-section:
 * - QA: Done ✓
 * - LRDI: Pending
 * - VARC: Pending
 */

export type Difficulty = "Easy" | "Medium" | "Hard";

export interface QuestionMeta {
  difficulty: Difficulty;
  concept_tags: string[];
  skill_tags: string[];
}

// ── Heuristic-based metadata generator ──────────────────────────────────────
// Used for questions without manual overrides.

const TOPIC_CONCEPTS: Record<string, string[]> = {
  "Ratios, Mixture and Variation": ["mixture ratio", "alligation rule", "concentration"],
  "Profit & Loss": ["cost price", "selling price", "margin", "discount"],
  "TSD": ["relative speed", "distance formula", "time calculation"],
  "T&W": ["work rate", "efficiency", "pipes and cisterns"],
  "SI-CI": ["simple interest", "compound interest", "principal"],
  "Percentages": ["percentage change", "successive percentage"],
  "Average and Alligation": ["weighted average", "mean value", "alligation"],
  "Sequence & Series": ["arithmetic progression", "geometric progression", "sum of series"],
  "Quadratic Equations": ["quadratic roots", "discriminant", "sum and product of roots"],
  "Simple Equations": ["linear equations", "system of equations"],
  "Modulus & Inequalities": ["inequality solution", "modulus", "range of values"],
  "Max/Min": ["optimization", "AM-GM inequality", "extrema"],
  "Permutation & Combination": ["permutation", "combination", "counting"],
  "Probability": ["probability events", "conditional probability"],
  "Functions": ["function composition", "functional equations"],
  "Indices & Surds": ["exponents", "surds", "index laws"],
  "Logs": ["logarithm properties", "change of base", "log equations"],
  "Triangles": ["triangle properties", "area of triangle", "similarity"],
  "Circles": ["circle theorems", "chord", "tangent"],
  "Mensuration": ["volume", "surface area", "3D geometry"],
  "Quadrilaterals": ["rectangle", "parallelogram", "area"],
  "Number Systems": ["divisibility", "remainders", "factors"],
  // VARC
  "RC": ["inference", "main idea", "tone"],
  "Para Summary": ["summarization", "essence", "key argument"],
  "Para Jumbles": ["sentence ordering", "logical flow", "coherence"],
  "Sentence Placement": ["paragraph structure", "sentence fit", "logical gap"],
  // LRDI
  "Candlestick Charts": ["data reading", "percentage comparison", "chart interpretation"],
  "Web Surfers & Bloggers": ["constraint satisfaction", "distribution"],
  "Countries Visited": ["set overlap", "inclusion-exclusion", "Venn diagram"],
  "Elections & Campaigns": ["logical deduction", "constraint analysis"],
  "Tournament Scheduling": ["scheduling", "round-robin", "constraint satisfaction"],
};

const TOPIC_SKILLS: Record<string, string[]> = {
  "Ratios, Mixture and Variation": ["calculation", "algebraic manipulation"],
  "Profit & Loss": ["calculation", "speed math"],
  "TSD": ["calculation", "algebraic manipulation", "speed math"],
  "T&W": ["calculation", "algebraic manipulation"],
  "SI-CI": ["calculation", "speed math"],
  "Percentages": ["calculation", "approximation"],
  "Average and Alligation": ["calculation", "algebraic manipulation"],
  "Sequence & Series": ["pattern recognition", "algebraic manipulation"],
  "Quadratic Equations": ["algebraic manipulation", "calculation"],
  "Simple Equations": ["algebraic manipulation", "logical deduction"],
  "Modulus & Inequalities": ["algebraic manipulation", "case analysis"],
  "Max/Min": ["algebraic manipulation", "pattern recognition"],
  "Permutation & Combination": ["logical deduction", "case analysis"],
  "Probability": ["logical deduction", "calculation"],
  "Functions": ["algebraic manipulation", "pattern recognition"],
  "Indices & Surds": ["algebraic manipulation", "calculation"],
  "Logs": ["algebraic manipulation", "calculation"],
  "Triangles": ["visual reasoning", "calculation"],
  "Circles": ["visual reasoning", "calculation"],
  "Mensuration": ["calculation", "visual reasoning"],
  "Quadrilaterals": ["visual reasoning", "calculation"],
  "Number Systems": ["pattern recognition", "logical deduction"],
  // VARC
  "RC": ["inference", "critical reasoning"],
  "Para Summary": ["inference", "elimination"],
  "Para Jumbles": ["logical deduction", "pattern recognition"],
  "Sentence Placement": ["logical deduction", "inference"],
  // LRDI
  "Candlestick Charts": ["data interpretation", "calculation", "approximation"],
  "Web Surfers & Bloggers": ["logical deduction", "case analysis"],
  "Countries Visited": ["logical deduction", "data interpretation"],
  "Elections & Campaigns": ["logical deduction", "case analysis"],
  "Tournament Scheduling": ["logical deduction", "case analysis"],
};

// ── Manual overrides for specific question IDs ──────────────────────────────

const MANUAL_META: Record<number, QuestionMeta> = {
  // Ebook Mixtures - Easy direct alligation
  1: { difficulty: "Easy", concept_tags: ["alligation rule", "mixture ratio", "price mixing"], skill_tags: ["calculation", "speed math"] },
  2: { difficulty: "Medium", concept_tags: ["weighted average", "percentage", "alligation"], skill_tags: ["algebraic manipulation", "calculation"] },
  3: { difficulty: "Medium", concept_tags: ["mixture ratio", "profit at cost price", "water adulteration"], skill_tags: ["logical deduction", "calculation"] },
  4: { difficulty: "Easy", concept_tags: ["alligation rule", "mixture ratio", "price mixing"], skill_tags: ["calculation", "speed math"] },
  5: { difficulty: "Easy", concept_tags: ["alligation rule", "price mixing", "weighted average"], skill_tags: ["calculation", "speed math"] },
  6: { difficulty: "Easy", concept_tags: ["ratio", "percentage to ratio", "mixture"], skill_tags: ["calculation"] },
  7: { difficulty: "Medium", concept_tags: ["replacement", "mixture ratio", "serial dilution"], skill_tags: ["algebraic manipulation", "calculation"] },
  8: { difficulty: "Easy", concept_tags: ["alligation rule", "price mixing"], skill_tags: ["calculation", "speed math"] },
  9: { difficulty: "Hard", concept_tags: ["serial replacement", "ratio after replacement", "successive dilution"], skill_tags: ["algebraic manipulation", "calculation"] },
  10: { difficulty: "Hard", concept_tags: ["serial replacement", "volume calculation", "successive dilution"], skill_tags: ["algebraic manipulation", "calculation"] },
  11: { difficulty: "Hard", concept_tags: ["weighted average", "department ratio", "three-group alligation"], skill_tags: ["algebraic manipulation", "calculation", "case analysis"] },
  12: { difficulty: "Hard", concept_tags: ["mixture ratio", "two-bag mixing", "percentage composition"], skill_tags: ["calculation", "algebraic manipulation"] },

  // Profit & Loss key questions
  13: { difficulty: "Medium", concept_tags: ["profit percentage", "combined profit", "cost price ratio"], skill_tags: ["calculation", "algebraic manipulation"] },
  17: { difficulty: "Easy", concept_tags: ["cost price", "selling price", "profit calculation"], skill_tags: ["calculation", "speed math"] },
  26: { difficulty: "Medium", concept_tags: ["successive discount", "marked price", "profit margin"], skill_tags: ["calculation", "algebraic manipulation"] },

  // TSD key questions
  40: { difficulty: "Easy", concept_tags: ["speed ratio", "time ratio", "late arrival"], skill_tags: ["calculation", "speed math"] },
  41: { difficulty: "Easy", concept_tags: ["speed ratio", "time ratio", "early arrival"], skill_tags: ["calculation", "speed math"] },
  42: { difficulty: "Medium", concept_tags: ["distance calculation", "late arrival", "two speeds"], skill_tags: ["algebraic manipulation", "calculation"] },
  43: { difficulty: "Medium", concept_tags: ["Pythagorean distance", "right angle motion", "unit conversion"], skill_tags: ["calculation", "visual reasoning"] },
  48: { difficulty: "Medium", concept_tags: ["relative speed", "overtaking", "train length"], skill_tags: ["calculation", "algebraic manipulation"] },

  // CAT 2024 hard questions
  128: { difficulty: "Hard", concept_tags: ["coordinate geometry", "circle inequality", "area between curves"], skill_tags: ["algebraic manipulation", "visual reasoning", "calculation"] },
  129: { difficulty: "Hard", concept_tags: ["exponent equations", "sum of roots", "index laws"], skill_tags: ["algebraic manipulation", "calculation"] },
  130: { difficulty: "Medium", concept_tags: ["digit sum", "permutation", "four-digit numbers"], skill_tags: ["pattern recognition", "calculation"] },
  131: { difficulty: "Hard", concept_tags: ["work rate", "combined work", "variable hours"], skill_tags: ["algebraic manipulation", "calculation"] },
  132: { difficulty: "Hard", concept_tags: ["floor function", "summation", "pattern"], skill_tags: ["pattern recognition", "calculation"] },
  133: { difficulty: "Hard", concept_tags: ["sphere volume", "inscribed box", "surface area"], skill_tags: ["algebraic manipulation", "calculation"] },
  134: { difficulty: "Hard", concept_tags: ["logarithm base change", "log equation"], skill_tags: ["algebraic manipulation", "calculation"] },
  135: { difficulty: "Hard", concept_tags: ["square root of surd", "integer solutions"], skill_tags: ["algebraic manipulation", "case analysis"] },
  136: { difficulty: "Medium", concept_tags: ["backward calculation", "sequential operation"], skill_tags: ["logical deduction", "calculation"] },
  137: { difficulty: "Hard", concept_tags: ["sum of squares", "system of equations", "completing square"], skill_tags: ["algebraic manipulation", "pattern recognition"] },
  138: { difficulty: "Hard", concept_tags: ["surjective function", "inclusion-exclusion", "counting"], skill_tags: ["logical deduction", "calculation"] },
  139: { difficulty: "Medium", concept_tags: ["profit percentage", "cost reduction", "selling price"], skill_tags: ["algebraic manipulation", "calculation"] },
  140: { difficulty: "Medium", concept_tags: ["average sequence", "difference pattern"], skill_tags: ["algebraic manipulation", "pattern recognition"] },
  141: { difficulty: "Medium", concept_tags: ["simple interest", "ratio of interest", "two-bank deposit"], skill_tags: ["algebraic manipulation", "calculation"] },
  142: { difficulty: "Medium", concept_tags: ["ratio", "after selling", "fruit counting"], skill_tags: ["algebraic manipulation", "calculation"] },
  143: { difficulty: "Medium", concept_tags: ["incircle radius", "right triangle", "semi-perimeter"], skill_tags: ["calculation", "visual reasoning"] },
  144: { difficulty: "Hard", concept_tags: ["common root", "quadratic system", "sum of coefficients"], skill_tags: ["algebraic manipulation", "logical deduction"] },
  145: { difficulty: "Hard", concept_tags: ["percentage of income", "ratio change", "income increase"], skill_tags: ["calculation", "approximation"] },
  146: { difficulty: "Medium", concept_tags: ["arithmetic progression", "nth term", "common difference"], skill_tags: ["algebraic manipulation", "calculation"] },
  147: { difficulty: "Medium", concept_tags: ["serial replacement", "milk-water ratio", "successive dilution"], skill_tags: ["calculation", "pattern recognition"] },
  148: { difficulty: "Hard", concept_tags: ["relative speed", "meeting point", "time difference"], skill_tags: ["algebraic manipulation", "calculation"] },
  149: { difficulty: "Medium", concept_tags: ["remainder theorem", "cyclic pattern", "modular arithmetic"], skill_tags: ["pattern recognition", "calculation"] },

  // Inequalities
  150: { difficulty: "Medium", concept_tags: ["range estimation", "expression comparison", "sign analysis"], skill_tags: ["calculation", "case analysis"] },
  151: { difficulty: "Medium", concept_tags: ["polynomial inequality", "factorization", "root finding"], skill_tags: ["algebraic manipulation", "calculation"] },
  152: { difficulty: "Hard", concept_tags: ["modulus equation", "case splitting", "integer solutions"], skill_tags: ["case analysis", "algebraic manipulation"] },
  153: { difficulty: "Hard", concept_tags: ["AM-GM inequality", "optimization", "constraint"], skill_tags: ["algebraic manipulation", "pattern recognition"] },
  154: { difficulty: "Hard", concept_tags: ["custom operation", "comparison", "inequality"], skill_tags: ["algebraic manipulation", "logical deduction"] },
  155: { difficulty: "Medium", concept_tags: ["AM-GM inequality", "product constraint", "minimum value"], skill_tags: ["algebraic manipulation", "pattern recognition"] },

  // CAT 2018 QA
  287: { difficulty: "Hard", concept_tags: ["GP-AP relation", "common ratio", "sequence"], skill_tags: ["algebraic manipulation", "calculation"] },
  288: { difficulty: "Hard", concept_tags: ["pipes and cisterns", "filling rate", "draining rate"], skill_tags: ["algebraic manipulation", "calculation"] },
  289: { difficulty: "Hard", concept_tags: ["exponent system", "index equations"], skill_tags: ["algebraic manipulation", "calculation"] },
  290: { difficulty: "Hard", concept_tags: ["relative position", "speed ratio", "meeting time"], skill_tags: ["algebraic manipulation", "calculation"] },
  291: { difficulty: "Hard", concept_tags: ["nested logarithm", "log equation", "base conversion"], skill_tags: ["algebraic manipulation", "calculation"] },
  292: { difficulty: "Hard", concept_tags: ["mixture selling", "profit percentage", "cost optimization"], skill_tags: ["algebraic manipulation", "calculation"] },
  293: { difficulty: "Medium", concept_tags: ["parallel chords", "chord-radius relation", "distance between chords"], skill_tags: ["calculation", "visual reasoning"] },
  294: { difficulty: "Medium", concept_tags: ["set theory", "inclusion-exclusion", "counting"], skill_tags: ["logical deduction", "calculation"] },
  295: { difficulty: "Hard", concept_tags: ["weighted average", "maximization", "constraint"], skill_tags: ["algebraic manipulation", "logical deduction"] },
  296: { difficulty: "Medium", concept_tags: ["infinite GP", "midpoint triangle", "area sum"], skill_tags: ["pattern recognition", "calculation"] },
  297: { difficulty: "Hard", concept_tags: ["quadratic identity", "completing square", "system"], skill_tags: ["algebraic manipulation", "pattern recognition"] },
  298: { difficulty: "Hard", concept_tags: ["logarithm", "change of base", "exponent"], skill_tags: ["algebraic manipulation", "calculation"] },
  299: { difficulty: "Hard", concept_tags: ["product correction", "minimization", "sum of squares"], skill_tags: ["algebraic manipulation", "logical deduction"] },
  300: { difficulty: "Hard", concept_tags: ["nested square", "area ratio", "segment ratio"], skill_tags: ["algebraic manipulation", "visual reasoning"] },
  301: { difficulty: "Medium", concept_tags: ["frustum volume", "cone cutting", "mensuration"], skill_tags: ["calculation", "visual reasoning"] },
  302: { difficulty: "Hard", concept_tags: ["log identity", "change of base", "simplification"], skill_tags: ["algebraic manipulation", "calculation"] },
  303: { difficulty: "Hard", concept_tags: ["relative speed", "meeting point", "train time"], skill_tags: ["algebraic manipulation", "calculation"] },
  304: { difficulty: "Hard", concept_tags: ["three-set overlap", "inclusion-exclusion", "conditional"], skill_tags: ["logical deduction", "algebraic manipulation"] },
  305: { difficulty: "Hard", concept_tags: ["mixed buying", "transit loss", "profit chain"], skill_tags: ["algebraic manipulation", "calculation"] },
  306: { difficulty: "Hard", concept_tags: ["average change", "dropping terms", "total count"], skill_tags: ["algebraic manipulation", "logical deduction"] },
  307: { difficulty: "Medium", concept_tags: ["ratio change", "marble transfer", "fraction"], skill_tags: ["algebraic manipulation", "calculation"] },
  308: { difficulty: "Medium", concept_tags: ["inscribed rectangle", "circle radius", "Pythagorean"], skill_tags: ["calculation", "elimination"] },
  309: { difficulty: "Medium", concept_tags: ["parallelogram area", "perpendicular height", "triangle area"], skill_tags: ["calculation", "visual reasoning"] },
  310: { difficulty: "Hard", concept_tags: ["sector area", "inscribed triangle", "arc length"], skill_tags: ["algebraic manipulation", "visual reasoning"] },
  311: { difficulty: "Medium", concept_tags: ["ascending digits", "subset counting", "combination"], skill_tags: ["logical deduction", "calculation"] },
  312: { difficulty: "Hard", concept_tags: ["power range", "divisibility", "integer counting"], skill_tags: ["case analysis", "calculation"] },
  313: { difficulty: "Hard", concept_tags: ["functional equation", "Fibonacci-like", "backward computation"], skill_tags: ["pattern recognition", "algebraic manipulation"] },
  314: { difficulty: "Hard", concept_tags: ["percentage boundary", "integer range", "constraint"], skill_tags: ["algebraic manipulation", "calculation"] },
  315: { difficulty: "Medium", concept_tags: ["percentage change", "population growth"], skill_tags: ["calculation", "approximation"] },
  316: { difficulty: "Medium", concept_tags: ["ratio", "fraction simplification"], skill_tags: ["calculation", "algebraic manipulation"] },
  317: { difficulty: "Hard", concept_tags: ["function optimization", "min-max", "intersection"], skill_tags: ["algebraic manipulation", "visual reasoning"] },
  318: { difficulty: "Hard", concept_tags: ["speed calculation", "distance ratio", "time constraint"], skill_tags: ["algebraic manipulation", "calculation"] },
  319: { difficulty: "Hard", concept_tags: ["work rate", "efficiency", "combined work"], skill_tags: ["algebraic manipulation", "calculation"] },
  320: { difficulty: "Hard", concept_tags: ["work rate", "fractional completion", "time calculation"], skill_tags: ["algebraic manipulation", "calculation"] },
};

/**
 * Get metadata for a question by ID.
 * Falls back to heuristic generation if no manual override exists.
 */
export function getQuestionMeta(
  id: number,
  normalizedSubtopic: string,
  questionText: string
): QuestionMeta {
  if (MANUAL_META[id]) return MANUAL_META[id];

  // Heuristic-based generation
  const concepts = TOPIC_CONCEPTS[normalizedSubtopic] || ["general problem solving"];
  const skills = TOPIC_SKILLS[normalizedSubtopic] || ["calculation", "logical deduction"];

  // Difficulty heuristic: question length + has options + topic
  const qLen = questionText.length;
  let difficulty: Difficulty = "Medium";
  if (qLen < 120) difficulty = "Easy";
  else if (qLen > 350) difficulty = "Hard";

  return { difficulty, concept_tags: concepts, skill_tags: skills };
}

/**
 * Full metadata map - can be used for batch operations.
 */
export { MANUAL_META };
