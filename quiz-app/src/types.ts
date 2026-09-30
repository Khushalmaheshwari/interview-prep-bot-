/**
 * Generalized types: topics are dynamic strings (AI-generated interviews),
 * the Finance bank topics remain as the offline fallback vocabulary.
 */
export type Topic = string;

export type Difficulty = "Easy" | "Medium" | "Hard";

export type QuestionType = "mcq" | "true_false" | "scenario" | "behavioral";

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
  /** Where the question came from. Absent = legacy bank question. */
  source?: "ai" | "bank";
}

export interface OpenQuestion {
  id: string;
  topic: Topic;
  difficulty: Difficulty;
  type: "scenario" | "behavioral";
  question: string;
  ideal_answer: string;
  evaluation_points: string[];
  interview_tip: string;
  /** Where the question came from. Absent = legacy bank question. */
  source?: "ai" | "bank";
}

/** Backwards-compatible alias. */
export type ScenarioQuestion = OpenQuestion;

export type Question = ObjectiveQuestion | OpenQuestion;

export interface QuizConfig {
  topic: Topic | "All";
  difficulty: Difficulty | "Mixed";
  count: number;
}

/** One recorded answer. `correct` is null for open-ended questions (no auto-score). */
export interface AnswerRecord {
  questionId: string;
  userAnswer: string;
  correct: boolean | null;
  /**
   * AI evaluation for open-ended answers.
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
  /** A stronger example answer (AI evaluation only; absent in older sessions). */
  stronger_answer?: string;
}

/** Candidate profile produced by AI resume analysis. */
export interface CandidateProfile {
  name: string;
  education: string[];
  skills: string[];
  strengths: string[];
  /** Hedged wording only — "potential areas", never absolute facts. */
  improvement_areas: string[];
  experience_highlights: string[];
  /** Angles an interviewer is likely to probe. */
  likely_angles: string[];
  /** Interview-readiness score + highest-impact fixes (absent in older profiles). */
  readiness?: { score: number; fixes: string[] } | null;
}

/** What the interview is tailored to. */
export interface InterviewSetup {
  role: string;
  difficulty: Difficulty;
  count: number;
}

/** One saved quiz session in local history (localStorage). */
export interface QuizSession {
  id: string;
  date: string; // ISO timestamp
  topic: QuizConfig["topic"];
  difficulty: QuizConfig["difficulty"];
  total: number; // objective questions scored
  correct: number;
  incorrect: number;
  pct: number;
  questions: number; // all questions incl. open-ended
  scenarioCount: number;
  aiScores: { questionId: string; score: number }[];
  /**
   * Per-question topic breakdown for the dashboard.
   * Open-ended `correct` is derived from the AI score (>= 60), null when no AI.
   */
  details?: SessionDetail[];
  /** Target role for personalized interviews (absent = legacy bank quiz). */
  role?: string;
  /** True when questions were AI-generated for the candidate. */
  personalized?: boolean;
}

/** One answered question attributed to its topic/difficulty. */
export interface SessionDetail {
  topic: Topic;
  difficulty: Difficulty;
  correct: boolean | null;
}

/** Finance fallback bank topics (offline mode vocabulary). */
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

export const ROLE_SUGGESTIONS = [
  "Financial Analyst",
  "Investment Banking Analyst",
  "Marketing Analyst",
  "Business Analyst",
  "Data Analyst",
  "Product Manager",
  "Consultant",
  "Software Engineer",
  "HR",
  "Sales",
  "Operations",
] as const;
