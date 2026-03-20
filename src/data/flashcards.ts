import masterData from "./flashcards_master.json";

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

export const flashcardData: Record<FlashcardCategory, AnyCard[]> = {
  vocab: masterData.vocab as VocabCard[],
  idioms: masterData.idioms as IdiomCard[],
  quant_formulas: masterData.quant_formulas as QuantCard[],
  lrdi_tips: masterData.lrdi_tips as LRDICard[],
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
