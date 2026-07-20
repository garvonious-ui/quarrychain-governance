"use client";

import Link from "next/link";
import { useState } from "react";
import { SlashingTerminal } from "@/components/admin/SlashingTerminal";
import { useAdminAccess } from "@/hooks/useAdminAccess";
import { ACTIVE_SET_SIZE, MIN_SELF_BOND_QRY } from "@/lib/chain";
import { formatNumber, formatQry } from "@/lib/format";
import { getProvider } from "@/lib/providers";
import { SLASH_PRESETS } from "@/lib/slashing";
import type { Validator, ValidatorApplication } from "@/lib/types";

/**
 * QuarryLabs Admin Control Panel (Phase 1 manual permissioning).
 *
 * ⚠️ The gate on this page is COSMETIC. It reads a browser flag, not a wallet.
 * Every action here — approving a candidate, jailing a node, burning
 * collateral — must be authorised server-side once the backend exists. The
 * harness bar says so on screen so the limitation travels with the screenshot.
 */

type NodeState = "producing" | "missed" | "jailed" | "evicted";

function nodeState(
  v: Validator,
  jailed: Set<string>,
  evicted: Set<string>,
): NodeState {
  if (evicted.has(v.id)) return "evicted";
  if (jailed.has(v.id)) return "jailed";
  return v.missedBlocks > 0 ? "missed" : "producing";
}

const STATE_STYLE: Record<NodeState, { dot: string; label: string }> = {
  producing: { dot: "bg-success", label: "Producing blocks" },
  missed: { dot: "bg-warning", label: "Missed blocks" },
  jailed: { dot: "bg-danger", label: "Jailed" },
  evicted: { dot: "bg-faint", label: "Evicted" },
};

export function AdminConsole({
  validators,
  applications,
}: {
  validators: Validator[];
  applications: ValidatorApplication[];
}) {
  const { isAdmin, setAdmin } = useAdminAccess();
  const [jailed, setJailed] = useState<Set<string>>(new Set());
  const [evicted, setEvicted] = useState<Set<string>>(new Set());
  const [approved, setApproved] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState<string | null>(null);
  const [burnedTotal, setBurnedTotal] = useState(0);

  const harness = (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-warning/40 bg-warning-tint px-4 py-2.5">
      <span className="text-[11px] font-bold uppercase tracking-wider text-warning">
        Dev harness — this admin gate is cosmetic, not access control
      </span>
      <button
        type="button"
        onClick={() => setAdmin(!isAdmin)}
        className="ml-auto rounded bg-warning px-2.5 py-1 text-[11px] font-bold text-black"
      >
        {isAdmin ? "Drop admin access" : "Simulate admin wallet"}
      </button>
    </div>
  );

  if (!isAdmin) {
    return (
      <div className="space-y-6">
        {harness}
        <div className="mx-auto max-w-lg rounded-xl border border-border bg-card p-8 text-center shadow-sm">
          <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-danger/10 text-xl text-danger">
            ⛔
          </span>
          <h1 className="text-xl font-bold text-heading">Restricted</h1>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
            The QuarryLabs control panel is limited to authorised deployer
            wallets.
          </p>
          <Link
            href="/governance"
            className="mt-6 inline-block rounded-lg border border-border-strong bg-card px-5 py-2.5 text-sm font-bold text-body transition-colors hover:bg-surface"
          >
            Back to governance
          </Link>
        </div>
      </div>
    );
  }

  async function jailNode(v: Validator) {
    setBusy(v.id);
    try {
      await getProvider().admin.jail(v.id);
      setJailed((prev) => new Set(prev).add(v.id));
    } finally {
      setBusy(null);
    }
  }

  async function approve(app: ValidatorApplication) {
    setBusy(app.minerName);
    try {
      await getProvider().admin.approveApplication(app.minerName);
      setApproved((prev) => new Set(prev).add(app.minerName));
    } finally {
      setBusy(null);
    }
  }

  function handleSlashed(validatorId: string, penaltyPct: number) {
    const v = validators.find((x) => x.id === validatorId);
    if (v) setBurnedTotal((t) => t + Math.round(v.selfBond * (penaltyPct / 100)));
    setEvicted((prev) => new Set(prev).add(validatorId));
    setJailed((prev) => {
      const next = new Set(prev);
      next.delete(validatorId);
      return next;
    });
  }

  const activeCount = validators.filter((v) => !evicted.has(v.id)).length;

  return (
    <div className="space-y-6">
      {harness}

      {/* Status banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-danger/40 bg-danger/5 px-5 py-3">
        <span className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-danger" />
          <span className="text-xs font-bold uppercase tracking-wider text-danger">
            Admin Active — Phase 1 Manual Control
          </span>
        </span>
        <span className="font-mono text-[11px] text-muted">
          {activeCount}/{ACTIVE_SET_SIZE} validators active
          {burnedTotal > 0 && ` · ${formatQry(burnedTotal)} burned this session`}
        </span>
      </div>

      <div className="grid gap-6 xl:grid-cols-[260px_1fr_360px]">
        {/* Left — global parameters */}
        <aside className="space-y-6">
          <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <h2 className="text-sm font-bold uppercase tracking-wider text-body">
              Global Network Parameters
            </h2>
            <dl className="mt-3 divide-y divide-border text-[11px]">
              {[
                ["Active set size", String(ACTIVE_SET_SIZE)],
                ["Min self-bond", formatQry(MIN_SELF_BOND_QRY)],
                ["Downtime penalty", `${SLASH_PRESETS.downtime.penaltyPct}%`],
                ["Double-sign penalty", `${SLASH_PRESETS.double_sign.penaltyPct}%`],
                ["Malicious penalty", `${SLASH_PRESETS.malicious.penaltyPct}%`],
                ["Admission", "Manual (Phase 1)"],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between gap-2 py-2">
                  <dt className="text-muted">{label}</dt>
                  <dd className="font-mono font-bold text-heading">{value}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-3 text-[10px] text-muted">
              Parameters are read-only here. Changing them is a governance
              proposal, not an admin action.
            </p>
          </section>

          {/* Candidate approvals */}
          <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <h2 className="text-sm font-bold uppercase tracking-wider text-body">
              Pending Candidacies
            </h2>
            <p className="mt-1 text-[11px] text-muted">
              {applications.length} awaiting authorisation
            </p>
            <ul className="mt-3 space-y-3">
              {applications.map((app) => {
                const done = approved.has(app.minerName);
                return (
                  <li
                    key={app.minerName}
                    className="rounded-lg border border-border bg-surface p-3"
                  >
                    <span className="block text-xs font-bold text-heading">
                      {app.minerName}
                    </span>
                    <span className="mt-0.5 block text-[10px] text-muted">
                      {app.host} · {formatQry(app.selfBondQry)} self-bond
                    </span>
                    <button
                      type="button"
                      disabled={done || busy === app.minerName}
                      onClick={() => approve(app)}
                      className="mt-2 w-full rounded-md bg-brand py-1.5 text-[11px] font-bold text-white transition-colors hover:bg-brand-hover disabled:opacity-50"
                    >
                      {done
                        ? "✓ Authorized"
                        : busy === app.minerName
                          ? "Authorizing…"
                          : "Approve & Authorize"}
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        </aside>

        {/* Middle — validator registry */}
        <section className="rounded-xl border border-border bg-card shadow-sm">
          <div className="border-b border-border px-5 py-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-body">
              Active Validator Registry
            </h2>
            <p className="mt-0.5 text-[11px] text-muted">
              Status and manual overrides for the consensus set.
            </p>
          </div>
          <ul className="divide-y divide-border">
            {validators.map((v) => {
              const state = nodeState(v, jailed, evicted);
              const style = STATE_STYLE[state];
              const gone = state === "evicted";
              return (
                <li
                  key={v.id}
                  className={`flex flex-wrap items-center gap-3 px-5 py-3 ${
                    gone ? "opacity-50" : ""
                  }`}
                >
                  <span
                    className={`h-2.5 w-2.5 shrink-0 rounded-full ${style.dot}`}
                    title={style.label}
                    aria-label={style.label}
                  />
                  <span className="font-mono text-[11px] text-muted">
                    #{v.rank}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-xs font-semibold text-heading">
                    {v.name}
                  </span>
                  <span className="font-mono text-[11px] text-muted">
                    {formatNumber(v.votes)} QRY
                  </span>
                  <span className="w-24 text-right text-[10px] text-muted">
                    {style.label}
                  </span>
                  <button
                    type="button"
                    disabled={gone || jailed.has(v.id) || busy === v.id}
                    onClick={() => jailNode(v)}
                    className="rounded-md border border-border-strong bg-card px-2.5 py-1 text-[11px] font-bold text-body transition-colors hover:border-danger hover:text-danger disabled:opacity-40"
                  >
                    {jailed.has(v.id)
                      ? "Jailed"
                      : busy === v.id
                        ? "…"
                        : "Jail Node"}
                  </button>
                </li>
              );
            })}
          </ul>
          <p className="border-t border-border px-5 py-3 text-[10px] text-muted">
            Jailing suspends block production for downtime. It is reversible;
            slashing is not.
          </p>
        </section>

        {/* Right — emergency terminal */}
        <SlashingTerminal
          validators={validators.filter((v) => !evicted.has(v.id))}
          onSlashed={handleSlashed}
        />
      </div>
    </div>
  );
}
