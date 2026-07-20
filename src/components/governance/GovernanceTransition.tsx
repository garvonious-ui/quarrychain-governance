"use client";

import { useState } from "react";

/**
 * QuarryChain Governance Transition + Maturity stepper.
 *
 * Sourced from a diagram embedded as an IMAGE in the VibeCode prompt doc, which
 * text extraction had silently dropped — so this arrived later than the rest of
 * the spec. It models how a protocol change reaches the network as governance
 * matures from QuarryLabs control to full on-chain DPoS.
 *
 * The image only pinned down Phase 2 ("Hybrid · Multi-Sig / Soft Voting ·
 * Shared Authority"). Phases 1 and 3 are derived from the three paths shown in
 * the diagram and the spec's repeated framing of Phase 1 as manual
 * permissioning. Worth confirming with the protocol team before it's treated
 * as authoritative.
 */

interface Phase {
  id: 1 | 2 | 3;
  label: string;
  securityModel: string;
  governance: string;
  /** Which of the three change paths are live at this maturity level. */
  activePaths: PathId[];
}

type PathId = "admin" | "signaling" | "onchain";

const PATHS: { id: PathId; request: string; execution: string }[] = [
  {
    id: "admin",
    request: "Admin Secret Key Signature",
    execution: "Manual Binary Deployment",
  },
  {
    id: "signaling",
    request: "Validator Signaling (72h)",
    execution: "Admin 'Kill-Switch' Review",
  },
  {
    id: "onchain",
    request: "On-Chain Stake Voting",
    execution: "Automated Smart Contract Execution",
  },
];

const PHASES: Phase[] = [
  {
    id: 1,
    label: "Phase 1: Manual",
    securityModel: "Admin Key / Manual",
    governance: "QuarryLabs Authority",
    activePaths: ["admin"],
  },
  {
    id: 2,
    label: "Phase 2: Hybrid",
    securityModel: "Multi-Sig / Soft Voting",
    governance: "Shared Authority",
    activePaths: ["admin", "signaling"],
  },
  {
    id: 3,
    label: "Phase 3: Autonomous",
    securityModel: "On-Chain Consensus",
    governance: "Full DPoS",
    activePaths: ["signaling", "onchain"],
  },
];

export function GovernanceTransition() {
  const [index, setIndex] = useState(1); // default to Phase 2, as the source diagram showed
  const phase = PHASES[index];

  const step = (delta: number) =>
    setIndex((i) => Math.min(PHASES.length - 1, Math.max(0, i + delta)));

  return (
    <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="border-b border-border pb-4">
        <h2 className="text-lg font-bold text-heading">
          QuarryChain Governance Transition
        </h2>
        <p className="mt-0.5 text-xs text-muted">
          How a protocol change reaches the network as governance matures.
        </p>
      </div>

      {/* Flow diagram */}
      <div className="py-6">
        <div className="mx-auto max-w-3xl">
          <p className="mx-auto w-fit rounded-lg border border-border bg-surface px-5 py-2.5 text-center text-xs font-bold text-heading">
            Protocol Change Request
          </p>

          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {PATHS.map((p) => {
              const active = phase.activePaths.includes(p.id);
              return (
                <div
                  key={p.id}
                  className={`space-y-2 transition-opacity duration-300 ${
                    active ? "opacity-100" : "opacity-35"
                  }`}
                >
                  <div
                    className="mx-auto h-4 w-px bg-border"
                    aria-hidden="true"
                  />
                  <p
                    className={`rounded-lg border px-3 py-2.5 text-center text-[11px] font-semibold ${
                      active
                        ? "border-brand/40 bg-brand-tint text-brand"
                        : "border-border bg-surface text-muted"
                    }`}
                  >
                    {p.request}
                  </p>
                  <div
                    className="mx-auto h-4 w-px bg-border"
                    aria-hidden="true"
                  />
                  <p className="rounded-lg border border-border bg-surface px-3 py-2.5 text-center text-[11px] font-medium text-body">
                    {p.execution}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="mx-auto mt-4 h-4 w-px bg-border" aria-hidden="true" />
          <p className="mx-auto w-fit rounded-lg bg-brand px-6 py-2.5 text-center text-xs font-bold text-white">
            New Network State
          </p>
        </div>
      </div>

      {/* Maturity stepper */}
      <div className="border-t border-border pt-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="text-center sm:text-left">
            <span className="block text-[10px] uppercase tracking-wide text-muted">
              Security Model
            </span>
            <span className="font-mono text-sm font-bold text-heading">
              {phase.securityModel}
            </span>
          </div>
          <div className="text-center sm:text-right">
            <span className="block text-[10px] uppercase tracking-wide text-muted">
              Governance
            </span>
            <span className="font-mono text-sm font-bold text-heading">
              {phase.governance}
            </span>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <span className="hidden text-[10px] uppercase tracking-wide text-muted sm:block">
            Governance Maturity
          </span>
          <div className="flex flex-1 items-center gap-1">
            <button
              type="button"
              onClick={() => step(-1)}
              disabled={index === 0}
              aria-label="Previous governance phase"
              className="rounded-l-lg border border-border bg-surface px-3 py-2 text-sm text-body transition-colors hover:text-brand disabled:opacity-30"
            >
              ‹
            </button>
            <span
              aria-live="polite"
              className="flex-1 bg-surface py-2 text-center font-mono text-sm font-bold text-heading"
            >
              {phase.label}
            </span>
            <button
              type="button"
              onClick={() => step(1)}
              disabled={index === PHASES.length - 1}
              aria-label="Next governance phase"
              className="rounded-r-lg border border-border bg-surface px-3 py-2 text-sm text-body transition-colors hover:text-brand disabled:opacity-30"
            >
              ›
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
