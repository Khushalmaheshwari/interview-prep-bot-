/**
 * Gemini API helper. Single place that talks to Gemini so the key
 * (GEMINI_API_KEY) never leaves the server.
 *
 * Endpoint: POST https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent
 * Model: GEMINI_MODEL env, default "gemini-3.8-flash".
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
  const model = process.env.GEMINI_MODEL || "gemini-3.8-flash";

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const url =
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}` +
      `:generateContent?key=${encodeURIComponent(key)}`;
    const response = await fetch(url, {
      method: "POST",
      signal: controller.signal,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: system }] },
        contents: [{ role: "user", parts: [{ text: user }] }],
        generationConfig: { temperature, maxOutputTokens: maxTokens },
      }),
    });
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
