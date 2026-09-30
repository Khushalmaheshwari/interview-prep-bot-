# Demo Script — 3–5 Minute Demonstration

Setup before the audience arrives: `npm run server` (terminal 1),
`npm run dev` (terminal 2), browser on the app. Groq key in `quiz-app/.env`
for the live path. Have a 1–2 page text-based PDF resume ready (your own or a
sample). Without a key, show the fallback line at step 4 and continue with the
classic bank.

| # | Do | Say |
|---|----|-----|
| 1 | Open the deployed website (Home: **AI Interview Prep / Prepare smarter. Interview better.**) | "Students revise from generic lists that ignore their background. This builds a mock interview from your own resume, for any role." |
| 2 | Click **Upload Resume**, choose the PDF, click **Analyze Resume**. | "Resume stays in this session only — processed, never stored." |
| 3 | Show the Candidate Profile: strengths and potential improvement areas. | "Note the wording — potential areas, possibilities an interviewer may explore. The AI must not state guesses as facts." |
| 4 | Select a target role (e.g. Financial Analyst), difficulty, 5 questions. | "Any role — the same flow works for Marketing or Engineering. Difficulty and count are yours." |
| 5 | Click **Start Interview**. | "Questions are generated per candidate — resume-based, technical, behavioral, scenario." |
| 6 | Point at a resume-specific question. | "This one exists because of a line on the resume — that is the personalization." |
| 7 | Answer an MCQ → submit → instant Correct/Incorrect + explanation. | "Objective checking is deterministic — no AI wasted where the key is known." |
| 8 | Answer an open question in 2–3 sentences → submit. | "Now Groq judges what only interpretation can grade." |
| 9 | Show Groq evaluation: score, verdict, strengths, gaps, stronger example. | "Score plus a better answer to learn from — grounded in the resume, with the model answer below for checking." |
| 10 | Finish, **See Results** → score + review. | "Headline score stays objective-only; open answers carry their own AI scores." |
| 11 | Open **Performance** → previous result, topic bars, weakest area, recommendation. | "Simple arithmetic, no black box — and one click turns the diagnosis into the next drill." |

Fallback line (no key / API down): "Without AI service you see the designed
fallback — and the classic question bank keeps the whole loop demoable."
