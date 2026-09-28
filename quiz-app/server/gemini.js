/**
 * Gemini API helper. Single place that talks to Gemini so the key
 * (GEMINI_API_KEY) never leaves the server.
 *
 * Endpoint: POST https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent
 * Model: GEMINI_MODEL env, default "gemini-3.6-flash".
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
export async function geminiChat({ system, user, maxTokens = 1200, temperature = 0.2, timeoutMs = 60000 }) {
  const key = process.env.GEMINI_API_KEY || "";
  if (!key) return { ok: false, reason: "not_configured" };
  const model = process.env.GEMINI_MODEL || "gemini-3.6-flash";
  const url =
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}` +
    `:generateContent?key=${encodeURIComponent(key)}`;
  const body = JSON.stringify({
    system_instruction: { parts: [{ text: system }] },
    contents: [{ role: "user", parts: [{ text: user }] }],
    generationConfig: { temperature, maxOutputTokens: maxTokens },
  });

  // Retries on 503: free-tier capacity flaps, and a later attempt
  // seconds later often succeeds.
  const waits = [8000, 20000];
  for (let attempt = 1; attempt <= 3; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(url, {
        method: "POST",
        signal: controller.signal,
        headers: { "Content-Type": "application/json" },
        body,
      });
      if (response.status === 503 && attempt < 3) {
        const wait = waits[attempt - 1];
        console.warn(`Gemini 503 — retrying in ${wait / 1000}s…`);
        await new Promise((r) => setTimeout(r, wait));
        continue;
      }
      if (!response.ok) {
        console.error("Gemini API error:", response.status, await response.text().catch(() => ""));
        return { ok: false, reason: "api_error" };
      }
      const data = await response.json();
      const text =
        data?.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("") || "";
      if (!text.trim()) return { ok: false, reason: "bad_output" };
      return { ok: true, text };
    } catch (err) {
      console.error("Gemini request failed:", err?.message || err);
      return { ok: false, reason: "api_error" };
    } finally {
      clearTimeout(timeout);
    }
  }
  return { ok: false, reason: "api_error" };
}
