"use client";

import { useId, useState } from "react";
import { useLiveEarnings } from "@/hooks/useLiveEarnings";
import { formatEarnings, formatNumber } from "@/lib/format";
import type { Validator } from "@/lib/types";

/**
 * "Sustainable Bedrock Yield" panel — live earnings odometer, auto-compounding
 * toggle, and the APY window.
 *
 * Rendered on the accent panel token, which is a dark slab on the light theme
 * (per the spec) and an elevated surface on dark.
 */

/** Spec-mandated copy. Do not reword — it is quoted verbatim in the brief. */
const AUTO_COMPOUND_TOOLTIP =
  "Rewards automatically appreciate; no manual restaking or claiming required (Set-it-and-forget-it).";

export function YieldSidebar({
  delegatedTo,
  stakeQry,
  energy,
  bandwidth,
  autoCompound,
  onToggleAutoCompound,
}: {
  delegatedTo: Validator | null;
  stakeQry: number;
  energy: number;
  bandwidth: number;
  autoCompound: boolean;
  onToggleAutoCompound: () => void;
}) {
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipId = useId();

  const isActive = delegatedTo !== null;
  const apy = delegatedTo?.apyPct ?? 0;
  const earned = useLiveEarnings(stakeQry, apy, isActive);

  return (
    <aside className="flex min-h-[380px] flex-col justify-between rounded-xl bg-panel p-6 text-panel-ink shadow-md">
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-panel-ink/10 pb-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-panel-ink/80">
            Sustainable Bedrock Yield
          </h2>
          <span
            className={`rounded px-2 py-0.5 font-mono text-[10px] font-bold tracking-tight ${
              isActive ? "bg-brand text-white" : "bg-panel-ink/10 text-panel-ink/60"
            }`}
          >
            {isActive ? "LIVE REWARDS" : "IDLE"}
          </span>
        </div>

        <div>
          <span className="block text-[11px] font-medium text-panel-ink/60">
            Current Operational APY
          </span>
          <span className="font-mono text-2xl font-bold text-brand">
            {apy.toFixed(2)}%
          </span>
        </div>

        <div>
          <span className="mb-1 block text-[11px] font-medium text-panel-ink/60">
            Live Earnings Counter
          </span>
          {/*
            Updates 10x/second. aria-live is left off deliberately — announcing
            every tick would make a screen reader unusable. The delegation
            summary elsewhere carries the meaningful state.
          */}
          <div className="font-mono text-3xl font-bold tabular-nums tracking-tight">
            {formatEarnings(earned)}
            <span className="ml-1.5 font-sans text-xs text-panel-ink/40">QRY</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="rounded-lg border border-panel-ink/5 bg-panel-ink/5 p-3">
            <span className="block text-[10px] font-medium text-panel-ink/50">
              Available Energy
            </span>
            <span className="font-mono text-sm font-bold tabular-nums">
              {formatNumber(energy)} μS
            </span>
          </div>
          <div className="rounded-lg border border-panel-ink/5 bg-panel-ink/5 p-3">
            <span className="block text-[10px] font-medium text-panel-ink/50">
              Bandwidth Unit
            </span>
            <span className="font-mono text-sm font-bold tabular-nums">
              {formatNumber(bandwidth)} bp/s
            </span>
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-panel-ink/10 pt-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-panel-ink/80">
            Auto-Compounding Pool
          </span>
          <span className="relative">
            <button
              type="button"
              aria-describedby={tooltipId}
              aria-label="What is auto-compounding?"
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              onFocus={() => setShowTooltip(true)}
              onBlur={() => setShowTooltip(false)}
              className="flex h-4 w-4 items-center justify-center rounded-full border border-panel-ink/40 text-[10px] text-panel-ink/60 transition-colors hover:border-panel-ink hover:text-panel-ink"
            >
              ?
            </button>
            {showTooltip && (
              <span
                id={tooltipId}
                role="tooltip"
                /*
                  White-on-dark rather than the spec's bg-black: this tooltip
                  sits ON the accent panel, which is dark in BOTH themes, so a
                  black tooltip reads as near-black on near-black. Inverting it
                  guarantees contrast regardless of theme.
                */
                className="animate-fade-in absolute bottom-full left-1/2 z-50 mb-2 w-56 -translate-x-1/2 rounded-lg bg-white p-2.5 text-center text-[10px] font-medium leading-relaxed text-[#212529] shadow-xl ring-1 ring-black/10"
              >
                {AUTO_COMPOUND_TOOLTIP}
              </span>
            )}
          </span>
        </div>

        <button
          type="button"
          role="switch"
          aria-checked={autoCompound}
          aria-label="Auto-compounding"
          onClick={onToggleAutoCompound}
          className={`h-5 w-10 rounded-full p-0.5 transition-colors duration-200 ${
            autoCompound ? "bg-brand" : "bg-panel-ink/20"
          }`}
        >
          <span
            className={`block h-4 w-4 rounded-full bg-white transition-transform duration-200 ${
              autoCompound ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
      </div>
    </aside>
  );
}
