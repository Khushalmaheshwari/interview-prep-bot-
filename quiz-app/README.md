# AI Interview Prep — Personalized Interview Practice

Upload your resume, pick any target role, and get an AI-generated mock
interview built around your background — with Groq feedback on every open
answer. A classic Finance question bank is included as an offline fallback.

MBA end-term demonstration project — deliberately simple: no auth, no database,
single demo user, resume processed in-session only.

## Main features

- Resume upload (text-based PDF, ≤ 5 MB) → Groq candidate profile: strengths,
  (hedged) potential improvement areas, skills, experience, likely interview angles
- Any target role: preset list (Analyst, Marketing, Product, Consulting,
  Engineering, HR, Sales, Operations…) + free-text "Other"
- Personalized AI interviews: technical, resume-based, behavioral, situational
  and scenario questions generated per candidate, role and difficulty
- Optional job-description PDF: questions shaped around the JD's requirements
- Instant deterministic feedback on MCQ/True-False; Groq evaluation of
  open answers (score, verdict, strengths, gaps, stronger example, tip)
- Results with per-question review + performance dashboard (averages, topic
  stats, weakest area, rule-based practice recommendation, history)
- Works without an API key in fallback mode (profile/generation unavailable;
  classic bank fully usable)

## Tech stack

- React 19 + TypeScript + Tailwind CSS v4 (Vite 8)
- Minimal Express backend (`server/`) — holds the Groq key server-side and
  exposes `/api/resume/analyze`, `/api/interview/generate`, `/api/evaluate`
- Groq API (OpenAI-compatible `chat/completions`, default `openai/gpt-oss-20b`)
- PDF text extraction with `unpdf`; history in `localStorage`

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

## Groq API key

1. Create a key at https://console.groq.com (free tier available).
2. Copy `.env.example` to `.env` inside `quiz-app/`.
3. Set `GROQ_API_KEY=...` (optional: `GROQ_MODEL=openai/gpt-oss-20b`, `PORT=3001`).
4. Restart `npm run server`.

The key is read only by `server/*.js` and never reaches the browser.
`.env` is git-ignored; only `.env.example` is committed.

## How to use

Home → **Upload Resume** → review your Candidate Profile → pick target role,
difficulty, question count → **Start Interview** → answer each question →
read feedback → Results → Performance dashboard.
Without a resume: **classic question bank** from Home.

## Project structure

```text
quiz-app/
  src/
    components/ResumeUpload.tsx    # PDF picker + analyzing states
    components/ProfileCard.tsx     # strengths / hedged improvement areas
    components/InterviewSetup.tsx  # role + difficulty + count
    components/QuizRunner.tsx      # answer → submit → feedback → next
    components/Results.tsx
    components/Dashboard.tsx
    data/questions.json            # classic Finance fallback bank (36)
    lib/ai.ts                      # browser API client + friendly errors
    lib/quiz.ts                    # filtering, deterministic scoring, type labels
    lib/history.ts                 # localStorage sessions (fpa-quiz-history-v1)
    lib/dashboard.ts               # averages, topic stats, weakest, recommendation
    App.tsx                        # Home / Upload / Profile / Bank / Quiz / Results / Performance
  server/
    index.js                       # Express API + static hosting
    groq.js                        # Groq chat-completions helper
    prompt.js                      # Groq prompts + strict JSON parsers
  .env.example
```

Docs for the evaluation: `../PROJECT_REPORT.md`, `../DEMO_SCRIPT.md`.

## Important limitations

- Groq API needs a key (free tier at console.groq.com); without one AI features fall back.
- AI scores and generated questions are advisory — verify against model answers.
- Only text-based PDFs can be read (scanned/image PDFs are rejected).
- History lives in one browser's `localStorage` (max 50 sessions).
- Resumes are processed in memory for the session and never stored server-side.
