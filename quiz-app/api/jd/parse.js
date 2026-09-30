import { extractPdfText, json, readBody } from "../_shared.js";

// Pure text extraction for job-description PDFs (no AI call, no quota burn).
export default async function handler(req, res) {
  if (req.method !== "POST") return json(res, 405, { ok: false, reason: "bad_request" });
  const { pdfBase64, fileName } = readBody(req);
  if (typeof pdfBase64 !== "string" || pdfBase64.length === 0) {
    return json(res, 400, { ok: false, reason: "no_file" });
  }
  if (pdfBase64.length > 8_000_000) {
    return json(res, 400, { ok: false, reason: "file_too_large" });
  }
  try {
    const text = await extractPdfText(pdfBase64, 100);
    return json(res, 200, {
      ok: true,
      jdExcerpt: text.slice(0, 3000),
      fileName: typeof fileName === "string" ? fileName.slice(0, 120) : "",
    });
  } catch (err) {
    return json(res, 400, { ok: false, reason: (err && err.reason) || "unreadable" });
  }
}
