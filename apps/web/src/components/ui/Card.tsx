import type { HTMLAttributes, ReactNode } from "react";

export function Card({
  title,
  kicker,
  action,
  children,
  className = "",
  ...rest
}: HTMLAttributes<HTMLDivElement> & { title?: string; kicker?: string; action?: ReactNode }) {
  return (
    <div className={`film-card animate-fade-in ${className}`} {...rest}>
      {(title || kicker || action) && (
        <div className="mb-3 flex items-start justify-between gap-2">
          <div>
            {kicker && <p className="kicker">{kicker}</p>}
            {title && <h3 className="mt-0.5 text-base font-medium">{title}</h3>}
          </div>
          {action}
        </div>
      )}
      {children}
    </div>
  );
}

export function Badge({
  children,
  tone = "moss",
}: {
  children: ReactNode;
  tone?: "moss" | "ember" | "ink";
}) {
  const toneClasses = {
    moss: "bg-moss/10 text-moss dark:bg-moss/20 dark:text-cream",
    ember: "bg-ember/15 text-ember",
    ink: "bg-ink/10 text-ink dark:bg-cream/10 dark:text-cream",
  }[tone];
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${toneClasses}`}
    >
      {children}
    </span>
  );
}
