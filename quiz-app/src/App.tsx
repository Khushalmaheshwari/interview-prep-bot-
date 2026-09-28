import { useMemo, useState } from "react";
import Dashboard from "./components/Dashboard";
import InterviewSetup from "./components/InterviewSetup";
import ProfileCard from "./components/ProfileCard";
import QuizRunner from "./components/QuizRunner";
import Results from "./components/Results";
import ResumeUpload from "./components/ResumeUpload";
import { generateInterview } from "./lib/ai";
import { loadSessions } from "./lib/history";
import { countBy, selectQuestions } from "./lib/quiz";
import type { Recommendation } from "./lib/dashboard";
import {
  DIFFICULTIES,
  QUESTION_COUNTS,
  TOPICS,
  type AnswerRecord,
  type CandidateProfile,
  type Difficulty,
  type Question,
  type QuizConfig,
  type QuizSession,
  type Topic,
} from "./types";

type Screen =
  | "home"
  | "upload"
  | "profile"
  | "bank"
  | "quiz"
  | "results"
  | "dashboard";

export default function App() {
  const [screen, setScreen] = useState<Screen>("home");

  // Personalized flow state (session only — resume never leaves memory).
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [resumeExcerpt, setResumeExcerpt] = useState("");
  const [resumeFileName, setResumeFileName] = useState("");
  const [role, setRole] = useState("Financial Analyst");
  const [personalized, setPersonalized] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);

  // Classic bank flow state.
  const [config, setConfig] = useState<QuizConfig>({
    topic: "FP&A",
    difficulty: "Medium",
    count: 5,
  });

  // Running quiz state.
  const [picked, setPicked] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [runId, setRunId] = useState(0);
  const [runDifficulty, setRunDifficulty] = useState<Difficulty>("Medium");
  const [sessions, setSessions] = useState<QuizSession[]>([]);

  const available = useMemo(
    () => countBy(config.topic, config.difficulty),
    [config.topic, config.difficulty]
  );

  const beginQuiz = (questions: Question[], isPersonalized: boolean) => {
    setPicked(questions);
    setAnswers([]);
    setPersonalized(isPersonalized);
    setRunId((n) => n + 1);
    setScreen("quiz");
  };

  const startPersonalized = async (r: string, difficulty: Difficulty, count: number) => {
    if (!profile || generating) return;
    setRole(r);
    setGenerating(true);
    setGenerateError(null);
    const result = await generateInterview({
      profile,
      resumeExcerpt,
      role: r,
      difficulty,
      count,
    });
    setGenerating(false);
    if (result.ok) {
      setRunDifficulty(difficulty);
      beginQuiz(result.questions, true);
    } else {
      setGenerateError(result.reason);
    }
  };

  const startBankQuiz = () => {
    setRunDifficulty(config.difficulty === "Mixed" ? "Medium" : config.difficulty);
    beginQuiz(selectQuestions(config), false);
  };

  const openDashboard = () => {
    setSessions(loadSessions());
    setScreen("dashboard");
  };

  const startPractice = (rec: Recommendation) => {
    // Dashboard practice targets the classic bank; fall back to All when the
    // recommended (possibly AI-generated) topic has no bank questions.
    const next: QuizConfig =
      countBy(rec.topic, rec.difficulty) > 0
        ? { topic: rec.topic, difficulty: rec.difficulty, count: rec.count }
        : { topic: "All", difficulty: rec.difficulty, count: rec.count };
    setConfig(next);
    setRunDifficulty(next.difficulty === "Mixed" ? "Medium" : next.difficulty);
    beginQuiz(selectQuestions(next), false);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <button className="text-left" onClick={() => setScreen("home")}>
            <p className="text-lg font-bold">AI Interview Prep</p>
            <p className="text-xs text-slate-500">Personalized interview practice</p>
          </button>
          <nav className="flex gap-2 text-sm">
            <NavBtn active={screen === "home"} onClick={() => setScreen("home")}>
              Home
            </NavBtn>
            <NavBtn active={screen === "dashboard"} onClick={openDashboard}>
              Performance
            </NavBtn>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-10">
        {screen === "home" && (
          <>
            <section className="rounded-2xl bg-white p-10 text-center shadow-sm">
              <h1 className="text-4xl font-extrabold">AI Interview Prep</h1>
              <p className="mt-2 text-lg text-slate-600">
                Prepare smarter. Interview better.
              </p>
              <p className="mx-auto mt-4 max-w-xl text-sm text-slate-600">
                Upload your resume and get a personalized interview experience —
                questions built around your background and your target role,
                with AI feedback on every open answer.
              </p>
              <button
                onClick={() => setScreen("upload")}
                className="mt-6 rounded-xl bg-indigo-600 px-8 py-3 font-semibold text-white hover:bg-indigo-700"
              >
                Upload Resume
              </button>
              <p className="mt-4">
                <button
                  onClick={() => setScreen("bank")}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-700"
                >
                  Skip — try the classic question bank instead
                </button>
              </p>
            </section>
            <RecentSessions />
          </>
        )}

        {screen === "upload" && (
          <ResumeUpload
            onAnalyzed={(p, excerpt, fileName) => {
              setProfile(p);
              setResumeExcerpt(excerpt);
              setResumeFileName(fileName);
              setGenerateError(null);
              setScreen("profile");
            }}
            onClassic={() => setScreen("bank")}
          />
        )}

        {screen === "profile" && profile && (
          <div className="space-y-6">
            <ProfileCard profile={profile} />
            <InterviewSetup
              initialRole={role}
              generating={generating}
              generateError={generateError}
              onStart={startPersonalized}
              onClassic={() => setScreen("bank")}
              onBack={() => setScreen("upload")}
            />
            {resumeFileName && (
              <p className="text-center text-xs text-slate-400">
                Profile built from {resumeFileName} · kept in this session only.
              </p>
            )}
          </div>
        )}

        {screen === "bank" && (
          <section className="rounded-2xl bg-white p-8 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-widest text-indigo-600">
              Classic Quiz
            </p>
            <h2 className="mt-1 text-2xl font-bold">Question bank practice</h2>
            <p className="mt-1 text-sm text-slate-600">
              No resume needed — fixed Finance/FP&A bank with instant feedback.
            </p>

            <div className="mt-6">
              <Label>Topic</Label>
              <div className="flex flex-wrap gap-2">
                {TOPICS.map((t) => (
                  <Option
                    key={t}
                    active={config.topic === t}
                    onClick={() => setConfig({ ...config, topic: t as Topic | "All" })}
                  >
                    {t === "All" ? "All" : shortTopic(t as Topic)}
                  </Option>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <Label>Difficulty</Label>
              <div className="flex flex-wrap gap-2">
                {DIFFICULTIES.map((d) => (
                  <Option
                    key={d}
                    active={config.difficulty === d}
                    onClick={() =>
                      setConfig({ ...config, difficulty: d as Difficulty | "Mixed" })
                    }
                  >
                    {d}
                  </Option>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <Label>Questions</Label>
              <div className="flex gap-2">
                {QUESTION_COUNTS.map((n) => (
                  <Option
                    key={n}
                    active={config.count === n}
                    onClick={() => setConfig({ ...config, count: n })}
                  >
                    {n}
                  </Option>
                ))}
              </div>
            </div>

            <div className="mt-6 rounded-xl bg-slate-50 p-4 text-sm">
              <p>
                Available matching your filter: <strong>{available} questions</strong>
              </p>
              <p className="text-slate-500">
                Topic: {config.topic} · Difficulty: {config.difficulty} · Requested:{" "}
                {config.count}
              </p>
              {available === 0 && (
                <p className="mt-1 font-medium text-red-600">
                  No questions match — try “All” or “Mixed”.
                </p>
              )}
              {available > 0 && available < config.count && (
                <p className="mt-1 text-amber-700">
                  Only {available} available — you’ll get all of them.
                </p>
              )}
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setScreen("home")}
                className="rounded-xl border px-5 py-3 text-sm font-semibold hover:bg-slate-50"
              >
                Back
              </button>
              <button
                onClick={startBankQuiz}
                disabled={available === 0}
                className="rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white hover:bg-indigo-700 disabled:opacity-40"
              >
                Start Quiz
              </button>
            </div>
          </section>
        )}

        {screen === "quiz" && (
          <QuizRunner
            key={runId}
            questions={picked}
            onExit={() => setScreen(personalized ? "profile" : "bank")}
            onFinish={(a) => {
              setAnswers(a);
              setScreen("results");
            }}
            evalContext={
              personalized
                ? { resumeContext: resumeExcerpt, role }
                : undefined
            }
          />
        )}

        {screen === "results" && (
          <Results
            questions={picked}
            answers={answers}
            config={config}
            difficulty={runDifficulty}
            role={personalized ? role : undefined}
            personalized={personalized}
            onRetake={personalized ? () => setScreen("profile") : startBankQuiz}
            onNewSetup={() => setScreen(personalized ? "profile" : "bank")}
            onDashboard={openDashboard}
          />
        )}

        {screen === "dashboard" && (
          <Dashboard
            sessions={sessions}
            onPractice={startPractice}
            onSetup={() => setScreen("home")}
          />
        )}
      </main>

      <footer className="mx-auto max-w-4xl px-6 pb-10 text-center text-xs text-slate-400">
        Practice. Learn. Improve. — your resume stays in this session only.
      </footer>
    </div>
  );
}

function shortTopic(t: Topic): string {
  if (t === "Financial Accounting") return "Accounting";
  if (t === "Excel / Financial Modeling") return "Excel";
  return t;
}

/** Compact list of recent saved sessions on Home (plain history, no analytics). */
function RecentSessions() {
  const [sessions] = useState<QuizSession[]>(() => loadSessions().slice(0, 5));
  if (sessions.length === 0) return null;
  return (
    <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm sm:p-8">
      <h3 className="text-base font-bold">Recent sessions (this device)</h3>
      <ul className="mt-3 space-y-2 text-sm">
        {sessions.map((s) => (
          <li
            key={s.id}
            className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-2.5"
          >
            <span className="text-slate-600">
              {s.role || s.topic} · {s.difficulty}
            </span>
            <span className="font-bold">{s.pct}%</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <p className="mb-2 text-sm font-semibold">{children}</p>;
}

function NavBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={
        active
          ? "rounded-lg bg-slate-900 px-3 py-1.5 font-semibold text-white"
          : "rounded-lg px-3 py-1.5 text-slate-600 hover:bg-slate-100"
      }
    >
      {children}
    </button>
  );
}

function Option({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={
        active
          ? "rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white"
          : "rounded-xl border bg-white px-4 py-2 text-sm hover:bg-slate-50"
      }
    >
      {children}
    </button>
  );
}
