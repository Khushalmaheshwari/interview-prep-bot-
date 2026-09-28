import type { CandidateProfile } from "../types";

export default function ProfileCard({ profile }: { profile: CandidateProfile }) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
      <p className="text-sm font-semibold uppercase tracking-widest text-indigo-600">
        Candidate Profile
      </p>
      <h2 className="mt-1 text-2xl font-bold">
        {profile.name ? `Hi, ${profile.name}` : "Your profile"}
      </h2>
      <p className="mt-1 text-sm text-slate-600">
        Review this before starting — your interview will be built around it.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <ProfileBlock title="Strengths" tone="green" items={profile.strengths} empty="No clear strengths extracted — the interview will stay general." />
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm font-bold text-amber-900">Potential areas to improve</p>
          <List items={profile.improvement_areas} empty="Nothing flagged." />
          <p className="mt-2 text-xs text-amber-700">
            Inferred from your resume — possibilities an interviewer may explore,
            not facts about you.
          </p>
        </div>
        <ProfileBlock title="Skills" tone="slate" items={profile.skills} empty="No skills listed." />
        <ProfileBlock title="Experience highlights" tone="slate" items={profile.experience_highlights} empty="No experience extracted." />
      </div>

      {profile.education.length > 0 && (
        <p className="mt-4 text-sm text-slate-600">
          <strong>Education:</strong> {profile.education.join(" · ")}
        </p>
      )}
      {profile.likely_angles.length > 0 && (
        <div className="mt-3 rounded-xl bg-indigo-50 p-4 text-sm">
          <p className="font-bold text-indigo-900">An interviewer may ask about…</p>
          <List items={profile.likely_angles} empty="" />
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
      ? "border-green-200 bg-green-50 text-green-900"
      : "border-slate-200 bg-slate-50 text-slate-900";
  return (
    <div className={`rounded-xl border p-4 ${cls}`}>
      <p className="text-sm font-bold">{title}</p>
      <List items={items} empty={empty} />
    </div>
  );
}

function List({ items, empty }: { items: string[]; empty: string }) {
  if (items.length === 0) return <p className="mt-1 text-sm text-slate-500">{empty}</p>;
  return (
    <ul className="mt-1 list-disc space-y-1 pl-5 text-sm">
      {items.map((it, i) => (
        <li key={`${it}-${i}`}>{it}</li>
      ))}
    </ul>
  );
}
