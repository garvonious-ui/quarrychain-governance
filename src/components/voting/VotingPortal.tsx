"use client";

import { useState } from "react";
import { ValidatorIcon } from "@/components/governance/ValidatorIcon";
import { YieldSidebar } from "@/components/voting/YieldSidebar";
import { formatQry } from "@/lib/format";
import { getProvider } from "@/lib/providers";
import type { Validator } from "@/lib/types";

/**
 * Module B — the 4-step DPoS delegation wizard.
 *
 *   Freeze QRY → Select Miner → Cast Vote → Manage Pool
 *
 * All mutations go through the provider, so wiring real staking is a provider
 * change rather than a rewrite here. Transaction hashes are labelled as
 * simulated: presenting a fake hash as a real on-chain receipt would be
 * actively misleading, and someone will screenshot this.
 */

const STEPS = [
  { step: 1, label: "Freeze Asset" },
  { step: 2, label: "Select Miner" },
  { step: 3, label: "Cast Vote" },
  { step: 4, label: "Manage Pool" },
] as const;

interface ActiveDelegation {
  validator: Validator;
  amountQry: number;
  txHash: string;
}

export function VotingPortal({
  validators,
  preselectedId,
}: {
  validators: Validator[];
  preselectedId?: string;
}) {
  const [step, setStep] = useState(1);
  const [freezeInput, setFreezeInput] = useState("1000");
  const [resources, setResources] = useState({ energy: 0, bandwidth: 0 });
  // Arriving via a "One-Click Delegate" link pre-selects the miner, so after
  // freezing we skip the selection grid and go straight to confirmation.
  const [selected, setSelected] = useState<Validator | null>(
    () => validators.find((v) => v.id === preselectedId) ?? null,
  );
  const [delegation, setDelegation] = useState<ActiveDelegation | null>(null);
  const [autoCompound, setAutoCompound] = useState(true);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const provider = getProvider();
  const amount = Number.parseFloat(freezeInput) || 0;

  async function handleFreeze(event: React.FormEvent) {
    event.preventDefault();
    if (amount <= 0) {
      setError("Enter an amount greater than zero.");
      return;
    }
    setError(null);
    setPending(true);
    try {
      const next = await provider.delegation.freeze(amount);
      setResources(next);
      setStep(selected ? 3 : 2);
    } catch {
      setError("Could not freeze that amount. Try again.");
    } finally {
      setPending(false);
    }
  }

  async function handleCastVote() {
    if (!selected) return;
    setPending(true);
    setError(null);
    try {
      const { txHash } = await provider.delegation.delegate(selected.id, amount);
      setDelegation({ validator: selected, amountQry: amount, txHash });
      setStep(4);
    } catch {
      setError("The delegation could not be submitted.");
    } finally {
      setPending(false);
    }
  }

  async function handleVoteOut() {
    if (!delegation) return;
    setPending(true);
    try {
      await provider.delegation.undelegate(delegation.validator.id);
      setDelegation(null);
      setSelected(null);
      setResources({ energy: 0, bandwidth: 0 });
      setStep(1);
    } catch {
      setError("The undelegation could not be submitted.");
    } finally {
      setPending(false);
    }
  }

  async function handleToggleAutoCompound() {
    const next = !autoCompound;
    setAutoCompound(next);
    if (delegation) {
      await provider.delegation.setAutoCompound(delegation.validator.id, next);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h1 className="text-xl font-bold text-heading">
            Quarry DPoS Stake &amp; Voting Engine
          </h1>
          <p className="mb-8 mt-1 text-xs text-muted">
            Lock your utility assets to generate execution energy, assign block
            weight, and earn network yield.
          </p>

          {/* Step indicator */}
          <ol className="relative mb-8 flex items-center justify-between px-4">
            <div
              className="absolute left-0 right-0 top-4 h-0.5 bg-border"
              aria-hidden="true"
            />
            {STEPS.map((item) => {
              const reached = step >= item.step;
              return (
                <li key={item.step} className="relative flex flex-col items-center">
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors duration-300 ${
                      reached
                        ? "bg-brand text-white"
                        : "bg-border text-muted"
                    }`}
                    aria-current={step === item.step ? "step" : undefined}
                  >
                    {item.step}
                  </span>
                  <span
                    className={`mt-2 text-[11px] font-semibold ${
                      step === item.step ? "text-brand" : "text-muted"
                    }`}
                  >
                    {item.label}
                  </span>
                </li>
              );
            })}
          </ol>

          {error && (
            <p
              role="alert"
              className="mb-4 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-xs font-medium text-danger"
            >
              {error}
            </p>
          )}

          {/* Step 1 — Freeze */}
          {step === 1 && (
            <form onSubmit={handleFreeze} className="animate-fade-in space-y-4">
              {selected && (
                <p className="flex flex-wrap items-center gap-2 rounded-lg border border-brand/20 bg-brand-tint px-4 py-3 text-xs font-medium text-brand">
                  <span className="flex items-center gap-2">
                    <ValidatorIcon
                      name={selected.name}
                      asset={selected.iconAsset}
                      size={20}
                    />
                    Delegating to <strong>{selected.name}</strong> via a shared
                    link.
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelected(null)}
                    className="ml-auto underline underline-offset-2 hover:no-underline"
                  >
                    Choose a different miner
                  </button>
                </p>
              )}
              <div className="rounded-lg border border-border bg-surface p-4">
                <label
                  htmlFor="freeze-amount"
                  className="mb-2 block text-xs font-bold uppercase tracking-wider text-body"
                >
                  Amount of QRY to Freeze
                </label>
                <div className="relative">
                  <input
                    id="freeze-amount"
                    type="number"
                    min="1"
                    value={freezeInput}
                    onChange={(e) => setFreezeInput(e.target.value)}
                    placeholder="Enter token allocation size"
                    className="w-full rounded-lg border border-border-strong bg-card py-3 pl-4 pr-16 text-sm font-semibold text-ink transition-colors focus:border-brand focus:outline-none"
                  />
                  <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-xs font-bold text-muted">
                    QRY
                  </span>
                </div>
                <p className="mt-2 text-[11px] text-muted">
                  Freezing generates Energy and Bandwidth — the resources that
                  carry your vote weight.
                </p>
              </div>
              <button
                type="submit"
                disabled={pending || amount <= 0}
                className="w-full rounded-lg bg-brand py-3 text-sm font-bold text-white transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50"
              >
                {pending ? "Freezing…" : "Generate Energy & Bandwidth"}
              </button>
            </form>
          )}

          {/* Step 2 — Select */}
          {step === 2 && (
            <div className="animate-fade-in space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold uppercase tracking-wider text-body">
                  Select a Target Miner Pool
                </h2>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs text-muted transition-colors hover:text-brand"
                >
                  ← Back
                </button>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {validators.slice(0, 8).map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    // Explicit label: the visible content is split across
                    // nested spans, which does not yield a usable accessible
                    // name for the button.
                    aria-label={`Delegate to ${v.name} — ${v.apyPct}% APY, ${v.host} ${v.region}`}
                    onClick={() => {
                      setSelected(v);
                      setStep(3);
                    }}
                    className="flex items-center justify-between rounded-xl border border-border bg-card p-4 text-left transition-colors hover:border-brand hover:bg-surface"
                  >
                    <span className="flex items-center gap-3">
                      <ValidatorIcon name={v.name} asset={v.iconAsset} size={32} />
                      <span>
                        <span className="block text-sm font-bold text-heading">
                          {v.name}
                        </span>
                        <span className="mt-0.5 inline-block rounded-sm bg-well px-2 py-0.5 text-[10px] font-medium text-body">
                          {v.host} · {v.region}
                        </span>
                      </span>
                    </span>
                    <span className="text-right">
                      <span className="block text-xs font-medium text-muted">
                        Yield Rate
                      </span>
                      <span className="text-sm font-bold text-brand">
                        {v.apyPct}% APY
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3 — Cast */}
          {step === 3 && selected && (
            <div className="animate-fade-in space-y-6 rounded-xl border border-border bg-surface p-6">
              <div className="space-y-2 text-center">
                <span className="inline-flex justify-center">
                  <ValidatorIcon
                    name={selected.name}
                    asset={selected.iconAsset}
                    size={48}
                  />
                </span>
                <h2 className="text-lg font-bold text-heading">
                  Confirm Token Delegation
                </h2>
                <p className="text-xs text-muted">
                  You are allocating security weight to{" "}
                  <span className="font-bold text-heading">{selected.name}</span>.
                </p>
              </div>

              <dl className="divide-y divide-border rounded-lg border border-border bg-card px-4 text-xs">
                <div className="flex justify-between py-3">
                  <dt className="font-medium text-muted">Staked Asset Mass</dt>
                  <dd className="font-mono font-bold tabular-nums text-heading">
                    {formatQry(amount)}
                  </dd>
                </div>
                <div className="flex justify-between py-3">
                  <dt className="font-medium text-muted">
                    Expected Generation Yield
                  </dt>
                  <dd className="font-mono font-bold text-brand">
                    {selected.apyPct}% APY
                  </dd>
                </div>
                <div className="flex justify-between py-3">
                  <dt className="font-medium text-muted">Commission</dt>
                  <dd className="font-mono font-bold text-heading">
                    {selected.commissionPct}%
                  </dd>
                </div>
              </dl>

              <p className="rounded-lg border border-border bg-card px-3 py-2 text-[11px] text-muted">
                Wallet signing arrives in Phase 6. This step currently records the
                delegation locally and returns a simulated transaction hash.
              </p>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex-1 rounded-lg border border-border-strong bg-card py-2.5 text-sm font-bold text-body transition-colors hover:bg-surface"
                >
                  Change Target
                </button>
                <button
                  type="button"
                  onClick={handleCastVote}
                  disabled={pending}
                  className="flex-1 rounded-lg bg-brand py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-hover disabled:opacity-50"
                >
                  {pending ? "Submitting…" : "Submit Vote"}
                </button>
              </div>
            </div>
          )}

          {/* Step 4 — Manage */}
          {step === 4 && delegation && (
            <div className="animate-fade-in space-y-4 rounded-xl border border-success/30 bg-success-tint p-6">
              <div className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-success" />
                  <h2 className="text-sm font-bold uppercase tracking-wider text-success-deep">
                    Active Secure Delegation Link
                  </h2>
                </span>
                <button
                  type="button"
                  onClick={handleVoteOut}
                  disabled={pending}
                  className="rounded-md bg-danger px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-danger-hover disabled:opacity-50"
                >
                  {pending ? "Revoking…" : "Vote Out"}
                </button>
              </div>

              <p className="text-xs text-success-deep/80">
                Your frozen assets are participating in the live network consensus
                topology via{" "}
                <span className="font-bold">{delegation.validator.name}</span>.
              </p>

              <dl className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-lg border border-border bg-card p-3">
                  <dt className="text-muted">Delegated</dt>
                  <dd className="font-mono font-bold text-heading">
                    {formatQry(delegation.amountQry)}
                  </dd>
                </div>
                <div className="rounded-lg border border-border bg-card p-3">
                  <dt className="text-muted">Transaction</dt>
                  <dd className="truncate font-mono text-[11px] text-body">
                    {delegation.txHash.slice(0, 18)}…
                    <span className="ml-1 rounded bg-warning-tint px-1 py-0.5 text-[9px] font-bold uppercase text-warning">
                      simulated
                    </span>
                  </dd>
                </div>
              </dl>
            </div>
          )}
        </div>
      </div>

      <YieldSidebar
        delegatedTo={delegation?.validator ?? null}
        stakeQry={delegation?.amountQry ?? 0}
        energy={resources.energy}
        bandwidth={resources.bandwidth}
        autoCompound={autoCompound}
        onToggleAutoCompound={handleToggleAutoCompound}
      />
    </div>
  );
}
