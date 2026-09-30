import { computeDashboard } from "../lib/dashboard";
import type { Recommendation } from "../lib/dashboard";
import type { QuizSession } from "../types";

interface Props {
  sessions: QuizSession[];
  onPractice: (rec: Recommendation) => void;
  onSetup: () => void;
}

function fmtDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export default function Dashboard({ sessions, onPractice, onSetup }: Props) {
  const data = computeDashboard(sessions);

  if (data.quizzes === 0) {
    return (
      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-10 text-center shadow-xl shadow-black/30">
        <p className="text-sm font-semibold uppercase tracking-widest text-indigo-400">
          📊 Performance Dashboard
        </p>
        <h2 className="mt-2 text-2xl font-bold text-white">No quizzes yet</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-slate-400">
          Complete a quiz and your average score, weakest
          area and recommended practice will appear here.
        </p>
        <button
          onClick={onSetup}
          className="mt-6 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-950 hover:bg-indigo-500"
        >
          Start Your First Quiz
        </button>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl shadow-black/30 sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-widest text-indigo-400">
          📊 Performance Dashboard
        </p>
        <h2 className="mt-1 text-2xl font-bold text-white">Overall Performance</h2>
        <div className="mt-4 grid grid-cols-2 gap-3 text-center sm:grid-cols-4">
          <BigStat label="Average score" value={`${data.average}%`} />
          <BigStat label="Best score" value={`${data.best}%`} />
          <BigStat label="Quizzes attempted" value={String(data.quizzes)} />
          <BigStat label="Questions attempted" value={String(data.questions)} />
        </div>
      </div>

      {data.weakest && data.recommendation && (
        <div className="rounded-2xl border border-amber-800 bg-gradient-to-br from-amber-950 to-slate-900 p-6 shadow-xl shadow-black/30 sm:p-8">
          <h3 className="text-lg font-bold text-white">
            🎯 Weakest Area: {data.weakest.topic} ({data.weakest.pct}%)
          </h3>
          <p className="mt-2 text-sm text-slate-200">
            Recommended Practice: {data.recommendation.topic} →{" "}
            {data.recommendation.difficulty} → {data.recommendation.count}{" "}
            Questions
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Simple rule: your lowest-scoring attempted topic, at the difficulty
            you struggle with most. No AI involved.
          </p>
          <button
            onClick={() => onPractice(data.recommendation as Recommendation)}
            className="mt-4 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-950 hover:bg-indigo-500"
          >
            Start Recommended Practice
          </button>
        </div>
      )}

      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl shadow-black/30 sm:p-8">
        <h3 className="text-lg font-bold text-white">🕘 Previous Quizzes</h3>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-200">
            <thead>
              <tr className="border-b border-slate-800 text-xs uppercase tracking-wide text-slate-400">
                <th className="py-2 pr-3">Date</th>
                <th className="py-2 pr-3">Topic</th>
                <th className="py-2 pr-3">Difficulty</th>
                <th className="py-2 pr-3">Questions</th>
                <th className="py-2">Score</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((s) => (
                <tr key={s.id} className="border-b border-slate-800 last:border-0">
                  <td className="py-2 pr-3 text-slate-400">{fmtDate(s.date)}</td>
                  <td className="py-2 pr-3">{s.role || s.topic}</td>
                  <td className="py-2 pr-3">{s.difficulty}</td>
                  <td className="py-2 pr-3">{s.questions}</td>
                  <td className="py-2 font-bold text-white">{s.pct}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function BigStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-800 px-3 py-4">
      <p className="text-2xl font-extrabold text-white">{value}</p>
      <p className="mt-1 text-xs text-slate-400">{label}</p>
    </div>
  );
}
