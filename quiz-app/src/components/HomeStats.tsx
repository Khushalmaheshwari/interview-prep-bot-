import { loadSessions, practiceStreak } from "../lib/history";
import { useState } from "react";

/** Badges + recent sessions for Home. */
export default function HomeStats() {
  const [sessions] = useState(() => loadSessions());
  if (sessions.length === 0) return null;
  const best = Math.max(...sessions.map((s) => s.pct));
  const streak = practiceStreak();
  return (
    <section className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl shadow-black/30 sm:p-8">
      <div className="flex flex-wrap gap-3">
        <span className="rounded-full border border-orange-800 bg-orange-950 px-4 py-1.5 text-sm font-bold text-orange-200">
          🔥 {streak}-day streak
        </span>
        <span className="rounded-full border border-yellow-800 bg-yellow-950 px-4 py-1.5 text-sm font-bold text-yellow-200">
          🏆 Best {best}%
        </span>
        <span className="rounded-full border border-slate-700 bg-slate-800 px-4 py-1.5 text-sm font-semibold text-slate-300">
          ✅ {sessions.length} session{sessions.length === 1 ? "" : "s"}
        </span>
      </div>
      <h3 className="mt-5 text-base font-bold text-white">Recent sessions (this device)</h3>
      <ul className="mt-3 space-y-2 text-sm">
        {sessions.slice(0, 5).map((s) => (
          <li
            key={s.id}
            className="flex items-center justify-between rounded-xl bg-slate-800 px-4 py-2.5"
          >
            <span className="text-slate-400">
              {s.role || s.topic} · {s.difficulty}
            </span>
            <span className="font-bold text-slate-100">{s.pct}%</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
