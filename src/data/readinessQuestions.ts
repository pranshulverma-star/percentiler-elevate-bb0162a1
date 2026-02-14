export type Difficulty = "easy" | "medium" | "hard";
export type Section = "quant" | "lrdi" | "varc";

export interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number; // index of correct option
  difficulty: Difficulty;
  section: Section;
}

export const questions: Question[] = [
  {
    id: 1,
    question: "If x + y = 10 and xy = 21, what is x² + y²?",
    options: ["56", "58", "60", "62"],
    correctAnswer: 1,
    difficulty: "easy",
    section: "quant",
  },
  {
    id: 2,
    question: "A train 250m long crosses a bridge 150m long in 20 seconds. What is the speed of the train in km/hr?",
    options: ["54", "72", "36", "90"],
    correctAnswer: 1,
    difficulty: "medium",
    section: "quant",
  },
  {
    id: 3,
    question: "In a group of 100 people, 70 like tea, 80 like coffee. What is the minimum number who like both?",
    options: ["40", "50", "60", "30"],
    correctAnswer: 1,
    difficulty: "medium",
    section: "quant",
  },
  {
    id: 4,
    question: "Five people — A, B, C, D, E — sit in a row. A is not at either end, and B is to the right of A. How many valid arrangements exist?",
    options: ["36", "48", "24", "60"],
    correctAnswer: 0,
    difficulty: "hard",
    section: "lrdi",
  },
  {
    id: 5,
    question: "If all roses are flowers, some flowers are red, and no reds are blue — which must be true?",
    options: [
      "Some roses are red",
      "No roses are blue",
      "Some flowers are not blue",
      "All reds are flowers",
    ],
    correctAnswer: 2,
    difficulty: "medium",
    section: "lrdi",
  },
  {
    id: 6,
    question: "A set contains 6 elements. In how many ways can it be partitioned into two non-empty subsets?",
    options: ["31", "30", "32", "15"],
    correctAnswer: 0,
    difficulty: "hard",
    section: "lrdi",
  },
  {
    id: 7,
    question: "Choose the word most similar in meaning to 'Ephemeral':",
    options: ["Eternal", "Transient", "Robust", "Ambiguous"],
    correctAnswer: 1,
    difficulty: "easy",
    section: "varc",
  },
  {
    id: 8,
    question: "Which sentence is grammatically correct?",
    options: [
      "Each of the students have completed their work.",
      "Each of the students has completed his or her work.",
      "Each of the students have completed his or her work.",
      "Each of the student has completed their work.",
    ],
    correctAnswer: 1,
    difficulty: "easy",
    section: "varc",
  },
  {
    id: 9,
    question: "The passage argues that economic growth without equity leads to — (implied meaning question). What is the most likely completion?",
    options: [
      "National prosperity",
      "Social instability",
      "Technological advancement",
      "Cultural enrichment",
    ],
    correctAnswer: 1,
    difficulty: "hard",
    section: "varc",
  },
  {
    id: 10,
    question: "A pipe fills a tank in 6 hours, another empties it in 8 hours. If both are open, how long to fill?",
    options: ["20 hours", "24 hours", "12 hours", "18 hours"],
    correctAnswer: 1,
    difficulty: "medium",
    section: "quant",
  },
];
