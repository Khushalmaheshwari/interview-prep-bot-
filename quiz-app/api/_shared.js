/** Shared bits for Vercel serverless API routes (no Express). */
import { extractText } from "unpdf";

export function json(res, status, body) {
  res.status(status).setHeader("Content-Type", "application/json");
  res.send(JSON.stringify(body));
}

export function readBody(req) {
  return req.body && typeof req.body === "object" ? req.body : {};
}

/** Extract readable text from a base64 PDF. Throws { reason } on failure. */
export async function extractPdfText(pdfBase64, minChars) {
  const bytes = Buffer.from(pdfBase64, "base64");
  if (bytes.subarray(0, 5).toString() !== "%PDF-") {
    throw { reason: "not_a_pdf" };
  }
  let text = "";
  try {
    const { text: raw } = await extractText(new Uint8Array(bytes));
    text = (Array.isArray(raw) ? raw.join("\n") : String(raw || "")).trim();
  } catch (err) {
    console.error("PDF extraction failed:", err?.message || err);
    throw { reason: "unreadable" };
  }
  if (text.replace(/\s/g, "").length < minChars) {
    throw { reason: "unreadable" };
  }
  return text;
}

export const DIFFS = ["Easy", "Medium", "Hard"];

export const clean = (v) => (typeof v === "string" ? v.trim().slice(0, 80) : "");
