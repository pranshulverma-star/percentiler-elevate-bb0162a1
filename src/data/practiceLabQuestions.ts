import rawQuestions from "./questions_full.json";
import { topicOverrides, getDifficulty, getConceptTags, getSkillTags, type Difficulty } from "./questionFixes";

export interface PracticeQuestion {
  id: number;
  question: string;
  type: "mcq";
  options: string[];
  correctAnswer: number; // 0-based index
  explanation?: string;
  group_id?: string;
  group_context?: string;
  group_image?: string;
  difficulty?: Difficulty;
  concept_tags?: string[];
  skill_tags?: string[];
}

export interface Chapter {
  slug: string;
  name: string;
  questions: PracticeQuestion[];
}

export interface SectionData {
  id: string;
  name: string;
  icon: string;
  description: string;
  chapters: Chapter[];
}

// ── Process raw JSON into chapters ──────────────────────────────────────────

interface RawQuestion {
  id: number;
  topic: string;
  subtopic: string;
  question: string;
  options: Record<string, string>;
  correct_answer: string;
  explanation?: string;
  group_id?: string;
  group_context?: string;
  group_image?: string;
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[&,]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

// ── Deterministic seeded RNG (per question id) ─────────────────────────────
function seededRng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

// ── Generate plausible distractors for a numeric answer ────────────────────
function generateDistractors(correctStr: string, questionId: number): { options: string[]; correctIndex: number } {
  const rng = seededRng(questionId);

  // Try to parse a primary numeric value
  const numMatch = correctStr.match(/-?[\d,]+\.?\d*/);
  const numVal = numMatch ? parseFloat(numMatch[0].replace(/,/g, "")) : NaN;

  let distractors: string[];

  if (!isNaN(numVal) && isFinite(numVal)) {
    // Generate numeric distractors
    const isInteger = Number.isInteger(numVal);
    const abs = Math.abs(numVal) || 1;

    // Create offsets that produce plausible wrong answers
    const offsets = [
      numVal * (0.15 + rng() * 0.2),  // ~15-35% off
      numVal * (0.3 + rng() * 0.25),   // ~30-55% off
      numVal * (0.05 + rng() * 0.15),  // ~5-20% off
    ];

    // Alternate signs and ensure uniqueness
    const signs = [1, -1, rng() > 0.5 ? 1 : -1];
    const wrongValues = offsets.map((off, i) => {
      let v = numVal + off * signs[i];
      // For small integers, ensure distinct values
      if (isInteger && abs < 100) {
        const delta = Math.max(1, Math.ceil(off));
        v = numVal + delta * signs[i];
      }
      if (isInteger) v = Math.round(v);
      return v;
    });

    // Ensure no duplicates or matches with correct
    const seen = new Set<number>([numVal]);
    const finalWrong: number[] = [];
    for (let v of wrongValues) {
      if (seen.has(v)) v = v + (isInteger ? 1 : 0.5);
      if (seen.has(v)) v = numVal + Math.ceil(abs * 0.4 * (finalWrong.length + 1));
      seen.add(v);
      finalWrong.push(v);
    }

    // Format to match the style of the correct answer
    const hasUnit = correctStr.replace(numMatch![0], "").trim();
    distractors = finalWrong.map((v) => {
      let formatted: string;
      if (isInteger) {
        formatted = v.toString();
      } else {
        // Match decimal places of original
        const decMatch = numMatch![0].match(/\.(\d+)/);
        const decimals = decMatch ? decMatch[1].length : 2;
        formatted = v.toFixed(decimals);
      }
      return hasUnit ? `${formatted} ${hasUnit}`.trim() : formatted;
    });
  } else if (correctStr.includes(":")) {
    // Ratio answers like "3:1", "1:2"
    const parts = correctStr.split(":").map((p) => parseInt(p.trim()));
    if (parts.length === 2 && parts.every((p) => !isNaN(p))) {
      const [a, b] = parts;
      const ratioSet = new Set<string>([`${a}:${b}`]);
      const candidates = [
        `${a + 1}:${b}`, `${a}:${b + 1}`, `${b}:${a}`,
        `${a * 2}:${b}`, `${a}:${b * 2}`, `${a + 2}:${b + 1}`,
        `${Math.max(1, a - 1)}:${b}`, `${a}:${Math.max(1, b - 1)}`,
      ];
      distractors = [];
      for (const c of candidates) {
        if (!ratioSet.has(c)) {
          ratioSet.add(c);
          distractors.push(c);
          if (distractors.length === 3) break;
        }
      }
      while (distractors.length < 3) distractors.push(`${a + distractors.length + 1}:${b + 1}`);
    } else {
      distractors = generateFallbackDistractors(correctStr, rng);
    }
  } else if (correctStr.includes("%")) {
    // Percentage answers
    const pctMatch = correctStr.match(/([\d.]+)\s*%/);
    if (pctMatch) {
      const pct = parseFloat(pctMatch[1]);
      const wrongs = [
        Math.max(0, pct - 5 - rng() * 10),
        Math.min(100, pct + 5 + rng() * 10),
        Math.max(0, pct - 15 - rng() * 5),
      ].map((v) => `${Number.isInteger(pct) ? Math.round(v) : v.toFixed(pctMatch[1].includes(".") ? 2 : 0)}%`);
      const seen = new Set([correctStr]);
      distractors = wrongs.filter((w) => !seen.has(w));
      while (distractors.length < 3) distractors.push(`${Math.round(pct + distractors.length * 7)}%`);
      distractors = distractors.slice(0, 3);
    } else {
      distractors = generateFallbackDistractors(correctStr, rng);
    }
  } else {
    distractors = generateFallbackDistractors(correctStr, rng);
  }

  // Shuffle correct answer into the options
  const correctIndex = Math.floor(rng() * 4);
  const options: string[] = [];
  let dIdx = 0;
  for (let i = 0; i < 4; i++) {
    if (i === correctIndex) {
      options.push(correctStr);
    } else {
      options.push(distractors[dIdx++]);
    }
  }

  return { options, correctIndex };
}

function generateFallbackDistractors(correct: string, rng: () => number): string[] {
  // For text-based answers, create slight variations
  // Try extracting any number and varying it
  const nums = correct.match(/-?[\d.]+/g);
  if (nums && nums.length > 0) {
    const n = parseFloat(nums[0]);
    return [
      correct.replace(nums[0], String(Math.round(n * 1.25))),
      correct.replace(nums[0], String(Math.round(n * 0.75))),
      correct.replace(nums[0], String(Math.round(n * 1.5))),
    ];
  }
  // Last resort: generic options
  return [
    `Not ${correct}`,
    "None of these",
    "Cannot be determined",
  ];
}

function extractAnswerFromExplanation(explanation: string): string {
  const patterns = [
    /(?:answer|ans)[.:=]\s*(.+?)(?:\.|$)/i,
    /(?:=\s*)([\d,.:/ ]+)\s*(?:litres?|km|kg|rs\.?|rupees?|girls?|boys?|hours?|days?|minutes?|seconds?|kmph|km\/hr|m\/s|%)?\.?\s*$/im,
    /(?:ratio\s*(?:is|=)\s*)([\d: ]+)/i,
    /∴\s*(.+?)$/m,
    /(?:therefore|hence|so|thus)[,:]?\s*(.+?)\.?\s*$/im,
  ];
  for (const p of patterns) {
    const m = explanation.match(p);
    if (m) return m[1].trim().replace(/\.$/, "");
  }
  return "";
}

// Broad CAT topics that should be split by subtopic in QA
const QA_BROAD_TOPICS = new Set(["Arithmetic", "Algebra", "Geometry", "Number Systems"]);

function buildChaptersFromRaw(raw: RawQuestion[], useSubtopic = false, splitBroadTopics = false): Chapter[] {
  const topicMap = new Map<string, PracticeQuestion[]>();

  for (const r of raw) {
    if (/same as id\s*\d+|see id\s*\d+/i.test(r.question) || /see full explanation there/i.test(r.question)) {
      continue;
    }

    // Skip image-based questions (require visual reference that can't be rendered as text)
    if (r.group_image) {
      continue;
    }

    // Apply topic/subtopic overrides from audit fixes
    const override = topicOverrides[r.id];
    const topic = override?.topic ?? r.topic;
    const subtopic = override?.subtopic ?? r.subtopic;

    const optKeys = Object.keys(r.options);
    const isMcq = optKeys.length >= 2 && optKeys.every((k) => /^\d+$/.test(k));

    let pq: PracticeQuestion;

    // Compute metadata tags
    const difficulty = getDifficulty(r.id, subtopic);
    const concept_tags = getConceptTags(topic, subtopic);
    const skill_tags = getSkillTags(topic, subtopic);

    if (isMcq) {
      const sortedKeys = optKeys.sort((a, b) => Number(a) - Number(b));
      const optionsArr = sortedKeys.map((k) => r.options[k]);
      // Skip questions where any option is excessively long (likely explanation leakage)
      if (optionsArr.some((o) => o.length > 120)) continue;
      const correctIdx = sortedKeys.indexOf(r.correct_answer);

      pq = {
        id: r.id,
        question: r.question,
        type: "mcq",
        options: optionsArr,
        correctAnswer: correctIdx >= 0 ? correctIdx : 0,
        explanation: r.explanation,
        group_id: r.group_id,
        group_context: r.group_context,
        group_image: r.group_image,
        difficulty,
        concept_tags,
        skill_tags,
      };
    } else {
      const answerText = r.correct_answer === "Open-ended"
        ? extractAnswerFromExplanation(r.explanation || "")
        : r.correct_answer;

      // Skip if answer is missing or too long (explanation leakage)
      if (!answerText || answerText.length > 60) continue;

      const { options, correctIndex } = generateDistractors(answerText, r.id);

      pq = {
        id: r.id,
        question: r.question,
        type: "mcq",
        options,
        correctAnswer: correctIndex,
        explanation: r.explanation,
        group_id: r.group_id,
        group_context: r.group_context,
        group_image: r.group_image,
        difficulty,
        concept_tags,
        skill_tags,
      };
    }

    // For QA: split broad topics (Arithmetic/Algebra/Geometry) into subtopics
    let key: string;
    if (useSubtopic) {
      key = subtopic || topic;
    } else if (splitBroadTopics && QA_BROAD_TOPICS.has(topic)) {
      key = subtopic || topic;
    } else {
      key = topic;
    }
    if (!topicMap.has(key)) topicMap.set(key, []);
    topicMap.get(key)!.push(pq);
  }

  return Array.from(topicMap.entries()).map(([name, questions]) => ({
    slug: slugify(name),
    name,
    questions,
  }));
}

// ── Section routing by topic ────────────────────────────────────────────────

const LRDI_TOPICS = new Set(["Logical Reasoning", "Data Interpretation"]);
const VARC_TOPICS = new Set(["Reading Comprehension", "Para Jumbles", "Sentence Placement", "Summary"]);

function getSectionForTopic(topic: string): "qa" | "lrdi" | "varc" {
  if (LRDI_TOPICS.has(topic)) return "lrdi";
  if (VARC_TOPICS.has(topic)) return "varc";
  return "qa";
}

function getEffectiveTopic(r: RawQuestion): string {
  return topicOverrides[r.id]?.topic ?? r.topic;
}

const rawData: RawQuestion[] = Array.isArray(rawQuestions) ? rawQuestions : ((rawQuestions as any).default ?? []);

const qaRaw = rawData.filter((r) => getSectionForTopic(getEffectiveTopic(r)) === "qa");
const lrdiRaw = rawData.filter((r) => getSectionForTopic(getEffectiveTopic(r)) === "lrdi");
const varcRaw = rawData.filter((r) => getSectionForTopic(getEffectiveTopic(r)) === "varc");

const qaChapters = buildChaptersFromRaw(qaRaw, false, true);
const lrdiChapters = buildChaptersFromRaw(lrdiRaw, true);
const varcChapters = buildChaptersFromRaw(varcRaw);

export const practiceLabSections: SectionData[] = [
  {
    id: "qa",
    name: "Quantitative Ability",
    icon: "📐",
    description: "Arithmetic, Algebra, Geometry & Number Systems",
    chapters: qaChapters,
  },
  {
    id: "lrdi",
    name: "Logical Reasoning & Data Interpretation",
    icon: "🧩",
    description: "Arrangements, Puzzles & Data Interpretation",
    chapters: lrdiChapters,
  },
  {
    id: "varc",
    name: "Verbal Ability & Reading Comprehension",
    icon: "📖",
    description: "Reading Comprehension, Para Jumbles & Grammar",
    chapters: varcChapters,
  },
];
