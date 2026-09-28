# AI Interview Prep — FP&A Quiz Bot

Interview-preparation quizzes for **Financial Analyst / FP&A** roles:
topic/difficulty quiz setup, instant deterministic feedback on objective
questions, **Gemini AI evaluation** of scenario answers, local score history
and a simple performance dashboard with weakest-area recommendations.

MBA end-term demonstration project — deliberately simple, no auth, no database.

## Main features

- Quiz setup: topic (6 + All) × difficulty (Easy/Medium/Hard/Mixed) × 5 or 10 questions
- 36-question local bank (`src/data/questions.json`): MCQ, True/False, scenario
- Instant feedback per question: Correct/Incorrect, correct answer, explanation, interview tip
- AI evaluation of scenario answers: score /100, verdict, what you got right,
  what's missing, explanation, improvement tip — with model-answer fallback
- Results screen with score, per-question review and AI scores
- Dashboard: average/best score, quizzes/questions attempted, topic performance,
  weakest area, rule-based practice recommendation, previous-quiz table
- Quiz history persisted in the browser (`localStorage`)

## Tech stack

- React 19 + TypeScript + Tailwind CSS v4 (Vite 8)
- Minimal Express backend (`server/`) — exists only so the Gemini API key
  stays server-side; serves the API plus the production build
- Gemini API (`gemini-2.0-flash` by default) via REST `generateContent`
- No database, no auth, no ML recommender (recommendation is plain arithmetic)

## Install / run

```bash
cd quiz-app
npm install
```

Two processes (dev):

```bash
npm run server   # API on http://localhost:3001 (terminal 1)
npm run dev      # app on http://localhost:5173, /api proxied (terminal 2)
```

Production (single process):

```bash
npm run build
npm run start    # serves dist/ + API on PORT (default 3001)
```

## Gemini API key

1. Copy `.env.example` to `.env` inside `quiz-app/`.
2. Set `GEMINI_API_KEY=your_key_here` (get one from Google AI Studio).
3. Optional: `GEMINI_MODEL=gemini-2.0-flash`, `PORT=3001`.
4. Restart `npm run server`.

The key is read only by `server/index.js` and never reaches the browser.
Without a key the app runs in fallback mode: scenario questions show the
model answer with "AI feedback is temporarily unavailable."

`.env` is git-ignored; only `.env.example` is committed.

## How to use

Home → Quiz Setup (pick topic, difficulty, count) → answer each question with
Submit → read instant feedback → Next → Results → Dashboard.
Try the professor path: **FP&A → Medium → 5 questions** (exactly 5 exist).

## Project structure

```text
quiz-app/
  src/
    data/questions.json      # 36-question bank
    lib/quiz.ts              # filtering, selection, deterministic scoring
    lib/ai.ts                # browser client for /api/evaluate
    lib/history.ts           # localStorage save/load (key fpa-quiz-history-v1)
    lib/dashboard.ts         # averages, topic stats, weakest, recommendation
    components/QuizRunner.tsx
    components/Results.tsx
    components/Dashboard.tsx
    App.tsx                  # Home / Setup / Quiz / Results / Dashboard
  server/
    index.js                 # Express: /api/health, /api/evaluate, serves dist/
    prompt.js                # system prompt + strict-JSON parsing
  .env.example
```

Docs for the evaluation: `../PROJECT_REPORT.md`, `../DEMO_SCRIPT.md`.

## Important limitations

- AI scores are advisory and can be wrong — always compare with the model answer.
- Small bank (36): retakes reshuffle and may repeat questions.
- History lives in one browser's `localStorage` (max 50 sessions, single demo user).
- Scenario answers over 2000 characters are rejected; empty answers can't be submitted.
- Without a network connection or API key there is no AI evaluation (fallback only).
