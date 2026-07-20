"use client";

import { MetricCard } from "@/components/ui/MetricCard";
import { useConsensusTicker } from "@/hooks/useConsensusTicker";
import { formatEarnings, formatNumber, formatQry } from "@/lib/format";
import type { Validator } from "@/lib/types";

/**
 * Overview — block production telemetry (Module A of the spec's real-time
 * grid) plus the QRY mining yield ticker (Module B).
 */

const HORIZONS = [
  { label: "Last Hour", days: 1 / 24, estimate: false },
  { label: "Last Day", days: 1, estimate: false },
  { label: "Projected Week", days: 7, estimate: true },
  { label: "Projected Month", days: 30, estimate: true },
  { label: "Projected Year", days: 365, estimate: true },
];

/** Total delegated stake across the active set, for network-weight share. */
export function OverviewSection({
  validator,
  seedHeight,
  networkVoteTotal,
}: {
  validator: Validator;
  seedHeight: number;
  networkVoteTotal: number;
}) {
  const t = useConsensusTicker(validator, seedHeight);
  const weightPct = (validator.votes / networkVoteTotal) * 100;

  return (
    <div className="space-y-6">
      {/* Block production telemetry */}
      <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-body">
            Block Production Telemetry
          </h2>
          <span className="flex items-center gap-2 rounded-full bg-brand-tint px-3 py-1">
            <span className="h-2 w-2 animate-pulse rounded-full bg-brand" />
            <span className="font-mono text-[11px] font-bold text-brand">
              {t.consensusState}
            </span>
          </span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            label="Epoch / Round"
            value={`${t.epoch} / ${formatNumber(t.round)}`}
          />
          <MetricCard
            label="Consecutive Blocks Signed"
            value={formatNumber(t.consecutiveBlocks)}
            hint="without a miss"
          />
          <MetricCard
            label="Last Signed Block"
            value={
              <span className={t.flash ? "text-brand" : undefined}>
                #{formatNumber(t.blockHeight)}
              </span>
            }
          />
          <MetricCard
            label="Missed Blocks"
            value={validator.missedBlocks}
            tone={validator.missedBlocks > 0 ? "danger" : "success"}
          />
        </div>
      </section>

      {/* Yield ticker */}
      <section className="rounded-xl bg-panel p-6 text-panel-ink shadow-md">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-panel-ink/10 pb-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-panel-ink/80">
            QRY Mining Yield
          </h2>
          <span className="rounded bg-brand px-2 py-0.5 font-mono text-[10px] font-bold text-white">
            LIVE
          </span>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <span className="block text-[11px] text-panel-ink/60">
              Total Active Pool Weight
            </span>
            <span className="font-mono text-2xl font-bold tabular-nums">
              {formatNumber(validator.votes)}
              <span className="ml-1 font-sans text-xs text-panel-ink/40">QRY</span>
            </span>
            <p className="mt-1 text-[11px] text-panel-ink/60">
              {weightPct.toFixed(2)}% of global voting weight
            </p>
          </div>

          <div>
            <span className="block text-[11px] text-panel-ink/60">
              Total QRY Mined To Date
            </span>
            <span className="font-mono text-2xl font-bold tabular-nums text-brand">
              {formatEarnings(t.totalMined)}
            </span>
          </div>
        </div>

        <div className="mt-6 grid gap-3 border-t border-panel-ink/10 pt-5 sm:grid-cols-3 lg:grid-cols-5">
          {HORIZONS.map((h) => (
            <div
              key={h.label}
              className="rounded-lg border border-panel-ink/5 bg-panel-ink/5 p-3"
            >
              <span className="block text-[10px] text-panel-ink/50">
                {h.label}
              </span>
              <span className="font-mono text-sm font-bold tabular-nums">
                {formatQry(validator.dailyRewardQry * h.days)}
              </span>
              {h.estimate && (
                <span className="mt-0.5 block text-[9px] uppercase tracking-wide text-panel-ink/40">
                  estimate
                </span>
              )}
            </div>
          ))}
        </div>
        <p className="mt-3 text-[10px] text-panel-ink/40">
          Projections extrapolate the current daily rate and assume constant pool
          weight — they are not guarantees.
        </p>
      </section>
    </div>
  );
}
