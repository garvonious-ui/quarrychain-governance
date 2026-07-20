"use client";

import Link from "next/link";
import { useState } from "react";
import { DevHarnessBar } from "@/components/dev/DevHarnessBar";
import { ValidatorIcon } from "@/components/governance/ValidatorIcon";
import { CampaignHubSection } from "@/components/miner/sections/CampaignHubSection";
import { GovernanceSection } from "@/components/miner/sections/GovernanceSection";
import { OverviewSection } from "@/components/miner/sections/OverviewSection";
import { ServerAnalyticsSection } from "@/components/miner/sections/ServerAnalyticsSection";
import { StakingPoolSection } from "@/components/miner/sections/StakingPoolSection";
import { useMinerRole } from "@/hooks/useMinerRole";
import { ACTIVE_SET_SIZE } from "@/lib/chain";
import { formatNumber, shortenAddress } from "@/lib/format";
import type { Proposal, Validator } from "@/lib/types";

/**
 * Quarry Miner personal dashboard.
 *
 * Access is gated on validator identity. Until Phase 6 that identity comes from
 * a dev harness rather than a connected wallet — which is why the harness bar
 * is loud and says so. The gate here is presentational; real authorisation must
 * live server-side.
 */

const SECTIONS = [
  "Overview",
  "Server Analytics",
  "Staking & Pool",
  "Campaign Hub",
  "Governance Voting",
] as const;

type Section = (typeof SECTIONS)[number];

export function MinerDashboard({
  electedNode,
  candidateNode,
  proposals,
  seedHeight,
  networkVoteTotal,
}: {
  electedNode: Validator;
  candidateNode: Validator;
  proposals: Proposal[];
  seedHeight: number;
  networkVoteTotal: number;
}) {
  const { role } = useMinerRole();
  const [section, setSection] = useState<Section>("Overview");

  if (role === "visitor") {
    return (
      <div className="space-y-6">
        <DevHarnessBar />
        <div className="mx-auto max-w-lg rounded-xl border border-border bg-card p-8 text-center shadow-sm">
          <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-warning-tint text-xl text-warning">
            !
          </span>
          <h1 className="text-xl font-bold text-heading">Access Denied</h1>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
            This wallet is not a registered Quarry Miner. Run a node and commit
            collateral to access your validator workspace.
          </p>
          <Link
            href="/onboarding"
            className="mt-6 inline-block rounded-lg bg-brand px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-hover"
          >
            Become a Quarry Miner
          </Link>
        </div>
      </div>
    );
  }

  const isElected = role === "elected";
  const validator = isElected ? electedNode : candidateNode;
  const weightPct = (validator.votes / networkVoteTotal) * 100;

  return (
    <div className="space-y-6">
      <DevHarnessBar />

      {/* Status banner */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <ValidatorIcon name={validator.name} asset={validator.iconAsset} size={48} />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold text-heading">{validator.name}</h1>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                    isElected
                      ? "bg-success-tint text-success-deep"
                      : "bg-warning-tint text-warning"
                  }`}
                >
                  {isElected ? "Elected — Active Producer" : "Candidate — Backup"}
                </span>
              </div>
              <p className="mt-1 font-mono text-xs text-muted">
                {shortenAddress(validator.address)}
              </p>
            </div>
          </div>

          <dl className="flex flex-wrap gap-6 text-right">
            <div>
              <dt className="text-[10px] uppercase tracking-wide text-muted">
                Current Rank
              </dt>
              <dd className="font-mono text-lg font-bold text-heading">
                #{validator.rank}
                {isElected && (
                  <span className="text-xs text-muted"> of {ACTIVE_SET_SIZE}</span>
                )}
              </dd>
            </div>
            <div>
              <dt className="text-[10px] uppercase tracking-wide text-muted">
                Total Votes
              </dt>
              <dd className="font-mono text-lg font-bold text-heading">
                {formatNumber(validator.votes)}
              </dd>
            </div>
            <div>
              <dt className="text-[10px] uppercase tracking-wide text-muted">
                Network Weight
              </dt>
              <dd className="font-mono text-lg font-bold text-brand">
                {weightPct.toFixed(2)}%
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[200px_1fr]">
        {/* Sidebar nav */}
        <nav aria-label="Validator workspace" className="lg:sticky lg:top-24 lg:self-start">
          <ul className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
            {SECTIONS.map((s) => (
              <li key={s}>
                <button
                  type="button"
                  onClick={() => setSection(s)}
                  aria-current={section === s ? "page" : undefined}
                  className={`w-full whitespace-nowrap rounded-lg px-3 py-2 text-left text-xs font-semibold transition-colors ${
                    section === s
                      ? "bg-brand-tint text-brand"
                      : "text-muted hover:bg-well hover:text-ink"
                  }`}
                >
                  {s}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="min-w-0">
          {section === "Overview" && (
            <OverviewSection
              validator={validator}
              seedHeight={seedHeight}
              networkVoteTotal={networkVoteTotal}
            />
          )}
          {section === "Server Analytics" && (
            <ServerAnalyticsSection validator={validator} />
          )}
          {section === "Staking & Pool" && (
            <StakingPoolSection validator={validator} />
          )}
          {section === "Campaign Hub" && (
            <CampaignHubSection validator={validator} />
          )}
          {section === "Governance Voting" && (
            <GovernanceSection proposals={proposals} canVote={isElected} />
          )}
        </div>
      </div>
    </div>
  );
}
