import type { Metadata } from "next";
import Link from "next/link";
import { getRecentTransactions } from "@/lib/explorer/blockscout";
import {
  formatNumber,
  formatWei,
  shortenAddress,
  shortenHash,
  timeAgo,
} from "@/lib/format";

export const metadata: Metadata = {
  title: "Transactions — QuarryChain Explorer",
};
export const revalidate = 10;

export default async function TransactionsPage() {
  const transactions = await getRecentTransactions(50);

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/explorer"
          className="text-xs text-muted transition-colors hover:text-brand"
        >
          ← Explorer
        </Link>
        <h1 className="mt-1 text-2xl font-bold text-heading">Transactions</h1>
        <p className="mt-1 text-xs text-muted">
          Most recent {transactions.length} transactions on the QuarryChain
          testnet.
        </p>
      </div>

      <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-border bg-surface text-[11px] font-bold uppercase tracking-wider text-body">
                {["", "Hash", "Block", "Age", "From", "To", "Value"].map((h, i) => (
                  <th key={`${h}-${i}`} className="whitespace-nowrap px-4 py-3.5">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-xs">
              {transactions.map((t) => (
                <tr key={t.hash} className="hover:bg-surface">
                  <td className="px-4 py-3">
                    <span
                      className={`block h-1.5 w-1.5 rounded-full ${
                        t.status === "success" ? "bg-success" : "bg-danger"
                      }`}
                      aria-label={t.status}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/explorer/tx/${t.hash}`}
                      className="font-mono text-brand hover:underline"
                    >
                      {shortenHash(t.hash)}
                    </Link>
                  </td>
                  <td className="px-4 py-3 font-mono text-body">
                    {t.blockHeight === null ? (
                      <span className="text-muted">pending</span>
                    ) : (
                      <Link
                        href={`/explorer/block/${t.blockHeight}`}
                        className="hover:text-brand hover:underline"
                      >
                        {formatNumber(t.blockHeight)}
                      </Link>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 font-mono text-muted">
                    {timeAgo(t.timestamp)}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/explorer/address/${t.from}`}
                      className="font-mono text-muted hover:text-brand hover:underline"
                    >
                      {shortenAddress(t.from)}
                    </Link>
                  </td>
                  <td className="px-4 py-3 font-mono text-muted">
                    {t.to ? (
                      <Link
                        href={`/explorer/address/${t.to}`}
                        className="hover:text-brand hover:underline"
                      >
                        {shortenAddress(t.to)}
                      </Link>
                    ) : t.isContractCreation ? (
                      "contract creation"
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-4 py-3 font-mono text-body">
                    {formatWei(t.value, 2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {transactions.length === 0 && (
          <p className="px-6 py-10 text-center text-xs text-muted">
            No transactions yet on this testnet.
          </p>
        )}
      </section>
    </div>
  );
}
