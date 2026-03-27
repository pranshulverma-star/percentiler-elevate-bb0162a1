import type { QuestionAttempt } from "@/hooks/useRevisionData";
import { startOfWeek, format } from "date-fns";

export interface ChapterWeakness {
  chapter_slug: string;
  section_id: string;
  total: number;
  wrong: number;
  accuracy: number; // 0-100
}

export interface SectionWeakness {
  section_id: string;
  total: number;
  wrong: number;
  accuracy: number;
}

export interface AccuracyByWeek {
  week: string; // "MMM d" label
  accuracy: number;
  total: number;
}

export interface RevisionPriorityItem {
  chapter_slug: string;
  section_id: string;
  score: number; // higher = more urgent
  reason: string;
  wrong: number;
  total: number;
  accuracy: number;
  lastAttempted: string | null;
}

/** Latest attempt per question_id (most recent determines if still "wrong") */
export function getLatestAttemptPerQuestion(
  attempts: QuestionAttempt[]
): Map<number, QuestionAttempt> {
  const map = new Map<number, QuestionAttempt>();
  // attempts are ordered newest-first
  for (const a of attempts) {
    if (!map.has(a.question_id)) {
      map.set(a.question_id, a);
    }
  }
  return map;
}

/** Wrong questions = questions where the LATEST attempt is incorrect */
export function getWrongAttempts(attempts: QuestionAttempt[]): QuestionAttempt[] {
  const latest = getLatestAttemptPerQuestion(attempts);
  return Array.from(latest.values()).filter((a) => !a.is_correct);
}

/** Chapter-level weakness: accuracy per chapter using ALL attempts */
export function getChapterWeakness(attempts: QuestionAttempt[]): ChapterWeakness[] {
  const map = new Map<string, { total: number; wrong: number; section_id: string }>();

  for (const a of attempts) {
    const key = `${a.section_id}::${a.chapter_slug}`;
    const existing = map.get(key) ?? { total: 0, wrong: 0, section_id: a.section_id };
    existing.total++;
    if (!a.is_correct) existing.wrong++;
    map.set(key, existing);
  }

  return Array.from(map.entries())
    .map(([key, v]) => {
      const chapter_slug = key.split("::")[1];
      return {
        chapter_slug,
        section_id: v.section_id,
        total: v.total,
        wrong: v.wrong,
        accuracy: v.total > 0 ? Math.round(((v.total - v.wrong) / v.total) * 100) : 0,
      };
    })
    .sort((a, b) => a.accuracy - b.accuracy); // worst accuracy first
}

/** Section-level weakness */
export function getSectionWeakness(attempts: QuestionAttempt[]): SectionWeakness[] {
  const map = new Map<string, { total: number; wrong: number }>();

  for (const a of attempts) {
    const existing = map.get(a.section_id) ?? { total: 0, wrong: 0 };
    existing.total++;
    if (!a.is_correct) existing.wrong++;
    map.set(a.section_id, existing);
  }

  return Array.from(map.entries()).map(([section_id, v]) => ({
    section_id,
    total: v.total,
    wrong: v.wrong,
    accuracy: v.total > 0 ? Math.round(((v.total - v.wrong) / v.total) * 100) : 0,
  }));
}

/** Weekly accuracy trend (last 8 weeks) */
export function getAccuracyByWeek(attempts: QuestionAttempt[]): AccuracyByWeek[] {
  const map = new Map<string, { total: number; correct: number; date: Date }>();

  for (const a of attempts) {
    const d = new Date(a.attempted_at);
    const weekStart = startOfWeek(d, { weekStartsOn: 1 }); // Monday
    const key = weekStart.toISOString().slice(0, 10);
    const existing = map.get(key) ?? { total: 0, correct: 0, date: weekStart };
    existing.total++;
    if (a.is_correct) existing.correct++;
    map.set(key, existing);
  }

  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-8)
    .map(([, v]) => ({
      week: format(v.date, "MMM d"),
      accuracy: v.total > 0 ? Math.round((v.correct / v.total) * 100) : 0,
      total: v.total,
    }));
}

/** Priority scoring: which chapters to revise first */
export function getRevisionPriority(attempts: QuestionAttempt[]): RevisionPriorityItem[] {
  const chapterData = new Map<
    string,
    {
      section_id: string;
      wrong: number;
      total: number;
      recentWrong: number; // wrong in last 14 days
      lastAttempted: string | null;
    }
  >();

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 14);

  for (const a of attempts) {
    const key = `${a.section_id}::${a.chapter_slug}`;
    const existing = chapterData.get(key) ?? {
      section_id: a.section_id,
      wrong: 0,
      total: 0,
      recentWrong: 0,
      lastAttempted: null,
    };

    existing.total++;
    if (!a.is_correct) {
      existing.wrong++;
      if (new Date(a.attempted_at) >= cutoff) existing.recentWrong++;
    }

    if (!existing.lastAttempted || a.attempted_at > existing.lastAttempted) {
      existing.lastAttempted = a.attempted_at;
    }

    chapterData.set(key, existing);
  }

  const results: RevisionPriorityItem[] = [];

  for (const [key, v] of chapterData.entries()) {
    if (v.total < 3 || v.wrong === 0) continue; // skip chapters with too few attempts or no errors
    const chapter_slug = key.split("::")[1];
    const accuracy = Math.round(((v.total - v.wrong) / v.total) * 100);

    // Score: higher error rate + recent errors = higher urgency
    const errorRate = v.wrong / v.total;
    const recencyBoost = v.recentWrong / Math.max(v.wrong, 1);
    const volumeBoost = Math.min(v.wrong / 5, 1); // caps at 5 wrong questions
    const score = Math.round((errorRate * 50 + recencyBoost * 30 + volumeBoost * 20) * 100) / 100;

    let reason: string;
    if (accuracy < 40) reason = "Critical weakness — high error rate";
    else if (accuracy < 60) reason = "Needs work — below 60% accuracy";
    else if (v.recentWrong >= 3) reason = "Recent mistakes — fresh revision needed";
    else reason = "Room for improvement";

    results.push({
      chapter_slug,
      section_id: v.section_id,
      score,
      reason,
      wrong: v.wrong,
      total: v.total,
      accuracy,
      lastAttempted: v.lastAttempted,
    });
  }

  return results.sort((a, b) => b.score - a.score).slice(0, 10);
}

/** Human-readable chapter name from slug */
export function slugToName(slug: string): string {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/** Section display name */
export function sectionName(id: string): string {
  const map: Record<string, string> = { qa: "QA", lrdi: "LRDI", varc: "VARC" };
  return map[id] ?? id.toUpperCase();
}

// ── AI coaching analytics ────────────────────────────────────────────────────

export interface SubtopicWeaknessItem {
  subtopic: string;
  topic: string;
  total: number;
  wrong: number;
  was_skipped: number;
  error_rate: number;
}

/** Weakness grouped by subtopic (most granular signal for the AI) */
export function getSubtopicWeakness(attempts: QuestionAttempt[]): SubtopicWeaknessItem[] {
  const map = new Map<string, {
    subtopic: string;
    topic: string;
    total: number;
    wrong: number;
    was_skipped: number;
  }>();

  for (const a of attempts) {
    const subtopic = (a as any).subtopic ?? null;
    if (!subtopic) continue;
    const key = subtopic;
    const existing = map.get(key) ?? {
      subtopic,
      topic: a.chapter_slug.replace(/-/g, " "),
      total: 0,
      wrong: 0,
      was_skipped: 0,
    };
    existing.total++;
    if (!a.is_correct) existing.wrong++;
    if ((a as any).was_skipped) existing.was_skipped++;
    map.set(key, existing);
  }

  return Array.from(map.values())
    .filter((s) => s.total >= 2)
    .map((s) => ({ ...s, error_rate: Math.round((s.wrong / s.total) * 100) }))
    .sort((a, b) => b.error_rate - a.error_rate);
}

export interface DifficultyBreakdownItem {
  difficulty: string;
  total: number;
  correct: number;
  wrong: number;
  accuracy: number;
}

/** Accuracy broken down by difficulty level */
export function getDifficultyBreakdown(attempts: QuestionAttempt[]): DifficultyBreakdownItem[] {
  const map = new Map<string, { total: number; correct: number }>();

  for (const a of attempts) {
    const d = a.difficulty ?? "Medium";
    const existing = map.get(d) ?? { total: 0, correct: 0 };
    existing.total++;
    if (a.is_correct) existing.correct++;
    map.set(d, existing);
  }

  return Array.from(map.entries()).map(([difficulty, data]) => ({
    difficulty,
    total: data.total,
    correct: data.correct,
    wrong: data.total - data.correct,
    accuracy: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0,
  }));
}

export interface ConceptTagFailItem {
  tag: string;
  total: number;
  wrong: number;
  error_rate: number;
}

/** Most-failed concept tags across all attempts */
export function getTopFailingConceptTags(attempts: QuestionAttempt[]): ConceptTagFailItem[] {
  const map = new Map<string, { total: number; wrong: number }>();

  for (const a of attempts) {
    const tags = (a.concept_tags as string[] | null) ?? [];
    for (const tag of tags) {
      const existing = map.get(tag) ?? { total: 0, wrong: 0 };
      existing.total++;
      if (!a.is_correct) existing.wrong++;
      map.set(tag, existing);
    }
  }

  return Array.from(map.entries())
    .filter(([, d]) => d.total >= 3)
    .map(([tag, d]) => ({
      tag,
      total: d.total,
      wrong: d.wrong,
      error_rate: Math.round((d.wrong / d.total) * 100),
    }))
    .sort((a, b) => b.error_rate - a.error_rate)
    .slice(0, 10);
}

export interface SectionWeaknessEnriched {
  section_id: string;
  label: string;
  total: number;
  correct: number;
  skipped: number;
  accuracy_rate: number; // accuracy on attempted (non-skipped) questions
  skip_rate: number;     // % of total that were skipped
}

/** Section weakness with skip-rate (critical for CAT strategy coaching) */
export function getSectionWeaknessEnriched(attempts: QuestionAttempt[]): SectionWeaknessEnriched[] {
  const labels: Record<string, string> = { qa: "QA", varc: "VARC", lrdi: "LRDI" };

  return ["qa", "varc", "lrdi"].map((section) => {
    const sa = attempts.filter((a) => a.section_id === section);
    const total = sa.length;
    const correct = sa.filter((a) => a.is_correct).length;
    const skipped = sa.filter((a) => (a as any).was_skipped).length;
    const attempted = total - skipped;

    return {
      section_id: section,
      label: labels[section],
      total,
      correct,
      skipped,
      accuracy_rate: attempted > 0 ? Math.round((correct / attempted) * 100) : 0,
      skip_rate: total > 0 ? Math.round((skipped / total) * 100) : 0,
    };
  });
}
