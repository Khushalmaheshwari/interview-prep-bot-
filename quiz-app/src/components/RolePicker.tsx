import { useState } from "react";

interface Props {
  value: string;
  onChange: (role: string) => void;
}

const GROUPS: { label: string; roles: string[] }[] = [
  { label: "💰 Finance", roles: ["Financial Analyst", "Investment Banking Analyst"] },
  { label: "📊 Data & Analytics", roles: ["Marketing Analyst", "Business Analyst", "Data Analyst"] },
  { label: "💼 Business & Management", roles: ["Product Manager", "Consultant", "Sales", "Operations"] },
  { label: "👥 People & Technology", roles: ["HR", "Software Engineer"] },
];

const ALL_PRESETS = GROUPS.flatMap((g) => g.roles);

/** Grouped role picker + free-text "Other", shared by all setup screens. */
export default function RolePicker({ value, onChange }: Props) {
  const isPreset = ALL_PRESETS.includes(value);
  const [customOpen, setCustomOpen] = useState(!isPreset && value !== "");
  const [custom, setCustom] = useState(!isPreset ? value : "");

  const pickPreset = (r: string) => {
    setCustomOpen(false);
    onChange(r);
  };

  return (
    <div className="space-y-3">
      {GROUPS.map((g) => (
        <div key={g.label}>
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
            {g.label}
          </p>
          <div className="flex flex-wrap gap-2">
            {g.roles.map((r) => (
              <button
                key={r}
                onClick={() => pickPreset(r)}
                className={value === r ? activeCls : idleCls}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      ))}
      <div>
        <button
          onClick={() => {
            setCustomOpen(true);
            onChange(custom);
          }}
          className={customOpen && value ? activeCls : idleCls}
        >
          ✏️ Other…
        </button>
        {customOpen && (
          <input
            value={custom}
            autoFocus
            onChange={(e) => {
              setCustom(e.target.value);
              onChange(e.target.value.trim());
            }}
            placeholder="Enter your role, e.g. Supply Chain Analyst"
            maxLength={80}
            className="mt-3 w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30"
          />
        )}
      </div>
    </div>
  );
}

const activeCls =
  "rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-950";
const idleCls =
  "rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-200 hover:bg-slate-800";
