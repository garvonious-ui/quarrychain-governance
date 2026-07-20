"use client";

import Link from "next/link";
import { useState } from "react";
import { ConnectionCheck } from "@/components/onboarding/ConnectionCheck";
import { NodeCommandBlock } from "@/components/onboarding/NodeCommandBlock";
import { MIN_SELF_BOND_QRY } from "@/lib/chain";
import { formatQry } from "@/lib/format";
import { getProvider } from "@/lib/providers";
import type { ServerHost } from "@/lib/types";

/**
 * Module C — the "Become a Quarry Miner" onboarding wizard.
 *
 *   1. Profile & Branding
 *   2. Infrastructure Connection Config  (real RPC verification)
 *   3. Collateral Lockup
 *
 * Registration on this chain is a Cosmos `create-validator` message carrying an
 * ed25519 consensus pubkey plus a native self-delegation — NOT an ERC-20
 * registry contract, despite the spec's wording. Step 3 collects what that
 * message needs and submits the candidacy for Phase-1 manual approval.
 * See docs/integration.md.
 */

const HOSTS: { value: ServerHost; label: string }[] = [
  { value: "AWS", label: "AWS Server Cluster" },
  { value: "IONOS", label: "IONOS Cloud Stack" },
  { value: "BareMetal", label: "Custom Bare Metal Host" },
];

const STEPS = ["Profile & Branding", "Connection Config", "Collateral Lockup"];

export function OnboardingWizard() {
  const [step, setStep] = useState(1);

  // Step 1
  const [minerName, setMinerName] = useState("");
  const [website, setWebsite] = useState("");
  const [xHandle, setXHandle] = useState("");
  const [discord, setDiscord] = useState("");
  const [description, setDescription] = useState("");

  // Step 2
  const [host, setHost] = useState<ServerHost>("IONOS");
  const [peerId, setPeerId] = useState("");
  const [consensusKey, setConsensusKey] = useState("");
  const [nodeVerified, setNodeVerified] = useState(false);

  // Step 3
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const provider = getProvider();
  const command = provider.onboarding.buildNodeCommand(host);

  const step1Complete = minerName.trim().length > 0;
  const step2Complete =
    nodeVerified && peerId.trim().length > 0 && consensusKey.trim().length > 0;

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    try {
      const { id } = await provider.onboarding.submitApplication({
        minerName,
        website,
        description,
        socials: { x: xHandle || undefined, discord: discord || undefined },
        host,
        nodePeerId: peerId,
        consensusPubkey: consensusKey,
        selfBondQry: MIN_SELF_BOND_QRY,
      });
      setSubmitted(id);
    } catch {
      setError("Could not submit your candidacy. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-xl animate-fade-in rounded-xl border border-success/30 bg-card p-8 text-center shadow-sm">
        <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-success-tint text-xl text-success-deep">
          ✓
        </span>
        <h1 className="text-xl font-bold text-heading">Candidacy submitted</h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted">
          <strong className="text-heading">{minerName}</strong> has been submitted
          for QuarryLabs review. During Phase 1, validator admission is manually
          permissioned — you&apos;ll enter the candidate set once approved.
        </p>
        <p className="mt-4 rounded-lg border border-border bg-surface px-3 py-2 font-mono text-[11px] text-body">
          Reference: {submitted}
        </p>
        <Link
          href="/miner"
          className="mt-6 inline-block rounded-lg bg-brand px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-hover"
        >
          Go to your node dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="rounded-xl border border-border bg-card p-8 shadow-sm">
        <div className="border-b border-border pb-4">
          <h1 className="text-xl font-bold text-heading">
            Quarry Miner Onboarding Portal
          </h1>
          <p className="mt-1 text-xs text-muted">
            Provision hardware, verify your node against the live testnet, and
            commit collateral to enter the active consensus set.
          </p>
        </div>

        {/* Step indicator */}
        <ol className="flex items-center justify-between gap-2 py-5 text-xs font-semibold text-muted">
          {STEPS.map((label, i) => (
            <li key={label} className="flex items-center gap-2">
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold ${
                  step > i + 1
                    ? "bg-success text-white"
                    : step === i + 1
                      ? "bg-brand text-white"
                      : "bg-border text-muted"
                }`}
              >
                {step > i + 1 ? "✓" : i + 1}
              </span>
              <span className={step === i + 1 ? "text-brand" : ""}>{label}</span>
            </li>
          ))}
        </ol>

        {error && (
          <p
            role="alert"
            className="mb-4 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-xs font-medium text-danger"
          >
            {error}
          </p>
        )}

        {/* Step 1 — Profile & Branding */}
        {step === 1 && (
          <div className="animate-fade-in space-y-4">
            <Field
              id="miner-name"
              label="Miner Identification Name"
              value={minerName}
              onChange={setMinerName}
              placeholder="e.g., Global Mining Group"
              required
            />
            <Field
              id="miner-website"
              label="Website URL"
              value={website}
              onChange={setWebsite}
              placeholder="https://yournode.io"
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                id="miner-x"
                label="X (Twitter)"
                value={xHandle}
                onChange={setXHandle}
                placeholder="@yournode"
              />
              <Field
                id="miner-discord"
                label="Discord"
                value={discord}
                onChange={setDiscord}
                placeholder="discord.gg/…"
              />
            </div>
            <div className="space-y-1">
              <label
                htmlFor="miner-description"
                className="text-[11px] font-bold uppercase tracking-wider text-body"
              >
                On-Chain Node Description
              </label>
              <textarea
                id="miner-description"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Who you are and how you run your infrastructure. Shown on your public miner profile."
                className="w-full rounded-lg border border-border-strong bg-card px-3 py-2 text-sm text-ink transition-colors focus:border-brand focus:outline-none"
              />
            </div>

            <p className="text-[11px] text-muted">
              Logo upload lands with the campaign hub — drop assets in later from
              your node dashboard.
            </p>

            <button
              type="button"
              disabled={!step1Complete}
              onClick={() => setStep(2)}
              className="w-full rounded-lg bg-brand py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50"
            >
              Continue to Node Configuration
            </button>
          </div>
        )}

        {/* Step 2 — Infrastructure */}
        {step === 2 && (
          <div className="animate-fade-in space-y-4">
            <div className="space-y-1">
              <label
                htmlFor="server-host"
                className="text-[11px] font-bold uppercase tracking-wider text-body"
              >
                Server Host
              </label>
              <select
                id="server-host"
                value={host}
                onChange={(e) => setHost(e.target.value as ServerHost)}
                className="w-full rounded-lg border border-border-strong bg-card px-3 py-2 text-sm text-ink transition-colors focus:border-brand focus:outline-none"
              >
                {HOSTS.map((h) => (
                  <option key={h.value} value={h.value}>
                    {h.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-body">
                Node Deployment Command
              </span>
              <NodeCommandBlock command={command} />
            </div>

            <Field
              id="peer-id"
              label="Node Peer ID"
              value={peerId}
              onChange={setPeerId}
              placeholder="12D3KooW…"
              mono
            />
            <Field
              id="consensus-key"
              label="Consensus Public Key (ed25519)"
              value={consensusKey}
              onChange={setConsensusKey}
              placeholder="quarryvalconspub1… — from `tendermint show-validator`"
              mono
            />

            <div className="rounded-lg border border-border bg-surface p-4">
              <ConnectionCheck onVerified={setNodeVerified} />
            </div>

            <div className="flex gap-3 border-t border-border pt-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="rounded-lg border border-border-strong bg-card px-4 py-2 text-sm font-bold text-body transition-colors hover:bg-surface"
              >
                Back
              </button>
              <button
                type="button"
                disabled={!step2Complete}
                onClick={() => setStep(3)}
                className="flex-1 rounded-lg bg-brand py-2 text-sm font-bold text-white transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50"
              >
                Continue to Collateral Lockup
              </button>
            </div>
            {!step2Complete && (
              <p className="text-[11px] text-muted">
                A verified node connection, Peer ID, and consensus key are all
                required before staking collateral.
              </p>
            )}
          </div>
        )}

        {/* Step 3 — Collateral */}
        {step === 3 && (
          <div className="animate-fade-in space-y-5">
            <div className="rounded-xl border border-border bg-surface p-5 text-center">
              <span className="block text-[11px] uppercase tracking-wide text-muted">
                Required Self-Bond
              </span>
              <span className="font-mono text-3xl font-bold tabular-nums text-heading">
                {formatQry(MIN_SELF_BOND_QRY)}
              </span>
              <p className="mx-auto mt-2 max-w-sm text-[11px] text-muted">
                Locked as your validator collateral. Slashable for double-signing
                or sustained downtime.
              </p>
            </div>

            <dl className="divide-y divide-border rounded-lg border border-border bg-card px-4 text-xs">
              <Row label="Miner" value={minerName} />
              <Row label="Infrastructure" value={host} />
              <Row label="Node verified" value="Yes — synced with testnet" />
              <Row label="Admission" value="Phase 1 — manual approval" />
            </dl>

            <p className="rounded-lg border border-warning/30 bg-warning-tint px-3 py-2 text-[11px] font-medium text-warning">
              Wallet connection and on-chain staking arrive in Phase 6. This step
              records your candidacy and the parameters for the
              <code className="mx-1 font-mono">create-validator</code>
              transaction; no funds move yet.
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="rounded-lg border border-border-strong bg-card px-4 py-2 text-sm font-bold text-body transition-colors hover:bg-surface"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 rounded-lg bg-brand py-2 text-sm font-bold text-white transition-colors hover:bg-brand-hover disabled:opacity-50"
              >
                {submitting ? "Submitting…" : "Lock Collateral & Submit Candidacy"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  placeholder,
  required,
  mono,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  mono?: boolean;
}) {
  return (
    <div className="space-y-1">
      <label
        htmlFor={id}
        className="text-[11px] font-bold uppercase tracking-wider text-body"
      >
        {label}
        {required && <span className="ml-1 text-danger">*</span>}
      </label>
      <input
        id={id}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full rounded-lg border border-border-strong bg-card px-3 py-2 text-sm text-ink transition-colors focus:border-brand focus:outline-none ${
          mono ? "font-mono" : ""
        }`}
      />
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 py-2.5">
      <dt className="text-muted">{label}</dt>
      <dd className="font-medium text-heading">{value}</dd>
    </div>
  );
}
