export interface VocabCard {
  id: string;
  word: string;
  meaning: string;
  memoryKey: string;
}

export interface IdiomCard {
  id: string;
  phrase: string;
  meaning: string;
  memoryKey: string;
}

export interface QuantCard {
  id: string;
  topic: string;
  question: string;
  answer: string;
}

export interface LRDICard {
  id: string;
  topic: string;
  question: string;
  answer: string;
}

export type FlashcardCategory = "vocab" | "idioms" | "quant_formulas" | "lrdi_tips";

export type AnyCard = VocabCard | IdiomCard | QuantCard | LRDICard;

export const CATEGORY_META: Record<FlashcardCategory, { label: string; color: string }> = {
  vocab: { label: "Vocab", color: "#FF6600" },
  idioms: { label: "Idioms & Phrases", color: "#EC4899" },
  quant_formulas: { label: "Quant Formulas", color: "#3B82F6" },
  lrdi_tips: { label: "LRDI Tips", color: "#06B6D4" },
};

export const flashcardData = {
  vocab: [
    { id: "v001", word: "Refulgent", meaning: "Radiant, shining, brilliantly gleaming", memoryKey: "Sounds like 'full gent' — a gentleman full of shine and brilliance." },
    { id: "v002", word: "Obsequious", meaning: "Excessively eager to please or obey", memoryKey: "Ob-SEE-kwee-us — think 'I'll obey your sequence' — overly compliant." },
    { id: "v003", word: "Ephemeral", meaning: "Lasting for a very short time", memoryKey: "E-FEM-eral — like a femme fatale who vanishes quickly from your life." },
    { id: "v004", word: "Perspicacious", meaning: "Having keen mental perception and understanding", memoryKey: "Per-SPIC-acious — has 'spic' like spectacle — someone who sees things clearly." },
    { id: "v005", word: "Recalcitrant", meaning: "Stubbornly resistant to authority or control", memoryKey: "Re-CAL-citrant — imagine recalling a city ant that refuses to follow the colony." },
  ] as VocabCard[],

  idioms: [
    { id: "i001", phrase: "Bite the bullet", meaning: "To endure a painful experience bravely", memoryKey: "Soldiers bit bullets during surgery without anesthesia — facing pain head-on." },
    { id: "i002", phrase: "Burn the midnight oil", meaning: "To work late into the night", memoryKey: "Before electricity, people literally burned oil lamps to work after dark." },
    { id: "i003", phrase: "A penny for your thoughts", meaning: "Asking someone what they're thinking about", memoryKey: "Thoughts are priceless but we offer a penny — it's a gentle, curious nudge." },
    { id: "i004", phrase: "Break the ice", meaning: "To initiate conversation in an awkward situation", memoryKey: "Imagine literally cracking ice to let ships (conversations) pass through." },
    { id: "i005", phrase: "Cry over spilt milk", meaning: "To be upset about something that cannot be undone", memoryKey: "Milk on the floor can't go back in the glass — no point worrying." },
  ] as IdiomCard[],

  quant_formulas: [
    { id: "q001", topic: "Numbers", question: "Sum of first $$n$$ natural numbers?", answer: "$$\\frac{n(n+1)}{2}$$" },
    { id: "q002", topic: "Numbers", question: "Sum of squares of first $$n$$ natural numbers?", answer: "$$\\frac{n(n+1)(2n+1)}{6}$$" },
    { id: "q003", topic: "Geometry", question: "Area of a triangle given sides $$a, b, c$$?", answer: "Heron's formula: $$\\sqrt{s(s-a)(s-b)(s-c)}$$ where $$s = \\frac{a+b+c}{2}$$" },
    { id: "q004", topic: "Algebra", question: "What is $$(a+b)^2$$?", answer: "$$a^2 + 2ab + b^2$$" },
    { id: "q005", topic: "Percentages", question: "If A is $$x\\%$$ more than B, B is what $$\\%$$ less than A?", answer: "$$\\frac{x}{100+x} \\times 100\\%$$" },
  ] as QuantCard[],

  lrdi_tips: [
    { id: "l001", topic: "Arrangements", question: "In circular arrangements of $$n$$ people, how many unique arrangements exist?", answer: "$$(n-1)!$$ — fix one person, arrange the rest." },
    { id: "l002", topic: "Venn Diagrams", question: "For 3 overlapping sets, what is the formula for total elements?", answer: "$$|A \\cup B \\cup C| = |A|+|B|+|C|-|A \\cap B|-|B \\cap C|-|A \\cap C|+|A \\cap B \\cap C|$$" },
    { id: "l003", topic: "Blood Relations", question: "Quick tip: How to decode complex blood relation statements?", answer: "Draw a family tree top-down. Males on left, females on right. Use = for marriage, | for parent-child." },
    { id: "l004", topic: "Schedules", question: "When given a scheduling constraint puzzle, what's the first step?", answer: "List all entities and constraints. Create a grid/matrix. Fill definite placements first, then eliminate." },
    { id: "l005", topic: "Directions", question: "Person faces North, turns 135° clockwise. Which direction do they face?", answer: "South-East. North → 90° = East → 45° more = SE. Always draw the compass rose." },
  ] as LRDICard[],
};

export function getCardFront(card: AnyCard, category: FlashcardCategory): string {
  if (category === "vocab") return (card as VocabCard).word;
  if (category === "idioms") return (card as IdiomCard).phrase;
  return (card as QuantCard | LRDICard).question;
}

export function getCardBack(card: AnyCard, category: FlashcardCategory): { main: string; hint?: string } {
  if (category === "vocab") {
    const c = card as VocabCard;
    return { main: c.meaning, hint: c.memoryKey };
  }
  if (category === "idioms") {
    const c = card as IdiomCard;
    return { main: c.meaning, hint: c.memoryKey };
  }
  return { main: (card as QuantCard | LRDICard).answer };
}

export function getTotalCards(category: FlashcardCategory): number {
  return flashcardData[category].length;
}
