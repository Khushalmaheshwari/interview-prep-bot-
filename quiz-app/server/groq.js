/**
 * Groq API helper. Single place that talks to Groq so the key
 * (GROQ_API_KEY) never leaves the server.
 *
 * Endpoint: POST https://api.groq.com/openai/v1/chat/completions (OpenAI-compatible).
 * Model: GROQ_MODEL env, default "openai/gpt-oss-20b".
 */

/**
 * @param {object} p
 * @param {string} p.system
 * @param {string} p.user
 * @param {number} [p.maxTokens]
 * @param {number} [p.temperature]
 * @param {number} [p.timeoutMs]
 * @returns {Promise<{ok: true, text: string} | {ok: false, reason: string}>}
 */
export async function groqChat({ system, user, maxTokens = 1200, temperature = 0.2, timeoutMs = 60000 }) {
  const key = process.env.GROQ_API_KEY || "";
  if (!key) return { ok: false, reason: "not_configured" };
  const model = process.env.GROQ_MODEL || "openai/gpt-oss-20b";

  const body = JSON.stringify({
    model,
    temperature,
    max_tokens: maxTokens,
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
  });

  // Retries on 503/529 (overloaded): capacity flaps, a later attempt
  // seconds later often succeeds. Never retry 429 (rate limit).
  const waits = [8000, 20000];
  for (let attempt = 1; attempt <= 3; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${key}`,
        },
        body,
      });
      if (response.status === 429) {
        // Rate-limited: retrying only burns more budget. Surface it so the
        // UI can suggest later or the offline bank.
        console.error("Groq rate-limited:", await response.text().catch(() => ""));
        return { ok: false, reason: "quota" };
      }
      if ((response.status === 503 || response.status === 529) && attempt < 3) {
        const wait = waits[attempt - 1];
        console.warn(`Groq ${response.status} — retrying in ${wait / 1000}s…`);
        await new Promise((r) => setTimeout(r, wait));
        continue;
      }
      if (!response.ok) {
        console.error("Groq API error:", response.status, await response.text().catch(() => ""));
        return { ok: false, reason: "api_error" };
      }
      const data = await response.json();
      const text = data?.choices?.[0]?.message?.content || "";
      if (!String(text).trim()) return { ok: false, reason: "bad_output" };
      return { ok: true, text };
    } catch (err) {
      console.error("Groq request failed:", err?.message || err);
      return { ok: false, reason: "api_error" };
    } finally {
      clearTimeout(timeout);
    }
  }
  return { ok: false, reason: "api_error" };
}
