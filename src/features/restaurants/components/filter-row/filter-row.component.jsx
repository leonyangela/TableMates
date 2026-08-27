const FilterRow = ({ label, options, active, onSelect }) => (
  <div className="relative flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 py-2">
    <span className="w-24 shrink-0 text-sm text-gray-400">{label}</span>
    <div className="flex flex-wrap gap-x-5 gap-y-1">
      {options.map((opt) => {
        const isActive = active === opt.key;
        return (
          <button
            key={opt.key}
            onClick={() => onSelect(isActive ? null : opt.key)}
            className={`text-sm transition cursor-pointer ${
              isActive
                ? "font-bold text-black"
                : "text-gray-500 hover:text-black"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  </div>
);

export default FilterRow;
