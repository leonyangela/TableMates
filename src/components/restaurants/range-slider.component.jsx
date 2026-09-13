"use client";

export default function RangeSlider({ label, min, max, value, onChange, formatValue }) {
  return (
    <div>
      <div className="flex justify-between text-xs text-gray-400 mb-2">
        <span>{label}</span>
        <span>{formatValue ? formatValue(value) : value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-primary"
      />
    </div>
  );
}