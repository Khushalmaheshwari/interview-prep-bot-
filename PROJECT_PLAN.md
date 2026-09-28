# AI INTERVIEW-PREP QUIZ BOT — PROJECT PLAN

## 1. Project Purpose

Build a simple but impressive **AI-powered Interview Preparation Quiz Bot** for an MBA end-term academic project.

This is a **demonstration project, not a production application**.

### Priority

1. Working functionality
2. Good demonstration
3. Meaningful use of AI
4. Clean UI
5. Easy implementation
6. Ability to answer professor evaluation questions

### Critical Development Rule

**Do NOT over-engineer the project.**

Do not add:
- Enterprise architecture
- Complex authentication
- Production infrastructure
- Advanced security
- Advanced machine learning
- Complex recommendation systems
- Unnecessary databases or services

Only implement features that directly improve the required demonstration.

---

# 2. Selected Use Case

## Interview-Prep Quiz Bot for a Specific Role

Target role:

**Financial Analyst / FP&A**

The bot helps students prepare for Finance/FP&A interviews through quizzes.

---

# 3. Core Requirements

## A. Question Bank

Questions must be organized by:

- Topic
- Difficulty
- Question type

### Topics

- Financial Accounting
- Financial Analysis
- Corporate Finance
- FP&A
- Excel / Financial Modeling
- Business Cases

### Difficulty

- Easy
- Medium
- Hard

Create approximately **30–40 good sample questions**.

Do NOT create hundreds of questions.

---

# 4. Quiz Functionality

The user must be able to:

1. Select topic
2. Select difficulty
3. Select number of questions
4. Start quiz
5. Answer questions
6. Submit answer
7. Immediately see feedback
8. Move to next question
9. Finish quiz

Support mainly:

- MCQ
- True/False
- A few scenario-based questions

Do not implement complicated question formats unless they are easy to add.

---

# 5. Instant Feedback

After every objective question show:

- Correct / Incorrect
- Correct answer
- Short explanation
- Interview tip

Example:

**Incorrect**

**Correct Answer:** EBITDA

**Explanation:** EBITDA measures operating performance before interest, taxes, depreciation and amortization.

**Interview Tip:** Be prepared to explain why EBITDA differs from EBIT.

---

# 6. AI Functionality

AI must have a genuine role.

Use an accessible LLM API such as **Gemini**.

## Main AI Feature: AI Answer Evaluation

For selected scenario/open-ended questions:

1. User submits an answer.
2. AI evaluates the answer.
3. AI provides:
   - Score
   - Whether the answer is broadly correct
   - What the user understood correctly
   - What is missing
   - Explanation
   - Improvement tip

Example:

User:
> Revenue increased but EBITDA decreased because costs increased.

AI feedback:

- Score: 80/100
- Feedback should identify what was correct, what was missing, and how to improve the answer.

---

# 7. AI Design Principle

**Do NOT use AI for everything.**

For normal MCQs, use deterministic application logic:

```text
User answer
    ↓
Compare with correct answer
    ↓
Correct / Incorrect
```

For open-ended questions:

```text
User answer
    ↓
AI
    ↓
Evaluation + explanation
```

This design should be explained to the professor as:

> We use deterministic logic for objective questions because the correct answer is already known, while LLM evaluation is used where interpretation of a candidate's response is required.

This makes the application more reliable and demonstrates meaningful AI usage.

---

# 8. Score Tracking

After each quiz show:

- Total questions
- Correct answers
- Incorrect answers
- Score %
- Topic
- Difficulty

Store previous quiz results locally.

Example:

| Quiz | Topic | Difficulty | Score |
|---|---|---|---|
| 1 | FP&A | Easy | 80% |
| 2 | Accounting | Medium | 70% |
| 3 | Corporate Finance | Hard | 60% |

No complicated user-account system is required.

A single demo user is sufficient.

---

# 9. Simple Performance Dashboard

Create one simple dashboard.

## Overall Performance

Show:

- Average score
- Best score
- Quizzes attempted
- Questions attempted

## Topic Performance

Example:

- Accounting — 80%
- FP&A — 72%
- Corporate Finance — 65%
- Excel — 90%

## Weak Area

Automatically identify the lowest-scoring topic.

Example:

> Your weakest area is Corporate Finance.

## Recommendation

Example:

> Recommended: Corporate Finance → Medium → 5 Questions

Use simple application logic.

No machine-learning recommendation system is required.

---

# 10. UI

Create a clean, modern, simple interface.

## Screen 1 — Home

Title:

**AI Interview Prep**

Subtitle:

**Practice. Learn. Improve.**

Button:

**Start Quiz**

## Screen 2 — Quiz Setup

Show:

**Role:** Financial Analyst / FP&A

**Topic:**
- All
- Accounting
- Financial Analysis
- Corporate Finance
- FP&A
- Excel
- Business Cases

**Difficulty:**
- Easy
- Medium
- Hard
- Mixed

**Questions:**
- 5
- 10

Button:

**Start Quiz**

## Screen 3 — Quiz

Display:

- Question number
- Topic
- Difficulty
- Question
- Answer options
- Submit Answer

Example:

```text
Question 3 of 10

Topic: FP&A
Difficulty: Medium

Question:
...

A. ...
B. ...
C. ...
D. ...

[Submit Answer]
```

## Screen 4 — Feedback

Show:

- Correct / Incorrect
- Correct Answer
- Explanation
- Interview Tip
- Next Question

## Screen 5 — Results

Show:

- Score
- Correct answers
- Incorrect answers
- Performance message

Button:

**View Performance**

## Screen 6 — Dashboard

Show:

- Average score
- Best score
- Previous quizzes
- Topic performance
- Weakest topic
- Recommended practice

---

# 11. Question Data

Use a simple local question dataset.

**JSON is acceptable.**

Each objective question should contain:

```text
id
topic
difficulty
type
question
options
correct_answer
explanation
interview_tip
```

Open-ended questions should contain:

```text
id
topic
difficulty
type
question
ideal_answer
evaluation_points
interview_tip
```

Create realistic Finance/FP&A questions.

## Accounting

- Three financial statements
- Working capital
- Depreciation
- Revenue
- Cash flow

## Financial Analysis

- EBITDA
- Margins
- ROE
- ROCE
- Ratios

## Corporate Finance

- NPV
- IRR
- WACC
- Cost of capital

## FP&A

- Budget vs actual
- Variance analysis
- Forecasting
- Scenario analysis
- KPI analysis

## Excel

- XLOOKUP
- SUMIFS
- Pivot tables
- Financial modeling

## Business Cases

- Revenue decline
- Margin decline
- Cost increase
- Working capital problem

---

# 12. AI Prompt and Guardrails

Create a clear system prompt for the AI evaluator.

The AI should:

- Evaluate only the submitted interview answer
- Use the provided ideal answer/evaluation criteria
- Not invent facts
- Give concise feedback
- Identify missing concepts
- Provide an improvement suggestion
- Return predictable structured output

If the AI API fails, show:

> AI feedback is temporarily unavailable. Please review the model answer.

The quiz itself must continue working if the AI API fails.

---

# 13. Tech Stack

Use the simplest appropriate stack.

Preferred:

- React
- TypeScript
- Tailwind CSS
- Local JSON or SQLite for question/score storage
- Simple backend only if required for the AI API

## VERY IMPORTANT

**If the existing OpenCode project already has a stack, use the existing stack.**

Do NOT rebuild the project using a different technology unless absolutely necessary.

Do NOT introduce unnecessary technologies.

---

# 14. API Key

Keep the Gemini/API key in an environment variable.

Never hard-code the API key into source code.

Create:

```text
.env.example
```

Do not build authentication.

---

# 15. Project Documentation

Create:

```text
PROJECT_REPORT.md
```

The report must directly address the professor's evaluation areas.

## A. Business & Strategic Framing

Explain:

1. What problem does the chatbot solve?
2. Who is the target user?
3. Why is this useful?
4. What is the value proposition?
5. SWOT analysis
6. Existing alternatives/competitors
7. Possible adoption/monetization

## B. AI & Technical Understanding

Explain:

1. Which AI model/API was used?
2. Why was it selected?
3. Where is AI used?
4. What prompt is used?
5. What guardrails are implemented?
6. Why is deterministic scoring used for MCQs?
7. What are the limitations?

## C. Critical Thinking

Explain:

1. How could AI give wrong feedback?
2. What should users not blindly trust?
3. What happens if the API fails?
4. How is AI accountability handled?
5. What is the biggest limitation?

## D. Execution

Explain:

1. How duplicate/repeated questions are handled
2. What happens if AI fails
3. What happens with an empty answer
4. How scores are calculated
5. How previous sessions are tracked

Keep the report concise and directly related to the actual application.

Do not write generic AI theory unrelated to this project.

---

# 16. Demonstration Flow

The final application should support this 3–5 minute demonstration:

1. Open application
2. Explain the problem
3. Select Financial Analyst / FP&A
4. Select FP&A
5. Select Medium
6. Start 5-question quiz
7. Answer one question correctly
8. Show instant feedback
9. Answer one scenario question
10. Show AI evaluation
11. Complete quiz
12. Show score
13. Open dashboard
14. Show previous score
15. Show weakest topic
16. Show recommended practice

The demonstration should be smooth and visually clear.

---

# 17. DEVELOPMENT PHASES

Use only these 5 phases.

**DO NOT IMPLEMENT ALL PHASES AT ONCE.**

---

## PHASE 1 — Foundation + Question Bank

Build:

- Basic UI
- Navigation
- Quiz setup screen
- Question dataset
- Topic filtering
- Difficulty filtering

### Goal

The user can select a quiz and retrieve appropriate questions.

### STOP HERE

Test Phase 1 before moving to Phase 2.

---

## PHASE 2 — Complete Quiz + Scoring

Build:

- Question display
- Answer selection
- Submit
- Correct/incorrect logic
- Explanation
- Next question
- Quiz completion
- Score calculation

### Goal

A complete quiz works from start to finish WITHOUT AI.

### STOP HERE

Test before moving forward.

---

## PHASE 3 — AI Feedback + Session Tracking

Add:

- AI evaluation for open-ended/scenario questions
- AI explanation
- Interview tips
- API failure fallback
- Save quiz results
- Previous sessions

### Goal

Demonstrate genuine AI functionality and score tracking.

### STOP HERE

Test before moving forward.

---

## PHASE 4 — Dashboard + Recommendation

Build:

- Average score
- Best score
- Topic performance
- Previous quizzes
- Weakest topic
- Simple recommendation

### Goal

Show that the system uses previous quiz performance to provide practice recommendations.

### STOP HERE

Test before moving forward.

---

## PHASE 5 — Polish + Submission

Final work:

- Improve UI
- Fix bugs
- Test complete demo
- Add loading/error states
- Verify API key handling
- Prepare README
- Prepare PROJECT_REPORT.md
- Prepare demo script

Do NOT add unnecessary features.

---

# 18. CRITICAL OPENCODE DEVELOPMENT INSTRUCTIONS

These instructions have priority during development.

## FIRST ACTION

Before changing any code:

1. Inspect the existing project.
2. Identify the existing files.
3. Identify the current technology stack.
4. Identify how the project currently runs.
5. Identify any existing UI/components that can be reused.

Do not delete or rebuild existing work unnecessarily.

## THEN

Explain:

1. What files already exist
2. What technology is being used
3. What will be built in the current phase
4. Which files you intend to modify/create

Then implement **only the current phase**.

After implementation:

1. Run/test the application.
2. Check that the implemented functionality works.
3. Report what was completed.
4. Report any issues.
5. STOP.

**Wait for the user to explicitly confirm before starting the next phase.**

---

# 19. OPEN CODE RULES — AVOID UNNECESSARY WORK

Do NOT:

- Build all phases at once
- Add authentication
- Add multiple users
- Add enterprise database architecture
- Add unnecessary backend services
- Add Docker unless required
- Add deployment infrastructure
- Add advanced analytics
- Add machine learning recommendations
- Create hundreds of questions
- Install unnecessary packages
- Replace the existing framework without a reason
- Refactor unrelated code
- Change working code without need
- Add features not listed in this plan

Prefer the **simplest working implementation**.

If two technical approaches can satisfy the requirement, choose the simpler one.

---

# 20. Current Task

## START WITH PHASE 1 ONLY

Your immediate task is:

1. Inspect the existing project.
2. Report the existing files and stack.
3. Explain the Phase 1 implementation.
4. Implement Phase 1.
5. Run/test Phase 1.
6. Report completed work and issues.
7. STOP and wait for confirmation.

**Do not implement Phase 2.**

---

# 21. Success Criteria

The completed project should allow a professor to:

- Open the application
- Select Financial Analyst / FP&A
- Select topic
- Select difficulty
- Take a quiz
- Receive instant feedback
- See explanations
- Get AI evaluation for an open-ended answer
- See final score
- See previous quiz performance
- See weak areas
- Receive a recommendation

The application does NOT need:

- Multiple users
- Complex authentication
- Enterprise database
- Production-scale architecture
- Advanced machine learning
- Complex recommendation algorithms
- Hundreds of questions
- Complicated deployment infrastructure

## Final Principle

**Focus on making the core experience work extremely well rather than making the project unnecessarily large.**
