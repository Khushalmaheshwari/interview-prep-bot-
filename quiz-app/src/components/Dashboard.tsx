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

      <div className="grid gap-6 sm:grid-cols-5">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl shadow-black/30 sm:col-span-3">
          <h3 className="text-lg font-bold text-white">📈 Score trend</h3>
          <p className="text-xs text-slate-500">Quiz score over time (oldest → newest)</p>
          <ScoreTrend sessions={sessions} />
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 text-center shadow-xl shadow-black/30 sm:col-span-2">
          <h3 className="text-lg font-bold text-white">🎯 Accuracy</h3>
          <p className="text-xs text-slate-500">All objective answers</p>
          <AccuracyDonut sessions={sessions} />
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

function shortDate(iso: string): string {
  try {
    const d = new Date(iso);
    return `${d.getDate()}/${d.getMonth() + 1}`;
  } catch {
    return "";
  }
}

/** Bar chart of session scores, chronological, last 10. Pure SVG, no deps. */
function ScoreTrend({ sessions }: { sessions: QuizSession[] }) {
  const last = [...sessions].reverse().slice(-10);
  const W = 340;
  const H = 140;
  const LEFT = 34;
  const BOTTOM = 20;
  const TOP = 8;
  const GAP = 6;
  const base = H - BOTTOM;
  const plotH = base - TOP;
  const yOf = (pct: number) => base - (pct / 100) * plotH;
  const bw = (W - LEFT - GAP * (last.length - 1)) / Math.max(last.length, 1);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="mt-3 w-full" role="img" aria-label="Score trend chart">
      {[0, 25, 50, 75, 100].map((g) => (
        <g key={g}>
          <line x1={LEFT} x2={W} y1={yOf(g)} y2={yOf(g)} stroke="#1e293b" strokeWidth={1} />
          <text x={LEFT - 5} y={yOf(g) + 3} textAnchor="end" fontSize={9} fill="#64748b">
            {g}%
          </text>
        </g>
      ))}
      <line x1={LEFT} x2={W} y1={base} y2={base} stroke="#334155" strokeWidth={1.5} />
      {last.map((s, i) => {
        const h = Math.max(4, (s.pct / 100) * plotH);
        const x = LEFT + i * (bw + GAP);
        const color = s.pct >= 60 ? "#6366f1" : s.pct >= 40 ? "#f59e0b" : "#f43f5e";
        return (
          <g key={s.id}>
            <title>{`${shortDate(s.date)} — ${s.pct}%`}</title>
            <rect x={x} y={base - h} width={bw} height={h} rx={3} fill={color} />
            <text x={x + bw / 2} y={H - 6} textAnchor="middle" fontSize={8} fill="#64748b">
              {shortDate(s.date)}
            </text>
          </g>
        );
      })}
      <text x={LEFT - 5} y={TOP - 1} textAnchor="end" fontSize={9} fill="#64748b">
        Score
      </text>
    </svg>
  );
}

/** Donut of total correct vs incorrect objective answers. Pure SVG. */
function AccuracyDonut({ sessions }: { sessions: QuizSession[] }) {
  const correct = sessions.reduce((n, s) => n + s.correct, 0);
  const total = sessions.reduce((n, s) => n + s.total, 0);
  const pct = total === 0 ? 0 : Math.round((correct / total) * 100);
  const R = 44;
  const C = 2 * Math.PI * R;
  return (
    <div className="mt-3 flex items-center justify-center gap-4">
      <svg width={110} height={110} viewBox="0 0 110 110" role="img" aria-label="Accuracy donut">
        <circle cx={55} cy={55} r={R} fill="none" stroke="#1e293b" strokeWidth={12} />
        <circle
          cx={55}
          cy={55}
          r={R}
          fill="none"
          stroke="#6366f1"
          strokeWidth={12}
          strokeLinecap="round"
          strokeDasharray={`${(pct / 100) * C} ${C}`}
          transform="rotate(-90 55 55)"
        />
        <text x={55} y={60} textAnchor="middle" fontSize={18} fontWeight={800} fill="#fff">
          {pct}%
        </text>
      </svg>
      <div className="text-left text-xs text-slate-400">
        <p>
          <span className="font-bold text-emerald-300">{correct}</span> correct
        </p>
        <p>
          <span className="font-bold text-rose-300">{total - correct}</span> missed
        </p>
      </div>
    </div>
  );
}
