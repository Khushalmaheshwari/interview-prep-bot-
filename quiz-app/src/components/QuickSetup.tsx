import { useState } from "react";
import { friendlyError, generateInterview } from "../lib/ai";
import { type Difficulty, type Question } from "../types";
import CountInput from "./CountInput";
import RoleCombobox from "./RoleCombobox";

interface Props {
  onDone: (questions: Question[], meta: { role: string; difficulty: Difficulty }) => void;
  onBack: () => void;
  onClassic: () => void;
}

const DIFFS: Difficulty[] = ["Easy", "Medium", "Hard"];

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-semibold text-slate-200">{label}</span>
      {children}
    </label>
  );
}

const inputCls =
  "w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30";

/** Interview setup without resume: role + company + industry drive AI questions. */
export default function QuickSetup({ onDone, onBack, onClassic }: Props) {
  const [role, setRole] = useState("");
  const [company, setCompany] = useState("");
  const [industry, setIndustry] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>("Medium");
  const [count, setCount] = useState<number>(5);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canStart = !generating && role.length > 0;

  const start = async () => {
    if (!canStart) return;
    setGenerating(true);
    setError(null);
    const result = await generateInterview({
      role,
      company: company.trim(),
      industry: industry.trim(),
      difficulty,
      count,
    });
    setGenerating(false);
    if (result.ok) {
      onDone(result.questions, { role, difficulty });
    } else {
      setError(result.reason);
    }
  };

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl shadow-black/30 sm:p-8">
      <p className="text-sm font-semibold uppercase tracking-widest text-indigo-400">
        Quick Interview
      </p>
      <h2 className="mt-1 text-2xl font-bold text-white">No resume needed ⚡</h2>
      <p className="mt-1 text-sm text-slate-400">
        Tell us the role — questions are generated for it. Company and industry
        are optional context.
      </p>

      <p className="mb-2 mt-6 text-sm font-semibold text-slate-200">Target role</p>
      <RoleCombobox value={role} onChange={(r) => setRole(r.trim())} placeholder="Type a role, e.g. Marketing Analyst" />

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Field label="🏢 Company (optional)">
          <input
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="e.g. HDFC Bank"
            maxLength={80}
            className={inputCls}
          />
        </Field>
        <Field label="🏭 Industry (optional)">
          <input
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            placeholder="e.g. Banking, FMCG, IT"
            maxLength={80}
            className={inputCls}
          />
        </Field>
      </div>

      <p className="mb-2 mt-6 text-sm font-semibold text-slate-200">Difficulty</p>
      <div className="flex flex-wrap gap-2">
        {DIFFS.map((d) => (
          <button key={d} onClick={() => setDifficulty(d)} className={difficulty === d ? activeCls : idleCls}>
            {d}
          </button>
        ))}
      </div>

      <p className="mb-2 mt-6 text-sm font-semibold text-slate-200">Number of questions</p>
      <CountInput value={count} onChange={setCount} />

      {generating ? (
        <div className="mt-6 rounded-xl border border-indigo-800 bg-indigo-950 p-4 text-sm text-indigo-200">
          <p className="animate-pulse font-semibold">⚙️ Generating interview questions…</p>
          <p className="mt-1 text-indigo-300">Tailoring questions for {role}…</p>
        </div>
      ) : (
        <div className="mt-6 flex flex-wrap gap-3">
          <button onClick={onBack} className="rounded-xl border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-200 hover:bg-slate-800">
            Back
          </button>
          <button
            onClick={start}
            disabled={!canStart}
            className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-950 hover:bg-indigo-500 disabled:opacity-40"
          >
            🚀 Start Interview
          </button>
        </div>
      )}

      {error && !generating && (
        <div className="mt-4 rounded-xl border border-rose-800 bg-rose-950 p-4 text-sm">
          <p className="font-semibold text-rose-200">{friendlyError(error)}</p>
          <button onClick={onClassic} className="mt-2 rounded-lg border border-rose-700 px-4 py-2 text-xs font-semibold text-rose-100 hover:bg-rose-900">
            Practice with the classic question bank instead
          </button>
        </div>
      )}
    </section>
  );
}

const activeCls = "rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-950";
const idleCls = "rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-200 hover:bg-slate-800";
