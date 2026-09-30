/**
 * Groq prompts + strict parsers for the personalized interview platform.
 *
 * Three AI jobs, all grounded in candidate-provided material:
 * 1. Resume analysis -> CandidateProfile (hedged improvement areas, never facts).
 * 2. Interview generation -> Question[] in the app's own shape.
 * 3. Answer evaluation -> score + strengths + gaps + stronger example.
 */

/** Extract the first {...} JSON object from model text (tolerates fences). */
export function extractJson(rawText) {
  if (!rawText || typeof rawText !== "string") return null;
  const stripped = rawText.replace(/```(?:json)?/gi, "").replace(/```/g, "").trim();
  const start = stripped.indexOf("{");
  const end = stripped.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  try {
    return JSON.parse(stripped.slice(start, end + 1));
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------- resume ---
export const RESUME_SYSTEM = `You analyze a candidate's resume for interview preparation.

Rules:
- Use ONLY what is written in the resume. Never invent employers, degrees, skills or numbers.
- Strengths must be backed by something visible in the resume.
- Improvement areas MUST be hedged: phrase every item as potential ("Potential area to improve: ...", "The interviewer may explore ..."). Never present an inferred weakness as a fact.
- Be concise: short strings, at most 6 items per list.
- Return ONLY the JSON object, on a single line with no line breaks or pretty-printing. No markdown, no code fences, no extra keys.`;

export function buildResumeMessage(resumeText) {
  return `Resume text:
${resumeText}

Respond with ONLY this JSON object:
{"name": "<candidate name or ''>", "education": ["<degree/school>"], "skills": ["<skill>"], "strengths": ["<strength with evidence>"], "improvement_areas": ["<hedged potential area>"], "experience_highlights": ["<role/project highlight>"], "likely_angles": ["<angle an interviewer may probe>"], "readiness": {"score": <0-100 interview-readiness>, "fixes": ["<highest-impact fix, max 3>"]}}`;
}

const strList = (v) =>
  Array.isArray(v) ? v.map((x) => String(x)).filter(Boolean).slice(0, 8) : [];

export function parseProfile(rawText) {
  const p = extractJson(rawText);
  if (!p || typeof p !== "object") return null;
  const r = p.readiness && typeof p.readiness === "object" ? p.readiness : null;
  return {
    name: String(p.name || "").slice(0, 120),
    education: strList(p.education),
    skills: strList(p.skills),
    strengths: strList(p.strengths),
    improvement_areas: strList(p.improvement_areas),
    experience_highlights: strList(p.experience_highlights),
    likely_angles: strList(p.likely_angles),
    readiness: r
      ? {
          score: Math.max(0, Math.min(100, Math.round(Number(r.score) || 0))),
          fixes: strList(r.fixes).slice(0, 3),
        }
      : null,
  };
}

// ------------------------------------------------------------- interview ---
export const INTERVIEW_SYSTEM = `You generate personalized interview questions for a job candidate.

Rules:
- When a candidate profile/resume is provided: ground resume-based questions ONLY in it. Never invent facts about the candidate.
- When NO resume is provided: generate role/company/industry-based technical, behavioral, situational and scenario questions. Do NOT invent candidate background and do NOT include resume-based questions.
- Mix the requested question kinds across relevant topics.
- Match the requested difficulty (Easy = fundamentals, Medium = applied, Hard = deep/ambiguous).
- Every MCQ/True-False needs exactly one correct option, a short explanation and an interview tip.
- Every scenario/behavioral question needs an ideal answer, 2-3 evaluation points and an interview tip.
- Keep each field to 1-3 sentences.
- Return ONLY the JSON object described below, on a single line with no line breaks. No markdown, no code fences, no extra keys.`;

export function buildInterviewMessage({ profile, resumeExcerpt, jdExcerpt, role, company, industry, topicFocus, difficulty, count }) {
  const hasResume = profile && typeof profile === "object" && Object.keys(profile).length > 0;
  const lines = [
    `Target role: ${role || "(general)"}`,
    company ? `Company: ${company}` : null,
    industry ? `Industry: ${industry}` : null,
    topicFocus ? `Topic focus: ${topicFocus}` : null,
    `Difficulty: ${difficulty}`,
    `Number of questions: ${count}`,
  ].filter(Boolean);
  const header = lines.join("\n");
  const jdPart = jdExcerpt
    ? `Job description requirements (shape technical/situational questions around these listed requirements and skills; do not invent requirements):\n${jdExcerpt}\n`
    : "";
  const resumePart = hasResume
    ? `Candidate profile:\n${JSON.stringify(profile)}\n\nResume excerpts (do not go beyond these facts):\n${resumeExcerpt || "(none)"}\n\nGenerate a mix of technical, resume-based, behavioral, situational and scenario questions for this candidate and role.`
    : `No resume provided. Generate role-based technical, behavioral, situational and scenario questions (no resume-based questions).`;
  return `${header}\n\n${jdPart}${resumePart}\nRespond with ONLY this JSON object:\n{"questions": [{"topic": "<short topic label>", "difficulty": "<Easy|Medium|Hard>", "type": "<mcq|true_false|scenario|behavioral>", "question": "<text>", "options": ["<A>", "<B>", "<C>", "<D>"], "correct_answer": "<one of options>", "explanation": "<why>", "interview_tip": "<tip>", "ideal_answer": "<for scenario/behavioral>", "evaluation_points": ["<point>"]}]}`;
}

const DIFFS = ["Easy", "Medium", "Hard"];
const TYPES = ["mcq", "true_false", "scenario", "behavioral"];

/** Validate + normalize one AI-generated question. Returns null when unusable. */
export function normalizeQuestion(raw, index, fallbackDifficulty) {
  if (!raw || typeof raw !== "object" || typeof raw.question !== "string" || !raw.question.trim()) {
    return null;
  }
  const type = TYPES.includes(raw.type) ? raw.type : "scenario";
  const difficulty = DIFFS.includes(raw.difficulty) ? raw.difficulty : fallbackDifficulty;
  const topic = typeof raw.topic === "string" && raw.topic.trim() ? raw.topic.trim().slice(0, 60) : "General";
  const base = {
    id: `ai-${index + 1}`,
    topic,
    difficulty,
    type,
    question: raw.question.trim().slice(0, 1000),
    interview_tip: String(raw.interview_tip || "").slice(0, 400),
    source: "ai",
  };
  if (type === "mcq" || type === "true_false") {
    const options = Array.isArray(raw.options)
      ? raw.options.map((o) => String(o)).filter(Boolean).slice(0, 6)
      : [];
    if (options.length < 2 || !options.includes(String(raw.correct_answer))) return null;
    return {
      ...base,
      options,
      correct_answer: String(raw.correct_answer),
      explanation: String(raw.explanation || "").slice(0, 800),
    };
  }
  return {
    ...base,
    ideal_answer: String(raw.ideal_answer || "").slice(0, 1200),
    evaluation_points: strList(raw.evaluation_points).slice(0, 4),
  };
}

export function parseInterviewQuestions(rawText, count, difficulty) {
  const p = extractJson(rawText);
  const list = p && Array.isArray(p.questions) ? p.questions : null;
  if (!list) return null;
  const out = [];
  for (const raw of list.slice(0, Math.max(count, 1))) {
    const q = normalizeQuestion(raw, out.length, difficulty);
    if (q) out.push(q);
  }
  return out.length > 0 ? out : null;
}

// -------------------------------------------------------------- evaluate ---
export const EVAL_SYSTEM = `You evaluate a candidate's interview-practice answer.

Rules:
- Evaluate ONLY the submitted answer against the provided ideal answer and criteria, plus the resume context when given.
- Do NOT invent facts about the candidate beyond the provided material.
- Be concise: each text field is 1-3 sentences, except stronger_answer (3-5 sentences).
- Identify what was done well, what is missing (including technical/content gaps), and give one concrete improvement tip plus a stronger example answer.
- Score holistically 0-100 (80+ broadly correct, 40-79 partially correct, below 40 incorrect).
- Return ONLY the JSON object described below. No markdown, no code fences, no extra keys.`;

export function buildEvalMessage({ question, idealAnswer, evaluationPoints, userAnswer, resumeContext, role }) {
  const points = (evaluationPoints || []).map((pt, i) => `${i + 1}. ${pt}`).join("\n");
  return `Target role: ${role || "unspecified"}
Resume context (do not go beyond these facts):
${resumeContext || "(none provided)"}

Question:
${question}

Model (ideal) answer:
${idealAnswer}

A strong answer covers:
${points}

Candidate answer to evaluate:
${userAnswer}

Respond with ONLY this JSON object:
{"score": <0-100 integer>, "verdict": "<broadly correct | partially correct | incorrect>", "understood": "<what the candidate did well>", "missing": "<gaps, including technical/content gaps>", "explanation": "<short overall assessment>", "tip": "<one concrete improvement tip>", "stronger_answer": "<a stronger example answer>", "interview_tip": "<short interview tip>"}`;
}

/** Parse Groq evaluation output. Strict contract + stronger fields. */
export function parseEvaluation(rawText) {
  const parsed = extractJson(rawText);
  if (!parsed || typeof parsed !== "object") return null;
  const score = Math.max(0, Math.min(100, Math.round(Number(parsed.score) || 0)));
  const verdict =
    parsed.verdict === "broadly correct" ||
    parsed.verdict === "partially correct" ||
    parsed.verdict === "incorrect"
      ? parsed.verdict
      : score >= 80
        ? "broadly correct"
        : score >= 40
          ? "partially correct"
          : "incorrect";
  return {
    score,
    verdict,
    understood: String(parsed.understood || "").slice(0, 600),
    missing: String(parsed.missing || "").slice(0, 600),
    explanation: String(parsed.explanation || "").slice(0, 800),
    tip: String(parsed.tip || parsed.interview_tip || "").slice(0, 400),
    stronger_answer: String(parsed.stronger_answer || "").slice(0, 1200),
    interview_tip: String(parsed.interview_tip || "").slice(0, 400),
  };
}
