import type { AIEvaluation } from "../types";

export interface EvaluateInput {
  question: string;
  idealAnswer: string;
  evaluationPoints: string[];
  userAnswer: string;
}

export type EvaluateResult =
  | { ok: true; evaluation: AIEvaluation }
  | { ok: false; reason: string };

/**
 * Ask the backend proxy to evaluate one scenario answer.
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
