import type { QuizSession } from "../types";

const KEY = "fpa-quiz-history-v1";
const MAX = 50;

/** Load all saved sessions (newest first). Never throws — returns [] on bad data. */
export function loadSessions(): QuizSession[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((s) => s && typeof s.id === "string");
  } catch {
    return [];
  }
}

/** Append one session (dedupes by id), newest first, capped at MAX. */
export function saveSession(session: QuizSession): QuizSession[] {
  const existing = loadSessions().filter((s) => s.id !== session.id);
  const next = [session, ...existing].slice(0, MAX);
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Storage full/blocked: history is best-effort; quiz still works.
  }
  return next;
}
