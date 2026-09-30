import { useState } from "react";
import { ROLE_SUGGESTIONS } from "../types";

interface Props {
  value: string;
  onChange: (role: string) => void;
}

/** Preset role pills + free-text "Other", shared by all setup screens. */
export default function RolePicker({ value, onChange }: Props) {
  const isPreset = (ROLE_SUGGESTIONS as readonly string[]).includes(value);
  const [custom, setCustom] = useState(isPreset || !value ? "" : value);
  const showCustom = !isPreset;

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {ROLE_SUGGESTIONS.map((r) => (
          <button
            key={r}
            onClick={() => onChange(r)}
            className={value === r ? activeCls : idleCls}
          >
            {r}
          </button>
        ))}
        <button
          onClick={() => onChange(custom)}
          className={showCustom && value ? activeCls : idleCls}
        >
          Other…
        </button>
      </div>
      {showCustom && (
        <input
          value={custom}
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
  );
}

const activeCls =
  "rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-950";
const idleCls =
  "rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-200 hover:bg-slate-800";
