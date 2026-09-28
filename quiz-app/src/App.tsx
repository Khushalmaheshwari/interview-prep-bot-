import { useMemo, useState } from "react";
import Dashboard from "./components/Dashboard";
import QuizRunner from "./components/QuizRunner";
import Results from "./components/Results";
import { loadSessions } from "./lib/history";
import { countBy, selectQuestions } from "./lib/quiz";
import type { Recommendation } from "./lib/dashboard";
import {
  DIFFICULTIES,
  QUESTION_COUNTS,
  TOPICS,
  type AnswerRecord,
  type Difficulty,
  type Question,
  type QuizConfig,
  type QuizSession,
  type Topic,
} from "./types";

type Screen = "home" | "setup" | "quiz" | "results" | "dashboard";

export default function App() {
  const [screen, setScreen] = useState<Screen>("home");
  const [config, setConfig] = useState<QuizConfig>({
    topic: "FP&A",
    difficulty: "Medium",
    count: 5,
  });
  const [picked, setPicked] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [sessions, setSessions] = useState<QuizSession[]>([]);

  const available = useMemo(
    () => countBy(config.topic, config.difficulty),
    [config.topic, config.difficulty]
  );

  const startQuiz = () => {
    setPicked(selectQuestions(config));
    setAnswers([]);
    setScreen("quiz");
  };

  const openDashboard = () => {
    setSessions(loadSessions());
    setScreen("dashboard");
  };

  const startPractice = (rec: Recommendation) => {
    const next: QuizConfig = { topic: rec.topic, difficulty: rec.difficulty, count: rec.count };
    setConfig(next);
    setPicked(selectQuestions(next));
    setAnswers([]);
    setScreen("quiz");
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <button className="text-left" onClick={() => setScreen("home")}>
            <p className="text-lg font-bold">AI Interview Prep</p>
            <p className="text-xs text-slate-500">Financial Analyst / FP&amp;A</p>
          </button>
          <nav className="flex gap-2 text-sm">
            <NavBtn active={screen === "home"} onClick={() => setScreen("home")}>
              Home
            </NavBtn>
            <NavBtn active={screen === "setup"} onClick={() => setScreen("setup")}>
              Quiz Setup
            </NavBtn>
            <NavBtn active={screen === "dashboard"} onClick={openDashboard}>
              Dashboard
            </NavBtn>
            {picked.length > 0 && (screen === "quiz" || screen === "results") && (
              <NavBtn
                active={screen === "results"}
                onClick={() => answers.length > 0 && setScreen("results")}
              >
                Results
              </NavBtn>
            )}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-10">
        {screen === "home" && (
          <>
            <section className="rounded-2xl bg-white p-10 text-center shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-widest text-indigo-600">
                Phase 4 — Performance Dashboard
              </p>
              <h1 className="mt-2 text-4xl font-extrabold">AI Interview Prep</h1>
              <p className="mt-2 text-lg text-slate-600">Practice. Learn. Improve.</p>
              <p className="mx-auto mt-4 max-w-xl text-sm text-slate-600">
                Prepare for <strong>Financial Analyst / FP&amp;A</strong> interviews
                with topic-wise quizzes, instant feedback and AI evaluation of
                scenario answers — then track your weakest areas on the dashboard.
              </p>
              <button
                onClick={() => setScreen("setup")}
                className="mt-6 rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white hover:bg-indigo-700"
              >
                Start Quiz
              </button>
              <p className="mt-4 text-xs text-slate-400">
                Demo: Home → Setup → Quiz → Results.
              </p>
            </section>
            <RecentSessions />
          </>
        )}

        {screen === "setup" && (
          <section className="rounded-2xl bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-bold">Quiz Setup</h2>
            <p className="mt-1 text-sm text-slate-600">
              Role: <strong>Financial Analyst / FP&amp;A</strong>
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
                onClick={startQuiz}
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
            questions={picked}
            onExit={() => setScreen("setup")}
            onFinish={(a) => {
              setAnswers(a);
              setScreen("results");
            }}
          />
        )}

        {screen === "results" && (
          <Results
            questions={picked}
            answers={answers}
            config={config}
            onRetake={startQuiz}
            onNewSetup={() => setScreen("setup")}
            onDashboard={openDashboard}
          />
        )}

        {screen === "dashboard" && (
          <Dashboard
            sessions={sessions}
            onPractice={startPractice}
            onSetup={() => setScreen("setup")}
          />
        )}
      </main>

      <footer className="mx-auto max-w-4xl px-6 pb-10 text-center text-xs text-slate-400">
        Phase 4 build — full quiz with AI evaluation plus a simple performance
        dashboard (averages, topic stats, weakest area, practice recommendation).
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
              {s.topic} · {s.difficulty}
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
