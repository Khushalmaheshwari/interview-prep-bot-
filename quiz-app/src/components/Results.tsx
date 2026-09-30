import { useEffect, useRef, useState } from "react";
import { AI_PASS_SCORE } from "../lib/dashboard";
import { saveSession } from "../lib/history";
import { downloadReport } from "../lib/export";
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
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center shadow-xl shadow-black/30">
        <p className="text-sm font-semibold uppercase tracking-widest text-indigo-400">
          {score.pct >= 60 ? "🎉 Quiz Complete" : "Quiz Complete"}
        </p>
        <p className="mt-2 bg-gradient-to-r from-white to-indigo-300 bg-clip-text text-5xl font-extrabold text-transparent">{score.pct}%</p>
        <p className="mt-2 text-sm text-slate-400">{message(score.pct)}</p>

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
            ` · ${score.scenarioCount} open answer(s) evaluated by AI, excluded from auto-score.`}
        </p>

        <SectionSplit questions={questions} answers={answers} />

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            onClick={onRetake}
            className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-950 hover:bg-indigo-500"
          >
            🔁 Retake
          </button>
          <button
            onClick={onNewSetup}
            className="rounded-xl border border-slate-700 px-6 py-3 text-sm font-semibold text-slate-200 hover:bg-slate-800"
          >
            New Setup
          </button>
          <button
            onClick={() =>
              downloadReport({ questions, answers, role, difficulty, date: new Date() })
            }
            className="rounded-xl border border-slate-700 px-6 py-3 text-sm font-semibold text-slate-200 hover:bg-slate-800"
          >
            ⬇ Download Report
          </button>
          <button
            onClick={onDashboard}
            className="rounded-xl border border-slate-700 px-6 py-3 text-sm font-semibold text-slate-200 hover:bg-slate-800"
          >
            View Dashboard
          </button>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl shadow-black/30 sm:p-8">
        <h3 className="text-lg font-bold text-white">📝 Review</h3>
        <ol className="mt-4 space-y-4">
          {answers.map((a, i) => {
            const q = byId.get(a.questionId);
            if (!q) return null;
            return (
              <li key={a.questionId + i} className="rounded-xl border border-slate-800 bg-slate-800/50 p-4 text-sm text-slate-200">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Q{i + 1} · {q.topic} · {q.difficulty} ·{" "}
                  {a.correct === null ? typeLabel(q.type) : a.correct ? "Correct ✅" : "Incorrect ❌"}
                  {a.ai ? ` · AI ${a.ai.score}/100` : ""}
                </p>
                <p className="mt-1 font-semibold text-white">{q.question}</p>
                <p className="mt-2">
                  <strong>Your answer:</strong> {a.userAnswer || <em>(empty)</em>}
                </p>
                {!isOpenEnded(q) ? (
                  <>
                    <p className="mt-1">
                      <strong>Correct:</strong> {q.correct_answer}
                    </p>
                    <p className="mt-1 text-slate-400">{q.explanation}</p>
                  </>
                ) : a.ai ? (
                  <div className="mt-2 space-y-1 text-slate-300">
                    <p>
                      <strong className="text-white">AI verdict ({a.ai.score}/100):</strong> {a.ai.verdict}
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
                    <p className="text-slate-400">
                      <strong>Model answer:</strong> {q.ideal_answer}
                    </p>
                  </div>
                ) : (
                  <>
                    <p className="mt-1 text-slate-400">
                      AI feedback was unavailable — model answer: {q.ideal_answer}
                    </p>
                  </>
                )}
              </li>
            );
          })}
        </ol>
      </div>

      <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl shadow-black/30 sm:p-8">
        <h3 className="text-lg font-bold text-white">Previous quizzes (this device)</h3>
        {previous.length === 0 ? (
          <p className="mt-2 text-sm text-slate-400">
            This was your first saved quiz on this device. Your next quizzes will
            appear here.
          </p>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-200">
              <thead>
                <tr className="border-b border-slate-800 text-xs uppercase tracking-wide text-slate-400">
                  <th className="py-2 pr-3">Date</th>
                  <th className="py-2 pr-3">Topic</th>
                  <th className="py-2 pr-3">Difficulty</th>
                  <th className="py-2">Score</th>
                </tr>
              </thead>
              <tbody>
                {previous.map((s) => (
                  <tr key={s.id} className="border-b border-slate-800 last:border-0">
                    <td className="py-2 pr-3 text-slate-400">{fmtDate(s.date)}</td>
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

/** Technical vs Behavioral/HR vs Scenario split for this interview. */
function SectionSplit({ questions, answers }: { questions: Question[]; answers: AnswerRecord[] }) {
  const byId = new Map(questions.map((q) => [q.id, q]));
  const buckets: Record<string, { correct: number; total: number }> = {
    Technical: { correct: 0, total: 0 },
    "Behavioral & HR": { correct: 0, total: 0 },
    "Scenario / Applied": { correct: 0, total: 0 },
  };
  for (const a of answers) {
    const q = byId.get(a.questionId);
    if (!q) continue;
    const key =
      q.type === "mcq" || q.type === "true_false"
        ? "Technical"
        : q.type === "behavioral"
          ? "Behavioral & HR"
          : "Scenario / Applied";
    const verdict =
      a.correct !== null ? a.correct : a.ai ? a.ai.score >= AI_PASS_SCORE : null;
    if (verdict === null) continue;
    buckets[key].total += 1;
    if (verdict) buckets[key].correct += 1;
  }
  const order = ["Technical", "Behavioral & HR", "Scenario / Applied"];
  const shown = order.filter((k) => buckets[k].total > 0);
  if (shown.length === 0) return null;
  const icons: Record<string, string> = {
    Technical: "🧠",
    "Behavioral & HR": "🤝",
    "Scenario / Applied": "📊",
  };
  return (
    <div className="mx-auto mt-6 grid max-w-lg grid-cols-3 gap-3 text-sm">
      {shown.map((k) => {
        const b = buckets[k];
        const pct = Math.round((b.correct / b.total) * 100);
        return (
          <div key={k} className="rounded-xl bg-slate-800 px-3 py-3">
            <p className="text-base font-extrabold text-white">
              {icons[k]} {pct}%
            </p>
            <p className="mt-1 text-xs text-slate-400">
              {k} · {b.correct}/{b.total}
            </p>
          </div>
        );
      })}
    </div>
  );
}

function Stat({ label, value, wide }: { label: string; value: string; wide?: boolean }) {
  return (
    <div className={`rounded-xl bg-slate-800 px-3 py-3 ${wide ? "col-span-2" : ""}`}>
      <p className="text-xs text-slate-400">{label}</p>
      <p className="truncate text-base font-bold text-white" title={value}>
        {value}
      </p>
    </div>
  );
}
