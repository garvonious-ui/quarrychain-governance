"use client";

import { useState } from "react";
import { getProvider } from "@/lib/providers";
import type { Proposal, ProposalVote } from "@/lib/types";

/**
 * Validator representative governance.
 *
 * Under DPoS the elected 21 act as the governing body, so this panel is only
 * meaningful for elected validators — candidates see it read-only.
 */

const OPTIONS: { value: ProposalVote; label: string; className: string }[] = [
  {
    value: "aye",
    label: "Vote AYE",
    className: "bg-success text-white hover:opacity-90",
  },
  {
    value: "nay",
    label: "Vote NAY",
    className: "bg-danger text-white hover:bg-danger-hover",
  },
  {
    value: "abstain",
    label: "Abstain",
    className:
      "border border-border-strong bg-card text-body hover:bg-surface",
  },
];

export function GovernanceSection({
  proposals,
  canVote,
}: {
  proposals: Proposal[];
  canVote: boolean;
}) {
  const [votes, setVotes] = useState<Record<string, ProposalVote>>({});
  const [pending, setPending] = useState<string | null>(null);

  async function cast(proposalId: string, vote: ProposalVote) {
    setPending(proposalId);
    try {
      await getProvider().governance.castVote(proposalId, vote);
      setVotes((prev) => ({ ...prev, [proposalId]: vote }));
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="space-y-6">
      {!canVote && (
        <p className="rounded-lg border border-warning/30 bg-warning-tint px-4 py-3 text-xs font-medium text-warning">
          Only the elected top-21 vote on protocol proposals. As a candidate you
          can review them, but cannot cast a network-weighted vote.
        </p>
      )}

      {proposals.map((p) => {
        const myVote = votes[p.id];
        const total = p.tally.aye + p.tally.nay + p.tally.abstain;
        return (
          <section
            key={p.id}
            className="rounded-xl border border-border bg-card p-6 shadow-sm"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <span className="font-mono text-[11px] font-bold text-brand">
                  {p.id}
                </span>
                <h2 className="text-base font-bold text-heading">{p.title}</h2>
              </div>
              <span className="rounded-full bg-brand-tint px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-brand">
                {p.status}
              </span>
            </div>

            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-body">
              {p.description}
            </p>

            <div className="mt-4 flex flex-wrap gap-4 text-[11px] text-muted">
              <span>
                Aye <strong className="font-mono text-success">{p.tally.aye}</strong>
              </span>
              <span>
                Nay <strong className="font-mono text-danger">{p.tally.nay}</strong>
              </span>
              <span>
                Abstain{" "}
                <strong className="font-mono text-body">{p.tally.abstain}</strong>
              </span>
              <span>
                of <strong className="font-mono">{total}</strong> validators
              </span>
            </div>

            {canVote && (
              <div className="mt-5 flex flex-wrap gap-3 border-t border-border pt-4">
                {OPTIONS.map((o) => (
                  <button
                    key={o.value}
                    type="button"
                    disabled={pending === p.id}
                    onClick={() => cast(p.id, o.value)}
                    className={`rounded-lg px-4 py-2 text-xs font-bold transition-colors disabled:opacity-50 ${
                      myVote === o.value
                        ? "ring-2 ring-brand ring-offset-2 ring-offset-[var(--card)] "
                        : ""
                    }${o.className}`}
                  >
                    {o.label}
                  </button>
                ))}
                {myVote && (
                  <span className="self-center text-[11px] font-semibold text-success">
                    ✓ Vote recorded: {myVote.toUpperCase()}
                  </span>
                )}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
