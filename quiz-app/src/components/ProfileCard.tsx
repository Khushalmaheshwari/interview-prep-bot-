import type { CandidateProfile } from "../types";

export default function ProfileCard({ profile }: { profile: CandidateProfile }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl shadow-black/30 sm:p-8">
      <p className="text-sm font-semibold uppercase tracking-widest text-indigo-400">
        Candidate Profile
      </p>
      <h2 className="mt-1 text-2xl font-bold text-white">
        {profile.name ? `Hi, ${profile.name} 👋` : "Your profile"}
      </h2>
      <p className="mt-1 text-sm text-slate-400">
        Review this before starting — your interview will be built around it.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <ProfileBlock title="💪 Strengths" tone="green" items={profile.strengths} empty="No clear strengths extracted — the interview will stay general." />
        <div className="rounded-xl border border-amber-800 bg-amber-950 p-4">
          <p className="text-sm font-bold text-amber-200">🎯 Potential areas to improve</p>
          <List items={profile.improvement_areas} empty="Nothing flagged." dim />
          <p className="mt-2 text-xs text-amber-400/80">
            Inferred from your resume — possibilities an interviewer may explore,
            not facts about you.
          </p>
        </div>
        <ProfileBlock title="🛠 Skills" tone="slate" items={profile.skills} empty="No skills listed." />
        <ProfileBlock title="💼 Experience highlights" tone="slate" items={profile.experience_highlights} empty="No experience extracted." />
      </div>

      {profile.education.length > 0 && (
        <p className="mt-4 text-sm text-slate-400">
          <strong className="text-slate-200">🎓 Education:</strong> {profile.education.join(" · ")}
        </p>
      )}
      {profile.likely_angles.length > 0 && (
        <div className="mt-3 rounded-xl border border-indigo-800 bg-indigo-950 p-4 text-sm">
          <p className="font-bold text-indigo-200">🎙 An interviewer may ask about…</p>
          <List items={profile.likely_angles} empty="" dim />
        </div>
      )}
    </div>
  );
}

function ProfileBlock({
  title,
  tone,
  items,
  empty,
}: {
  title: string;
  tone: "green" | "slate";
  items: string[];
  empty: string;
}) {
  const cls =
    tone === "green"
      ? "border-emerald-800 bg-emerald-950 text-emerald-100"
      : "border-slate-800 bg-slate-800/60 text-slate-200";
  return (
    <div className={`rounded-xl border p-4 ${cls}`}>
      <p className="text-sm font-bold">{title}</p>
      <List items={items} empty={empty} dim={tone !== "green"} />
    </div>
  );
}

function List({ items, empty, dim }: { items: string[]; empty: string; dim?: boolean }) {
  if (items.length === 0)
    return <p className="mt-1 text-sm text-slate-500">{empty}</p>;
  return (
    <ul className={`mt-1 list-disc space-y-1 pl-5 text-sm ${dim ? "text-slate-300" : ""}`}>
      {items.map((it, i) => (
        <li key={`${it}-${i}`}>{it}</li>
      ))}
    </ul>
  );
}
