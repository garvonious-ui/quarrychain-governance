"use client";

import { useId, useState } from "react";
import { useLiveEarnings } from "@/hooks/useLiveEarnings";
import { MIN_SELF_BOND_QRY } from "@/lib/chain";
import { formatEarnings, formatQry } from "@/lib/format";
import type { Validator } from "@/lib/types";

/** Staking & pool economics: self-bond, delegation volume, commission. */
export function StakingPoolSection({ validator }: { validator: Validator }) {
  const [commission, setCommission] = useState(validator.commissionPct);
  const [saved, setSaved] = useState(false);
  const tooltipId = useId();
  const [showTooltip, setShowTooltip] = useState(false);

  const delegated = Math.max(0, validator.votes - validator.selfBond);
  const earnings = useLiveEarnings(validator.selfBond, validator.apyPct, true);

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-body">
          Self-Bond Locker
        </h2>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="font-mono text-3xl font-bold tabular-nums text-heading">
              {formatQry(validator.selfBond)}
            </span>
            <p className="mt-1 text-[11px] text-muted">
              Minimum required: {formatQry(MIN_SELF_BOND_QRY)} · slashable
              collateral
            </p>
          </div>
          <button
            type="button"
            className="rounded-lg border border-border-strong bg-card px-4 py-2 text-xs font-bold text-body transition-colors hover:border-brand hover:text-brand"
          >
            Increase Self-Bond
          </button>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-body">
            Delegation Pool
          </h2>
          <span className="font-mono text-2xl font-bold tabular-nums text-heading">
            {formatQry(delegated)}
          </span>
          <p className="mt-1 text-[11px] text-muted">
            Delegated to you by network voters
          </p>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-well">
            <div
              className="h-full rounded-full bg-brand"
              style={{
                width: `${Math.min(100, (delegated / validator.votes) * 100)}%`,
              }}
            />
          </div>
          <p className="mt-2 text-[10px] text-muted">
            {((delegated / validator.votes) * 100).toFixed(1)}% of your total pool
            weight is delegated stake
          </p>
        </section>

        <section className="rounded-xl bg-panel p-6 text-panel-ink shadow-md">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-panel-ink/80">
            Validation Earnings
          </h2>
          <span className="font-mono text-2xl font-bold tabular-nums">
            {formatEarnings(earnings)}
            <span className="ml-1 font-sans text-xs text-panel-ink/40">QRY</span>
          </span>
          <p className="mt-1 text-[11px] text-panel-ink/60">
            Accruing this session at {validator.apyPct}% APY
          </p>
        </section>
      </div>

      <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <h2 className="text-sm font-bold uppercase tracking-wider text-body">
            Commission Rate
          </h2>
          <span className="relative">
            <button
              type="button"
              aria-label="What is the commission rate?"
              aria-describedby={tooltipId}
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              onFocus={() => setShowTooltip(true)}
              onBlur={() => setShowTooltip(false)}
              className="flex h-4 w-4 items-center justify-center rounded-full border border-border-strong text-[10px] text-muted transition-colors hover:border-brand hover:text-brand"
            >
              ?
            </button>
            {showTooltip && (
              <span
                id={tooltipId}
                role="tooltip"
                className="animate-fade-in absolute bottom-full left-1/2 z-50 mb-2 w-64 -translate-x-1/2 rounded-lg bg-panel p-2.5 text-center text-[10px] font-medium leading-relaxed text-panel-ink shadow-xl"
              >
                This is the percentage of block rewards you keep to cover your
                server costs before the remaining rewards auto-compound back to
                your voters.
              </span>
            )}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <input
            type="range"
            min={0}
            max={20}
            step={1}
            value={commission}
            aria-label="Commission rate percent"
            onChange={(e) => {
              setCommission(Number(e.target.value));
              setSaved(false);
            }}
            className="h-2 flex-1 cursor-pointer appearance-none rounded-full bg-well accent-brand"
          />
          <span className="w-14 text-right font-mono text-lg font-bold tabular-nums text-brand">
            {commission}%
          </span>
          <button
            type="button"
            onClick={() => setSaved(true)}
            disabled={commission === validator.commissionPct}
            className="rounded-lg bg-brand px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-brand-hover disabled:opacity-40"
          >
            {saved ? "Saved" : "Save"}
          </button>
        </div>
        <p className="mt-3 text-[11px] text-muted">
          Range 0–20%. Commission changes are an on-chain
          <code className="mx-1 font-mono">MsgEditValidator</code>
          in production and take effect at the next epoch — this control is local
          only until wallet signing ships.
        </p>
      </section>
    </div>
  );
}
