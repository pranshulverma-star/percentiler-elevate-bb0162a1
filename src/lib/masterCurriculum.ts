// ─── Master Curriculum: Fixed Academic Sequence ───
// This order NEVER changes. No randomness. No shuffling.

export interface WeekCurriculum {
  label: string;          // e.g. "April Week 1"
  qa_topic: string;
  qa_questions: number;
  lrdi_topic: string;
  lrdi_sets: number;
  varc_topic: string;
  varc_questions: number;
  weekly_test: boolean;
}

export const MASTER_CURRICULUM: WeekCurriculum[] = [
  // April
  { label: "April Week 1", qa_topic: "Vedic Maths + Ratios", qa_questions: 60, lrdi_topic: "Logic Puzzles", lrdi_sets: 13, varc_topic: "Grammar + Vocab + Reading", varc_questions: 70, weekly_test: false },
  { label: "April Week 2", qa_topic: "Percentages", qa_questions: 50, lrdi_topic: "Circular + Double Line-up", lrdi_sets: 20, varc_topic: "PJ + Odd One Out", varc_questions: 35, weekly_test: true },
  { label: "April Week 3", qa_topic: "Profit & Loss + SICI", qa_questions: 80, lrdi_topic: "Venn Diagrams", lrdi_sets: 30, varc_topic: "Summary + Completion", varc_questions: 35, weekly_test: true },
  { label: "April Week 4", qa_topic: "Time & Work + Intro TSD", qa_questions: 80, lrdi_topic: "Games & Tournaments", lrdi_sets: 15, varc_topic: "CR Assumption", varc_questions: 30, weekly_test: true },
  // May
  { label: "May Week 1", qa_topic: "Finish TSD + Quadratic", qa_questions: 130, lrdi_topic: "Network & 3D", lrdi_sets: 15, varc_topic: "CR Inference", varc_questions: 30, weekly_test: true },
  { label: "May Week 2", qa_topic: "AP GP HP", qa_questions: 100, lrdi_topic: "Line/Bar Graph", lrdi_sets: 15, varc_topic: "CR Conclusion", varc_questions: 30, weekly_test: true },
  { label: "May Week 3", qa_topic: "Inequality + Logs", qa_questions: 150, lrdi_topic: "Pie Charts", lrdi_sets: 20, varc_topic: "RC GMAT", varc_questions: 21, weekly_test: true },
  { label: "May Week 4", qa_topic: "Max/Min + Functions", qa_questions: 90, lrdi_topic: "% Based DI", lrdi_sets: 20, varc_topic: "RC + Summary", varc_questions: 21, weekly_test: true },
  // June
  { label: "June Week 1", qa_topic: "Circles + Triangles", qa_questions: 90, lrdi_topic: "Avg Based DI", lrdi_sets: 20, varc_topic: "PJ + RC", varc_questions: 21, weekly_test: true },
  { label: "June Week 2", qa_topic: "Quadrilaterals", qa_questions: 80, lrdi_topic: "Mixed CAT Sets", lrdi_sets: 15, varc_topic: "Grammar + RC Timed", varc_questions: 20, weekly_test: true },
  { label: "June Week 3", qa_topic: "Mensuration + PnC", qa_questions: 120, lrdi_topic: "CAT PYQ Reasoning", lrdi_sets: 21, varc_topic: "Summary + RC Timed", varc_questions: 20, weekly_test: true },
  { label: "June Week 4", qa_topic: "Probability + Factorials", qa_questions: 100, lrdi_topic: "Puzzle Revision", lrdi_sets: 14, varc_topic: "VARC Sectionals", varc_questions: 30, weekly_test: true },
  // July
  { label: "July Week 1", qa_topic: "Prime/HCF/LCM", qa_questions: 40, lrdi_topic: "Reasoning Sectionals", lrdi_sets: 14, varc_topic: "Mixed VARC", varc_questions: 30, weekly_test: true },
  { label: "July Week 2", qa_topic: "Remainders + QA Tests", qa_questions: 40, lrdi_topic: "Advanced DI Tests", lrdi_sets: 14, varc_topic: "Reading Drills", varc_questions: 30, weekly_test: true },
  { label: "July Week 3", qa_topic: "Arithmetic Revision", qa_questions: 120, lrdi_topic: "Puzzle Reinforcement", lrdi_sets: 14, varc_topic: "Advanced RC", varc_questions: 30, weekly_test: true },
  { label: "July Week 4", qa_topic: "Algebra Revision", qa_questions: 100, lrdi_topic: "LRDI Sectionals", lrdi_sets: 14, varc_topic: "Full VARC Test", varc_questions: 30, weekly_test: true },
  // August
  { label: "August Week 1", qa_topic: "Geometry Revision", qa_questions: 100, lrdi_topic: "Tough Set Drill", lrdi_sets: 14, varc_topic: "RC + PJ Mixed", varc_questions: 30, weekly_test: true },
  { label: "August Week 2", qa_topic: "Modern Maths Revision", qa_questions: 50, lrdi_topic: "Speed Set Practice", lrdi_sets: 14, varc_topic: "Sectionals + Errors", varc_questions: 30, weekly_test: true },
  { label: "August Week 3", qa_topic: "Number System Revision", qa_questions: 80, lrdi_topic: "CAT Caselets", lrdi_sets: 14, varc_topic: "VA-RC Split", varc_questions: 30, weekly_test: true },
  { label: "August Week 4", qa_topic: "QA Sectionals", qa_questions: 90, lrdi_topic: "LRDI Full-Length Sectionals", lrdi_sets: 14, varc_topic: "VARC Full-Length", varc_questions: 30, weekly_test: true },
];

// Total curriculum days = 20 weeks × 7 = 140 days

// ─── Skip Hierarchy (for crash mode / compression) ───

// Tier 3: Skip first in crash mode
const TIER_3_QA = ["Vedic Maths", "Profit & Loss", "Max/Min", "Quadrilaterals", "Mensuration", "Probability", "PnC"];
const TIER_3_LRDI = ["Logic Puzzles", "Games & Tournaments", "Line/Bar Graph"];
const TIER_3_VARC = ["Grammar", "Vocab"];

// Tier 2: Compress if needed
const TIER_2_LABELS = ["Revision", "Sectionals", "Advanced DI", "Advanced RC"];

function isTier3Week(w: WeekCurriculum): boolean {
  return TIER_3_QA.some(t => w.qa_topic.includes(t)) ||
    TIER_3_LRDI.some(t => w.lrdi_topic.includes(t)) ||
    TIER_3_VARC.some(t => w.varc_topic.includes(t));
}

function isTier2Week(w: WeekCurriculum): boolean {
  return TIER_2_LABELS.some(t => w.qa_topic.includes(t) || w.lrdi_topic.includes(t) || w.varc_topic.includes(t));
}

// ─── Daily Task ───

export interface DailyTask {
  dayIndex: number;       // 0-based from start_date
  weekLabel: string;
  dayOfWeek: number;      // 0=Mon .. 6=Sun
  qa_topic: string;
  qa_questions: number;
  lrdi_topic: string;
  lrdi_sets: number;
  varc_topic: string;
  varc_questions: number;
  is_mock_day: boolean;
  weekly_test: boolean;
  revision: boolean;
  phase: string;
}

// ─── Prep Level Modifiers ───

type PrepLevel = "Beginner" | "Concepts Done" | "Sectionals" | "Mocks";

function applyPrepModifier(
  qaQ: number, varcQ: number, prepLevel: PrepLevel
): { qaQ: number; varcQ: number } {
  if (prepLevel === "Concepts Done") {
    return { qaQ: Math.round(qaQ * 0.6), varcQ: Math.round(varcQ * 0.6) };
  }
  if (prepLevel === "Sectionals" || prepLevel === "Mocks") {
    return { qaQ: Math.round(qaQ * 0.5), varcQ: varcQ };
  }
  return { qaQ, varcQ };
}

// ─── Core Engine ───

export function getLastSundayOfNovember(year: number): Date {
  const d = new Date(year, 10, 30); // Nov 30
  while (d.getDay() !== 0) d.setDate(d.getDate() - 1);
  return d;
}

export function getDaysUntilCAT(targetYear: number): number {
  const catDate = getLastSundayOfNovember(targetYear);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  catDate.setHours(0, 0, 0, 0);
  return Math.max(0, Math.ceil((catDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
}

export function getPhaseLabel(daysLeft: number, dayIndex: number, totalDays: number): string {
  const daysFromEnd = totalDays - dayIndex;
  if (daysFromEnd <= 45) return "Mock Phase";
  // Check if in revision weeks (weeks 15-20 roughly)
  if (daysLeft <= 120) return "Strength Phase";
  return "Foundation Phase";
}

export interface PlanConfig {
  targetYear: number;
  startDate: Date;
  prepLevel: PrepLevel;
}

export function generateFullPlan(config: PlanConfig): DailyTask[] {
  const { targetYear, startDate, prepLevel } = config;
  const catDate = getLastSundayOfNovember(targetYear);
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  catDate.setHours(0, 0, 0, 0);

  const totalDays = Math.max(0, Math.ceil((catDate.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
  if (totalDays === 0) return [];

  const isCrashMode = totalDays <= 50;
  const MOCK_RESERVE = 45;
  const curriculumDays = Math.max(0, totalDays - MOCK_RESERVE);

  // Build the curriculum sequence, applying skip/compression
  let weeks = [...MASTER_CURRICULUM];

  if (isCrashMode) {
    // Only Tier 1 topics
    weeks = weeks.filter(w => !isTier3Week(w) && !isTier2Week(w));
  } else if (curriculumDays < 140) {
    // Need to compress: first remove Tier 3, then Tier 2
    const tier1Weeks = weeks.filter(w => !isTier3Week(w));
    if (tier1Weeks.length * 7 <= curriculumDays) {
      weeks = tier1Weeks;
    } else {
      // Further compress: remove Tier 2
      weeks = tier1Weeks.filter(w => !isTier2Week(w));
    }
  }

  // Flatten weeks into daily tasks
  const dailyTasks: DailyTask[] = [];
  let dayIndex = 0;

  // Curriculum phase
  for (const week of weeks) {
    if (dayIndex >= curriculumDays) break;

    const daysThisWeek = Math.min(7, curriculumDays - dayIndex);
    const { qaQ, varcQ } = applyPrepModifier(week.qa_questions, week.varc_questions, prepLevel);

    for (let d = 0; d < daysThisWeek; d++) {
      const dayQA = Math.round(qaQ / 7);
      const dayVARC = Math.round(varcQ / 7);
      const dayLRDI = Math.round(week.lrdi_sets / 7) || 1;
      const isSunday = d === 6;

      dailyTasks.push({
        dayIndex,
        weekLabel: week.label,
        dayOfWeek: d,
        qa_topic: week.qa_topic,
        qa_questions: dayQA,
        lrdi_topic: week.lrdi_topic,
        lrdi_sets: dayLRDI,
        varc_topic: week.varc_topic,
        varc_questions: dayVARC,
        is_mock_day: false,
        weekly_test: isSunday && week.weekly_test,
        revision: !isCrashMode,
        phase: getPhaseLabel(totalDays - dayIndex, dayIndex, totalDays),
      });
      dayIndex++;
    }
  }

  // Mock phase: last 45 days (or remaining days)
  const mockStart = dayIndex;
  const mockEnd = totalDays;
  // Continue from August Week 4 content for non-mock days
  const lastWeek = MASTER_CURRICULUM[MASTER_CURRICULUM.length - 1];
  const { qaQ: mockQA, varcQ: mockVARC } = applyPrepModifier(lastWeek.qa_questions, lastWeek.varc_questions, prepLevel);

  for (let i = mockStart; i < mockEnd; i++) {
    // In mock phase, day-of-week relative to mock start
    const mockDayOfWeek = (i - mockStart) % 7;
    // Fixed mock days: Wednesday (2) and Sunday (6)
    const isMockDay = mockDayOfWeek === 2 || mockDayOfWeek === 6;
    // Max 2 mocks per week already enforced by Wed+Sun

    if (isMockDay) {
      dailyTasks.push({
        dayIndex: i,
        weekLabel: "Mock Phase",
        dayOfWeek: mockDayOfWeek,
        qa_topic: "Full Mock CAT + Analysis",
        qa_questions: 0,
        lrdi_topic: "Full Mock CAT + Analysis",
        lrdi_sets: 0,
        varc_topic: "Full Mock CAT + Analysis",
        varc_questions: 0,
        is_mock_day: true,
        weekly_test: false,
        revision: false,
        phase: "Mock Phase",
      });
    } else {
      dailyTasks.push({
        dayIndex: i,
        weekLabel: "Mock Phase – Practice",
        dayOfWeek: mockDayOfWeek,
        qa_topic: lastWeek.qa_topic,
        qa_questions: Math.round(mockQA / 7),
        lrdi_topic: lastWeek.lrdi_topic,
        lrdi_sets: Math.round(lastWeek.lrdi_sets / 7) || 1,
        varc_topic: lastWeek.varc_topic,
        varc_questions: Math.round(mockVARC / 7),
        is_mock_day: false,
        weekly_test: false,
        revision: !isCrashMode,
        phase: "Mock Phase",
      });
    }
  }

  return dailyTasks;
}

// Get a single day's task by index
export function getDayTask(config: PlanConfig, dayIndex: number): DailyTask | null {
  const plan = generateFullPlan(config);
  return plan[dayIndex] ?? null;
}
