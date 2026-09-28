import { useRef, useState } from "react";
import { evaluateAnswer } from "../lib/ai";
import { isCorrect } from "../lib/quiz";
import type {
  AIEvaluation,
  AnswerRecord,
  ObjectiveQuestion,
  Question,
  ScenarioQuestion,
} from "../types";

interface Props {
  questions: Question[];
  onFinish: (answers: AnswerRecord[]) => void;
  onExit: () => void;
}

export default function QuizRunner({ questions, onFinish, onExit }: Props) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  // Late AI results (resolved after the user moved on) are merged at finish.
  const aiRef = useRef(new Map<string, AIEvaluation | null>());

  if (questions.length === 0) {
    return (
      <section className="rounded-2xl bg-white p-8 text-center shadow-sm">
        <p className="font-semibold">No questions to show.</p>
        <button
          onClick={onExit}
          className="mt-4 rounded-xl border px-5 py-2.5 text-sm font-semibold hover:bg-slate-50"
        >
          Back to Setup
        </button>
      </section>
    );
  }

  const q = questions[index];
  const isLast = index === questions.length - 1;
  const isObjective = q.type === "mcq" || q.type === "true_false";
  const currentRecord = answers[index];

  const canSubmit = submitted
    ? false
    : isObjective
      ? selected !== null
      : text.trim().length > 0;

  const handleSubmit = () => {
    if (!canSubmit) return;
    const userAnswer = isObjective ? (selected as string) : text.trim();
    const record: AnswerRecord = {
      questionId: q.id,
      userAnswer,
      correct: isCorrect(q, userAnswer),
    };
    const next = [...answers];
    next[index] = record;
    setAnswers(next);
    setSubmitted(true);

    // AI evaluation ONLY for scenario answers. Objective scoring stays
    // deterministic. Failures resolve to null -> fallback UI, quiz continues.
    if (!isObjective) {
      const sq = q as ScenarioQuestion;
      setLoadingId(sq.id);
      void evaluateAnswer({
        question: sq.question,
        idealAnswer: sq.ideal_answer,
        evaluationPoints: sq.evaluation_points,
        userAnswer,
      }).then((result) => {
        const ai = result.ok ? result.evaluation : null;
        aiRef.current.set(sq.id, ai);
        setAnswers((prev) =>
          prev.map((a) => (a.questionId === sq.id ? { ...a, ai } : a))
        );
        setLoadingId((prev) => (prev === sq.id ? null : prev));
      });
    }
  };

  const handleNext = () => {
    const merged = answers.map((a) =>
      aiRef.current.has(a.questionId)
        ? { ...a, ai: aiRef.current.get(a.questionId) ?? null }
        : a
    );
    if (isLast) {
      onFinish(merged);
      return;
    }
    setAnswers(merged);
    setIndex(index + 1);
    setSelected(null);
    setText("");
    setSubmitted(false);
  };

  return (
    <section>
      <div className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Question {index + 1} of {questions.length} · {q.topic} · {q.difficulty}
          </p>
          <button onClick={onExit} className="text-xs font-semibold text-slate-400 hover:text-slate-600">
            Quit
          </button>
        </div>

        <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-indigo-600 transition-all"
            style={{ width: `${((index + (submitted ? 1 : 0)) / questions.length) * 100}%` }}
          />
        </div>

        <h2 className="mt-4 text-lg font-bold leading-snug">{q.question}</h2>

        {isObjective ? (
          <div className="mt-4 space-y-2">
            {(q as ObjectiveQuestion).options.map((opt) => {
              const picked = selected === opt;
              const showResult = submitted && currentRecord;
              const isRight = (q as ObjectiveQuestion).correct_answer === opt;
              return (
                <button
                  key={opt}
                  disabled={submitted}
                  onClick={() => setSelected(opt)}
                  className={`w-full rounded-xl border px-4 py-3 text-left text-sm transition ${
                    showResult && isRight
                      ? "border-green-500 bg-green-50 font-semibold"
                      : showResult && picked && !isRight
                        ? "border-red-400 bg-red-50"
                        : picked
                          ? "border-indigo-600 bg-indigo-50 font-semibold"
                          : "bg-white hover:bg-slate-50"
                  } ${submitted ? "cursor-default" : "cursor-pointer"}`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="mt-4">
            <textarea
              value={text}
              disabled={submitted}
              onChange={(e) => setText(e.target.value)}
              rows={5}
              placeholder="Type your answer in 2-4 sentences (e.g. what drove the variance, what you'd check next)…"
              className="w-full rounded-xl border px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-50"
            />
            <p className="mt-1 text-xs text-slate-400">
              Scenario question — AI will evaluate your answer after you submit.
            </p>
          </div>
        )}

        {!submitted ? (
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="mt-5 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-40"
          >
            Submit Answer
          </button>
        ) : (
          <FeedbackPanel
            question={q}
            record={currentRecord}
            aiLoading={loadingId === q.id}
            isLast={isLast}
            onNext={handleNext}
          />
        )}
      </div>
    </section>
  );
}

function FeedbackPanel({
  question,
  record,
  aiLoading,
  isLast,
  onNext,
}: {
  question: Question;
  record: AnswerRecord;
  aiLoading: boolean;
  isLast: boolean;
  onNext: () => void;
}) {
  if (question.type === "scenario") {
    const ai = record.ai;
    return (
      <div className="mt-5 space-y-4">
        <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4 text-sm">
          <p className="font-bold text-indigo-900">AI Evaluation</p>
          {aiLoading && ai === undefined ? (
            <p className="mt-2 animate-pulse text-indigo-700">
              Evaluating your answer…
            </p>
          ) : ai ? (
            <div className="mt-2 space-y-2">
              <p>
                <strong>Score: {ai.score}/100</strong>{" "}
                <span className="ml-1 rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-indigo-700">
                  {ai.verdict}
                </span>
              </p>
              <p>
                <strong>What you got right:</strong> {ai.understood || "—"}
              </p>
              <p>
                <strong>What&apos;s missing:</strong> {ai.missing || "—"}
              </p>
              <p>
                <strong>Explanation:</strong> {ai.explanation || "—"}
              </p>
              <p>
                <strong>Improvement tip:</strong> {ai.tip || "—"}
              </p>
            </div>
          ) : (
            <p className="mt-2">
              AI feedback is temporarily unavailable. Please review the model
              answer.
            </p>
          )}
        </div>

        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm">
          <p className="font-bold text-amber-800">Model answer</p>
          <p className="mt-2">{question.ideal_answer}</p>
          <p className="mt-3 font-semibold">What a strong answer covers:</p>
          <ul className="mt-1 list-disc pl-5">
            {question.evaluation_points.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
          <p className="mt-3">
            <strong>Interview tip:</strong> {question.interview_tip}
          </p>
          <NextBtn isLast={isLast} onNext={onNext} />
        </div>
      </div>
    );
  }

  const ok = record.correct === true;
  return (
    <div
      className={`mt-5 rounded-xl border p-4 text-sm ${
        ok ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"
      }`}
    >
      <p className={`text-base font-extrabold ${ok ? "text-green-700" : "text-red-700"}`}>
        {ok ? "Correct" : "Incorrect"}
      </p>
      <p className="mt-2">
        <strong>Correct Answer:</strong> {question.correct_answer}
      </p>
      <p className="mt-1">
        <strong>Explanation:</strong> {question.explanation}
      </p>
      <p className="mt-1">
        <strong>Interview Tip:</strong> {question.interview_tip}
      </p>
      <NextBtn isLast={isLast} onNext={onNext} />
    </div>
  );
}

function NextBtn({ isLast, onNext }: { isLast: boolean; onNext: () => void }) {
  return (
    <button
      onClick={onNext}
      className="mt-4 rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-slate-700"
    >
      {isLast ? "See Results" : "Next Question"}
    </button>
  );
}
