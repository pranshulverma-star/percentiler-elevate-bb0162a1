import { practiceLabSections, type Chapter, type PracticeQuestion } from "@/data/practiceLabQuestions";
import { pickGroupedRandom, pickOneSet } from "@/lib/pickGroupedQuestions";

export interface TodaysBattleConfig {
  sectionId: string;
  sectionName: string;
  sectionIcon: string;
  chapter: Chapter;
  questions: PracticeQuestion[];
  duration: number;
}

/** Simple hash of a string to a number */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

/** Seeded random using today's date — same result for all users on a given day */
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return s / 2147483647;
  };
}

function todayLocal(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function getTodaysSectionIndex(): number {
  const dateStr = todayLocal();
  const hash = hashString(dateStr);
  return hash % 3; // 0=QA, 1=LRDI, 2=VARC
}

export function generateTodaysBattle(): TodaysBattleConfig {
  const sectionIndex = getTodaysSectionIndex();
  const sections = practiceLabSections;
  const section = sections[sectionIndex];
  const dateStr = todayLocal();
  const rand = seededRandom(hashString(dateStr + "battle"));

  let questions: PracticeQuestion[] = [];
  let duration = 900; // 15 min default
  let chapterName = "Quiz of the Day";

  if (section.id === "qa") {
    // 10 mixed-topic questions from all QA chapters
    const allQaQuestions = section.chapters.flatMap(ch => ch.questions);
    questions = pickGroupedRandom(allQaQuestions, 10);
    duration = 900;
    chapterName = "Quiz of the Day — QA Mix";
  } else if (section.id === "lrdi") {
    // 1 set from LRDI
    const lrdiChapter = section.chapters.find(ch => ch.questions.length > 0);
    if (lrdiChapter) {
      questions = pickOneSet(lrdiChapter.questions);
    }
    duration = 720; // 12 min
    chapterName = "Quiz of the Day — LRDI Set";
  } else if (section.id === "varc") {
    // 1 RC set + 1 PJ question
    const rcChapter = section.chapters.find(ch => ch.slug === "reading-comprehension");
    const pjChapter = section.chapters.find(ch => ch.slug === "para-jumbles");

    if (rcChapter && rcChapter.questions.length > 0) {
      const rcSet = pickOneSet(rcChapter.questions);
      questions.push(...rcSet);
    }

    if (pjChapter && pjChapter.questions.length > 0) {
      const shuffled = [...pjChapter.questions].sort(() => rand() - 0.5);
      questions.push(shuffled[0]);
    }

    duration = 900;
    chapterName = "Quiz of the Day — VARC";
  }

  const virtualChapter: Chapter = {
    slug: "quiz-of-the-day",
    name: chapterName,
    questions,
  };

  return {
    sectionId: section.id,
    sectionName: section.name,
    sectionIcon: section.icon,
    chapter: virtualChapter,
    questions,
    duration,
  };
}
