import type { Metadata } from "next";
import Link from "next/link";
import { getRecentBlocks } from "@/lib/explorer/blockscout";
import { formatNumber, shortenAddress, timeAgo } from "@/lib/format";

export const metadata: Metadata = { title: "Blocks — QuarryChain Explorer" };
export const revalidate = 10;

export default async function BlocksPage() {
  const blocks = await getRecentBlocks(50);

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/explorer"
          className="text-xs text-muted transition-colors hover:text-brand"
        >
          ← Explorer
        </Link>
        <h1 className="mt-1 text-2xl font-bold text-heading">Blocks</h1>
        <p className="mt-1 text-xs text-muted">
          Most recent {blocks.length} blocks on the QuarryChain testnet.
        </p>
      </div>

      <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-border bg-surface text-[11px] font-bold uppercase tracking-wider text-body">
                {["Height", "Age", "Txns", "Proposer", "Gas Used", "Size"].map((h) => (
                  <th key={h} className="whitespace-nowrap px-4 py-3.5">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-xs">
              {blocks.map((b) => (
                <tr key={b.hash} className="hover:bg-surface">
                  <td className="px-4 py-3">
                    <Link
                      href={`/explorer/block/${b.height}`}
                      className="font-mono font-bold text-brand hover:underline"
                    >
                      {formatNumber(b.height)}
                    </Link>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 font-mono text-muted">
                    {timeAgo(b.timestamp)}
                  </td>
                  <td className="px-4 py-3 font-mono text-body">
                    {b.transactionCount}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/explorer/address/${b.proposer}`}
                      className="font-mono text-muted hover:text-brand hover:underline"
                    >
                      {shortenAddress(b.proposer)}
                    </Link>
                  </td>
                  <td className="px-4 py-3 font-mono text-muted">
                    {formatNumber(Number(b.gasUsed))}
                  </td>
                  <td className="px-4 py-3 font-mono text-muted">
                    {formatNumber(b.size)} B
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {blocks.length === 0 && (
          <p className="px-6 py-10 text-center text-xs text-muted">
            Could not reach the chain indexer.
          </p>
        )}
      </section>
    </div>
  );
}
