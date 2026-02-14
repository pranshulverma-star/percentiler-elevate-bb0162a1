import type { Question, Difficulty, Section } from "@/data/readinessQuestions";

const DIFFICULTY_WEIGHTS: Record<Difficulty, number> = {
  easy: 1,
  medium: 1.5,
  hard: 2,
};

const TOTAL_TIME = 900; // seconds

export interface AssessmentResult {
  readinessIndex: number;
  band: string;
  accuracyPercent: number;
  avgTimePerQuestion: number;
  correctCount: number;
  totalQuestions: number;
  accuracyScore: number;
  difficultyScore: number;
  timeScore: number;
  targetScore: number;
  difficultyBreakdown: Record<Difficulty, { correct: number; total: number }>;
  sectionBreakdown: Record<Section, { correct: number; total: number }>;
  timeTaken: number;
  targetPercentile: string;
}

export function computeScore(
  questions: Question[],
  answers: Record<number, number>,
  timeTaken: number,
  targetPercentile: string
): AssessmentResult {
  const total = questions.length;
  let correctCount = 0;

  const difficultyBreakdown: Record<Difficulty, { correct: number; total: number }> = {
    easy: { correct: 0, total: 0 },
    medium: { correct: 0, total: 0 },
    hard: { correct: 0, total: 0 },
  };

  const sectionBreakdown: Record<Section, { correct: number; total: number }> = {
    quant: { correct: 0, total: 0 },
    lrdi: { correct: 0, total: 0 },
    varc: { correct: 0, total: 0 },
  };

  let weightedCorrect = 0;
  let weightedTotal = 0;

  questions.forEach((q) => {
    const isCorrect = answers[q.id] === q.correctAnswer;
    const w = DIFFICULTY_WEIGHTS[q.difficulty];

    difficultyBreakdown[q.difficulty].total++;
    sectionBreakdown[q.section].total++;
    weightedTotal += w;

    if (isCorrect) {
      correctCount++;
      weightedCorrect += w;
      difficultyBreakdown[q.difficulty].correct++;
      sectionBreakdown[q.section].correct++;
    }
  });

  // 1. Accuracy (40%)
  const accuracyScore = (correctCount / total) * 40;

  // 2. Difficulty weighted (30%)
  const difficultyScore = (weightedCorrect / weightedTotal) * 30;

  // 3. Time efficiency (20%)
  let timeScore: number;
  if (timeTaken <= 750) {
    timeScore = 20;
  } else if (timeTaken < TOTAL_TIME) {
    timeScore = 20 * (1 - (timeTaken - 750) / (TOTAL_TIME - 750)) * 0.8 + 20 * 0.2;
  } else {
    timeScore = 2; // minimal
  }

  // 4. Target adjustment (10%)
  let targetScore: number;
  const baseTarget = (correctCount / total) * 10;
  if (targetPercentile === "99+") {
    targetScore = baseTarget * 0.7;
  } else if (targetPercentile === "98+") {
    targetScore = baseTarget * 0.8;
  } else if (targetPercentile === "95+") {
    targetScore = baseTarget * 0.9;
  } else {
    targetScore = baseTarget;
  }

  const readinessIndex = Math.round(
    Math.min(100, Math.max(0, accuracyScore + difficultyScore + timeScore + targetScore))
  );

  let band: string;
  if (readinessIndex <= 40) band = "Foundational";
  else if (readinessIndex <= 60) band = "Developing";
  else if (readinessIndex <= 80) band = "Competitive";
  else band = "Advanced";

  return {
    readinessIndex,
    band,
    accuracyPercent: Math.round((correctCount / total) * 100),
    avgTimePerQuestion: Math.round(timeTaken / total),
    correctCount,
    totalQuestions: total,
    accuracyScore: Math.round(accuracyScore * 10) / 10,
    difficultyScore: Math.round(difficultyScore * 10) / 10,
    timeScore: Math.round(timeScore * 10) / 10,
    targetScore: Math.round(targetScore * 10) / 10,
    difficultyBreakdown,
    sectionBreakdown,
    timeTaken,
    targetPercentile,
  };
}

export function generateInsight(result: AssessmentResult): string {
  const { band, targetPercentile, sectionBreakdown, difficultyBreakdown, accuracyPercent, timeTaken } = result;

  const weakSections = (Object.entries(sectionBreakdown) as [Section, { correct: number; total: number }][])
    .filter(([, v]) => v.total > 0 && v.correct / v.total < 0.5)
    .map(([k]) => k.toUpperCase());

  const weakDifficulty = (Object.entries(difficultyBreakdown) as [Difficulty, { correct: number; total: number }][])
    .filter(([, v]) => v.total > 0 && v.correct / v.total < 0.5)
    .map(([k]) => k);

  const slow = timeTaken > 750;

  let insight = `To realistically target ${targetPercentile}, `;

  if (band === "Foundational") {
    insight += "you need to significantly strengthen your fundamentals across all sections. ";
  } else if (band === "Developing") {
    insight += "you're building a foundation but need focused improvement. ";
  } else if (band === "Competitive") {
    insight += "you're on track but need to sharpen specific areas. ";
  } else {
    insight += "you're well-positioned — focus on consistency and peak performance. ";
  }

  if (weakSections.length > 0) {
    insight += `Focus on improving accuracy in ${weakSections.join(" and ")}. `;
  }
  if (weakDifficulty.length > 0) {
    insight += `You need stronger performance on ${weakDifficulty.join(" and ")} difficulty questions. `;
  }
  if (slow) {
    insight += "Work on improving your speed to complete within optimal time.";
  }

  return insight.trim();
}
