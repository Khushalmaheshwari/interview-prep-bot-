# Project Report — AI Interview-Prep Quiz Bot (Financial Analyst / FP&A)

Demo project for the MBA end-term: `quiz-app/` (React + TypeScript + Tailwind,
minimal Express proxy, Gemini API, local JSON bank of 36 questions).

## A. Business & Strategic Framing

1. **Problem.** Finance students preparing for FP&A/analyst interviews have
   scattered material (textbooks, PDFs, generic question lists) with no instant
   checking, no interview-style open-ended practice and no view of weak areas.
2. **Target user.** MBA / master's finance students preparing for Financial
   Analyst / FP&A interviews. Paying customer (if commercialised) would be the
   student or a university careers office; the end user is the student.
3. **Why useful.** One loop — pick a topic mix, answer, get instant correction
   plus interview tips, have scenario answers graded like a mock interviewer,
   and see exactly which topic to revise next.
4. **Value proposition.** Interview-ready practice in 5-minute sessions:
   deterministic correctness where answers are known, AI judgement where only
   interpretation works, and a dashboard that points at the weakest area.
5. **SWOT.**
   - Strengths: instant feedback with explanations + tips; genuine AI use
     confined to where it adds value; runs with or without an API key.
   - Weaknesses: only 36 questions (retakes repeat); single device/browser
     history; AI scores are approximate, not examiner-grade.
   - Opportunities: more roles/topics, campus licences, placement-cell analytics.
   - Threats: Gemini price/model changes; free general chatbots as
     good-enough substitutes; curriculum drift making the bank stale.
6. **Alternatives.** Quizlet/flashcard decks (no grading of open answers),
   Wall Street Oasis / CFI question lists (static, no feedback loop), generic
   ChatGPT practice (no curriculum structure, no score tracking, hallucinates
   answer keys). Ours combines a fixed correct-answer bank with AI only for
   open answers plus progress tracking.
7. **Adoption/monetisation (hypothetical).** Freemium per-student; paid campus
   licence for careers offices with cohort dashboards; question-pack add-ons
   per role (IB, equity research). Not implemented — out of scope for the demo.

## B. AI & Technical Understanding

1. **Model/API.** Google Gemini via REST `generateContent`, default model
   `gemini-2.0-flash` (overridable with `GEMINI_MODEL`).
2. **Why this one.** Accessible free-tier API, fast enough for per-answer
   grading, good instruction-following for strict JSON output; flash-tier
   latency/cost fits a classroom demo. No fine-tuning or RAG needed — the
   "knowledge" is the hand-written ideal answer shipped with each question.
3. **Where AI is used.** Only for scenario/open-ended answers: score 0–100,
   verdict, what was understood, what is missing, explanation, improvement tip.
   MCQ/True-False never touch the model.
4. **Prompt approach.** `server/prompt.js`: system instruction (evaluate only
   the submitted answer against the provided ideal answer + criteria, don't
   invent facts, concise 1–3 sentence fields, JSON object only) plus a user
   message carrying question, ideal answer, evaluation points and candidate
   answer. `temperature 0.2`, `maxOutputTokens 512`.
5. **Guardrails.** Key lives server-side (`server/index.js` reads
   `GEMINI_API_KEY`; the browser only calls same-origin `/api/evaluate`);
   2000-character answer cap; empty answers rejected; response parsed as JSON
   with score clamped 0–100 and defaulted fields; any failure returns
   `ok:false` and the UI shows the fallback sentence with the model answer.
6. **Why deterministic scoring for MCQs.** The correct answer is already known,
   so an LLM adds latency, cost and hallucination risk for zero benefit:
   `userAnswer === correct_answer`. LLM judgement is reserved for responses
   that require interpretation. This is stated in the app's design and demo.
7. **Limitations.** AI grades against a short ideal answer, so terse-but-right
   or unusually-phrased answers can be under-scored; no streaming; English
   only; needs network + key or it degrades to the model answer.

## C. Critical Thinking

1. **How AI could be wrong.** Example: a candidate writes "receivables rose
   because the firm stuffed the channel" — correct intuition, but if the ideal
   answer phrases it as "revenue booked before cash collected", a literal model
   may mark the mechanism missing. Scores also compress toward the middle on
   vague answers. The Review screen keeps the model answer visible so errors
   are checkable.
2. **Don't blindly trust.** The AI score/verdict and its finance phrasing —
   verify against the model answer and evaluation points shown underneath.
3. **API failure.** The quiz never breaks: loading state → fallback message
   ("AI feedback is temporarily unavailable. Please review the model answer."),
   objective scoring unaffected, results still save (scenario recorded without
   AI score and excluded from topic stats).
4. **Accountability.** The student remains responsible for their learning; the
   app is a practice aid, scores are formative, and every AI judgement is
   displayed next to the human-written model answer it was checked against.
5. **Biggest limitation.** The LLM has no real examiner judgement — it matches
   text against 2–3 bullet criteria. Anything subtle (trade-offs, prioritised
   actions) is approximated, which is why AI output never feeds the headline
   quiz percentage.

## D. Execution

1. **Duplicates/repeats.** Within a quiz, questions are shuffled then sliced —
   never repeated. Across quizzes/retakes the 36-question bank reshuffles, so
   repeats are possible and expected; the setup screen always shows how many
   match the filter.
2. **AI failure.** See C3: `ok:false` at any layer (no key, HTTP error,
   timeout, unparseable output, network down) → fallback UI, quiz continues,
   session saves with `ai: null`.
3. **Empty answers.** Submit stays disabled until an option is picked or the
   textarea is non-blank; the API additionally rejects blank/oversize input
   with 400.
4. **Score calculation.** Headline `%` = correct ÷ attempted over objective
   questions only (`scoreQuiz`). Scenarios never move it; each carries its own
   AI score. Dashboard topic stats reuse the same rule, counting a scenario as
   correct only if its AI score ≥ 60 (`AI_PASS_SCORE`); answers without AI are
   excluded. Averages/best are plain means/maxima of saved session percentages.
5. **Session tracking.** Each finished quiz is saved once to `localStorage`
   key `fpa-quiz-history-v1` (id, ISO date, topic, difficulty, totals, pct,
   per-question topic details, AI scores; capped at 50). Dashboard, Results
   history and Home recents all read this store; corrupt data is ignored and
   the quiz keeps working. Single demo user, single device by design.
