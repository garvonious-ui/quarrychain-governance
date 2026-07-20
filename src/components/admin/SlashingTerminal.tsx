"use client";

import { useState } from "react";
import { formatQry } from "@/lib/format";
import { getProvider } from "@/lib/providers";
import {
  BURN_ADDRESS,
  BURN_DISCLOSURE,
  penaltyAmount,
  SLASH_PRESETS,
} from "@/lib/slashing";
import type { InfractionKind, Validator } from "@/lib/types";

/**
 * Emergency Action Terminal — the slashing console.
 *
 * This is the most destructive surface in the app: it burns a validator's
 * collateral and permanently reduces QRY supply. Two deliberate guardrails:
 *
 *  1. Confirmation requires TYPING the validator's name. A second click is too
 *     easy to fire by muscle memory, and this action is irreversible.
 *  2. The confirmation modal restates the exact burn amount and the resulting
 *     supply reduction, rather than a generic "are you sure?".
 *
 * Selecting an infraction sets the spec's preset penalty; the operator can
 * override it, but the override is always visible next to the preset so a
 * non-standard penalty can't be applied without it being obvious.
 */
export function SlashingTerminal({
  validators,
  onSlashed,
}: {
  validators: Validator[];
  onSlashed: (validatorId: string, penaltyPct: number) => void;
}) {
  const [targetId, setTargetId] = useState<string>("");
  const [infraction, setInfraction] = useState<InfractionKind>("downtime");
  const [penaltyPct, setPenaltyPct] = useState<number>(
    SLASH_PRESETS.downtime.penaltyPct,
  );
  const [confirming, setConfirming] = useState(false);
  const [typed, setTyped] = useState("");
  const [executing, setExecuting] = useState(false);

  const target = validators.find((v) => v.id === targetId) ?? null;
  const preset = SLASH_PRESETS[infraction];
  const burn = target ? penaltyAmount(target.selfBond, penaltyPct) : 0;
  const isOverridden = penaltyPct !== preset.penaltyPct;
  const typedMatches = target !== null && typed.trim() === target.name;

  function selectInfraction(kind: InfractionKind) {
    setInfraction(kind);
    setPenaltyPct(SLASH_PRESETS[kind].penaltyPct);
  }

  async function execute() {
    if (!target || !typedMatches) return;
    setExecuting(true);
    try {
      await getProvider().admin.slashAndEvict(target.id, penaltyPct);
      onSlashed(target.id, penaltyPct);
      setConfirming(false);
      setTyped("");
      setTargetId("");
    } finally {
      setExecuting(false);
    }
  }

  return (
    <section className="rounded-xl border border-danger/40 bg-card p-5 shadow-sm">
      <h2 className="text-sm font-bold uppercase tracking-wider text-danger">
        Emergency Action Terminal
      </h2>
      <p className="mt-1 text-[11px] text-muted">
        Slashing permanently burns collateral. Actions here are irreversible.
      </p>

      <div className="mt-4 space-y-4">
        {/* Target */}
        <div className="space-y-1">
          <label
            htmlFor="slash-target"
            className="text-[11px] font-bold uppercase tracking-wider text-body"
          >
            Target Validator
          </label>
          <select
            id="slash-target"
            value={targetId}
            onChange={(e) => setTargetId(e.target.value)}
            className="w-full rounded-lg border border-border-strong bg-card px-3 py-2 text-sm text-ink focus:border-brand focus:outline-none"
          >
            <option value="">Select a validator…</option>
            {validators.map((v) => (
              <option key={v.id} value={v.id}>
                #{v.rank} — {v.name}
              </option>
            ))}
          </select>
        </div>

        {/* Infraction */}
        <div className="space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-body">
            Infraction Classification
          </span>
          <div className="space-y-1.5">
            {Object.values(SLASH_PRESETS).map((p) => (
              <label
                key={p.kind}
                className={`flex cursor-pointer items-start gap-2.5 rounded-lg border p-2.5 transition-colors ${
                  infraction === p.kind
                    ? "border-danger bg-danger/5"
                    : "border-border hover:border-border-strong"
                }`}
              >
                <input
                  type="radio"
                  name="infraction"
                  value={p.kind}
                  checked={infraction === p.kind}
                  onChange={() => selectInfraction(p.kind)}
                  className="mt-0.5 accent-danger"
                />
                <span>
                  <span className="block text-xs font-bold text-heading">
                    {p.label}
                  </span>
                  <span className="block text-[11px] text-muted">
                    {p.penaltyPct}% of self-bond · {p.action}
                  </span>
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Penalty override */}
        <div className="space-y-1">
          <label
            htmlFor="penalty-slider"
            className="text-[11px] font-bold uppercase tracking-wider text-body"
          >
            Penalty Override
          </label>
          <div className="flex items-center gap-3">
            <input
              id="penalty-slider"
              type="range"
              min={1}
              max={100}
              value={penaltyPct}
              onChange={(e) => setPenaltyPct(Number(e.target.value))}
              className="h-2 flex-1 cursor-pointer appearance-none rounded-full bg-well accent-danger"
            />
            <span className="w-12 text-right font-mono text-lg font-bold tabular-nums text-danger">
              {penaltyPct}%
            </span>
          </div>
          {isOverridden && (
            <p className="rounded border border-warning/40 bg-warning-tint px-2 py-1 text-[10px] font-bold text-warning">
              Overridden — {preset.label} preset is {preset.penaltyPct}%
            </p>
          )}
        </div>

        {/* Burn calculator */}
        <div className="rounded-lg border border-border bg-surface p-3">
          <span className="block text-[11px] font-bold uppercase tracking-wider text-body">
            Burn Calculator
          </span>
          <dl className="mt-2 divide-y divide-border text-[11px]">
            <div className="flex justify-between py-1.5">
              <dt className="text-muted">Validator Starting Balance</dt>
              <dd className="font-mono font-bold text-heading">
                {target ? formatQry(target.selfBond) : "—"}
              </dd>
            </div>
            <div className="flex justify-between py-1.5">
              <dt className="text-muted">Penalized Deductions</dt>
              <dd className="font-mono font-bold text-danger">
                {target ? `−${formatQry(burn)}` : "—"}
              </dd>
            </div>
            <div className="flex justify-between py-1.5">
              <dt className="text-muted">Total Global Supply Reduction</dt>
              <dd className="font-mono font-bold text-danger">
                {target ? `−${formatQry(burn)}` : "—"}
              </dd>
            </div>
          </dl>
          <p className="mt-2 text-[10px] leading-relaxed text-muted">
            {BURN_DISCLOSURE}
          </p>
        </div>

        <button
          type="button"
          disabled={!target}
          onClick={() => setConfirming(true)}
          className="w-full rounded-lg bg-danger py-3 text-sm font-bold text-white transition-colors hover:bg-danger-hover disabled:cursor-not-allowed disabled:opacity-40"
        >
          Execute Slash &amp; Evict
        </button>
      </div>

      {/* Double confirmation */}
      {confirming && target && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="slash-confirm-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
        >
          <div className="w-full max-w-md rounded-xl border border-danger/50 bg-card p-6 shadow-xl">
            <h3
              id="slash-confirm-title"
              className="text-base font-bold text-danger"
            >
              Confirm irreversible action
            </h3>
            <p className="mt-2 text-xs text-body">
              This will burn{" "}
              <strong className="font-mono text-danger">{formatQry(burn)}</strong>{" "}
              from <strong className="text-heading">{target.name}</strong>,
              permanently reducing global QRY supply, and{" "}
              {preset.action.toLowerCase()}.
            </p>

            <dl className="mt-4 divide-y divide-border rounded-lg border border-border bg-surface px-3 text-[11px]">
              <div className="flex justify-between py-2">
                <dt className="text-muted">Infraction</dt>
                <dd className="font-medium text-heading">{preset.label}</dd>
              </div>
              <div className="flex justify-between py-2">
                <dt className="text-muted">Penalty applied</dt>
                <dd className="font-mono font-bold text-danger">
                  {penaltyPct}%{isOverridden && " (overridden)"}
                </dd>
              </div>
              <div className="flex justify-between py-2">
                <dt className="text-muted">Burn address</dt>
                <dd className="truncate font-mono text-[10px] text-body">
                  {BURN_ADDRESS}
                </dd>
              </div>
            </dl>

            <label
              htmlFor="slash-typed"
              className="mt-4 block text-[11px] font-medium text-body"
            >
              Type <strong className="font-mono text-heading">{target.name}</strong>{" "}
              to confirm
            </label>
            <input
              id="slash-typed"
              type="text"
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              autoComplete="off"
              className="mt-1 w-full rounded-lg border border-border-strong bg-card px-3 py-2 font-mono text-sm text-ink focus:border-danger focus:outline-none"
            />

            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setConfirming(false);
                  setTyped("");
                }}
                className="flex-1 rounded-lg border border-border-strong bg-card py-2.5 text-sm font-bold text-body transition-colors hover:bg-surface"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!typedMatches || executing}
                onClick={execute}
                className="flex-1 rounded-lg bg-danger py-2.5 text-sm font-bold text-white transition-colors hover:bg-danger-hover disabled:cursor-not-allowed disabled:opacity-40"
              >
                {executing ? "Executing…" : `Burn ${formatQry(burn)}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
