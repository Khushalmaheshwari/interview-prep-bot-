/**
 * Minimal backend for Phase 3 — Gemini evaluation proxy + static hosting.
 *
 * Why a backend exists at all: the Gemini API key must NOT be exposed in
 * frontend code (PROJECT_PLAN.md section 14). This server holds the key in
 * an environment variable and exposes a single POST /api/evaluate endpoint.
 * MCQ / True-False scoring stays deterministic in the frontend; AI is used
 * only for scenario / open-ended answers.
 *
 * Run:
 *   npm run server        (serves API on PORT, default 3001; serves dist/ if built)
 * Dev (two terminals):
 *   npm run server        (API)
 *   npm run dev           (Vite proxies /api -> localhost:3001)
 */
import "dotenv/config";
import express from "express";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { SYSTEM_PROMPT, buildUserMessage, parseEvaluation } from "./prompt.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = Number(process.env.PORT || 3001);
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash";

app.use(express.json({ limit: "64kb" }));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, aiConfigured: Boolean(GEMINI_API_KEY) });
});

app.post("/api/evaluate", async (req, res) => {
  const { question, idealAnswer, evaluationPoints, userAnswer } = req.body || {};

  if (!userAnswer || typeof userAnswer !== "string" || !userAnswer.trim()) {
    return res.status(400).json({ ok: false, reason: "empty_answer" });
  }
  if (typeof question !== "string" || typeof idealAnswer !== "string") {
    return res.status(400).json({ ok: false, reason: "bad_request" });
  }
  if (userAnswer.length > 2000) {
    return res.status(400).json({ ok: false, reason: "answer_too_long" });
  }

  // No key configured (e.g. professor demo without a key): tell the
  // frontend to show the fallback. The quiz itself keeps working.
  if (!GEMINI_API_KEY) {
    return res.json({ ok: false, reason: "not_configured" });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);

  try {
    const url =
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(GEMINI_MODEL)}` +
      `:generateContent?key=${encodeURIComponent(GEMINI_API_KEY)}`;
    const response = await fetch(url, {
      method: "POST",
      signal: controller.signal,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [
          {
            role: "user",
            parts: [{ text: buildUserMessage({ question, idealAnswer, evaluationPoints, userAnswer }) }],
          },
        ],
        generationConfig: { temperature: 0.2, maxOutputTokens: 512 },
      }),
    });

    if (!response.ok) {
      console.error("Gemini API error:", response.status, await response.text().catch(() => ""));
      return res.json({ ok: false, reason: "api_error" });
    }

    const data = await response.json();
    const rawText =
      data?.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("") || "";
    const evaluation = parseEvaluation(rawText);
    if (!evaluation) {
      console.error("Gemini returned unparseable output:", rawText.slice(0, 300));
      return res.json({ ok: false, reason: "bad_output" });
    }
    return res.json({ ok: true, evaluation });
  } catch (err) {
    console.error("Evaluation failed:", err?.message || err);
    return res.json({ ok: false, reason: "api_error" });
  } finally {
    clearTimeout(timeout);
  }
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
  console.log(`Quiz server on http://localhost:${PORT} (AI ${GEMINI_API_KEY ? "configured" : "NOT configured — fallback mode"})`);
});
