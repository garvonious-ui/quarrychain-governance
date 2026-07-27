"use client";

import Link from "next/link";
import { useState } from "react";
import { ConfirmStep, type ConfirmLeg } from "@/components/voting/ConfirmStep";
import { FreezeStep } from "@/components/voting/FreezeStep";
import { SelectStep, type Allocation } from "@/components/voting/SelectStep";
import { energyFor } from "@/lib/voting";
import { getProvider } from "@/lib/providers";
import type { Validator } from "@/lib/types";

/**
 * Module B — the DPoS voting flow, now three steps (Alec's edit):
 *   Freeze → Select (single or split) → Confirm.
 * The old Step 4 (Manage Pool / Active Delegation) moved to the Wallet
 * Dashboard, so submitting sends the user there to manage.
 */

const STEPS = ["Freeze", "Select Miner", "Confirm Vote"] as const;

export function VotingPortal({
  validators,
  preselectedId,
}: {
  validators: Validator[];
  preselectedId?: string;
}) {
  const [step, setStep] = useState(1);
  const [freezeInput, setFreezeInput] = useState("50000");
  const [frozen, setFrozen] = useState(0);
  const [energy, setEnergy] = useState(0);
  const [mode, setMode] = useState<"single" | "split">("single");
  const [singleId, setSingleId] = useState<string | null>(preselectedId ?? null);
  const [allocation, setAllocation] = useState<Allocation>({});
  const [autoCompound, setAutoCompound] = useState(true);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const provider = getProvider();
  const amount = Number.parseFloat(freezeInput) || 0;

  async function handleFreeze() {
    if (amount <= 0) {
      setError("Enter an amount greater than zero.");
      return;
    }
    setError(null);
    setPending(true);
    try {
      await provider.delegation.freeze(amount);
      setFrozen(amount);
      setEnergy(energyFor(amount));
      // A shared "one-click delegate" link jumps straight to confirmation.
      setStep(preselectedId ? 3 : 2);
    } catch {
      setError("Could not freeze that amount. Try again.");
    } finally {
      setPending(false);
    }
  }

  function selectSingle(id: string) {
    setSingleId(id);
    setMode("single");
    setStep(3);
  }

  /** Resolve the current selection into display legs for the confirm step. */
  function buildLegs(): ConfirmLeg[] {
    if (mode === "single") {
      const v = validators.find((x) => x.id === singleId);
      return v ? [{ validator: v, qry: frozen, energy }] : [];
    }
    return Object.entries(allocation)
      .filter(([, points]) => points > 0)
      .map(([id, points]) => {
        const v = validators.find((x) => x.id === id)!;
        return { validator: v, qry: Math.round((frozen * points) / energy), energy: points };
      })
      .filter((l) => l.validator);
  }

  async function handleSubmit() {
    const legs = buildLegs();
    if (legs.length === 0) return;
    setPending(true);
    setError(null);
    try {
      for (const leg of legs) {
        await provider.delegation.delegate(leg.validator.id, leg.qry);
        await provider.delegation.setAutoCompound(leg.validator.id, autoCompound);
      }
      setSubmitted(true);
    } catch {
      setError("The delegation could not be submitted.");
    } finally {
      setPending(false);
    }
  }

  if (submitted) {
    const legs = buildLegs();
    return (
      <div className="mx-auto max-w-xl animate-fade-in rounded-xl border border-success/30 bg-card p-8 text-center shadow-sm">
        <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-success-tint text-xl text-success-deep">
          ✓
        </span>
        <h1 className="text-xl font-bold text-heading">Delegation submitted</h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted">
          You delegated to{" "}
          <strong className="text-heading">
            {legs.length === 1 ? legs[0].validator.name : `${legs.length} miners`}
          </strong>
          . Manage or revoke it any time from your Quarry Wallet.
        </p>
        <Link
          href="/wallet"
          className="mt-6 inline-block rounded-lg bg-brand px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-hover"
        >
          Go to Quarry Wallet →
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Step indicator */}
      <ol className="relative flex items-center justify-between px-4">
        <div className="absolute left-0 right-0 top-4 h-0.5 bg-border" aria-hidden="true" />
        {STEPS.map((label, i) => {
          const n = i + 1;
          return (
            <li key={label} className="relative flex flex-col items-center">
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                  step >= n ? "bg-brand text-white" : "bg-border text-muted"
                }`}
                aria-current={step === n ? "step" : undefined}
              >
                {n}
              </span>
              <span
                className={`mt-2 text-[11px] font-semibold ${
                  step === n ? "text-brand" : "text-muted"
                }`}
              >
                {label}
              </span>
            </li>
          );
        })}
      </ol>

      {error && (
        <p
          role="alert"
          className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-xs font-medium text-danger"
        >
          {error}
        </p>
      )}

      {step === 1 && (
        <FreezeStep
          value={freezeInput}
          onChange={setFreezeInput}
          onSubmit={handleFreeze}
          pending={pending}
        />
      )}

      {step === 2 && (
        <SelectStep
          validators={validators}
          frozen={frozen}
          energy={energy}
          mode={mode}
          onModeChange={setMode}
          allocation={allocation}
          onAllocationChange={setAllocation}
          onSelectSingle={selectSingle}
          onBack={() => setStep(1)}
          onContinue={() => setStep(3)}
        />
      )}

      {step === 3 && (
        <ConfirmStep
          legs={buildLegs()}
          autoCompound={autoCompound}
          onToggleAutoCompound={() => setAutoCompound((v) => !v)}
          onBack={() => setStep(preselectedId ? 1 : 2)}
          onSubmit={handleSubmit}
          pending={pending}
        />
      )}
    </div>
  );
}
