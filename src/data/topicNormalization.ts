/**
 * Maps raw question topics/subtopics from questions_full.json
 * to the official Percentilers CAT syllabus structure.
 *
 * Syllabus chapters:
 *   QA: Arithmetic (Percentages, Ratios Mixture & Variation, Average & Alligation,
 *       Profit & Loss, SI-CI, TSD, T&W), Number Systems, Geometry,
 *       Algebra (Simple Equations, Quadratic Equations, Sequence & Series,
 *       Modulus & Inequalities, Max/Min),
 *       Modern Maths (Permutation & Combination, Probability, Functions,
 *       Indices & Surds, Logs)
 *   VARC: RC, Critical Reasoning, Grammar, Vocab, Para Jumbles,
 *         Para Completion, Para Summary, Sentence Completion
 *   LRDI: Bar Graph, Line Graph, Pie Chart, Misc Charts, Venn Diagram,
 *         Network & 3D, Games & Tournaments, Arrangements, Double Line Up,
 *         Selection, Grouping, Misc Sets
 */

// ── Per-ID overrides for questions that can't be auto-classified ────────────

const ID_OVERRIDES: Record<number, { topic: string; subtopic: string }> = {
  // CAT 2024 Algebra → actually coordinate geometry + inequalities
  128: { topic: "Algebra", subtopic: "Modulus & Inequalities" },
  // CAT 2024 Algebra → indices
  129: { topic: "Modern Maths", subtopic: "Indices & Surds" },
  // CAT 2024 Number Systems → digit permutations
  130: { topic: "Modern Maths", subtopic: "Permutation & Combination" },
  // CAT 2024 Algebra → logarithms
  134: { topic: "Modern Maths", subtopic: "Logs" },
  // CAT 2024 Algebra → surds
  135: { topic: "Modern Maths", subtopic: "Indices & Surds" },
  // CAT 2024 Algebra → simple equation (working backwards)
  136: { topic: "Algebra", subtopic: "Simple Equations" },
  // CAT 2024 Algebra → system of equations
  137: { topic: "Algebra", subtopic: "Simple Equations" },
  // CAT 2024 Algebra → quadratic equations
  144: { topic: "Algebra", subtopic: "Quadratic Equations" },
  // CAT 2024 Mixtures → actually an averages problem
  140: { topic: "Arithmetic", subtopic: "Average and Alligation" },
  // CAT 2024 PLD → actually percentage calculation
  145: { topic: "Arithmetic", subtopic: "Percentages" },
  // CAT 2024 Geometry → mensuration (inscribed box)
  133: { topic: "Geometry", subtopic: "Mensuration" },
  // CAT 2024 Geometry → triangles (incircle)
  143: { topic: "Geometry", subtopic: "Triangles" },
  // Ebook: ID 2 (alligation on pass%) and ID 11 (weighted average)
  2: { topic: "Arithmetic", subtopic: "Average and Alligation" },
  11: { topic: "Arithmetic", subtopic: "Average and Alligation" },
};

// ── Subtopic normalization maps ─────────────────────────────────────────────

const ARITHMETIC_SUBTOPIC_MAP: Record<string, string> = {
  "Pipes & Cisterns": "T&W",
  "Work & Time": "T&W",
  "Time, Speed & Distance": "TSD",
  "Profit, Loss & Discounts": "Profit & Loss",
  "Averages": "Average and Alligation",
  "Ratios & Proportions": "Ratios, Mixture and Variation",
  "Percentages": "Percentages",
  "Set Theory": "Average and Alligation", // counting/sets closest fit
};

const ALGEBRA_SUBTOPIC_MAP: Record<string, string> = {
  "Logarithms": "__Modern Maths__Logs",
  "Indices & Surds": "__Modern Maths__Indices & Surds",
  "Functions": "__Modern Maths__Functions",
  "Progressions": "Sequence & Series",
  "Quadratic Equations": "Quadratic Equations",
};

const NUMBER_SYSTEMS_SUBTOPIC_MAP: Record<string, string> = {
  "Permutations & Combinations": "__Modern Maths__Permutation & Combination",
  "Indices & Powers": "__Modern Maths__Indices & Surds",
};

// ── Main normalization function ─────────────────────────────────────────────

export function normalizeTopic(
  id: number,
  rawTopic: string,
  rawSubtopic: string
): { topic: string; subtopic: string } {
  // Check per-ID overrides first
  if (ID_OVERRIDES[id]) return ID_OVERRIDES[id];

  const t = rawTopic;
  const st = rawSubtopic;

  // ── Ebook-era topic names → Arithmetic ──
  if (t === "Mixtures & Alligations")
    return { topic: "Arithmetic", subtopic: "Ratios, Mixture and Variation" };
  if (t === "Profit, Loss & Discounts")
    return { topic: "Arithmetic", subtopic: "Profit & Loss" };
  if (t === "Speed, Distance & Time" || t === "Speed, Time & Distance")
    return { topic: "Arithmetic", subtopic: "TSD" };
  if (t === "Simple Interest")
    return { topic: "Arithmetic", subtopic: "SI-CI" };
  if (t === "Work & Time")
    return { topic: "Arithmetic", subtopic: "T&W" };

  // ── Standalone topic names → proper syllabus placement ──
  if (t === "Progressions")
    return { topic: "Algebra", subtopic: "Sequence & Series" };
  if (t === "Inequalities")
    return { topic: "Algebra", subtopic: "Modulus & Inequalities" };
  if (t === "Combinatorics")
    return { topic: "Modern Maths", subtopic: "Permutation & Combination" };

  // ── Arithmetic with subtopic mapping ──
  if (t === "Arithmetic") {
    const mapped = ARITHMETIC_SUBTOPIC_MAP[st];
    return { topic: "Arithmetic", subtopic: mapped || st || "General" };
  }

  // ── Algebra with subtopic mapping (some go to Modern Maths) ──
  if (t === "Algebra") {
    const mapped = ALGEBRA_SUBTOPIC_MAP[st];
    if (mapped?.startsWith("__Modern Maths__")) {
      return { topic: "Modern Maths", subtopic: mapped.replace("__Modern Maths__", "") };
    }
    if (mapped) return { topic: "Algebra", subtopic: mapped };
    // CAT 2024 Quant or unknown → keep as Algebra
    return { topic: "Algebra", subtopic: st === "CAT 2024 Quant" ? "General" : (st || "General") };
  }

  // ── Number Systems with subtopic mapping (some go to Modern Maths) ──
  if (t === "Number Systems") {
    const mapped = NUMBER_SYSTEMS_SUBTOPIC_MAP[st];
    if (mapped?.startsWith("__Modern Maths__")) {
      return { topic: "Modern Maths", subtopic: mapped.replace("__Modern Maths__", "") };
    }
    return { topic: "Number Systems", subtopic: st === "CAT 2024 Quant" ? "Number Systems" : (st || "Number Systems") };
  }

  // ── Geometry subtopic normalization ──
  if (t === "Geometry") {
    if (st === "CAT 2024 Quant") return { topic: "Geometry", subtopic: "General" };
    return { topic: "Geometry", subtopic: st || "General" };
  }

  // ── VARC: Summary → Para Summary ──
  if (t === "Summary")
    return { topic: "Reading Comprehension", subtopic: "Para Summary" };

  // ── Everything else: keep as-is ──
  return { topic: t, subtopic: st };
}
