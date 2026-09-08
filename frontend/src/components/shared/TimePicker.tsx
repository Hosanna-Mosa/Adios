export function TimePicker({ value, onChange, label }: {
  value: string;
  onChange: (v: string) => void;
  label: string;
}) {
  return (
    <div>
      <p className="text-xs font-semibold text-secondary-app mb-1.5">{label}</p>
      <input
        type="time"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-white outline-none focus:border-brand-kinetic focus:ring-2 focus:ring-brand-kinetic/10 transition-all text-sm"
      />
    </div>
  );
}

