import { json } from "../_shared.js";

export default function handler(_req, res) {
  json(res, 200, {
    ok: true,
    provider: "groq",
    aiConfigured: Boolean(process.env.GROQ_API_KEY),
  });
}
