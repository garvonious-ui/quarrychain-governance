"use client";

import { useId, useState } from "react";
import { ValidatorIcon } from "@/components/governance/ValidatorIcon";
import { TokenLogo } from "@/components/ui/TokenLogo";
import { formatNumber } from "@/lib/format";
import { rewardEstimate } from "@/lib/voting";
import type { Validator } from "@/lib/types";

/** One line of the delegation, resolved for display. */
export interface ConfirmLeg {
  validator: Validator;
  qry: number;
  energy: number;
}

const AUTO_COMPOUND_COPY =
  "Rewards automatically reinvested. Earnings compound daily with zero manual action required.";

/**
 * Step 3 — Confirm Vote. Matches the demo: a details list with QRY amounts in
 * blue and APY in green (Alec's colour note), the QRY coin beside token
 * amounts, and the auto-compounding toggle + "currently earning" box on the
 * right (moved here from the old yield sidebar).
 */
export function ConfirmStep({
  legs,
  autoCompound,
  onToggleAutoCompound,
  onBack,
  onSubmit,
  pending,
}: {
  legs: ConfirmLeg[];
  autoCompound: boolean;
  onToggleAutoCompound: () => void;
  onBack: () => void;
  onSubmit: () => void;
  pending: boolean;
}) {
  const [showTip, setShowTip] = useState(false);
  const tipId = useId();

  const totalQry = legs.reduce((s, l) => s + l.qry, 0);
  const totalEnergy = legs.reduce((s, l) => s + l.energy, 0);
  const totalAnnual = legs.reduce(
    (s, l) => s + rewardEstimate(l.qry, l.validator.apyPct).annual,
    0,
  );
  const totalDaily = totalAnnual / 365;
  // Effective blended APY across the allocation.
  const effectiveApy = totalQry > 0 ? (totalAnnual / totalQry) * 100 : 0;
  const isSplit = legs.length > 1;
  const primary = legs[0]?.validator;

  return (
    <section className="rounded-xl border border-border bg-card shadow-sm">
      <div className="flex items-center gap-3 border-b border-border px-6 py-5">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-success-tint text-success-deep">
          <CheckIcon />
        </span>
        <div>
          <h2 className="text-lg font-bold text-heading">Step 3 — Confirm Vote</h2>
          <p className="text-xs text-muted">Review and submit your delegation</p>
        </div>
      </div>

      <div className="grid gap-6 p-6 lg:grid-cols-[1.4fr_1fr]">
        {/* Left — details */}
        <div className="space-y-4">
          {/* Selected miner header card */}
          <div className="flex items-center justify-between rounded-xl bg-surface p-4">
            <span className="flex items-center gap-3">
              {primary && (
                <ValidatorIcon name={primary.name} asset={primary.iconAsset} size={36} />
              )}
              <span>
                <span className="block text-sm font-bold text-heading">
                  {isSplit ? `${legs.length} miners` : primary?.name}
                </span>
                <span className="text-[11px] text-muted">
                  {isSplit
                    ? "Split delegation"
                    : `Rank #${primary?.rank} · ${primary?.apyPct}% APY`}
                </span>
              </span>
            </span>
            <button
              type="button"
              onClick={onBack}
              className="text-xs font-semibold text-brand hover:underline"
            >
              Change
            </button>
          </div>

          {/* Details list */}
          <dl className="divide-y divide-border rounded-xl border border-border">
            <Row label="QRY to Delegate">
              <span className="flex items-center gap-1.5 font-bold text-brand">
                {formatNumber(totalQry)} <TokenLogo size={16} />
              </span>
            </Row>
            <Row label="Energy Used">
              <span className="font-bold text-heading">{formatNumber(totalEnergy)}</span>
            </Row>
            <Row label={isSplit ? "Miners" : "Selected Miner"}>
              <span className="font-bold text-heading">
                {isSplit ? `${legs.length} selected` : primary?.name}
              </span>
            </Row>
            <Row label={isSplit ? "Effective APY" : "Current APY"}>
              <span className="font-bold text-success">{effectiveApy.toFixed(1)}%</span>
            </Row>
            <Row label="Est. Daily Reward">
              <span className="flex items-center gap-1.5 font-bold text-heading">
                {totalDaily.toFixed(4)} <TokenLogo size={16} />
              </span>
            </Row>
            <Row label="Est. Annual Reward">
              <span className="flex items-center gap-1.5 font-bold text-heading">
                {formatNumber(totalAnnual)} <TokenLogo size={16} />
              </span>
            </Row>
          </dl>

          {isSplit && (
            <div className="rounded-xl border border-border bg-surface p-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-body">
                Allocation
              </span>
              <ul className="mt-2 space-y-1.5">
                {legs.map((l) => (
                  <li
                    key={l.validator.id}
                    className="flex items-center justify-between text-xs"
                  >
                    <span className="font-medium text-heading">{l.validator.name}</span>
                    <span className="flex items-center gap-1.5 font-mono text-body">
                      {formatNumber(l.qry)} <TokenLogo size={13} />
                      <span className="text-success">· {l.validator.apyPct}%</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <p className="rounded-lg border border-warning/30 bg-warning-tint px-3 py-2 text-[11px] font-medium text-warning">
            Wallet signing arrives in Phase 6. This step records the delegation
            locally and returns a simulated transaction hash.
          </p>
        </div>

        {/* Right — auto-compound + earning */}
        <div className="space-y-4">
          <div className="rounded-xl border border-border p-4">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-sm font-bold text-heading">
                Auto-Compounding
                <span className="relative">
                  <button
                    type="button"
                    aria-describedby={tipId}
                    aria-label="What is auto-compounding?"
                    onMouseEnter={() => setShowTip(true)}
                    onMouseLeave={() => setShowTip(false)}
                    onFocusCapture={() => setShowTip(true)}
                    onBlur={() => setShowTip(false)}
                    className="flex h-4 w-4 items-center justify-center rounded-full border border-border-strong text-[10px] text-muted"
                  >
                    ?
                  </button>
                  {showTip && (
                    <span
                      id={tipId}
                      role="tooltip"
                      className="animate-fade-in absolute bottom-full left-1/2 z-50 mb-2 w-56 -translate-x-1/2 rounded-lg bg-panel p-2.5 text-center text-[10px] font-medium leading-relaxed text-panel-ink shadow-xl"
                    >
                      {AUTO_COMPOUND_COPY}
                    </span>
                  )}
                </span>
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={autoCompound}
                aria-label="Auto-compounding"
                onClick={onToggleAutoCompound}
                className={`h-5 w-10 rounded-full p-0.5 transition-colors ${
                  autoCompound ? "bg-brand" : "bg-border-strong"
                }`}
              >
                <span
                  className={`block h-4 w-4 rounded-full bg-white transition-transform ${
                    autoCompound ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
            <p className="mt-2 text-[11px] text-body">
              ✅ {AUTO_COMPOUND_COPY}
            </p>
          </div>

          <div className="rounded-xl border border-success/30 bg-success-tint/50 p-5 text-center">
            <span className="text-xs text-body">You are currently earning</span>
            <p className="my-1 font-mono text-4xl font-bold text-success">
              {effectiveApy.toFixed(1)}%
            </p>
            <span className="text-xs font-semibold text-body">
              Annual Percentage Yield
            </span>
            <p className="mt-1 text-[11px] text-muted">
              {isSplit ? "across your selected miners" : `with ${primary?.name}`}
            </p>
          </div>
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
        <button
          type="button"
          onClick={onSubmit}
          disabled={pending}
          className="flex-1 rounded-lg bg-brand py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-hover disabled:opacity-50"
        >
          {pending ? "Submitting…" : "🗳 Submit Vote"}
        </button>
      </div>
    </section>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 text-sm">
      <dt className="text-muted">{label}</dt>
      <dd className="font-mono tabular-nums">{children}</dd>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}
