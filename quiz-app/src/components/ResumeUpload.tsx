import { useState } from "react";
import { analyzeResume, fileToBase64, friendlyError } from "../lib/ai";
import type { CandidateProfile } from "../types";

interface Props {
  onAnalyzed: (profile: CandidateProfile, resumeExcerpt: string, fileName: string) => void;
  onClassic: () => void;
}

type Status = "idle" | "reading" | "analyzing";

export default function ResumeUpload({ onAnalyzed, onClassic }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const busy = status !== "idle";

  const pick = (f: File | null) => {
    setError(null);
    if (!f) {
      setFile(null);
      return;
    }
    const isPdf =
      f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      setFile(null);
      setError("Please upload a PDF file.");
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      setFile(null);
      setError("That file is too large. Please upload a resume under 5 MB.");
      return;
    }
    setFile(f);
  };

  const analyze = async () => {
    if (!file || busy) return;
    setError(null);
    try {
      setStatus("reading");
      const base64 = await fileToBase64(file);
      setStatus("analyzing");
      const result = await analyzeResume(base64, file.name);
      if (result.ok) {
        onAnalyzed(result.profile, result.resumeExcerpt, result.fileName);
      } else {
        setError(friendlyError(result.reason));
      }
    } catch {
      setError("Unable to read this file. Please try another PDF.");
    } finally {
      setStatus("idle");
    }
  };

  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
      <p className="text-sm font-semibold uppercase tracking-widest text-indigo-600">
        Resume Analysis
      </p>
      <h2 className="mt-1 text-2xl font-bold">Upload your resume</h2>
      <p className="mt-1 text-sm text-slate-600">
        A text-based PDF works best. Your resume is processed for this session
        only — it is never stored or shared.
      </p>

      <label
        className={`mt-6 flex cursor-pointer flex-col items-center rounded-2xl border-2 border-dashed px-6 py-10 text-center transition ${
          busy ? "cursor-wait opacity-60" : "border-slate-300 hover:border-indigo-400 hover:bg-indigo-50/40"
        }`}
      >
        <span className="text-3xl">📄</span>
        <span className="mt-2 text-sm font-semibold">
          {file ? file.name : "Choose a PDF resume"}
        </span>
        <span className="mt-1 text-xs text-slate-500">
          {file
            ? `${(file.size / 1024).toFixed(0)} KB — click to replace`
            : "PDF up to 5 MB"}
        </span>
        <input
          type="file"
          accept="application/pdf,.pdf"
          disabled={busy}
          className="hidden"
          onChange={(e) => pick(e.target.files ? e.target.files[0] : null)}
        />
      </label>

      {status === "analyzing" || status === "reading" ? (
        <div className="mt-5 rounded-xl bg-indigo-50 p-4 text-sm text-indigo-800">
          <p className="animate-pulse font-semibold">
            {status === "reading" ? "Reading your resume…" : "Analyzing your resume…"}
          </p>
          <p className="mt-1 text-indigo-600">Building your candidate profile…</p>
        </div>
      ) : (
        <button
          onClick={analyze}
          disabled={!file}
          className="mt-5 w-full rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-40 sm:w-auto"
        >
          Analyze Resume
        </button>
      )}

      {error && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm">
          <p className="font-semibold text-red-700">{error}</p>
          <button
            onClick={onClassic}
            className="mt-2 rounded-lg border px-4 py-2 text-xs font-semibold hover:bg-white"
          >
            Try the classic Finance quiz instead
          </button>
        </div>
      )}

      <div className="mt-6 border-t pt-4 text-center">
        <button onClick={onClassic} className="text-xs font-semibold text-slate-500 hover:text-slate-700">
          Skip — practice with the classic question bank instead
        </button>
      </div>
    </section>
  );
}
