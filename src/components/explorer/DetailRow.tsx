import type { ReactNode } from "react";

/** Label/value row used across the explorer detail pages. */
export function DetailRow({
  label,
  children,
  mono = true,
}: {
  label: string;
  children: ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1 py-3 sm:flex-row sm:items-baseline sm:gap-6">
      <dt className="w-56 shrink-0 text-xs text-muted">{label}</dt>
      <dd
        className={`min-w-0 break-all text-xs text-heading ${
          mono ? "font-mono" : ""
        }`}
      >
        {children}
      </dd>
    </div>
  );
}

export function DetailCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-xl border border-border bg-card shadow-sm">
      <div className="border-b border-border px-6 py-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-body">
          {title}
        </h2>
      </div>
      <dl className="divide-y divide-border px-6 py-2">{children}</dl>
    </section>
  );
}
