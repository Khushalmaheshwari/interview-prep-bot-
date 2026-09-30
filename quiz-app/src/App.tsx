import { useState } from "react";
import BankSetup from "./components/BankSetup";
import Dashboard from "./components/Dashboard";
import InterviewSetup from "./components/InterviewSetup";
import ProfileCard from "./components/ProfileCard";
import QuickSetup from "./components/QuickSetup";
import QuizRunner from "./components/QuizRunner";
import Results from "./components/Results";
import ResumeUpload from "./components/ResumeUpload";
import { generateInterview } from "./lib/ai";
import { loadSessions } from "./lib/history";
import { selectQuestions } from "./lib/quiz";
import type { Recommendation } from "./lib/dashboard";
import {
  type AnswerRecord,
  type CandidateProfile,
  type Difficulty,
  type Question,
  type QuizConfig,
  type QuizSession,
} from "./types";

type Screen =
  | "home"
  | "upload"
  | "profile"
  | "quick"
  | "bank"
  | "quiz"
  | "results"
  | "dashboard";

/** Where the current quiz came from (drives Back/Retake routing). */
type Flow = "resume" | "quick" | "topic" | "bank";

export default function App() {
  const [screen, setScreen] = useState<Screen>("home");
  const [flow, setFlow] = useState<Flow>("bank");

  // Personalized flow state (session only — resume never leaves memory).
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [resumeExcerpt, setResumeExcerpt] = useState("");
  const [resumeFileName, setResumeFileName] = useState("");
  const [role, setRole] = useState("Financial Analyst");
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [lastBankConfig, setLastBankConfig] = useState<QuizConfig | null>(null);

  // Running quiz state.
  const [picked, setPicked] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [runId, setRunId] = useState(0);
  const [runDifficulty, setRunDifficulty] = useState<Difficulty>("Medium");
  const [sessions, setSessions] = useState<QuizSession[]>([]);

  const personalized = flow !== "bank";

  const beginQuiz = (questions: Question[], nextFlow: Flow) => {
    setPicked(questions);
    setAnswers([]);
    setFlow(nextFlow);
    setRunId((n) => n + 1);
    setScreen("quiz");
  };

  const startPersonalized = async (r: string, difficulty: Difficulty, count: number) => {
    if (!profile || generating) return;
    setRole(r);
    setRunDifficulty(difficulty);
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
      beginQuiz(result.questions, "resume");
    } else {
      setGenerateError(result.reason);
    }
  };

  const startQuick = (questions: Question[], meta: { role: string; difficulty: Difficulty }) => {
    setRole(meta.role);
    setRunDifficulty(meta.difficulty);
    beginQuiz(questions, "quick");
  };

  const startTopic = (questions: Question[], meta: { role: string; difficulty: Difficulty }) => {
    setRole(meta.role);
    setRunDifficulty(meta.difficulty);
    beginQuiz(questions, "topic");
  };

  const startBank = (config: QuizConfig) => {
    setLastBankConfig(config);
    setRunDifficulty(config.difficulty === "Mixed" ? "Medium" : config.difficulty);
    beginQuiz(selectQuestions(config), "bank");
  };

  const openDashboard = () => {
    setSessions(loadSessions());
    setScreen("dashboard");
  };

  const startPractice = (rec: Recommendation) => {
    const next: QuizConfig = { topic: rec.topic, difficulty: rec.difficulty, count: rec.count };
    startBank(next);
  };

  const quizHome: Screen =
    flow === "resume" ? "profile" : flow === "quick" ? "quick" : "bank";

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
                Upload your resume for a fully personalized interview — or skip
                it and practice by role or topic. Every open answer gets AI
                feedback.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <button
                  onClick={() => setScreen("upload")}
                  className="rounded-xl bg-indigo-600 px-8 py-3 font-semibold text-white hover:bg-indigo-700"
                >
                  Upload Resume
                </button>
                <button
                  onClick={() => setScreen("quick")}
                  className="rounded-xl border px-6 py-3 text-sm font-semibold hover:bg-slate-50"
                >
                  Skip resume — quick setup
                </button>
              </div>
              <p className="mt-4 text-xs text-slate-400">
                Resume stays in this session only — never stored or shared.
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

        {screen === "quick" && (
          <QuickSetup
            onDone={startQuick}
            onBack={() => setScreen("home")}
            onClassic={() => setScreen("bank")}
          />
        )}

        {screen === "bank" && (
          <BankSetup
            onBankDone={startBank}
            onTopicDone={startTopic}
            onBack={() => setScreen("home")}
          />
        )}

        {screen === "quiz" && (
          <QuizRunner
            key={runId}
            questions={picked}
            onExit={() => setScreen(quizHome)}
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
            config={lastBankConfig || { topic: "All", difficulty: runDifficulty, count: picked.length }}
            difficulty={runDifficulty}
            role={personalized ? role : undefined}
            personalized={personalized}
            onRetake={() => {
              if (flow === "bank" && lastBankConfig) startBank(lastBankConfig);
              else if (flow !== "bank") beginQuiz(picked, flow);
              else setScreen("bank");
            }}
            onNewSetup={() => setScreen(quizHome)}
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
