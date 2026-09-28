export type Topic =
  | "Financial Accounting"
  | "Financial Analysis"
  | "Corporate Finance"
  | "FP&A"
  | "Excel / Financial Modeling"
  | "Business Cases";

export type Difficulty = "Easy" | "Medium" | "Hard";

export type QuestionType = "mcq" | "true_false" | "scenario";

export interface ObjectiveQuestion {
  id: string;
  topic: Topic;
  difficulty: Difficulty;
  type: "mcq" | "true_false";
  question: string;
  options: string[];
  correct_answer: string;
  explanation: string;
  interview_tip: string;
}

export interface ScenarioQuestion {
  id: string;
  topic: Topic;
  difficulty: Difficulty;
  type: "scenario";
  question: string;
  ideal_answer: string;
  evaluation_points: string[];
  interview_tip: string;
}

export type Question = ObjectiveQuestion | ScenarioQuestion;

export interface QuizConfig {
  topic: Topic | "All";
  difficulty: Difficulty | "Mixed";
  count: number;
}

/** One recorded answer. `correct` is null for scenario questions (no auto-score). */
export interface AnswerRecord {
  questionId: string;
  userAnswer: string;
  correct: boolean | null;
  /**
   * AI evaluation for scenario answers (Phase 3).
   * undefined = not requested yet, object = evaluated, null = AI unavailable (fallback).
   */
  ai?: AIEvaluation | null;
}

/** Structured AI evaluation for one open-ended answer (mirrors server output). */
export interface AIEvaluation {
  score: number; // 0-100
  verdict: "broadly correct" | "partially correct" | "incorrect";
  understood: string;
  missing: string;
  explanation: string;
  tip: string;
}

/** One saved quiz session in local history (Phase 3, localStorage). */
export interface QuizSession {
  id: string;
  date: string; // ISO timestamp
  topic: QuizConfig["topic"];
  difficulty: QuizConfig["difficulty"];
  total: number; // objective questions scored
  correct: number;
  incorrect: number;
  pct: number;
  questions: number; // all questions incl. scenarios
  scenarioCount: number;
  aiScores: { questionId: string; score: number }[];
  /**
   * Per-question topic breakdown (Phase 4, for topic performance).
   * Optional so Phase 3 sessions saved earlier still load.
   * Scenario `correct` is derived from the AI score (>= 60), null when no AI.
   */
  details?: SessionDetail[];
}

/** One answered question attributed to its topic/difficulty. */
export interface SessionDetail {
  topic: Topic;
  difficulty: Difficulty;
  correct: boolean | null;
}

export const TOPICS: (Topic | "All")[] = [
  "All",
  "Financial Accounting",
  "Financial Analysis",
  "Corporate Finance",
  "FP&A",
  "Excel / Financial Modeling",
  "Business Cases",
];

export const DIFFICULTIES: (Difficulty | "Mixed")[] = [
  "Easy",
  "Medium",
  "Hard",
  "Mixed",
];

export const QUESTION_COUNTS = [5, 10] as const;
