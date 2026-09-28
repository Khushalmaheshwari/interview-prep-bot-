import type { Difficulty, QuizSession, SessionDetail, Topic } from "../types";
import { TOPICS } from "../types";

/** AI score at or above this counts a scenario answer as correct for stats. */
export const AI_PASS_SCORE = 60;

export interface TopicStat {
  topic: Topic;
  answered: number;
  correct: number;
  pct: number; // 0-100, 0 when unanswered
}

export interface Recommendation {
  topic: Topic;
  difficulty: Difficulty;
  count: number;
}

export interface DashboardData {
  quizzes: number;
  questions: number;
  average: number;
  best: number;
  topics: TopicStat[];
  weakest: TopicStat | null;
  recommendation: Recommendation | null;
}

const REAL_TOPICS = TOPICS.filter((t): t is Topic => t !== "All");
const DIFF_ORDER: Difficulty[] = ["Easy", "Medium", "Hard"];

/**
  * All dashboard maths in one place — plain counts and averages, no AI/ML.
 * - Overall average/best come straight from saved session percentages.
 * - Topic stats come from per-question details (objective: deterministic
 *   correctness; scenario: AI score >= AI_PASS_SCORE). Sessions saved before
  * details: a session on a single topic falls back to its
 *   aggregate score; "All"-topic sessions without details can't be attributed
 *   and are skipped for topic stats (they still count overall).
 */
export function computeDashboard(sessions: QuizSession[]): DashboardData {
  const quizzes = sessions.length;
  const questions = sessions.reduce((n, s) => n + s.questions, 0);
  const average =
    quizzes === 0 ? 0 : Math.round(sessions.reduce((n, s) => n + s.pct, 0) / quizzes);
  const best = sessions.reduce((m, s) => Math.max(m, s.pct), 0);

  const answered = new Map<Topic, { correct: number; total: number }>();
  const byDiff = new Map<string, { correct: number; total: number }>();
  const bump = (topic: Topic, diff: Difficulty | null, correct: boolean | null) => {
    if (correct === null) return;
    const t = answered.get(topic) || { correct: 0, total: 0 };
    t.total += 1;
    if (correct) t.correct += 1;
    answered.set(topic, t);
    if (diff) {
      const key = `${topic}|||${diff}`;
      const d = byDiff.get(key) || { correct: 0, total: 0 };
      d.total += 1;
      if (correct) d.correct += 1;
      byDiff.set(key, d);
    }
  };

  for (const s of sessions) {
    if (s.details && s.details.length > 0) {
      for (const d of s.details as SessionDetail[]) bump(d.topic, d.difficulty, d.correct);
    } else if (s.topic !== "All" && s.total > 0) {
      // Backfill: single-topic session saved before details existed.
      const t = answered.get(s.topic) || { correct: 0, total: 0 };
      t.total += s.total;
      t.correct += s.correct;
      answered.set(s.topic, t);
    }
  }

  const topics: TopicStat[] = REAL_TOPICS.map((topic) => {
    const a = answered.get(topic) || { correct: 0, total: 0 };
    return {
      topic,
      answered: a.total,
      correct: a.correct,
      pct: a.total === 0 ? 0 : Math.round((a.correct / a.total) * 100),
    };
  });
  const attempted = topics.filter((t) => t.answered > 0);
  const weakest =
    attempted.length === 0
      ? null
      : [...attempted].sort(
          (x, y) => x.pct - y.pct || y.answered - x.answered || REAL_TOPICS.indexOf(x.topic) - REAL_TOPICS.indexOf(y.topic)
        )[0];

  let recommendation: Recommendation | null = null;
  if (weakest) {
    // Recommend the difficulty the user struggles with most in the weakest
    // topic; fall back to Medium when there is no difficulty breakdown.
    let difficulty: Difficulty = "Medium";
    let worst = Infinity;
    let worstCount = -1;
    for (const d of DIFF_ORDER) {
      const e = byDiff.get(`${weakest.topic}|||${d}`);
      if (!e || e.total === 0) continue;
      const pct = (e.correct / e.total) * 100;
      if (pct < worst || (pct === worst && e.total > worstCount)) {
        worst = pct;
        worstCount = e.total;
        difficulty = d;
      }
    }
    recommendation = { topic: weakest.topic, difficulty, count: 5 };
  }

  return { quizzes, questions, average, best, topics, weakest, recommendation };
}
