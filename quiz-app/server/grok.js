/**
 * Grok API helper (xAI). Single place that talks to Grok so the key
 * (XAI_API_KEY) never leaves the server.
 *
 * Endpoint: POST https://api.x.ai/v1/chat/completions (OpenAI-compatible).
 * Model: GROK_MODEL env, default "grok-4.6".
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
export async function grokChat({ system, user, maxTokens = 1200, temperature = 0.2, timeoutMs = 60000 }) {
  const key = process.env.XAI_API_KEY || "";
  if (!key) return { ok: false, reason: "not_configured" };
  const model = process.env.GROK_MODEL || "grok-4.6";

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model,
        temperature,
        max_tokens: maxTokens,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
    });
    if (!response.ok) {
      console.error("Grok API error:", response.status, await response.text().catch(() => ""));
      return { ok: false, reason: "api_error" };
    }
    const data = await response.json();
    const text = data?.choices?.[0]?.message?.content || "";
    if (!text.trim()) return { ok: false, reason: "bad_output" };
    return { ok: true, text };
  } catch (err) {
    console.error("Grok request failed:", err?.message || err);
    return { ok: false, reason: "api_error" };
  } finally {
    clearTimeout(timeout);
  }
}

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
