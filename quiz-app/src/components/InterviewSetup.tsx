import { useState } from "react";
import { friendlyError } from "../lib/ai";
import { QUESTION_COUNTS, type Difficulty } from "../types";
import RolePicker from "./RolePicker";

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
    <section className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
      <p className="text-sm font-semibold uppercase tracking-widest text-indigo-600">
        Interview Setup
      </p>
      <h2 className="mt-1 text-2xl font-bold">What are you preparing for?</h2>

      <p className="mb-2 mt-6 text-sm font-semibold">Target role</p>
      <RolePicker value={role} onChange={setRole} />

      <p className="mb-2 mt-6 text-sm font-semibold">Difficulty</p>
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

      <p className="mb-2 mt-6 text-sm font-semibold">Questions</p>
      <div className="flex gap-2">
        {QUESTION_COUNTS.map((n) => (
          <button
            key={n}
            onClick={() => setCount(n)}
            className={count === n ? activeCls : idleCls}
          >
            {n}
          </button>
        ))}
      </div>

      {generating ? (
        <div className="mt-6 rounded-xl bg-indigo-50 p-4 text-sm text-indigo-800">
          <p className="animate-pulse font-semibold">Generating personalized interview questions…</p>
          <p className="mt-1 text-indigo-600">
            Tailoring technical, resume-based and behavioral questions for {role || "your role"}…
          </p>
        </div>
      ) : (
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={onBack}
            className="rounded-xl border px-5 py-3 text-sm font-semibold hover:bg-slate-50"
          >
            Back
          </button>
          <button
            onClick={() => role && onStart(role, difficulty, count)}
            disabled={!canStart}
            className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-40"
          >
            Start Interview
          </button>
        </div>
      )}

      {generateError && !generating && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm">
          <p className="font-semibold text-red-700">{friendlyError(generateError)}</p>
          <button
            onClick={onClassic}
            className="mt-2 rounded-lg border px-4 py-2 text-xs font-semibold hover:bg-white"
          >
            Practice with the classic question bank instead
          </button>
        </div>
      )}
    </section>
  );
}

const activeCls =
  "rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white";
const idleCls =
  "rounded-xl border bg-white px-4 py-2 text-sm hover:bg-slate-50";
