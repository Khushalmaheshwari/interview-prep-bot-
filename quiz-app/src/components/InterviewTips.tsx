import { tipsFor } from "../lib/tips";

/** Role-wise do's and don'ts shown before the interview starts. */
export default function InterviewTips({ role }: { role: string }) {
  const tips = tipsFor(role || "");
  return (
    <div className="mt-6 rounded-xl border border-violet-900 bg-gradient-to-br from-violet-950 to-slate-900 p-4 text-sm">
      <p className="font-bold text-violet-200">
        💡 Interview tips{role ? ` for ${role}` : ""}
      </p>
      <div className="mt-2 grid gap-3 sm:grid-cols-2">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-emerald-300">Do</p>
          <ul className="mt-1 list-disc space-y-1 pl-5 text-slate-300">
            {tips.dos.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-rose-300">Don't</p>
          <ul className="mt-1 list-disc space-y-1 pl-5 text-slate-300">
            {tips.donts.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
