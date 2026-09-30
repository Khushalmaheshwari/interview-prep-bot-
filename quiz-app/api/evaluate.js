import { groqChat } from "../../server/groq.js";
import { EVAL_SYSTEM, buildEvalMessage, parseEvaluation } from "../../server/prompt.js";
import { json, readBody } from "../_shared.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return json(res, 405, { ok: false, reason: "bad_request" });
  const { question, idealAnswer, evaluationPoints, userAnswer, resumeContext, role } = readBody(req);

  if (!userAnswer || typeof userAnswer !== "string" || !userAnswer.trim()) {
    return json(res, 400, { ok: false, reason: "empty_answer" });
  }
  if (typeof question !== "string" || typeof idealAnswer !== "string") {
    return json(res, 400, { ok: false, reason: "bad_request" });
  }
  if (userAnswer.length > 2000) {
    return json(res, 400, { ok: false, reason: "answer_too_long" });
  }
  if (!process.env.GROQ_API_KEY) return json(res, 200, { ok: false, reason: "not_configured" });

  const result = await groqChat({
    system: EVAL_SYSTEM,
    user: buildEvalMessage({
      question,
      idealAnswer,
      evaluationPoints,
      userAnswer,
      resumeContext: String(resumeContext || "").slice(0, 2000),
      role: typeof role === "string" ? role.slice(0, 80) : "",
    }),
    maxTokens: 900,
    timeoutMs: 45000,
  });
  if (!result.ok) return json(res, 200, result);
  const evaluation = parseEvaluation(result.text);
  if (!evaluation) {
    console.error("Groq returned unparseable evaluation:", result.text.slice(0, 300));
    return json(res, 200, { ok: false, reason: "bad_output" });
  }
  return json(res, 200, { ok: true, evaluation });
}
