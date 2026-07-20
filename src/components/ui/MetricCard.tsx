import type { ReactNode } from "react";

/** Small labelled metric tile used across the validator dashboard. */
export function MetricCard({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  tone?: "default" | "success" | "danger" | "brand";
}) {
  const toneClass = {
    default: "text-heading",
    success: "text-success",
    danger: "text-danger",
    brand: "text-brand",
  }[tone];

  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <span className="block text-[10px] uppercase tracking-wide text-muted">
        {label}
      </span>
      <span className={`font-mono text-lg font-bold tabular-nums ${toneClass}`}>
        {value}
      </span>
      {hint && <span className="mt-0.5 block text-[10px] text-muted">{hint}</span>}
    </div>
  );
}
