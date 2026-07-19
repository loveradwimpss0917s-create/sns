import { useState, type ReactNode } from "react";

export function Tabs({ tabs }: { tabs: { label: string; content: ReactNode }[] }) {
  const [active, setActive] = useState(0);
  return (
    <div>
      <div className="bg-ink/5 dark:bg-cream/10 mb-4 flex flex-wrap gap-1 rounded-full p-1">
        {tabs.map((t, i) => (
          <button
            key={t.label}
            onClick={() => setActive(i)}
            className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
              active === i
                ? "bg-ink text-cream dark:bg-cream dark:text-ink"
                : "hover:bg-ink/5 dark:hover:bg-cream/10"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="animate-fade-in">{tabs[active]?.content}</div>
    </div>
  );
}
