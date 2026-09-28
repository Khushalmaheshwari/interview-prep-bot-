import { useEffect, useRef, useState } from "react";
import { AI_PASS_SCORE } from "../lib/dashboard";
import { saveSession } from "../lib/history";
import { scoreQuiz, isOpenEnded, typeLabel } from "../lib/quiz";
import type { AnswerRecord, Difficulty, Question, QuizConfig, QuizSession, SessionDetail } from "../types";

interface Props {
  questions: Question[];
  answers: AnswerRecord[];
  config: QuizConfig;
  difficulty: Difficulty;
  role?: string;
  personalized?: boolean;
  onRetake: () => void;
  onNewSetup: () => void;
  onDashboard: () => void;
}

function message(pct: number): string {
  if (pct >= 80) return "Excellent — interview ready on this mix.";
  if (pct >= 60) return "Good — review the explanations below.";
  if (pct >= 40) return "Keep practicing — focus on your misses.";
  return "Revisit the basics, then retake this mix.";
}

function fmtDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export default function Results({ questions, answers, config, difficulty, role, personalized, onRetake, onNewSetup, onDashboard }: Props) {
  const score = scoreQuiz(answers);
  const byId = new Map(questions.map((q) => [q.id, q]));
  const savedRef = useRef(false);
  const [previous, setPrevious] = useState<QuizSession[]>([]);

  // Save this quiz locally once, then show earlier sessions from this device.
  useEffect(() => {
    if (savedRef.current) return;
    savedRef.current = true;
    const session: QuizSession = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      date: new Date().toISOString(),
      topic: personalized && role ? role : config.topic,
      difficulty,
      total: score.total,
      correct: score.correct,
      incorrect: score.incorrect,
      pct: score.pct,
      questions: questions.length,
      scenarioCount: score.scenarioCount,
      aiScores: answers
        .filter((a) => a.ai)
        .map((a) => ({ questionId: a.questionId, score: (a.ai as { score: number }).score })),
      // Per-question topic breakdown for the dashboard.
      details: answers.flatMap((a): SessionDetail[] => {
        const q = byId.get(a.questionId);
        if (!q) return [];
        const correct =
          a.correct !== null ? a.correct : a.ai ? a.ai.score >= AI_PASS_SCORE : null;
        return [{ topic: q.topic, difficulty: q.difficulty, correct }];
      }),
      role: personalized ? role : undefined,
      personalized: personalized || undefined,
    };
    const all = saveSession(session);
    setPrevious(all.filter((s) => s.id !== session.id).slice(0, 10));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section>
      <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-widest text-indigo-600">
          Quiz Complete
        </p>
        <p className="mt-2 text-5xl font-extrabold">{score.pct}%</p>
        <p className="mt-2 text-sm text-slate-600">{message(score.pct)}</p>

        <div className="mx-auto mt-6 grid max-w-lg grid-cols-2 gap-3 text-sm sm:grid-cols-4">
          <Stat label="Questions" value={String(questions.length)} />
          <Stat label="Correct" value={String(score.correct)} />
          <Stat label="Incorrect" value={String(score.incorrect)} />
          <Stat
            label={personalized ? "Role" : "Topic"}
            value={personalized && role ? role : config.topic === "All" ? "All" : config.topic}
            wide
          />
        </div>
        <p className="mt-3 text-xs text-slate-500">
          Difficulty: {difficulty}
          {score.scenarioCount > 0 &&
            ` · ${score.scenarioCount} scenario answer(s) evaluated by AI, excluded from auto-score.`}
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            onClick={onRetake}
            className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Retake Same Mix
          </button>
          <button
            onClick={onNewSetup}
            className="rounded-xl border px-6 py-3 text-sm font-semibold hover:bg-slate-50"
          >
            New Setup
          </button>
          <button
            onClick={onDashboard}
            className="rounded-xl border px-6 py-3 text-sm font-semibold hover:bg-slate-50"
          >
            View Dashboard
          </button>
        </div>
      </div>

      <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm sm:p-8">
        <h3 className="text-lg font-bold">Review</h3>
        <ol className="mt-4 space-y-4">
          {answers.map((a, i) => {
            const q = byId.get(a.questionId);
            if (!q) return null;
            return (
              <li key={a.questionId + i} className="rounded-xl border p-4 text-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Q{i + 1} · {q.topic} · {q.difficulty} ·{" "}
                  {a.correct === null ? typeLabel(q.type) : a.correct ? "Correct" : "Incorrect"}
                  {a.ai ? ` · AI ${a.ai.score}/100` : ""}
                </p>
                <p className="mt-1 font-semibold">{q.question}</p>
                <p className="mt-2">
                  <strong>Your answer:</strong> {a.userAnswer || <em>(empty)</em>}
                </p>
                {!isOpenEnded(q) ? (
                  <>
                    <p className="mt-1">
                      <strong>Correct:</strong> {q.correct_answer}
                    </p>
                    <p className="mt-1 text-slate-600">{q.explanation}</p>
                  </>
                ) : a.ai ? (
                  <div className="mt-2 space-y-1 text-slate-700">
                    <p>
                      <strong>AI verdict ({a.ai.score}/100):</strong> {a.ai.verdict}
                    </p>
                    <p>
                      <strong>Got right:</strong> {a.ai.understood || "—"}
                    </p>
                    <p>
                      <strong>Missing:</strong> {a.ai.missing || "—"}
                    </p>
                    <p>
                      <strong>Tip:</strong> {a.ai.tip || "—"}
                    </p>
                    <p className="text-slate-600">
                      <strong>Model answer:</strong> {q.ideal_answer}
                    </p>
                  </div>
                ) : (
                  <>
                    <p className="mt-1 text-slate-600">
                      AI feedback was unavailable — model answer: {q.ideal_answer}
                    </p>
                  </>
                )}
              </li>
            );
          })}
        </ol>
      </div>

      <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm sm:p-8">
        <h3 className="text-lg font-bold">Previous quizzes (this device)</h3>
        {previous.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">
            This was your first saved quiz on this device. Your next quizzes will
            appear here.
          </p>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b text-xs uppercase tracking-wide text-slate-500">
                  <th className="py-2 pr-3">Date</th>
                  <th className="py-2 pr-3">Topic</th>
                  <th className="py-2 pr-3">Difficulty</th>
                  <th className="py-2">Score</th>
                </tr>
              </thead>
              <tbody>
                {previous.map((s) => (
                  <tr key={s.id} className="border-b last:border-0">
                    <td className="py-2 pr-3 text-slate-600">{fmtDate(s.date)}</td>
                    <td className="py-2 pr-3">{s.topic}</td>
                    <td className="py-2 pr-3">{s.difficulty}</td>
                    <td className="py-2 font-bold">{s.pct}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

function Stat({ label, value, wide }: { label: string; value: string; wide?: boolean }) {
  return (
    <div className={`rounded-xl bg-slate-50 px-3 py-3 ${wide ? "col-span-2" : ""}`}>
      <p className="text-xs text-slate-500">{label}</p>
      <p className="truncate text-base font-bold" title={value}>
        {value}
      </p>
    </div>
  );
}
