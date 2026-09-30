interface Props {
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
}

/** Free numeric input for question count (clamped to min–max). */
export default function CountInput({ value, onChange, min = 3, max = 10 }: Props) {
  const clamp = (n: number) => Math.min(max, Math.max(min, n));
  return (
    <div className="flex items-center gap-3">
      <input
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(e) => {
          const n = parseInt(e.target.value, 10);
          if (!Number.isNaN(n)) onChange(clamp(n));
        }}
        onBlur={(e) => {
          const n = parseInt(e.target.value, 10);
          onChange(Number.isNaN(n) ? min : clamp(n));
        }}
        className="w-24 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-slate-100 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30"
      />
      <span className="text-xs text-slate-500">
        {min}–{max} questions
      </span>
    </div>
  );
}
