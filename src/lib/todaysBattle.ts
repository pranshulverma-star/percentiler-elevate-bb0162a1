import type { Chapter, PracticeQuestion } from "@/data/practiceLabQuestions";
import { getTodaysSectionIndex, seededRandomForToday } from "@/lib/todaySectionIndex";

// Re-export for any existing consumers
export { getTodaysSectionIndex } from "@/lib/todaySectionIndex";

export interface TodaysBattleConfig {
  sectionId: string;
  sectionName: string;
  sectionIcon: string;
  chapter: Chapter;
  questions: PracticeQuestion[];
  duration: number;
}

export async function generateTodaysBattle(): Promise<TodaysBattleConfig> {
  const [{ practiceLabSections }, { pickGroupedRandom, pickOneSet }] = await Promise.all([
    import("@/data/practiceLabQuestions"),
    import("@/lib/pickGroupedQuestions"),
  ]);

  const sectionIndex = getTodaysSectionIndex();
  const section = practiceLabSections[sectionIndex];
  const rand = seededRandomForToday("battle");

  let questions: PracticeQuestion[] = [];
  let duration = 900;
  let chapterName = "Quiz of the Day";

  if (section.id === "qa") {
    const allQaQuestions = section.chapters.flatMap(ch => ch.questions);
    questions = pickGroupedRandom(allQaQuestions, 10);
    duration = 900;
    chapterName = "Quiz of the Day — QA Mix";
  } else if (section.id === "lrdi") {
    const lrdiChapter = section.chapters.find(ch => ch.questions.length > 0);
    if (lrdiChapter) {
      questions = pickOneSet(lrdiChapter.questions);
    }
    duration = 720;
    chapterName = "Quiz of the Day — LRDI Set";
  } else if (section.id === "varc") {
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
