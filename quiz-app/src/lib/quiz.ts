import questionsData from "../data/questions.json";
import type { AnswerRecord, Question, QuizConfig } from "../types";

export const QUESTIONS: Question[] = questionsData as Question[];

/** Filter questions by topic + difficulty (Phase 1 core logic). */
export function filterQuestions(config: QuizConfig): Question[] {
  return QUESTIONS.filter((q) => {
    const topicOk = config.topic === "All" || q.topic === config.topic;
    const diffOk =
      config.difficulty === "Mixed" || q.difficulty === config.difficulty;
    return topicOk && diffOk;
  });
}

/** Deterministic shuffle + take N (seed-free simple shuffle). */
export function selectQuestions(config: QuizConfig): Question[] {
  const pool = filterQuestions(config);
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(config.count, shuffled.length));
}

/** Count available questions per topic/difficulty for the setup screen. */
export function countBy(topic: QuizConfig["topic"], difficulty: QuizConfig["difficulty"]): number {
  return filterQuestions({ topic, difficulty, count: 9999 }).length;
}

/** Deterministic correctness check for objective questions (Phase 2, no AI). */
export function isCorrect(question: Question, userAnswer: string): boolean | null {
  if (question.type === "scenario") return null;
  return userAnswer === question.correct_answer;
}

export interface QuizScore {
  total: number; // objective questions only
  correct: number;
  incorrect: number;
  pct: number; // 0-100, 0 when no objective questions
  scenarioCount: number;
}

/** Score a finished quiz. Scenario answers are excluded from auto-score. */
export function scoreQuiz(answers: AnswerRecord[]): QuizScore {
  const scored = answers.filter((a) => a.correct !== null);
  const correct = scored.filter((a) => a.correct).length;
  const total = scored.length;
  return {
    total,
    correct,
    incorrect: total - correct,
    pct: total === 0 ? 0 : Math.round((correct / total) * 100),
    scenarioCount: answers.length - total,
  };
}
