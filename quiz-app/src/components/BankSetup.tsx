import { useState } from "react";
import { friendlyError, generateInterview } from "../lib/ai";
import { countBy } from "../lib/quiz";
import {
  DIFFICULTIES,
  QUESTION_COUNTS,
  TOPICS,
  type Difficulty,
  type Question,
  type QuizConfig,
  type Topic,
} from "../types";
import RolePicker from "./RolePicker";

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
 * Classic screen: Finance uses the offline bank (topic focus + difficulty);
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
    <section className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
      <p className="text-sm font-semibold uppercase tracking-widest text-indigo-600">
        Topic Quiz
      </p>
      <h2 className="mt-1 text-2xl font-bold">Pick a topic to practice</h2>
      <p className="mt-1 text-sm text-slate-600">
        Finance runs on the offline question bank. Other topics generate a
        fresh AI quiz — shaped by the role below.
      </p>

      <p className="mb-2 mt-6 text-sm font-semibold">Topic</p>
      <div className="flex flex-wrap gap-2">
        {BROAD_TOPICS.map((t) => (
          <button key={t} onClick={() => pickBroad(t)} className={broad === t ? activeCls : idleCls}>
            {t}
          </button>
        ))}
      </div>

      {broad === "Finance" ? (
        <>
          <p className="mb-2 mt-6 text-sm font-semibold">Focus area</p>
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

          <p className="mb-2 mt-6 text-sm font-semibold">Difficulty</p>
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

          <p className="mb-2 mt-6 text-sm font-semibold">Questions</p>
          <div className="flex gap-2">
            {QUESTION_COUNTS.map((n) => (
              <button key={n} onClick={() => setBankCount(n)} className={bankCount === n ? activeCls : idleCls}>
                {n}
              </button>
            ))}
          </div>

          <div className="mt-6 rounded-xl bg-slate-50 p-4 text-sm">
            <p>
              Available in bank: <strong>{available} questions</strong>
              <span className="text-slate-500"> · works without AI</span>
            </p>
            {available === 0 && (
              <p className="mt-1 font-medium text-red-600">No questions match — try “All” or “Mixed”.</p>
            )}
            {available > 0 && available < bankCount && (
              <p className="mt-1 text-amber-700">Only {available} available — you’ll get all of them.</p>
            )}
          </div>

          <div className="mt-6 flex gap-3">
            <button onClick={onBack} className="rounded-xl border px-5 py-3 text-sm font-semibold hover:bg-slate-50">
              Back
            </button>
            <button
              onClick={() => onBankDone({ topic: focus, difficulty: bankDiff, count: bankCount })}
              disabled={available === 0}
              className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-40"
            >
              Start Quiz
            </button>
          </div>
        </>
      ) : (
        <>
          <p className="mb-2 mt-6 text-sm font-semibold">Role (shapes the questions)</p>
          <RolePicker value={role} onChange={setRole} />

          <p className="mb-2 mt-6 text-sm font-semibold">Difficulty</p>
          <div className="flex flex-wrap gap-2">
            {AI_DIFFS.map((d) => (
              <button key={d} onClick={() => setAiDiff(d)} className={aiDiff === d ? activeCls : idleCls}>
                {d}
              </button>
            ))}
          </div>

          <p className="mb-2 mt-6 text-sm font-semibold">Questions</p>
          <div className="flex gap-2">
            {QUESTION_COUNTS.map((n) => (
              <button key={n} onClick={() => setAiCount(n)} className={aiCount === n ? activeCls : idleCls}>
                {n}
              </button>
            ))}
          </div>

          {generating ? (
            <div className="mt-6 rounded-xl bg-indigo-50 p-4 text-sm text-indigo-800">
              <p className="animate-pulse font-semibold">Generating {broad} questions…</p>
              <p className="mt-1 text-indigo-600">Tailoring them for {role || "your role"}…</p>
            </div>
          ) : (
            <div className="mt-6 flex gap-3">
              <button onClick={onBack} className="rounded-xl border px-5 py-3 text-sm font-semibold hover:bg-slate-50">
                Back
              </button>
              <button
                onClick={startTopicQuiz}
                disabled={!role}
                className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-40"
              >
                Start Quiz
              </button>
            </div>
          )}

          {error && !generating && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm">
              <p className="font-semibold text-red-700">{friendlyError(error)}</p>
              <button
                onClick={() => pickBroad("Finance")}
                className="mt-2 rounded-lg border px-4 py-2 text-xs font-semibold hover:bg-white"
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

const activeCls = "rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white";
const idleCls = "rounded-xl border bg-white px-4 py-2 text-sm hover:bg-slate-50";
