import { useState } from "react";
import { friendlyError } from "../lib/ai";
import { type Difficulty } from "../types";
import CountInput from "./CountInput";
import RoleCombobox from "./RoleCombobox";

interface Props {
  initialRole: string;
  generating: boolean;
  generateError: string | null;
  onStart: (role: string, difficulty: Difficulty, count: number) => void;
  onClassic: () => void;
  onBack: () => void;
}

const DIFFS: Difficulty[] = ["Easy", "Medium", "Hard"];

export default function InterviewSetup({
  initialRole,
  generating,
  generateError,
  onStart,
  onClassic,
  onBack,
}: Props) {
  const [role, setRole] = useState(initialRole);
  const [difficulty, setDifficulty] = useState<Difficulty>("Medium");
  const [count, setCount] = useState<number>(5);

  const canStart = !generating && role.length > 0 && role.length <= 80;

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl shadow-black/30 sm:p-8">
      <p className="text-sm font-semibold uppercase tracking-widest text-indigo-400">
        Interview Setup
      </p>
      <h2 className="mt-1 text-2xl font-bold text-white">What are you preparing for?</h2>

      <p className="mb-2 mt-6 text-sm font-semibold text-slate-200">Target role</p>
      <RoleCombobox value={role} onChange={setRole} />

      <p className="mb-2 mt-6 text-sm font-semibold text-slate-200">Difficulty</p>
      <div className="flex flex-wrap gap-2">
        {DIFFS.map((d) => (
          <button
            key={d}
            onClick={() => setDifficulty(d)}
            className={difficulty === d ? activeCls : idleCls}
          >
            {d}
          </button>
        ))}
      </div>

      <p className="mb-2 mt-6 text-sm font-semibold text-slate-200">Number of questions</p>
      <CountInput value={count} onChange={setCount} />

      {generating ? (
        <div className="mt-6 rounded-xl border border-indigo-800 bg-indigo-950 p-4 text-sm text-indigo-200">
          <p className="animate-pulse font-semibold">⚙️ Generating personalized interview questions…</p>
          <p className="mt-1 text-indigo-300">
            Tailoring technical, resume-based and behavioral questions for {role || "your role"}…
          </p>
        </div>
      ) : (
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={onBack}
            className="rounded-xl border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-200 hover:bg-slate-800"
          >
            Back
          </button>
          <button
            onClick={() => role && onStart(role, difficulty, count)}
            disabled={!canStart}
            className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-950 hover:bg-indigo-500 disabled:opacity-40"
          >
            🚀 Start Interview
          </button>
        </div>
      )}

      {generateError && !generating && (
        <div className="mt-4 rounded-xl border border-rose-800 bg-rose-950 p-4 text-sm">
          <p className="font-semibold text-rose-200">{friendlyError(generateError)}</p>
          <button
            onClick={onClassic}
            className="mt-2 rounded-lg border border-rose-700 px-4 py-2 text-xs font-semibold text-rose-100 hover:bg-rose-900"
          >
            Practice with the classic question bank instead
          </button>
        </div>
      )}
    </section>
  );
}

const activeCls =
  "rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-950";
const idleCls =
  "rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-200 hover:bg-slate-800";
