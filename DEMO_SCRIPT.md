# Demo Script — 3–5 Minute Demonstration

Setup before the audience arrives: `npm run server` (terminal 1),
`npm run dev` (terminal 2), browser on the app. If a Gemini key is in
`quiz-app/.env`, scenario answers grade live; otherwise the fallback shows —
both paths are demoable.

| # | Do | Say |
|---|----|-----|
| 1 | Open the app (Home: **AI Interview Prep / Practice. Learn. Improve.**) | "Finance students revise from scattered PDFs with no feedback. This bot quizzes you for FP&A interviews, corrects you instantly, grades open answers with AI, and tells you what to revise next." |
| 2 | Click **Start Quiz** → Setup. Point at **Role: Financial Analyst / FP&A**. | "One target role, so the bank stays realistic — accounting, analysis, corporate finance, FP&A, Excel, business cases." |
| 3 | Select topic **FP&A**. | "Topic-wise practice, exactly what a syllabus needs." |
| 4 | Select difficulty **Medium**. | "Easy, Medium, Hard, or Mixed — the counter shows matching questions live." |
| 5 | Select **5 questions**. | "Five questions, five minutes — a realistic daily drill." |
| 6 | Click **Start Quiz** (5 FP&A/Medium questions). | "The mix is shuffled every attempt." |
| 7 | Answer one MCQ, click **Submit Answer**. | "Pick and submit — note you can't proceed without answering." |
| 8 | Show **Correct/Incorrect + Correct Answer + Explanation + Interview Tip**. | "Deterministic checking — the answer key is known, so no AI is wasted here. Every miss teaches the interview line." |
| 9 | On a scenario question, type 2–3 sentences, submit. | "Open-ended: explain a variance like you would to a hiring manager." |
| 10 | Show **AI Evaluation**: score, verdict, got-right, missing, tip — then the model answer. | "Only here is the LLM used — where interpretation is required. Grounded in our model answer, and if the API is down you still get this fallback plus the model answer." |
| 11 | Finish remaining questions, click **See Results**. | |
| 12 | Show score %, Correct/Incorrect, Review list with AI scores. | "Headline score is objective questions only; scenarios carry their own AI score." |
| 13 | Click **View Dashboard**. | "Everything is saved on-device — no login." |
| 14 | Show previous-quiz row (topic, difficulty, questions, score). | "Your history, newest first." |
| 15 | Show weakest topic bar. | "Simple arithmetic picks the lowest-scoring attempted topic — no black box." |
| 16 | Show **Recommended Practice: Topic → Difficulty → 5 Questions**, click **Start Recommended Practice**. | "And one click turns the diagnosis into the next drill. That closes the loop: practice, learn, improve." |

Fallback line (if AI key missing): "Without a key you see the designed
fallback — model answer plus evaluation points — and the quiz, scoring and
dashboard all keep working."
