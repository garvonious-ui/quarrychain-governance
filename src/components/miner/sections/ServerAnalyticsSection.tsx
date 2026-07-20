"use client";

import { MetricCard } from "@/components/ui/MetricCard";
import { formatNumber } from "@/lib/format";
import type { Validator } from "@/lib/types";

/** Server & node telemetry for the operator's own infrastructure. */
export function ServerAnalyticsSection({ validator }: { validator: Validator }) {
  const hostLabel =
    validator.host === "BareMetal" ? "bare metal host" : `${validator.host} instance`;

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-body">
            Node Telemetry
          </h2>
          <span className="flex items-center gap-2 rounded-full bg-success-tint px-3 py-1">
            <span className="h-2 w-2 animate-pulse rounded-full bg-success" />
            <span className="text-[11px] font-bold text-success-deep">
              Synced with {hostLabel} · {validator.region}
            </span>
          </span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            label="Uptime"
            value={`${validator.uptimePct.toFixed(2)}%`}
            tone="success"
          />
          <MetricCard
            label="Blocks Minted"
            value={formatNumber(validator.blocksProduced)}
          />
          <MetricCard
            label="Missed Blocks"
            value={validator.missedBlocks}
            tone={validator.missedBlocks > 0 ? "danger" : "success"}
            hint={validator.missedBlocks > 0 ? "review slot coverage" : "clean record"}
          />
          <MetricCard
            label="RPC Latency"
            value={`${validator.latencyMs}ms`}
            tone="brand"
          />
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-body">
          Infrastructure
        </h2>
        <dl className="divide-y divide-border text-xs">
          {[
            ["Host", validator.host],
            ["Region", validator.region],
            ["Protocol Version", validator.protocolVersion],
            ["Validator Address", validator.address],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between gap-4 py-2.5">
              <dt className="text-muted">{label}</dt>
              <dd className="truncate font-mono font-medium text-heading">
                {value}
              </dd>
            </div>
          ))}
        </dl>
        <p className="mt-4 rounded-lg border border-border bg-surface px-3 py-2 text-[11px] text-muted">
          Per-node latency history and geographic peer maps need the CometBFT RPC
          (<code className="font-mono">/net_info</code>), which is not currently
          exposed. See docs/integration.md.
        </p>
      </section>
    </div>
  );
}
