import Link from "next/link";
import { DelegateLinkButton } from "@/components/governance/DelegateLinkButton";
import { MinerHero } from "@/components/governance/MinerHero";
import { ValidatorIcon } from "@/components/governance/ValidatorIcon";
import { explorerAddressUrl } from "@/lib/chain";
import { formatNumber, formatQry, shortenAddress } from "@/lib/format";
import type { Validator } from "@/lib/types";

/** Quarry Miner public profile — the page a validator campaigns with. */

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2.5">
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="font-mono text-xs font-bold tabular-nums text-heading">
        {value}
      </dd>
    </div>
  );
}

export function MinerProfile({ validator: v }: { validator: Validator }) {
  const isCandidate = v.status === "candidate";

  return (
    <div className="space-y-6">
      <Link
        href="/governance"
        className="inline-block text-xs text-muted transition-colors hover:text-brand"
      >
        ← Back to registry
      </Link>

      {/* Header */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="flex items-start gap-4">
            <ValidatorIcon name={v.name} asset={v.iconAsset} size={56} />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold text-heading">{v.name}</h1>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                    isCandidate
                      ? "bg-warning-tint text-warning"
                      : "bg-success-tint text-success-deep"
                  }`}
                >
                  {isCandidate ? "Candidate — Backup" : "Elected — Active Producer"}
                </span>
                {v.isLiveNode && (
                  <span className="rounded bg-brand-tint px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand">
                    live node
                  </span>
                )}
              </div>

              <a
                href={explorerAddressUrl(v.address)}
                target="_blank"
                rel="noreferrer"
                className="mt-1 inline-block font-mono text-xs text-muted transition-colors hover:text-brand"
                title={v.address}
              >
                {shortenAddress(v.address)} ↗
              </a>

              <p className="mt-2 text-xs text-body">
                Rank #{v.rank} · {v.host} · {v.region}
                {v.website && (
                  <>
                    {" · "}
                    <a
                      href={v.website}
                      target="_blank"
                      rel="noreferrer"
                      className="text-brand hover:underline"
                    >
                      {v.website.replace(/^https?:\/\//, "").replace(/\/$/, "")} ↗
                    </a>
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <DelegateLinkButton validatorId={v.id} />
            <Link
              href={`/voting?miner=${v.id}`}
              className="rounded-lg bg-brand px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-hover"
            >
              Vote / Delegate
            </Link>
          </div>
        </div>

        {v.pinnedNotice && (
          <p className="mt-5 rounded-lg border border-brand/20 bg-brand-tint px-4 py-3 text-xs font-medium text-brand">
            📌 {v.pinnedNotice}
          </p>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <MinerHero asset={v.heroAsset} name={v.name} />

          {v.description && (
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <h2 className="mb-2 text-sm font-bold uppercase tracking-wider text-body">
                About
              </h2>
              <p className="max-w-3xl text-sm leading-relaxed text-body">
                {v.description}
              </p>
            </div>
          )}

          {/* Performance */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-body">
              Consensus Performance
            </h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {[
                { label: "Uptime", value: `${v.uptimePct.toFixed(2)}%` },
                { label: "RPC Latency", value: `${v.latencyMs}ms` },
                { label: "Blocks Produced", value: formatNumber(v.blocksProduced) },
                { label: "Missed Blocks", value: String(v.missedBlocks) },
                { label: "Commission", value: `${v.commissionPct}%` },
                { label: "Protocol", value: v.protocolVersion },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-lg border border-border bg-surface p-3"
                >
                  <span className="block text-[10px] uppercase tracking-wide text-muted">
                    {stat.label}
                  </span>
                  <span className="font-mono text-sm font-bold tabular-nums text-heading">
                    {stat.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stats sidebar */}
        <aside className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h2 className="mb-2 text-sm font-bold uppercase tracking-wider text-body">
              Account
            </h2>
            <dl className="divide-y divide-border">
              <StatRow label="QRY Available" value={formatQry(v.qryAvailable)} />
              <StatRow label="QRY Staked" value={formatQry(v.selfBond)} />
              <StatRow label="Transactions" value={formatNumber(v.transactions)} />
              <StatRow label="Transfers" value={formatNumber(v.transfers)} />
              <StatRow label="Energy" value={`${formatNumber(v.energy)} μS`} />
            </dl>
          </div>

          <div className="rounded-xl bg-panel p-6 text-panel-ink shadow-md">
            <span className="block text-[11px] font-medium text-panel-ink/60">
              Delegated Vote Weight
            </span>
            <span className="font-mono text-2xl font-bold tabular-nums">
              {formatNumber(v.votes)}
            </span>
            <span className="ml-1 font-sans text-xs text-panel-ink/40">QRY</span>

            <div className="mt-4 border-t border-panel-ink/10 pt-4">
              <span className="block text-[11px] font-medium text-panel-ink/60">
                Current APY
              </span>
              <span className="font-mono text-xl font-bold text-brand">
                {v.apyPct}%
              </span>
            </div>

            <div className="mt-4 border-t border-panel-ink/10 pt-4">
              <span className="block text-[11px] font-medium text-panel-ink/60">
                Est. Daily Reward
              </span>
              <span className="font-mono text-sm font-bold">
                {formatQry(v.dailyRewardQry)}
              </span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
