import type {
  AIEvaluation,
  CandidateProfile,
  Difficulty,
  Question,
} from "../types";

export interface EvaluateInput {
  question: string;
  idealAnswer: string;
  evaluationPoints: string[];
  userAnswer: string;
  resumeContext?: string;
  role?: string;
}

export type EvaluateResult =
  | { ok: true; evaluation: AIEvaluation }
  | { ok: false; reason: string };

/**
 * Ask the backend proxy to evaluate one open-ended answer with Gemini.
 * The Gemini key lives server-side; the browser never sees it.
 * Any failure resolves to ok:false so the quiz keeps working (fallback UI).
 */
export async function evaluateAnswer(input: EvaluateInput): Promise<EvaluateResult> {
  try {
    const res = await fetch("/api/evaluate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const data = await res.json().catch(() => null);
    if (data && data.ok && data.evaluation) {
      return { ok: true, evaluation: data.evaluation as AIEvaluation };
    }
    return { ok: false, reason: (data && data.reason) || `http_${res.status}` };
  } catch {
    return { ok: false, reason: "network" };
  }
}

export type AnalyzeResult =
  | { ok: true; profile: CandidateProfile; resumeExcerpt: string; fileName: string }
  | { ok: false; reason: string };

/** Upload a resume PDF (base64) for Gemini analysis. Session-only, never stored. */
export async function analyzeResume(pdfBase64: string, fileName: string): Promise<AnalyzeResult> {
  try {
    const res = await fetch("/api/resume/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pdfBase64, fileName }),
    });
    const data = await res.json().catch(() => null);
    if (data && data.ok && data.profile) {
      return {
        ok: true,
        profile: data.profile as CandidateProfile,
        resumeExcerpt: String(data.resumeExcerpt || ""),
        fileName: String(data.fileName || fileName),
      };
    }
    return { ok: false, reason: (data && data.reason) || `http_${res.status}` };
  } catch {
    return { ok: false, reason: "network" };
  }
}

export type GenerateResult =
  | { ok: true; questions: Question[] }
  | { ok: false; reason: string };

/** Generate a personalized interview. Resume/profile optional (quick setup). */
export async function generateInterview(input: {
  profile?: CandidateProfile | null;
  resumeExcerpt?: string;
  role?: string;
  company?: string;
  industry?: string;
  topicFocus?: string;
  difficulty: Difficulty;
  count: number;
}): Promise<GenerateResult> {
  try {
    const res = await fetch("/api/interview/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const data = await res.json().catch(() => null);
    if (data && data.ok && Array.isArray(data.questions)) {
      return { ok: true, questions: data.questions as Question[] };
    }
    return { ok: false, reason: (data && data.reason) || `http_${res.status}` };
  } catch {
    return { ok: false, reason: "network" };
  }
}

/** Read a File as base64 (without the data-URL prefix). */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const url = String(reader.result || "");
      const comma = url.indexOf(",");
      resolve(comma === -1 ? url : url.slice(comma + 1));
    };
    reader.onerror = () => reject(reader.error || new Error("read_failed"));
    reader.readAsDataURL(file);
  });
}

/** User-facing message for an API failure reason. */
export function friendlyError(reason: string): string {
  switch (reason) {
    case "not_configured":
      return "AI service is not configured yet. Please try again later or use the classic quiz below.";
    case "api_error":
    case "bad_output":
    case "network":
      return "AI service is temporarily unavailable. Please try again.";
    case "unreadable":
    case "not_a_pdf":
      return "Unable to read this resume. Please upload a text-based PDF.";
    case "file_too_large":
      return "That file is too large. Please upload a resume under 5 MB.";
    case "no_file":
      return "Please choose a PDF resume first.";
    case "empty_answer":
      return "Please provide an answer before continuing.";
    case "answer_too_long":
      return "Please keep your answer shorter and try again.";
    default:
      return "Something went wrong. Please try again.";
  }
}
