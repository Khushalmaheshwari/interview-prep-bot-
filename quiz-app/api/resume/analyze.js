import { groqChat } from "../../server/groq.js";
import {
  RESUME_SYSTEM,
  buildResumeMessage,
  parseProfile,
} from "../../server/prompt.js";
import { extractPdfText, json, readBody } from "../_shared.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return json(res, 405, { ok: false, reason: "bad_request" });
  const { pdfBase64, fileName } = readBody(req);
  if (typeof pdfBase64 !== "string" || pdfBase64.length === 0) {
    return json(res, 400, { ok: false, reason: "no_file" });
  }
  if (pdfBase64.length > 8_000_000) {
    return json(res, 400, { ok: false, reason: "file_too_large" });
  }
  if (!process.env.GROQ_API_KEY) return json(res, 200, { ok: false, reason: "not_configured" });

  let text = "";
  try {
    text = await extractPdfText(pdfBase64, 200);
  } catch (err) {
    return json(res, 400, { ok: false, reason: (err && err.reason) || "unreadable" });
  }

  const result = await groqChat({
    system: RESUME_SYSTEM,
    user: buildResumeMessage(text.slice(0, 12000)),
    maxTokens: 1400,
    timeoutMs: 45000,
  });
  if (!result.ok) return json(res, 200, result);
  const profile = parseProfile(result.text);
  if (!profile) {
    console.error("Groq returned unparseable profile:", result.text.slice(0, 300));
    return json(res, 200, { ok: false, reason: "bad_output" });
  }
  return json(res, 200, {
    ok: true,
    profile,
    fileName: typeof fileName === "string" ? fileName.slice(0, 120) : "",
    resumeExcerpt: text.slice(0, 4000),
  });
}
