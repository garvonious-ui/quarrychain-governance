"use client";

import { ValidatorIcon } from "@/components/governance/ValidatorIcon";
import { TokenLogo } from "@/components/ui/TokenLogo";
import { formatNumber } from "@/lib/format";
import { isTopTier, SPLIT_PERCENTS } from "@/lib/voting";
import type { Validator } from "@/lib/types";

/** Points allocated per validator id, in split mode. */
export type Allocation = Record<string, number>;

/**
 * Step 2 — Select Quarry Miner. Two modes:
 *  - Single: pick one miner, all Energy goes to it (click → advance).
 *  - Split:  allocate Energy points across several miners.
 * Matches the demo's split-delegation UI (per-miner %, Even Split, progress).
 */
export function SelectStep({
  validators,
  frozen,
  energy,
  mode,
  onModeChange,
  allocation,
  onAllocationChange,
  onSelectSingle,
  onBack,
  onContinue,
}: {
  validators: Validator[];
  frozen: number;
  energy: number;
  mode: "single" | "split";
  onModeChange: (m: "single" | "split") => void;
  allocation: Allocation;
  onAllocationChange: (next: Allocation) => void;
  onSelectSingle: (id: string) => void;
  onBack: () => void;
  onContinue: () => void;
}) {
  const allocated = Object.values(allocation).reduce((s, n) => s + n, 0);
  const remaining = energy - allocated;
  const selectedIds = Object.keys(allocation).filter((id) => allocation[id] > 0);
  const fullyAllocated = allocated === energy && energy > 0;

  function setPoints(id: string, points: number) {
    const clamped = Math.max(0, Math.min(points, energy));
    const next = { ...allocation };
    if (clamped === 0) delete next[id];
    else next[id] = clamped;
    onAllocationChange(next);
  }

  function evenSplit() {
    const ids = selectedIds.length > 0 ? selectedIds : validators.slice(0, 3).map((v) => v.id);
    const each = Math.floor(energy / ids.length);
    const next: Allocation = {};
    ids.forEach((id, i) => {
      next[id] = i === ids.length - 1 ? energy - each * (ids.length - 1) : each;
    });
    onAllocationChange(next);
  }

  return (
    <section className="rounded-xl border border-border bg-card shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-6 py-5">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-tint text-brand">
            <ClipboardIcon />
          </span>
          <div>
            <h2 className="text-lg font-bold text-heading">
              Step 2 — Select Quarry Miner
            </h2>
            <p className="text-xs text-muted">
              {mode === "split"
                ? "Split your Energy across multiple miners"
                : "Choose a miner to delegate your Energy to"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 rounded-lg bg-brand-tint px-3 py-1.5 text-xs font-bold text-brand">
            {formatNumber(frozen)} <TokenLogo size={14} /> QRY frozen
          </span>
          <div className="flex rounded-lg border border-border-strong p-0.5 text-xs font-bold">
            {(["single", "split"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => onModeChange(m)}
                className={`rounded-md px-3 py-1.5 transition-colors ${
                  mode === m ? "bg-brand text-white" : "text-muted hover:text-ink"
                }`}
              >
                {m === "single" ? "Single Miner" : "Split Delegation"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-4 p-6">
        {/* Split-mode allocation summary */}
        {mode === "split" && (
          <div className="rounded-xl border border-border bg-surface p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-heading">
                  Energy Allocation
                </span>
                <button
                  type="button"
                  onClick={evenSplit}
                  className="rounded-md bg-brand-tint px-2.5 py-1 text-[11px] font-bold text-brand transition-colors hover:bg-brand hover:text-white"
                >
                  ⚡ Even Split
                </button>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm font-bold tabular-nums text-heading">
                  {formatNumber(allocated)} / {formatNumber(energy)}
                </span>
                {fullyAllocated && (
                  <span className="rounded-full bg-success-tint px-2 py-0.5 text-[11px] font-bold text-success-deep">
                    Fully Allocated ✓
                  </span>
                )}
              </div>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-well">
              <div
                className={`h-full rounded-full ${allocated > energy ? "bg-danger" : "bg-success"}`}
                style={{ width: `${Math.min(100, (allocated / (energy || 1)) * 100)}%` }}
              />
            </div>
            {selectedIds.length > 0 && (
              <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px]">
                <span className="text-muted">
                  {selectedIds.length} miner{selectedIds.length === 1 ? "" : "s"} selected:
                </span>
                {selectedIds.map((id) => {
                  const v = validators.find((x) => x.id === id);
                  return (
                    <span
                      key={id}
                      className="rounded-full border border-brand/30 bg-brand-tint px-2 py-0.5 font-semibold text-brand"
                    >
                      {v?.name} — {formatNumber(allocation[id])} pts
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Miner grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {validators.map((v) => {
            const top = isTopTier(v);
            const points = allocation[v.id] ?? 0;
            const selected = points > 0;

            if (mode === "single") {
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => onSelectSingle(v.id)}
                  aria-label={`Delegate to ${v.name} — ${v.apyPct}% APY`}
                  className="flex items-center justify-between rounded-xl border border-border bg-card p-4 text-left transition-colors hover:border-brand hover:bg-surface"
                >
                  <span className="flex items-center gap-3">
                    <ValidatorIcon name={v.name} asset={v.iconAsset} size={32} />
                    <span>
                      <span className="block text-sm font-bold text-heading">
                        {v.name}
                      </span>
                      <span className="text-[11px] text-muted">Rank #{v.rank}</span>
                    </span>
                  </span>
                  <span
                    className={`text-sm font-bold ${top ? "text-success" : "text-brand"}`}
                  >
                    {v.apyPct}%
                  </span>
                </button>
              );
            }

            // Split mode card
            return (
              <div
                key={v.id}
                className={`rounded-xl border p-4 transition-colors ${
                  selected ? "border-brand bg-brand-tint/40" : "border-border bg-card"
                }`}
              >
                <div className="flex items-start justify-between">
                  <span className="flex items-center gap-2.5">
                    <ValidatorIcon name={v.name} asset={v.iconAsset} size={28} />
                    <span>
                      <span className="block text-sm font-bold text-heading">
                        {v.name}
                      </span>
                      <span className="text-[11px] text-muted">Rank #{v.rank}</span>
                    </span>
                  </span>
                  <span
                    className={`text-sm font-bold ${top ? "text-success" : "text-brand"}`}
                  >
                    {v.apyPct}%
                  </span>
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    max={energy}
                    value={points || ""}
                    onChange={(e) => setPoints(v.id, Number(e.target.value) || 0)}
                    placeholder="0"
                    aria-label={`Energy points for ${v.name}`}
                    className="w-full rounded-lg border border-border-strong bg-card px-3 py-1.5 text-sm font-semibold text-ink focus:border-brand focus:outline-none"
                  />
                  <span className="text-[11px] font-medium text-muted">pts</span>
                  {selected && (
                    <button
                      type="button"
                      onClick={() => setPoints(v.id, 0)}
                      aria-label={`Clear ${v.name}`}
                      className="rounded bg-danger/10 px-1.5 py-1 text-xs font-bold text-danger hover:bg-danger/20"
                    >
                      ×
                    </button>
                  )}
                </div>

                <div className="mt-2 flex gap-1">
                  {SPLIT_PERCENTS.map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setPoints(v.id, Math.round((energy * pct) / 100))}
                      className="flex-1 rounded-md border border-border-strong px-1 py-1 text-[11px] font-bold text-body transition-colors hover:border-brand hover:text-brand"
                    >
                      {pct}%
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setPoints(v.id, points + Math.max(0, remaining))}
                    disabled={remaining <= 0}
                    className="flex-1 rounded-md border border-border-strong px-1 py-1 text-[11px] font-bold text-body transition-colors hover:border-brand hover:text-brand disabled:opacity-40"
                  >
                    Max
                  </button>
                </div>

                {selected && (
                  <p className="mt-2 text-[11px] font-semibold text-brand">
                    {((points / (energy || 1)) * 100).toFixed(1)}% of your Energy
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex gap-3 border-t border-border px-6 py-4">
        <button
          type="button"
          onClick={onBack}
          className="rounded-lg border border-border-strong bg-card px-4 py-2.5 text-sm font-bold text-body transition-colors hover:bg-surface"
        >
          Back
        </button>
        {mode === "split" && (
          <button
            type="button"
            onClick={onContinue}
            disabled={allocated <= 0 || allocated > energy}
            className="flex-1 rounded-lg bg-brand py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            Continue with {selectedIds.length} Miner
            {selectedIds.length === 1 ? "" : "s"} ({formatNumber(allocated)} /{" "}
            {formatNumber(energy)} pts) →
          </button>
        )}
      </div>
    </section>
  );
}

function ClipboardIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
    </svg>
  );
}
