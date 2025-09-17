import type { PropsWithChildren, ReactNode } from "react";
import clsx from "clsx";

interface CardProps extends PropsWithChildren {
  title?: string;
  className?: string;
  actions?: ReactNode;
}

export function Card({ title, className, children, actions }: CardProps) {
  return (
    <section
      className={clsx(
        "rounded-xl border border-border bg-card p-6 shadow-sm transition hover:shadow",
        className
      )}
    >
      {(title || actions) && (
        <header className="mb-4 flex items-center justify-between">
          {title ? <h2 className="text-lg font-semibold">{title}</h2> : <div />}
          {actions}
        </header>
      )}
      <div className="space-y-3 text-sm text-muted-foreground">{children}</div>
    </section>
  );
}
