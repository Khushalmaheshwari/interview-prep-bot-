import { groqChat } from "../../server/groq.js";
import {
  INTERVIEW_SYSTEM,
  buildInterviewMessage,
  parseInterviewQuestions,
} from "../../server/prompt.js";
import { DIFFS, clean, json, readBody } from "../_shared.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return json(res, 405, { ok: false, reason: "bad_request" });
  const { profile, resumeExcerpt, jdExcerpt, role, company, industry, topicFocus, difficulty, count } =
    readBody(req);
  const r = clean(role);
  const t = clean(topicFocus);
  if (!r && !t) return json(res, 400, { ok: false, reason: "bad_request" });
  const diff = DIFFS.includes(difficulty) ? difficulty : "Medium";
  const n = Math.min(10, Math.max(3, Number(count) || 5));
  if (!process.env.GROQ_API_KEY) return json(res, 200, { ok: false, reason: "not_configured" });

  const result = await groqChat({
    system: INTERVIEW_SYSTEM,
    user: buildInterviewMessage({
      profile: profile && typeof profile === "object" ? profile : null,
      role: r || t,
      company: clean(company),
      industry: clean(industry),
      topicFocus: t,
      jdExcerpt: String(jdExcerpt || "").slice(0, 3000),
      difficulty: diff,
      count: n,
      resumeExcerpt: String(resumeExcerpt || "").slice(0, 4000),
    }),
    maxTokens: 3000,
    timeoutMs: 50000,
  });
  if (!result.ok) return json(res, 200, result);
  const questions = parseInterviewQuestions(result.text, n, diff);
  if (!questions) {
    console.error("Groq returned unparseable questions:", result.text.slice(0, 300));
    return json(res, 200, { ok: false, reason: "bad_output" });
  }
  questions.forEach((q, i) => {
    q.id = `ai-${i + 1}`;
  });
  return json(res, 200, { ok: true, questions });
}
