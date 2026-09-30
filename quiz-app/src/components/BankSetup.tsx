import { useState } from "react";
import { friendlyError, generateInterview } from "../lib/ai";
import { countBy } from "../lib/quiz";
import {
  DIFFICULTIES,
  TOPICS,
  type Difficulty,
  type Question,
  type QuizConfig,
  type Topic,
} from "../types";
import CountInput from "./CountInput";
import RoleCombobox from "./RoleCombobox";

interface Props {
  onBankDone: (config: QuizConfig) => void;
  onTopicDone: (questions: Question[], meta: { role: string; difficulty: Difficulty }) => void;
  onBack: () => void;
}

const BROAD_TOPICS = [
  "Finance",
  "Marketing",
  "Human Resources",
  "Operations",
  "Data Analytics",
] as const;

type BroadTopic = (typeof BROAD_TOPICS)[number];

const DEFAULT_ROLE: Record<BroadTopic, string> = {
  Finance: "Financial Analyst",
  Marketing: "Marketing Analyst",
  "Human Resources": "HR",
  Operations: "Operations",
  "Data Analytics": "Data Analyst",
};

const AI_DIFFS: Difficulty[] = ["Easy", "Medium", "Hard"];

/**
 * Topic screen: Finance uses the offline bank (topic focus + difficulty);
 * other broad topics generate an AI topic quiz, optionally shaped by a role.
 */
export default function BankSetup({ onBankDone, onTopicDone, onBack }: Props) {
  const [broad, setBroad] = useState<BroadTopic>("Finance");
  const [focus, setFocus] = useState<Topic | "All">("FP&A");
  const [bankDiff, setBankDiff] = useState<Difficulty | "Mixed">("Medium");
  const [bankCount, setBankCount] = useState<number>(5);
  const [role, setRole] = useState<string>(DEFAULT_ROLE.Finance);
  const [aiDiff, setAiDiff] = useState<Difficulty>("Medium");
  const [aiCount, setAiCount] = useState<number>(5);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const available = countBy(focus, bankDiff);

  const pickBroad = (t: BroadTopic) => {
    setBroad(t);
    setRole(DEFAULT_ROLE[t]);
    setError(null);
  };

  const startTopicQuiz = async () => {
    if (generating || !role) return;
    setGenerating(true);
    setError(null);
    const result = await generateInterview({
      role,
      topicFocus: broad,
      difficulty: aiDiff,
      count: aiCount,
    });
    setGenerating(false);
    if (result.ok) {
      onTopicDone(result.questions, { role, difficulty: aiDiff });
    } else {
      setError(result.reason);
    }
  };

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl shadow-black/30 sm:p-8">
      <p className="text-sm font-semibold uppercase tracking-widest text-indigo-400">
        📚 Topic Quiz
      </p>
      <h2 className="mt-1 text-2xl font-bold text-white">Pick a topic to practice</h2>
      <p className="mt-1 text-sm text-slate-400">
        Finance runs on the offline question bank. Other topics generate a
        fresh AI quiz — shaped by the role below.
      </p>

      <p className="mb-2 mt-6 text-sm font-semibold text-slate-200">Topic</p>
      <div className="flex flex-wrap gap-2">
        {BROAD_TOPICS.map((t) => (
          <button key={t} onClick={() => pickBroad(t)} className={broad === t ? activeCls : idleCls}>
            {t}
          </button>
        ))}
      </div>

      {broad === "Finance" ? (
        <>
          <p className="mb-2 mt-6 text-sm font-semibold text-slate-200">Focus area</p>
          <div className="flex flex-wrap gap-2">
            {TOPICS.map((t) => (
              <button
                key={t}
                onClick={() => setFocus(t as Topic | "All")}
                className={focus === t ? activeCls : idleCls}
              >
                {t === "All" ? "All" : shortTopic(t as Topic)}
              </button>
            ))}
          </div>

          <p className="mb-2 mt-6 text-sm font-semibold text-slate-200">Difficulty</p>
          <div className="flex flex-wrap gap-2">
            {DIFFICULTIES.map((d) => (
              <button
                key={d}
                onClick={() => setBankDiff(d as Difficulty | "Mixed")}
                className={bankDiff === d ? activeCls : idleCls}
              >
                {d}
              </button>
            ))}
          </div>

          <p className="mb-2 mt-6 text-sm font-semibold text-slate-200">Number of questions</p>
          <CountInput value={bankCount} onChange={setBankCount} />

          <div className="mt-6 rounded-xl bg-slate-800 p-4 text-sm text-slate-300">
            <p>
              Available in bank: <strong className="text-white">{available} questions</strong>
              <span className="text-slate-500"> · works without AI</span>
            </p>
            {available === 0 && (
              <p className="mt-1 font-medium text-rose-300">No questions match — try “All” or “Mixed”.</p>
            )}
            {available > 0 && available < bankCount && (
              <p className="mt-1 text-amber-300">Only {available} available — you’ll get all of them.</p>
            )}
          </div>

          <div className="mt-6 flex gap-3">
            <button onClick={onBack} className="rounded-xl border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-200 hover:bg-slate-800">
              Back
            </button>
            <button
              onClick={() => onBankDone({ topic: focus, difficulty: bankDiff, count: bankCount })}
              disabled={available === 0}
              className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-950 hover:bg-indigo-500 disabled:opacity-40"
            >
              Start Quiz
            </button>
          </div>
        </>
      ) : (
        <>
          <p className="mb-2 mt-6 text-sm font-semibold text-slate-200">Role (shapes the questions)</p>
          <RoleCombobox value={role} onChange={setRole} />

          <p className="mb-2 mt-6 text-sm font-semibold text-slate-200">Difficulty</p>
          <div className="flex flex-wrap gap-2">
            {AI_DIFFS.map((d) => (
              <button key={d} onClick={() => setAiDiff(d)} className={aiDiff === d ? activeCls : idleCls}>
                {d}
              </button>
            ))}
          </div>

          <p className="mb-2 mt-6 text-sm font-semibold text-slate-200">Number of questions</p>
          <CountInput value={aiCount} onChange={setAiCount} />

          {generating ? (
            <div className="mt-6 rounded-xl border border-indigo-800 bg-indigo-950 p-4 text-sm text-indigo-200">
              <p className="animate-pulse font-semibold">⚙️ Generating {broad} questions…</p>
              <p className="mt-1 text-indigo-300">Tailoring them for {role || "your role"}…</p>
            </div>
          ) : (
            <div className="mt-6 flex gap-3">
              <button onClick={onBack} className="rounded-xl border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-200 hover:bg-slate-800">
                Back
              </button>
              <button
                onClick={startTopicQuiz}
                disabled={!role}
                className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-950 hover:bg-indigo-500 disabled:opacity-40"
              >
                🚀 Start Quiz
              </button>
            </div>
          )}

          {error && !generating && (
            <div className="mt-4 rounded-xl border border-rose-800 bg-rose-950 p-4 text-sm">
              <p className="font-semibold text-rose-200">{friendlyError(error)}</p>
              <button
                onClick={() => pickBroad("Finance")}
                className="mt-2 rounded-lg border border-rose-700 px-4 py-2 text-xs font-semibold text-rose-100 hover:bg-rose-900"
              >
                Practice Finance offline instead
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}

function shortTopic(t: Topic): string {
  if (t === "Financial Accounting") return "Accounting";
  if (t === "Excel / Financial Modeling") return "Excel";
  return t;
}

const activeCls = "rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-950";
const idleCls = "rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-200 hover:bg-slate-800";
