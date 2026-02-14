// ─── CAT Study Plan Generator ───
// Generates 180 days of structured study plan based on target year and prep level.

export interface TaskItem {
  chapter: string;
  concept: string;
  questionCount: number;
  difficulty: "easy" | "medium" | "hard" | "mixed";
}

export interface DayPlan {
  day_number: number;
  qa_tasks_json: TaskItem[];
  lrdi_tasks_json: TaskItem[];
  varc_tasks_json: TaskItem[];
}

// ─── Syllabus Banks ───

const QA_CHAPTERS = [
  { chapter: "Number Systems", concepts: ["Divisibility", "HCF & LCM", "Remainders", "Factorials", "Last Digits"] },
  { chapter: "Arithmetic", concepts: ["Percentages", "Profit & Loss", "SI & CI", "Ratios", "Averages", "Mixtures"] },
  { chapter: "Algebra", concepts: ["Linear Equations", "Quadratic Equations", "Inequalities", "Functions", "Logs"] },
  { chapter: "Geometry", concepts: ["Triangles", "Circles", "Coordinate Geometry", "Mensuration", "Polygons"] },
  { chapter: "Modern Maths", concepts: ["Permutation & Combination", "Probability", "Set Theory", "Progressions", "Binomial"] },
  { chapter: "Time & Work", concepts: ["Pipes & Cisterns", "Work Efficiency", "Alternate Days", "Chain Rule"] },
  { chapter: "Time Speed Distance", concepts: ["Relative Speed", "Boats & Streams", "Trains", "Races", "Circular Motion"] },
];

const LRDI_CHAPTERS = [
  { chapter: "Arrangements", concepts: ["Linear", "Circular", "Matrix"] },
  { chapter: "Grouping & Selection", concepts: ["Team Formation", "Distribution", "Conditional Selection"] },
  { chapter: "Schedules", concepts: ["Sequencing", "Slot Allocation", "Timetable"] },
  { chapter: "Data Interpretation", concepts: ["Bar Graphs", "Pie Charts", "Tables", "Caselets", "Mixed Charts"] },
  { chapter: "Puzzles", concepts: ["Blood Relations", "Coding", "Direction Sense", "Syllogisms"] },
  { chapter: "Networks & Routes", concepts: ["Shortest Path", "Connectivity", "Flow"] },
];

const VARC_CHAPTERS = [
  { chapter: "Reading Comprehension", concepts: ["Social Science", "Philosophy", "Economics", "Science & Tech", "Abstract"] },
  { chapter: "Para Jumbles", concepts: ["4-Sentence PJ", "5-Sentence PJ", "Odd Sentence Out"] },
  { chapter: "Para Summary", concepts: ["Summarization", "Main Idea", "Critical Reasoning"] },
  { chapter: "Sentence Completion", concepts: ["Vocab-based", "Grammar-based", "Context-based"] },
  { chapter: "Critical Reasoning", concepts: ["Strengthen/Weaken", "Assumptions", "Inferences"] },
];

type PrepLevel = "beginner" | "basic_done" | "sectionals" | "mocks";
type TargetYear = "2026" | "2027" | "2028";

interface PhaseConfig {
  name: string;
  days: number;
  difficulty: "easy" | "medium" | "hard" | "mixed";
  qaQuestions: number;
  lrdiSets: number;
  varcRCs: number;
  varcVA: number;
}

function getPhases(year: TargetYear, _level: PrepLevel): PhaseConfig[] {
  if (year === "2028") {
    return [
      { name: "Foundation", days: 60, difficulty: "easy", qaQuestions: 20, lrdiSets: 2, varcRCs: 1, varcVA: 6 },
      { name: "Concept Building", days: 40, difficulty: "medium", qaQuestions: 22, lrdiSets: 2, varcRCs: 1, varcVA: 7 },
      { name: "Mixed Practice", days: 40, difficulty: "medium", qaQuestions: 23, lrdiSets: 3, varcRCs: 2, varcVA: 7 },
      { name: "Sectionals", days: 20, difficulty: "hard", qaQuestions: 25, lrdiSets: 3, varcRCs: 2, varcVA: 8 },
      { name: "Full Mocks", days: 20, difficulty: "mixed", qaQuestions: 25, lrdiSets: 3, varcRCs: 2, varcVA: 8 },
    ];
  }
  if (year === "2027") {
    return [
      { name: "Foundation", days: 45, difficulty: "easy", qaQuestions: 20, lrdiSets: 2, varcRCs: 1, varcVA: 6 },
      { name: "Practice", days: 50, difficulty: "medium", qaQuestions: 22, lrdiSets: 2, varcRCs: 1, varcVA: 7 },
      { name: "Sectionals", days: 45, difficulty: "hard", qaQuestions: 24, lrdiSets: 3, varcRCs: 2, varcVA: 8 },
      { name: "Full Mocks", days: 40, difficulty: "mixed", qaQuestions: 25, lrdiSets: 3, varcRCs: 2, varcVA: 8 },
    ];
  }
  // 2026 - aggressive
  return [
    { name: "Aggressive Foundation", days: 30, difficulty: "easy", qaQuestions: 22, lrdiSets: 2, varcRCs: 1, varcVA: 7 },
    { name: "Mixed Practice", days: 40, difficulty: "medium", qaQuestions: 23, lrdiSets: 3, varcRCs: 2, varcVA: 7 },
    { name: "Sectionals", days: 50, difficulty: "hard", qaQuestions: 25, lrdiSets: 3, varcRCs: 2, varcVA: 8 },
    { name: "Full Mocks", days: 60, difficulty: "mixed", qaQuestions: 25, lrdiSets: 3, varcRCs: 2, varcVA: 8 },
  ];
}

function pick<T>(arr: T[], seed: number): T {
  return arr[seed % arr.length];
}

export function generateStudyPlan(targetYear: string, prepLevel: string): DayPlan[] {
  const year = targetYear.replace("CAT ", "") as TargetYear;
  const levelMap: Record<string, PrepLevel> = {
    "Beginner": "beginner",
    "Basic Concepts Done": "basic_done",
    "Attempting Sectionals": "sectionals",
    "Already Giving Mocks": "mocks",
  };
  const level = levelMap[prepLevel] || "beginner";
  const phases = getPhases(year, level);
  const days: DayPlan[] = [];
  let dayNum = 1;

  for (const phase of phases) {
    for (let d = 0; d < phase.days; d++) {
      const seed = dayNum * 17 + d * 7;

      // QA tasks
      const qaChapter = pick(QA_CHAPTERS, seed);
      const qaConcept = pick(qaChapter.concepts, seed + 3);
      const qa: TaskItem[] = [
        { chapter: qaChapter.chapter, concept: qaConcept, questionCount: phase.qaQuestions, difficulty: phase.difficulty },
      ];

      // LRDI tasks
      const lrdiChapter = pick(LRDI_CHAPTERS, seed + 5);
      const lrdiConcept = pick(lrdiChapter.concepts, seed + 11);
      const lrdi: TaskItem[] = [
        { chapter: lrdiChapter.chapter, concept: lrdiConcept, questionCount: phase.lrdiSets, difficulty: phase.difficulty },
      ];

      // VARC tasks
      const varcRC = pick(VARC_CHAPTERS, seed + 13);
      const varcRCConcept = pick(varcRC.concepts, seed + 19);
      const varcVA = pick(VARC_CHAPTERS.slice(1), seed + 23);
      const varcVAConcept = pick(varcVA.concepts, seed + 29);
      const varc: TaskItem[] = [
        { chapter: varcRC.chapter, concept: varcRCConcept, questionCount: phase.varcRCs, difficulty: phase.difficulty },
        { chapter: varcVA.chapter, concept: varcVAConcept, questionCount: phase.varcVA, difficulty: phase.difficulty },
      ];

      days.push({ day_number: dayNum, qa_tasks_json: qa, lrdi_tasks_json: lrdi, varc_tasks_json: varc });
      dayNum++;
    }
  }

  return days;
}
