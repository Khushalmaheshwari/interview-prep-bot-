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
      <section className="rounded-2xl bg-white p-10 text-center shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-widest text-indigo-600">
          Performance Dashboard
        </p>
        <h2 className="mt-2 text-2xl font-bold">No quizzes yet</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
          Complete a quiz and your average score, topic performance, weakest
          area and recommended practice will appear here.
        </p>
        <button
          onClick={onSetup}
          className="mt-6 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          Start Your First Quiz
        </button>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-widest text-indigo-600">
          Performance Dashboard
        </p>
        <h2 className="mt-1 text-2xl font-bold">Overall Performance</h2>
        <div className="mt-4 grid grid-cols-2 gap-3 text-center sm:grid-cols-4">
          <BigStat label="Average score" value={`${data.average}%`} />
          <BigStat label="Best score" value={`${data.best}%`} />
          <BigStat label="Quizzes attempted" value={String(data.quizzes)} />
          <BigStat label="Questions attempted" value={String(data.questions)} />
        </div>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
        <h3 className="text-lg font-bold">Topic Performance</h3>
        <ul className="mt-4 space-y-3">
          {data.topics.map((t) => (
            <li key={t.topic}>
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{t.topic}</span>
                <span className="text-slate-500">
                  {t.answered === 0 ? "not attempted" : `${t.pct}% · ${t.correct}/${t.answered}`}
                </span>
              </div>
              <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full ${t.answered === 0 ? "" : t.pct >= 60 ? "bg-green-500" : t.pct >= 40 ? "bg-amber-500" : "bg-red-500"}`}
                  style={{ width: `${t.answered === 0 ? 0 : t.pct}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      </div>

      {data.weakest && data.recommendation && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 shadow-sm sm:p-8">
          <h3 className="text-lg font-bold">
            Weakest Area: {data.weakest.topic} ({data.weakest.pct}%)
          </h3>
          <p className="mt-2 text-sm">
            Recommended Practice: {data.recommendation.topic} →{" "}
            {data.recommendation.difficulty} → {data.recommendation.count}{" "}
            Questions
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Simple rule: your lowest-scoring attempted topic, at the difficulty
            you struggle with most. No AI involved.
          </p>
          <button
            onClick={() => onPractice(data.recommendation as Recommendation)}
            className="mt-4 rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-slate-700"
          >
            Start Recommended Practice
          </button>
        </div>
      )}

      <div className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
        <h3 className="text-lg font-bold">Previous Quizzes</h3>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b text-xs uppercase tracking-wide text-slate-500">
                <th className="py-2 pr-3">Date</th>
                <th className="py-2 pr-3">Topic</th>
                <th className="py-2 pr-3">Difficulty</th>
                <th className="py-2 pr-3">Questions</th>
                <th className="py-2">Score</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((s) => (
                <tr key={s.id} className="border-b last:border-0">
                  <td className="py-2 pr-3 text-slate-600">{fmtDate(s.date)}</td>
                  <td className="py-2 pr-3">{s.topic}</td>
                  <td className="py-2 pr-3">{s.difficulty}</td>
                  <td className="py-2 pr-3">{s.questions}</td>
                  <td className="py-2 font-bold">{s.pct}%</td>
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
    <div className="rounded-xl bg-slate-50 px-3 py-4">
      <p className="text-2xl font-extrabold">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{label}</p>
    </div>
  );
}
