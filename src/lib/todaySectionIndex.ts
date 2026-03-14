/** Pure date math — zero dependencies on question data */

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
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

/** Seeded random using today's date */
export function seededRandomForToday(salt = "battle"): () => number {
  const seed = hashString(todayLocal() + salt);
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return s / 2147483647;
  };
}
