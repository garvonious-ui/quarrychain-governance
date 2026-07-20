import Link from "next/link";
import { Card, CardHeader } from "@/components/ui/Card";
import { ACTIVE_SET_SIZE } from "@/lib/chain";
import { getProvider } from "@/lib/providers";

/**
 * Module A — Main Governance Dashboard.
 *
 * Phase 0 renders the registry straight from the provider to prove the data
 * seam end-to-end. Phase 1 layers on the topology widget, column sorting, and
 * the live block-height ticker with per-row flash.
 */

const qry = (n: number) => `${n.toLocaleString()} QRY`;

export default async function GovernancePage() {
  const provider = getProvider();
  const [validators, status] = await Promise.all([
    provider.registry.listActive(),
    provider.telemetry.getNetworkStatus(),
  ]);

  return (
    <>
      <Card>
        <CardHeader
          title="Node Telemetry & Multi-Cloud Health"
          subtitle="Infrastructure health across the active consensus set."
          action={
            <div className="text-right">
              <span className="block text-xs text-muted">Global Height</span>
              <span className="font-mono text-lg font-bold tabular-nums text-brand">
                #{status.height.toLocaleString()}
              </span>
            </div>
          }
        />
        <div className="flex flex-wrap items-center gap-6 px-6 py-5 text-xs">
          <div>
            <span className="block text-muted">Live nodes</span>
            <span className="font-mono font-bold text-heading">
              {status.activeNodes}
            </span>
          </div>
          <div>
            <span className="block text-muted">Chain ID</span>
            <span className="font-mono font-bold text-heading">
              {status.chainId}
            </span>
          </div>
          <div>
            <span className="block text-muted">Data source</span>
            <span className="font-mono font-bold text-heading">
              {status.isLive ? "live RPC" : "simulated"}
            </span>
          </div>
          <p className="ml-auto max-w-md text-[11px] text-muted">
            Topology map, sortable columns, and the live block ticker land in
            Phase 1.
          </p>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <CardHeader
          title={`Active Consensus Registry (Top ${ACTIVE_SET_SIZE} Quarry Miners)`}
          subtitle="Sovereign consensus set secured by Delegated Proof of Stake incentives."
        />
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-border bg-surface text-[11px] font-bold uppercase tracking-wider text-body">
                {[
                  "Rank",
                  "Name",
                  "Votes",
                  "Status",
                  "Version",
                  "Latency",
                  "Uptime",
                  "Blocks",
                  "Missed",
                  "Daily Reward",
                  "APY",
                ].map((header) => (
                  <th key={header} className="px-4 py-3.5 whitespace-nowrap">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-xs font-medium text-heading">
              {validators.map((v) => (
                <tr key={v.id} className="bg-card hover:bg-surface">
                  <td className="px-4 py-4 font-mono tabular-nums text-muted">
                    #{v.rank}
                  </td>
                  <td className="px-4 py-4">
                    <Link
                      href={`/governance/${v.id}`}
                      className="font-semibold text-brand hover:underline"
                    >
                      {v.name}
                    </Link>
                    {v.isLiveNode && (
                      <span className="ml-2 rounded bg-success-tint px-1.5 py-0.5 text-[9px] font-bold uppercase text-success-deep">
                        live node
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-right font-mono tabular-nums">
                    {qry(v.votes)}
                  </td>
                  <td className="px-4 py-4">
                    <span className="inline-flex items-center rounded-full bg-success-tint px-2 py-0.5 text-[10px] font-bold text-success-deep">
                      Active
                    </span>
                  </td>
                  <td className="px-4 py-4 font-mono text-body">
                    {v.protocolVersion}
                  </td>
                  <td className="px-4 py-4 text-right font-mono tabular-nums text-success">
                    {v.latencyMs}ms
                  </td>
                  <td className="px-4 py-4 text-right font-mono tabular-nums">
                    {v.uptimePct.toFixed(2)}%
                  </td>
                  <td className="px-4 py-4 text-right font-mono tabular-nums">
                    {v.blocksProduced.toLocaleString()}
                  </td>
                  <td className="px-4 py-4 text-right font-mono tabular-nums text-danger">
                    {v.missedBlocks}
                  </td>
                  <td className="px-4 py-4 text-right font-mono tabular-nums text-brand">
                    {qry(v.dailyRewardQry)}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <span className="rounded-md bg-brand-tint px-2 py-1 font-mono font-bold text-brand">
                      {v.apyPct}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
