import { useRef, useState } from "react";
interface Props {
  value: string;
  onChange: (role: string) => void;
  placeholder?: string;
}

const GROUPS: { label: string; roles: string[] }[] = [
  { label: "💰 Finance", roles: ["Financial Analyst", "Investment Banking Analyst"] },
  { label: "📊 Data & Analytics", roles: ["Marketing Analyst", "Business Analyst", "Data Analyst"] },
  { label: "💼 Business & Management", roles: ["Product Manager", "Consultant", "Sales", "Operations"] },
  { label: "👥 People & Technology", roles: ["HR", "Software Engineer"] },
];

/** Type-to-search role box: write any role, matching presets appear inside. */
export default function RoleCombobox({ value, onChange, placeholder }: Props) {
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const q = value.trim().toLowerCase();

  const groups = GROUPS.map((g) => ({
    ...g,
    roles: g.roles.filter((r) => r.toLowerCase().includes(q)),
  })).filter((g) => g.roles.length > 0);

  const exactPreset = GROUPS.some((g) =>
    g.roles.some((r) => r.toLowerCase() === q)
  );
  const showCustomRow = value.trim().length > 0 && !exactPreset;

  const close = () => setOpen(false);

  return (
    <div ref={boxRef} className="relative">
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(close, 150)}
        onKeyDown={(e) => {
          if (e.key === "Escape") close();
          if (e.key === "Enter") close();
        }}
        placeholder={placeholder || "Type a role, e.g. Data Analyst"}
        maxLength={80}
        className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30"
      />
      {open && (
        <div className="absolute z-10 mt-2 max-h-64 w-full overflow-y-auto rounded-xl border border-slate-700 bg-slate-900 p-2 shadow-2xl shadow-black/60">
          {groups.length === 0 && !showCustomRow && (
            <p className="px-3 py-2 text-sm text-slate-400">
              Type any role to use it.
            </p>
          )}
          {groups.map((g) => (
              <div key={g.label} className="mb-1 last:mb-0">
                <p className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  {g.label}
                </p>
                {g.roles.map((r) => (
                  <button
                    key={r}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      onChange(r);
                      close();
                    }}
                    className={`block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-slate-800 ${
                      value === r ? "font-semibold text-indigo-300" : "text-slate-200"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            ))}
          {showCustomRow && (
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={close}
              className="mt-1 block w-full rounded-lg border border-dashed border-indigo-700 bg-indigo-950 px-3 py-2 text-left text-sm font-semibold text-indigo-200 hover:bg-indigo-900"
            >
              ➕ Use “{value.trim()}”
            </button>
          )}
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => inputRef.current?.focus()}
            className="mt-1 block w-full rounded-lg border border-slate-700 px-3 py-2 text-left text-sm font-semibold text-slate-300 hover:bg-slate-800"
          >
            ✏️ Others — type your own role above
          </button>
        </div>
      )}
    </div>
  );
}
