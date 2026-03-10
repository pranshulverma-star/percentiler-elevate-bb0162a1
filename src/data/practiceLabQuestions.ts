import rawQuestions from "./questions_full.json";

export interface PracticeQuestion {
  id: number;
  question: string;
  type: "mcq" | "numeric";
  options: string[]; // populated for mcq
  correctAnswer: number; // 0-based index for mcq, -1 for numeric
  numericAnswer?: string; // correct answer text for numeric
  explanation?: string;
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
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[&,]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

function buildChaptersFromRaw(raw: RawQuestion[]): Chapter[] {
  const topicMap = new Map<string, PracticeQuestion[]>();

  for (const r of raw) {
    const optKeys = Object.keys(r.options);
    const isMcq = optKeys.length >= 2 && optKeys.every((k) => /^\d+$/.test(k));

    let pq: PracticeQuestion;

    if (isMcq) {
      // Sort option keys numerically
      const sortedKeys = optKeys.sort((a, b) => Number(a) - Number(b));
      const optionsArr = sortedKeys.map((k) => r.options[k]);
      // correct_answer is 1-based key string like "2"
      const correctIdx = sortedKeys.indexOf(r.correct_answer);

      pq = {
        id: r.id,
        question: r.question,
        type: "mcq",
        options: optionsArr,
        correctAnswer: correctIdx >= 0 ? correctIdx : 0,
        explanation: r.explanation,
      };
    } else {
      // Numeric / fill-in-the-blank
      const answer = r.correct_answer === "Open-ended" ? extractAnswerFromExplanation(r.explanation || "") : r.correct_answer;
      pq = {
        id: r.id,
        question: r.question,
        type: "numeric",
        options: [],
        correctAnswer: -1,
        numericAnswer: answer,
        explanation: r.explanation,
      };
    }

    const topic = r.topic;
    if (!topicMap.has(topic)) topicMap.set(topic, []);
    topicMap.get(topic)!.push(pq);
  }

  return Array.from(topicMap.entries()).map(([topic, questions]) => ({
    slug: slugify(topic),
    name: topic,
    questions,
  }));
}

function extractAnswerFromExplanation(explanation: string): string {
  // Try to extract the final answer from common patterns
  // e.g., "G = 300 girls" → "300", "Ratio = 3:1" → "3:1", "V = 30 litres" → "30"
  const patterns = [
    /(?:answer|ans)[.:]\s*(.+?)(?:\.|$)/i,
    /=\s*([\d.:/ ]+)\s*(?:litres|litre|km|kg|rs|rupees|girls|boys|hours|days|minutes|seconds|kmph|km\/hr|m\/s)?\.?\s*$/i,
    /(?:ratio\s*(?:is|=)\s*)([\d: ]+)/i,
  ];
  for (const p of patterns) {
    const m = explanation.match(p);
    if (m) return m[1].trim();
  }
  return "";
}

// Build from raw data
const rawData = Array.isArray(rawQuestions) ? rawQuestions : (rawQuestions as any).default || [];
const qaChapters = buildChaptersFromRaw(rawData as RawQuestion[]);
console.log("[PracticeLab] Loaded", rawData.length, "raw questions →", qaChapters.length, "chapters");

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
    chapters: [
      { slug: "arrangements", name: "Arrangements", questions: [] },
      { slug: "puzzles", name: "Puzzles", questions: [] },
      { slug: "data-interpretation", name: "Data Interpretation", questions: [] },
      { slug: "logical-reasoning", name: "Logical Reasoning", questions: [] },
    ],
  },
  {
    id: "varc",
    name: "Verbal Ability & Reading Comprehension",
    icon: "📖",
    description: "Reading Comprehension, Para Jumbles & Grammar",
    chapters: [
      { slug: "reading-comprehension", name: "Reading Comprehension", questions: [] },
      { slug: "para-jumbles", name: "Para Jumbles", questions: [] },
      { slug: "sentence-correction", name: "Sentence Correction", questions: [] },
      { slug: "critical-reasoning", name: "Critical Reasoning", questions: [] },
    ],
  },
];
