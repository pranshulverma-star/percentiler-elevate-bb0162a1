export interface PracticeQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number; // 0-based index
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

export const practiceLabSections: SectionData[] = [
  {
    id: "qa",
    name: "Quantitative Ability",
    icon: "📐",
    description: "Arithmetic, Algebra, Geometry & Number Systems",
    chapters: [
      { slug: "arithmetic", name: "Arithmetic", questions: [] },
      { slug: "algebra", name: "Algebra", questions: [] },
      { slug: "geometry", name: "Geometry & Mensuration", questions: [] },
      { slug: "number-systems", name: "Number Systems", questions: [] },
      { slug: "modern-math", name: "Modern Math", questions: [] },
    ],
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
