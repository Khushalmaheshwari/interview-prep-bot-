import { GENERAL_TIPS, ROLE_TIPS } from "../lib/tips";

/** Standalone Interview Tips page: general guidance + per-role do's and don'ts. */
export default function TipsPage() {
  const roles = Object.keys(ROLE_TIPS);
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl shadow-black/30 sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-widest text-indigo-400">
          💡 Interview Tips
        </p>
        <h2 className="mt-1 text-2xl font-bold text-white">General guidance</h2>
        <p className="mt-1 text-sm text-slate-400">
          Works for every role. Scroll down for role-specific advice.
        </p>
        <TipsGrid dos={GENERAL_TIPS.dos} donts={GENERAL_TIPS.donts} />
      </section>

      {roles.map((role) => (
        <section
          key={role}
          className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl shadow-black/30 sm:p-8"
        >
          <h3 className="text-lg font-bold text-white">{role}</h3>
          <TipsGrid dos={ROLE_TIPS[role].dos} donts={ROLE_TIPS[role].donts} />
        </section>
      ))}
    </div>
  );
}

function TipsGrid({ dos, donts }: { dos: string[]; donts: string[] }) {
  return (
    <div className="mt-4 grid gap-4 sm:grid-cols-2">
      <div className="rounded-xl border border-emerald-800 bg-emerald-950 p-4">
        <p className="text-xs font-bold uppercase tracking-wide text-emerald-300">✅ Do</p>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-emerald-100">
          {dos.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      </div>
      <div className="rounded-xl border border-rose-800 bg-rose-950 p-4">
        <p className="text-xs font-bold uppercase tracking-wide text-rose-300">🚫 Don't</p>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-rose-100">
          {donts.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
