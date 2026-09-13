export default function PropertyTypeToggle({ options, value, onChange }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {options.map((opt) => {
        const isActive = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`flex flex-col items-center gap-1 p-3 rounded-xl border text-xs transition ${
              isActive ? "border-primary bg-primary/5" : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <opt.icon size={20} className={isActive ? "text-primary" : "text-gray-500"} />
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}