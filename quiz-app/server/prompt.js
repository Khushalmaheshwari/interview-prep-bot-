/**
 * System prompt + request builder for the AI answer evaluator (Phase 3).
 *
 * Design (PROJECT_PLAN.md sections 6, 7, 12):
 * - AI is used ONLY for open-ended / scenario answers.
 * - MCQs and True/False are scored deterministically in the frontend.
 * - The model must ground its judgement in the provided ideal answer and
 *   evaluation points, not invent finance facts.
 */

/** Concise system instruction sent with every evaluation request. */
export const SYSTEM_PROMPT = `You evaluate a student's short interview-practice answer for a Financial Analyst / FP&A role.

Rules:
- Evaluate ONLY the submitted candidate answer against the provided ideal answer and evaluation criteria.
- Do NOT invent facts beyond the provided material. If the candidate mentions something not covered, say it is outside the model answer rather than judging it as fact.
- Be concise: each text field is 1-3 sentences.
- Identify what the candidate understood correctly, what is missing, and one concrete improvement tip.
- Score holistically 0-100 (80+ broadly correct, 40-79 partially correct, below 40 incorrect).
- Return ONLY the JSON object described below. No markdown, no code fences, no extra keys.`;

/**
 * @param {object} p
 * @param {string} p.question
 * @param {string} p.idealAnswer
 * @param {string[]} p.evaluationPoints
 * @param {string} p.userAnswer
 */
export function buildUserMessage({ question, idealAnswer, evaluationPoints, userAnswer }) {
  const points = (evaluationPoints || []).map((pt, i) => `${i + 1}. ${pt}`).join("\n");
  return `Question:
${question}

Model (ideal) answer:
${idealAnswer}

A strong answer covers:
${points}

Candidate answer to evaluate:
${userAnswer}

Respond with ONLY this JSON object:
{"score": <0-100 integer>, "verdict": "<broadly correct | partially correct | incorrect>", "understood": "<what the candidate got right>", "missing": "<key concepts missing>", "explanation": "<short explanation of the judgement>", "tip": "<one concrete improvement tip>"}`;
}

/**
 * Extract the evaluation object from raw model text.
 * Tolerates markdown fences; clamps score; defaults missing fields.
 */
export function parseEvaluation(rawText) {
  if (!rawText || typeof rawText !== "string") return null;
  const stripped = rawText.replace(/```(?:json)?/gi, "").replace(/```/g, "").trim();
  const start = stripped.indexOf("{");
  const end = stripped.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  let parsed;
  try {
    parsed = JSON.parse(stripped.slice(start, end + 1));
  } catch {
    return null;
  }
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
    tip: String(parsed.tip || "").slice(0, 400),
  };
}
