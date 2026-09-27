import Button from "@/components/button/button.component";

/**
 * A row of filter tabs in small mono type with counts; the active one is
 * set in the accent with a rule under it.
 *
 *   tabs: [{ value, label, count }]
 */
export default function FilterTabs({ tabs, value, onChange, label = "Filter", className = "" }) {
  return (
    <div role="tablist" aria-label={label} className={`flex flex-wrap gap-x-8 gap-y-3 ${className}`}>
      {tabs.map((tab) => {
        const isActive = value === tab.value;
        return (
          <Button
            key={tab.label}
            variant="tab"
            active={isActive}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.value)}
          >
            {tab.label}
            {tab.count > 0 && <span className="-ml-1 opacity-60">{String(tab.count).padStart(2, "0")}</span>}
          </Button>
        );
      })}
    </div>
  );
}
