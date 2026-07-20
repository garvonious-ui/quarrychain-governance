"use client";

import Link from "next/link";
import { CHAIN } from "@/lib/chain";
import type { ServerHost, Validator } from "@/lib/types";

/**
 * Multi-cloud topology widget.
 *
 * HONESTY RULE: the "producing blocks" count comes from the REAL chain
 * (distinct proposers observed via Blockscout), not from mock flags. An earlier
 * version counted hardcoded `isLiveNode` values, which went stale as the
 * validator set grew from 2 to 5 — the widget then understated the network.
 * Derive from the chain; do not reintroduce a hardcoded count.
 *
 * Hosts with no live nodes render as *onboarding targets*, never as live
 * clusters. The spec's reference code hardcoded "3 Nodes on AWS", which would
 * be a fabrication. Do not "fill out" this widget to make the map look busier.
 */

const HOST_LABEL: Record<ServerHost, string> = {
  AWS: "AWS",
  IONOS: "IONOS",
  BareMetal: "Bare Metal",
};

interface Cluster {
  host: ServerHost;
  region: string;
  nodes: number;
}

function liveClusters(validators: Validator[]): Cluster[] {
  const grouped = new Map<string, Cluster>();
  for (const v of validators) {
    if (!v.isLiveNode) continue;
    const key = `${v.host}:${v.region}`;
    const existing = grouped.get(key);
    if (existing) existing.nodes += 1;
    else grouped.set(key, { host: v.host, region: v.region, nodes: 1 });
  }
  return [...grouped.values()].sort((a, b) => b.nodes - a.nodes);
}

export function NetworkTopology({
  validators,
  height,
  isLiveData,
  liveProposerCount,
}: {
  validators: Validator[];
  height: number;
  isLiveData: boolean;
  /**
   * Distinct block proposers observed on the real chain. Authoritative when
   * present — an earlier version derived this from hardcoded `isLiveNode`
   * flags, which silently went stale as the validator set grew from 2 to 5 and
   * left the widget understating the network.
   */
  liveProposerCount: number | null;
}) {
  const clusters = liveClusters(validators);
  const liveHosts = new Set(clusters.map((c) => c.host));
  const onboardingTargets = (
    Object.keys(HOST_LABEL) as ServerHost[]
  ).filter((h) => !liveHosts.has(h));
  const totalLiveNodes =
    liveProposerCount ?? clusters.reduce((sum, c) => sum + c.nodes, 0);

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border px-6 py-5">
        <div>
          <h2 className="text-lg font-bold text-heading">
            Node Telemetry &amp; Multi-Cloud Health
          </h2>
          <p className="mt-0.5 text-xs text-muted">
            Live consensus infrastructure across the QuarryChain testnet.
          </p>
        </div>
        <div className="flex items-center gap-5 text-right">
          <div>
            <span className="block text-[11px] text-muted">Chain ID</span>
            <span className="font-mono text-sm font-bold text-heading">
              {CHAIN.id}
            </span>
          </div>
          <div>
            <span className="block text-[11px] text-muted">Global Height</span>
            <span className="font-mono text-lg font-bold tabular-nums text-brand">
              #{height.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-4 px-6 py-5">
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-1.5 rounded bg-success-tint px-2 py-1 text-[11px] font-bold text-success-deep">
            <span className="h-2 w-2 animate-pulse rounded-full bg-success" />
            {totalLiveNodes} node{totalLiveNodes === 1 ? "" : "s"} producing blocks
          </span>
          <span className="rounded bg-well px-2 py-1 font-mono text-[11px] text-body">
            {liveProposerCount !== null
              ? "live chain"
              : isLiveData
                ? "live RPC"
                : "simulated telemetry"}
          </span>
        </div>

        {/* Live clusters */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {clusters.map((cluster) => (
            <div
              key={`${cluster.host}-${cluster.region}`}
              className="rounded-lg border border-border bg-surface p-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-heading">
                  {HOST_LABEL[cluster.host]} · {cluster.region}
                </span>
                <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-brand" />
              </div>
              <p className="mt-1 font-mono text-xs text-body">
                {cluster.nodes} active validator{cluster.nodes === 1 ? "" : "s"}
              </p>
              <p className="mt-2 text-[11px] text-muted">
                Quorum online · signing blocks
              </p>
            </div>
          ))}

          {/* Onboarding targets — explicitly NOT presented as live */}
          {onboardingTargets.map((host) => (
            <Link
              key={host}
              href="/onboarding"
              className="group rounded-lg border border-dashed border-border-strong bg-card p-4 transition-colors hover:border-brand"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-muted">
                  {HOST_LABEL[host]}
                </span>
                <span className="h-2.5 w-2.5 rounded-full bg-faint" />
              </div>
              <p className="mt-1 font-mono text-xs text-faint">no live nodes</p>
              <p className="mt-2 text-[11px] text-muted group-hover:text-brand">
                Supported onboarding target — run a Quarry Miner here →
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
