export default function TableVisibilityPicker({ options, value, onChange }) {
  return (
    <div className="space-y-2">
      {options.map((opt) => {
        const isActive = value === opt.key;
        return (
          <label
            key={opt.key}
            className={`flex items-start gap-3 border rounded-lg px-3 py-2 cursor-pointer transition ${
              isActive
                ? "border-black bg-gray-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <input
              type="radio"
              name="tableVisibility"
              value={opt.key}
              checked={isActive}
              onChange={() => onChange(opt.key)}
              className="mt-1"
            />
            <span>
              <span className="block text-sm font-medium">{opt.label}</span>
              <span className="block text-xs text-gray-500">
                {opt.description}
              </span>
            </span>
          </label>
        );
      })}
    </div>
  );
}
