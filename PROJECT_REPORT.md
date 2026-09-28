# Project Report — AI Interview Preparation Platform (Resume → Personalized Interview)

Demo project for the MBA end-term: `quiz-app/` (React + TypeScript + Tailwind,
minimal Express proxy, Gemini API, classic Finance bank of 36 questions as fallback).

Core loop: **upload resume → AI candidate profile → pick any target role →
AI-generated personalized interview → Gemini feedback → results + dashboard.**

## A. Business & Strategic Framing

1. **Problem.** Students prepare for interviews with generic question lists that
   ignore their background; mock interviews with humans are scarce and
   expensive, and static material gives no feedback on open-ended answers.
2. **Target user.** MBA / master's students preparing for role interviews
   across functions (Finance, Marketing, Consulting, Product, Engineering…).
   Paying customer (if commercialised) would be the student or a university
   careers office; the end user is the student.
3. **Why useful.** One loop — the resume becomes the curriculum: profile
   strengths and gaps are surfaced, questions probe the candidate's own
   experience and target role, open answers are graded like a mock interviewer,
   and the dashboard points at what to revise next.
4. **Value proposition.** A personal mock interview in 5-minute sessions:
   deterministic correctness where answers are known, Gemini judgement where
   only interpretation works, grounded in the candidate's own resume.
5. **SWOT.**
   - Strengths: resume-grounded personalization for any role; instant feedback
     with explanations + tips; runs with or without an API key (classic bank).
   - Weaknesses: AI question/answer quality varies; single device/browser
     history; only text-based PDFs readable; scores are approximate.
   - Opportunities: more roles, campus licences, placement-cell analytics,
     interviewer-side question review.
   - Threats: Gemini price/model changes; free general chatbots as good-enough
     substitutes; resume-parsing edge cases (scans, graphics-heavy CVs).
6. **Alternatives.** Generic chatbot practice (no structure, no score tracking,
   hallucinates answer keys), static question lists / WSO / CFI (no personal
   feedback), human mock interviews (expensive, unscalable). Ours combines
   resume grounding + structured bank fallback + progress tracking.
7. **Adoption/monetisation (hypothetical).** Freemium per-student; paid campus
   licence for careers offices with cohort dashboards. Not implemented.

## B. AI & Technical Understanding

1. **Model/API.** Google Gemini via REST `generateContent`
   (`https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent`),
   default model `gemini-3.8-flash` (overridable with `GEMINI_MODEL`).
2. **Why this one.** Accessible key with a free tier (AI Studio), fast
   flash-tier latency for per-answer grading, good instruction-following for
   strict JSON output, single text endpoint for all three AI jobs, plain
   `fetch` integration with no SDK. No fine-tuning or RAG needed — the
   "knowledge" is the uploaded resume plus per-question ideal answers.
3. **Where AI is used.** (a) Resume → candidate profile; (b) profile + role →
   personalized questions (technical, resume-based, behavioral, situational,
   scenario); (c) open-answer evaluation (score, verdict, strengths, gaps,
   stronger example, tip). MCQ/True-False never touch the model.
4. **Prompt approach.** `server/prompt.js`: three system prompts sharing one
   doctrine — use only provided material, never invent candidate facts,
   hedge improvement areas ("potential", "may explore"), concise fields,
   JSON-object-only output. Generation/difficulty/count are injected;
   evaluation additionally receives resume excerpts + target role.
5. **Guardrails.** Key server-side only (`GEMINI_API_KEY`; browser calls
   same-origin `/api/*`); PDF magic-byte + 5 MB + 200-char readability checks;
   generated questions re-validated in code (options contain the correct
   answer, else dropped); scores clamped 0–100 with defaulted fields; every
   failure returns `ok:false` → fallback UI, quiz continues.
6. **Why deterministic scoring for MCQs.** The correct answer is already known
   (authored or AI-supplied with the question), so an LLM adds latency, cost
   and hallucination risk for zero benefit: `userAnswer === correct_answer`.
   LLM judgement is reserved for responses that require interpretation.
7. **Limitations.** Generation quality depends on resume richness; terse-but-right
   answers can be under-scored; English only; needs network + key or it
   degrades to the classic bank / model answers.

## C. Critical Thinking

1. **How AI could be wrong.** Example: a candidate's correct-but-unusual
   phrasing may miss the model's 2–3 evaluation bullets and be under-scored;
   a thin resume yields generic questions; a confident wrong ideal answer in a
   generated MCQ would teach the wrong key (mitigated by code validation, not
   eliminated). Every AI judgement is shown next to its model answer/criteria
   so errors are checkable.
2. **Don't blindly trust.** AI scores, generated answer keys and inferred
   "improvement areas" — verify against model answers; improvement areas are
   possibilities, explicitly not facts.
3. **API failure.** The app never breaks: loading states → "AI service is
   temporarily unavailable. Please try again." (or the classic-bank detour);
   objective scoring unaffected; results still save (open answers recorded
   without AI score and excluded from topic stats).
4. **Accountability.** The student remains responsible for their learning; the
   app is a practice aid, scores are formative, and every AI judgement is
   displayed next to the human- or model-written reference it was checked
   against. Resumes are processed in-session only and never stored.
5. **Biggest limitation.** The LLM has no real examiner judgement — it matches
   text against short criteria. Anything subtle (trade-offs, prioritised
   actions) is approximated, which is why AI output never feeds the headline
   quiz percentage and improvement areas stay hedged.

## D. Execution

1. **Duplicates/repeats.** AI interviews are generated fresh per attempt (no
   bank repetition); classic-bank quizzes shuffle then slice (no in-quiz
   repeats; repeats possible across retakes of 36 questions).
2. **AI failure.** See C3: `ok:false` at any layer (no key, HTTP error,
   timeout, unparseable output, unreadable PDF, network down) → precise
   fallback message, quiz continues, session saves with `ai: null`.
3. **Empty answers.** Submit stays disabled until an option is picked or the
   textarea is non-blank ("Please provide an answer before continuing."); the
   API additionally rejects blank/oversize input with 400.
4. **Score calculation.** Headline `%` = correct ÷ attempted over objective
   questions only (`scoreQuiz`). Open answers never move it; each carries its
   own AI score. Dashboard topic stats reuse the rule, counting an open answer
   as correct only if its AI score ≥ 60 (`AI_PASS_SCORE`); answers without AI
   are excluded. Averages/best are means/maxima of saved percentages.
5. **Session tracking.** Each finished quiz is saved once to `localStorage`
   key `fpa-quiz-history-v1` (id, ISO date, role/topic, difficulty, totals,
   pct, per-question topic details, AI scores, role/personalized flags; capped
   at 50). Dashboard, Results history and Home recents all read this store;
   corrupt data is ignored. Single demo user, single device by design.
