export default function AmenityCheckbox({ label, checked, onChange }) {
  return (
    <label className="flex items-center justify-between text-sm cursor-pointer py-1">
      <span>{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="accent-primary w-4 h-4"
      />
    </label>
  );
}