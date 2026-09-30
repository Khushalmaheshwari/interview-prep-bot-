import { useState } from "react";
import { fileToBase64, parseJD } from "../lib/ai";

export interface JDValue {
  excerpt: string;
  fileName: string;
}

interface Props {
  value: JDValue | null;
  onChange: (jd: JDValue | null) => void;
}

/** Optional job-description PDF: parsed to text so questions target the JD. */
export default function JDUpload({ value, onChange }: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pick = async (f: File | null) => {
    setError(null);
    if (!f) return;
    const isPdf = f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      setError("Please upload a PDF file.");
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      setError("That file is too large. Please upload one under 5 MB.");
      return;
    }
    setBusy(true);
    try {
      const base64 = await fileToBase64(f);
      const result = await parseJD(base64, f.name);
      if (result.ok) {
        onChange({ excerpt: result.jdExcerpt, fileName: result.fileName });
      } else if (result.reason === "unreadable" || result.reason === "not_a_pdf") {
        setError("Unable to read this JD. Please upload a text-based PDF.");
      } else {
        setError("Could not read that file. You can continue without it.");
      }
    } catch {
      setError("Could not read that file. You can continue without it.");
    } finally {
      setBusy(false);
    }
  };

  if (value) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-xl border border-emerald-800 bg-emerald-950 px-4 py-2.5 text-sm">
        <span className="truncate text-emerald-100">📋 {value.fileName} — questions will target this JD</span>
        <button
          onClick={() => onChange(null)}
          className="shrink-0 text-xs font-semibold text-emerald-300 hover:text-white"
        >
          Remove
        </button>
      </div>
    );
  }

  return (
    <div>
      <label
        className={`flex cursor-pointer items-center gap-3 rounded-xl border border-dashed px-4 py-3 text-sm transition ${
          busy ? "cursor-wait opacity-60" : "border-slate-700 hover:border-indigo-500 hover:bg-indigo-950/30"
        }`}
      >
        <span className="text-xl">📋</span>
        <span>
          <span className="block font-semibold text-slate-200">
            {busy ? "Reading JD…" : "Add job description (PDF, optional)"}
          </span>
          <span className="block text-xs text-slate-500">
            Questions will be shaped around its requirements
          </span>
        </span>
        <input
          type="file"
          accept="application/pdf,.pdf"
          disabled={busy}
          className="hidden"
          onChange={(e) => void pick(e.target.files ? e.target.files[0] : null)}
        />
      </label>
      {error && <p className="mt-1 text-xs font-medium text-rose-300">{error}</p>}
    </div>
  );
}
