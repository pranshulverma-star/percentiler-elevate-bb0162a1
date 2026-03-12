import type { PracticeQuestion } from "@/data/practiceLabQuestions";

/**
 * Picks random questions while keeping grouped questions (same group_id) together.
 * Groups are shuffled, but questions within a group preserve original order.
 * May slightly exceed `count` to avoid splitting a group.
 */
export function pickGroupedRandom(questions: PracticeQuestion[], count: number): PracticeQuestion[] {
  // Separate into groups and ungrouped (standalone) questions
  const groupMap = new Map<string, PracticeQuestion[]>();
  const standalone: PracticeQuestion[] = [];

  for (const q of questions) {
    if (q.group_id) {
      if (!groupMap.has(q.group_id)) groupMap.set(q.group_id, []);
      groupMap.get(q.group_id)!.push(q);
    } else {
      standalone.push(q);
    }
  }

  // Build a list of "units" — each unit is either a group or a single question
  type Unit = { questions: PracticeQuestion[] };
  const units: Unit[] = [];

  for (const [, groupQs] of groupMap) {
    // Sort by id to preserve original order within a group
    groupQs.sort((a, b) => a.id - b.id);
    units.push({ questions: groupQs });
  }

  for (const q of standalone) {
    units.push({ questions: [q] });
  }

  // Shuffle units
  for (let i = units.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [units[i], units[j]] = [units[j], units[i]];
  }

  // Pick units until we reach ~count questions
  const result: PracticeQuestion[] = [];
  for (const unit of units) {
    if (result.length >= count) break;
    result.push(...unit.questions);
  }

  return result;
}

/**
 * Picks exactly 1 random set (group) for LRDI-style quizzes.
 * If no groups exist, falls back to picking `fallbackCount` standalone questions.
 */
export function pickOneSet(questions: PracticeQuestion[], fallbackCount = 5): PracticeQuestion[] {
  const groupMap = new Map<string, PracticeQuestion[]>();
  const standalone: PracticeQuestion[] = [];

  for (const q of questions) {
    if (q.group_id) {
      if (!groupMap.has(q.group_id)) groupMap.set(q.group_id, []);
      groupMap.get(q.group_id)!.push(q);
    } else {
      standalone.push(q);
    }
  }

  const groups = Array.from(groupMap.values());
  if (groups.length > 0) {
    const picked = groups[Math.floor(Math.random() * groups.length)];
    picked.sort((a, b) => a.id - b.id);
    return picked;
  }

  // Fallback: no groups, pick random standalone
  const shuffled = [...standalone].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, fallbackCount);
}
