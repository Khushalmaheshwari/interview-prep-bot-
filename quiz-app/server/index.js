/**
 * Minimal backend — Groq AI proxy + resume processing + static hosting.
 *
 * Why a backend exists: the Groq API key (GROQ_API_KEY) must NOT be exposed in
 * frontend code. The server holds it in an environment variable and exposes:
 *   POST /api/resume/analyze      PDF -> candidate profile
 *   POST /api/interview/generate   profile + role -> personalized questions
 *   POST /api/evaluate             open-ended answer -> Groq evaluation
 *   GET  /api/health               { ok, aiConfigured, provider }
 *
 * Resumes are processed in memory for the current session only — never stored.
 *
 * Run:
 *   npm run server        (API on PORT, default 3001; serves dist/ if built)
 * Dev (two terminals):
 *   npm run server        (API)
 *   npm run dev           (Vite proxies /api -> localhost:3001)
 */
import "dotenv/config";
import express from "express";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { extractText } from "unpdf";
import { groqChat } from "./groq.js";
import {
  EVAL_SYSTEM,
  INTERVIEW_SYSTEM,
  RESUME_SYSTEM,
  buildEvalMessage,
  buildInterviewMessage,
  buildResumeMessage,
  parseEvaluation,
  parseInterviewQuestions,
  parseProfile,
} from "./prompt.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = Number(process.env.PORT || 3001);
const aiConfigured = () => Boolean(process.env.GROQ_API_KEY);

// 10mb: resumes arrive as base64 inside JSON (no multipart needed).
app.use(express.json({ limit: "10mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, provider: "groq", aiConfigured: aiConfigured() });
});

// ------------------------------------------------------- resume analyze ---
/** Extract readable text from a base64 PDF. Throws with reason on failure. */
async function extractPdfText(pdfBase64, minChars) {
  const bytes = Buffer.from(pdfBase64, "base64");
  if (bytes.subarray(0, 5).toString() !== "%PDF-") {
    const err = new Error("not_a_pdf");
    err.reason = "not_a_pdf";
    throw err;
  }
  let text = "";
  try {
    const { text: raw } = await extractText(new Uint8Array(bytes));
    text = (Array.isArray(raw) ? raw.join("\n") : String(raw || "")).trim();
  } catch (err) {
    console.error("PDF extraction failed:", err?.message || err);
    const e = new Error("unreadable");
    e.reason = "unreadable";
    throw e;
  }
  if (text.replace(/\s/g, "").length < minChars) {
    // Scanned/image-only PDFs have (almost) no extractable text.
    const err = new Error("unreadable");
    err.reason = "unreadable";
    throw err;
  }
  return text;
}

app.post("/api/resume/analyze", async (req, res) => {
  const { pdfBase64, fileName } = req.body || {};
  if (typeof pdfBase64 !== "string" || pdfBase64.length === 0) {
    return res.status(400).json({ ok: false, reason: "no_file" });
  }
  if (pdfBase64.length > 8_000_000) {
    return res.status(400).json({ ok: false, reason: "file_too_large" });
  }
  if (!aiConfigured()) return res.json({ ok: false, reason: "not_configured" });

  let text = "";
  try {
    text = await extractPdfText(pdfBase64, 200);
  } catch (err) {
    return res.status(400).json({ ok: false, reason: err.reason || "unreadable" });
  }

  const result = await groqChat({
    system: RESUME_SYSTEM,
    user: buildResumeMessage(text.slice(0, 12000)),
    maxTokens: 1400,
    timeoutMs: 90000,
  });
  if (!result.ok) return res.json(result);
  const profile = parseProfile(result.text);
  if (!profile) {
    console.error("Groq returned unparseable profile:", result.text.slice(0, 300));
    return res.json({ ok: false, reason: "bad_output" });
  }
  // Keep a short excerpt so later calls stay grounded without resending all.
  return res.json({
    ok: true,
    profile,
    fileName: typeof fileName === "string" ? fileName.slice(0, 120) : "",
    resumeExcerpt: text.slice(0, 4000),
  });
});

// ------------------------------------------------------------ jd parse ---
// Pure text extraction for job-description PDFs (no AI call, no quota burn).
app.post("/api/jd/parse", async (req, res) => {
  const { pdfBase64, fileName } = req.body || {};
  if (typeof pdfBase64 !== "string" || pdfBase64.length === 0) {
    return res.status(400).json({ ok: false, reason: "no_file" });
  }
  if (pdfBase64.length > 8_000_000) {
    return res.status(400).json({ ok: false, reason: "file_too_large" });
  }
  try {
    const text = await extractPdfText(pdfBase64, 100);
    return res.json({
      ok: true,
      jdExcerpt: text.slice(0, 3000),
      fileName: typeof fileName === "string" ? fileName.slice(0, 120) : "",
    });
  } catch (err) {
    return res.status(400).json({ ok: false, reason: err.reason || "unreadable" });
  }
});

// ---------------------------------------------------- interview generate ---
const DIFFS = ["Easy", "Medium", "Hard"];

app.post("/api/interview/generate", async (req, res) => {
  const { profile, resumeExcerpt, jdExcerpt, role, company, industry, topicFocus, difficulty, count } = req.body || {};
  // Resume is optional (quick setup without resume). Role or topic focus is required.
  const clean = (v) => (typeof v === "string" ? v.trim().slice(0, 80) : "");
  const r = clean(role);
  const t = clean(topicFocus);
  if (!r && !t) {
    return res.status(400).json({ ok: false, reason: "bad_request" });
  }
  const diff = DIFFS.includes(difficulty) ? difficulty : "Medium";
  const n = Math.min(10, Math.max(3, Number(count) || 5));
  if (!aiConfigured()) return res.json({ ok: false, reason: "not_configured" });

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
    timeoutMs: 120000,
  });
  if (!result.ok) return res.json(result);
  const questions = parseInterviewQuestions(result.text, n, diff);
  if (!questions) {
    console.error("Groq returned unparseable questions:", result.text.slice(0, 300));
    return res.json({ ok: false, reason: "bad_output" });
  }
  // Re-id sequentially after validation drops.
  questions.forEach((q, i) => {
    q.id = `ai-${i + 1}`;
  });
  return res.json({ ok: true, questions });
});

// ------------------------------------------------------------ evaluate ---
app.post("/api/evaluate", async (req, res) => {
  const { question, idealAnswer, evaluationPoints, userAnswer, resumeContext, role } = req.body || {};

  if (!userAnswer || typeof userAnswer !== "string" || !userAnswer.trim()) {
    return res.status(400).json({ ok: false, reason: "empty_answer" });
  }
  if (typeof question !== "string" || typeof idealAnswer !== "string") {
    return res.status(400).json({ ok: false, reason: "bad_request" });
  }
  if (userAnswer.length > 2000) {
    return res.status(400).json({ ok: false, reason: "answer_too_long" });
  }
  if (!aiConfigured()) return res.json({ ok: false, reason: "not_configured" });

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
  });
  if (!result.ok) return res.json(result);
  const evaluation = parseEvaluation(result.text);
  if (!evaluation) {
    console.error("Groq returned unparseable evaluation:", result.text.slice(0, 300));
    return res.json({ ok: false, reason: "bad_output" });
  }
  return res.json({ ok: true, evaluation });
});

// Serve the production build (if present) so one process hosts app + API.
const distDir = path.join(__dirname, "..", "dist");
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
  // SPA fallback (Express 5 compatible — no "*" string route).
  app.use((req, res, next) => {
    if (req.method !== "GET" || req.path.startsWith("/api")) return next();
    res.sendFile(path.join(distDir, "index.html"));
  });
}

app.listen(PORT, () => {
  console.log(
    `Interview server on http://localhost:${PORT} (Groq ${aiConfigured() ? "configured" : "NOT configured — fallback mode"})`
  );
});
