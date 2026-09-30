import { useState } from "react";
import BankSetup from "./components/BankSetup";
import Dashboard from "./components/Dashboard";
import HomeStats from "./components/HomeStats";
import InterviewSetup from "./components/InterviewSetup";
import ProfileCard from "./components/ProfileCard";
import QuickSetup from "./components/QuickSetup";
import QuizRunner from "./components/QuizRunner";
import Results from "./components/Results";
import ResumeUpload from "./components/ResumeUpload";
import TipsPage from "./components/TipsPage";
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
  | "dashboard"
  | "tips";

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
  const [jdExcerpt, setJdExcerpt] = useState("");
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

  const startPersonalized = async (r: string, difficulty: Difficulty, count: number, jd: string) => {
    if (!profile || generating) return;
    setRole(r);
    setRunDifficulty(difficulty);
    setJdExcerpt(jd);
    setGenerating(true);
    setGenerateError(null);
    const result = await generateInterview({
      profile,
      resumeExcerpt,
      jdExcerpt: jd,
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

  const startQuick = (questions: Question[], meta: { role: string; difficulty: Difficulty; jdExcerpt: string }) => {
    setRole(meta.role);
    setRunDifficulty(meta.difficulty);
    setJdExcerpt(meta.jdExcerpt);
    beginQuiz(questions, "quick");
  };

  const startTopic = (questions: Question[], meta: { role: string; difficulty: Difficulty; jdExcerpt: string }) => {
    setRole(meta.role);
    setRunDifficulty(meta.difficulty);
    setJdExcerpt(meta.jdExcerpt);
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
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <button className="text-left" onClick={() => setScreen("home")}>
            <p className="text-lg font-bold text-white">🎯 AI Interview Prep</p>
            <p className="text-xs text-slate-400">Personalized interview practice</p>
          </button>
          <nav className="flex gap-2 text-sm">
            <NavBtn active={screen === "home"} onClick={() => setScreen("home")}>
              Home
            </NavBtn>
            <NavBtn active={screen === "tips"} onClick={() => setScreen("tips")}>
              Tips
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
            <section className="overflow-hidden rounded-2xl border border-indigo-900 bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-900 p-10 text-center shadow-xl shadow-black/40">
              <p className="text-sm font-semibold uppercase tracking-widest text-indigo-400">
                ✨ AI-powered mock interviews
              </p>
              <h1 className="mt-2 bg-gradient-to-r from-white via-indigo-200 to-violet-300 bg-clip-text text-4xl font-extrabold text-transparent sm:text-5xl">
                AI Interview Prep
              </h1>
              <p className="mt-3 text-lg text-slate-300">
                Prepare smarter. Interview better.
              </p>
              <p className="mx-auto mt-4 max-w-xl text-sm text-slate-400">
                Upload your resume for a fully personalized interview — or skip
                it and practice by role or topic. Every open answer gets AI
                feedback.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <button
                  onClick={() => setScreen("upload")}
                  className="rounded-xl bg-indigo-600 px-8 py-3 font-semibold text-white shadow-lg shadow-indigo-950 hover:bg-indigo-500"
                >
                  📄 Upload Resume
                </button>
                <button
                  onClick={() => setScreen("quick")}
                  className="rounded-xl border border-slate-700 bg-slate-800/60 px-6 py-3 text-sm font-semibold text-slate-100 hover:bg-slate-800"
                >
                  ⚡ Skip resume — quick setup
                </button>
              </div>
              <p className="mt-4 text-xs text-slate-500">
                Resume stays in this session only — never stored or shared.
              </p>
            </section>
            <HomeStats />
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
              <p className="text-center text-xs text-slate-500">
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
                ? {
                    resumeContext: [resumeExcerpt, jdExcerpt ? `Job description:\n${jdExcerpt}` : ""]
                      .filter(Boolean)
                      .join("\n\n"),
                    role,
                  }
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

        {screen === "tips" && <TipsPage />}
      </main>

      <footer className="mx-auto max-w-4xl px-6 pb-10 text-center text-xs text-slate-500">
        Practice. Learn. Improve. — your resume stays in this session only.
      </footer>
    </div>
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
          ? "rounded-lg bg-indigo-600 px-3 py-1.5 font-semibold text-white"
          : "rounded-lg px-3 py-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
      }
    >
      {children}
    </button>
  );
}
