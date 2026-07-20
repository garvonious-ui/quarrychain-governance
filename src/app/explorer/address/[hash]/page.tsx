import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DetailCard, DetailRow } from "@/components/explorer/DetailRow";
import { MetricCard } from "@/components/ui/MetricCard";
import { getAddress, getAddressTransactions } from "@/lib/explorer/blockscout";
import {
  formatNumber,
  formatWei,
  shortenAddress,
  shortenHash,
  timeAgo,
} from "@/lib/format";

interface PageProps {
  params: Promise<{ hash: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { hash } = await params;
  return { title: `Address ${hash.slice(0, 10)}… — QuarryChain Explorer` };
}

export const revalidate = 30;

export default async function AddressPage({ params }: PageProps) {
  const { hash } = await params;
  const [address, transactions] = await Promise.all([
    getAddress(hash),
    getAddressTransactions(hash),
  ]);

  if (!address) notFound();

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/explorer"
          className="text-xs text-muted transition-colors hover:text-brand"
        >
          ← Explorer
        </Link>
        <div className="mt-1 flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold text-heading">
            {address.isContract ? "Contract" : "Address"}
          </h1>
          {address.isVerifiedContract && (
            <span className="rounded-full bg-success-tint px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-success-deep">
              Verified
            </span>
          )}
        </div>
        <p className="mt-1 break-all font-mono text-xs text-muted">
          {address.hash}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard label="Balance" value={formatWei(address.balance)} tone="brand" />
        <MetricCard
          label="Transactions"
          value={formatNumber(address.transactionCount)}
        />
        <MetricCard
          label="Type"
          value={address.isContract ? "Contract" : "EOA"}
        />
      </div>

      <DetailCard title="Address Details">
        <DetailRow label="Address">{address.hash}</DetailRow>
        <DetailRow label="Balance">{formatWei(address.balance)}</DetailRow>
        <DetailRow label="Transaction Count">
          {formatNumber(address.transactionCount)}
        </DetailRow>
        {address.name && (
          <DetailRow label="Name" mono={false}>
            {address.name}
          </DetailRow>
        )}
      </DetailCard>

      <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="border-b border-border px-6 py-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-body">
            Transactions
          </h2>
        </div>
        <ul className="divide-y divide-border">
          {transactions.map((t) => {
            const outgoing = t.from.toLowerCase() === address.hash.toLowerCase();
            return (
              <li key={t.hash} className="flex items-center gap-3 px-6 py-3">
                <span
                  className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase ${
                    outgoing
                      ? "bg-warning-tint text-warning"
                      : "bg-success-tint text-success-deep"
                  }`}
                >
                  {outgoing ? "out" : "in"}
                </span>
                <Link
                  href={`/explorer/tx/${t.hash}`}
                  className="min-w-0 flex-1 truncate font-mono text-xs text-brand hover:underline"
                >
                  {shortenHash(t.hash)}
                </Link>
                <span className="hidden font-mono text-[11px] text-muted sm:block">
                  {outgoing ? `→ ${shortenAddress(t.to ?? "—")}` : `← ${shortenAddress(t.from)}`}
                </span>
                <span className="w-24 text-right font-mono text-[11px] text-body">
                  {formatWei(t.value, 2)}
                </span>
                <span className="w-16 text-right font-mono text-[11px] text-muted">
                  {timeAgo(t.timestamp)}
                </span>
              </li>
            );
          })}
          {transactions.length === 0 && (
            <li className="px-6 py-8 text-center text-xs text-muted">
              No transactions for this address.
            </li>
          )}
        </ul>
      </section>
    </div>
  );
}
