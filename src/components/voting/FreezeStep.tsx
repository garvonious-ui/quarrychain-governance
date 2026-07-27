"use client";

import { TokenLogo } from "@/components/ui/TokenLogo";
import { formatNumber } from "@/lib/format";
import {
  bandwidthFor,
  energyFor,
  ENERGY_PER_QRY,
  FREEZE_PRESETS,
} from "@/lib/voting";

/**
 * Step 1 — Freeze QRY. Matches the original demo: QRY coin on the input,
 * quick-select chips, and Energy/Bandwidth previewed live as the user types
 * (no "Sustainable Bedrock Yield" panel — Alec asked for that title removed).
 */
export function FreezeStep({
  value,
  onChange,
  onSubmit,
  pending,
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  pending: boolean;
}) {
  const amount = Number.parseFloat(value) || 0;
  const energy = energyFor(amount);
  const bandwidth = bandwidthFor(amount);

  return (
    <section className="rounded-xl border border-border bg-card shadow-sm">
      <div className="flex items-center gap-3 border-b border-border px-6 py-5">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-tint text-brand">
          <LockIcon />
        </span>
        <div>
          <h2 className="text-lg font-bold text-heading">Step 1 — Freeze QRY</h2>
          <p className="text-xs text-muted">
            Lock QRY tokens to generate Energy for voting
          </p>
        </div>
      </div>

      <div className="grid gap-6 p-6 lg:grid-cols-2">
        {/* Amount */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
        >
          <label
            htmlFor="freeze-amount"
            className="block text-sm font-semibold text-heading"
          >
            Amount to Freeze
          </label>
          <div className="relative mt-2">
            <input
              id="freeze-amount"
              type="number"
              min="1"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="0"
              className="w-full rounded-lg border border-border-strong bg-card py-3 pl-4 pr-24 text-lg font-bold text-ink transition-colors focus:border-brand focus:outline-none"
            />
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center gap-1.5 pr-4">
              <TokenLogo size={20} />
              <span className="text-sm font-bold text-brand">QRY</span>
            </span>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {FREEZE_PRESETS.map((preset) => {
              const active = amount === preset;
              return (
                <button
                  key={preset}
                  type="button"
                  onClick={() => onChange(String(preset))}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-bold transition-colors ${
                    active
                      ? "border-brand bg-brand text-white"
                      : "border-border-strong bg-card text-body hover:border-brand hover:text-brand"
                  }`}
                >
                  {formatNumber(preset)}
                </button>
              );
            })}
          </div>
        </form>

        {/* Live Energy / Bandwidth preview */}
        <div className="space-y-3">
          <div className="rounded-xl bg-brand-tint p-4">
            <span className="text-sm font-semibold text-brand">Energy Gained</span>
            <p className="font-mono text-3xl font-bold tabular-nums text-brand">
              {formatNumber(energy)}
            </p>
            <p className="mt-1 flex items-center gap-1 text-xs text-brand/80">
              1 <TokenLogo size={13} /> QRY Frozen = {ENERGY_PER_QRY} Energy
            </p>
          </div>
          <div className="rounded-xl bg-well p-4">
            <span className="text-sm font-semibold text-body">
              Bandwidth (Tx Allowance)
            </span>
            <p className="font-mono text-2xl font-bold tabular-nums text-heading">
              {formatNumber(bandwidth)}
            </p>
            <p className="mt-1 text-xs text-muted">
              Unlimited free transactions while frozen
            </p>
          </div>
        </div>
      </div>

      <div className="px-6 pb-6">
        <button
          type="button"
          onClick={onSubmit}
          disabled={pending || amount <= 0}
          className="w-full rounded-lg bg-brand py-3.5 text-sm font-bold text-white transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? "Freezing…" : "Freeze QRY & Get Energy →"}
        </button>
      </div>
    </section>
  );
}

function LockIcon() {
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
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}
