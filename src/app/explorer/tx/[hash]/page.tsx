import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DetailCard, DetailRow } from "@/components/explorer/DetailRow";
import { getTransaction } from "@/lib/explorer/blockscout";
import { formatNumber, formatWei, timeAgo } from "@/lib/format";

interface PageProps {
  params: Promise<{ hash: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { hash } = await params;
  return { title: `Transaction ${hash.slice(0, 12)}… — QuarryChain Explorer` };
}

export const revalidate = 30;

export default async function TransactionPage({ params }: PageProps) {
  const { hash } = await params;
  const tx = await getTransaction(hash);

  if (!tx) notFound();

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
          <h1 className="text-2xl font-bold text-heading">Transaction</h1>
          <span
            className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
              tx.status === "success"
                ? "bg-success-tint text-success-deep"
                : tx.status === "failed"
                  ? "bg-danger/10 text-danger"
                  : "bg-warning-tint text-warning"
            }`}
          >
            {tx.status}
          </span>
        </div>
      </div>

      <DetailCard title="Transaction Details">
        <DetailRow label="Transaction Hash">{tx.hash}</DetailRow>
        <DetailRow label="Status">{tx.status}</DetailRow>
        <DetailRow label="Block">
          {tx.blockHeight === null ? (
            <span className="text-muted">Pending</span>
          ) : (
            <Link
              href={`/explorer/block/${tx.blockHeight}`}
              className="text-brand hover:underline"
            >
              {formatNumber(tx.blockHeight)}
            </Link>
          )}
        </DetailRow>
        <DetailRow label="Timestamp">
          {timeAgo(tx.timestamp)}
          {tx.timestamp && <span className="text-muted"> ({tx.timestamp})</span>}
        </DetailRow>
        <DetailRow label="From">
          <Link
            href={`/explorer/address/${tx.from}`}
            className="text-brand hover:underline"
          >
            {tx.from}
          </Link>
        </DetailRow>
        <DetailRow label="To">
          {tx.to ? (
            <Link
              href={`/explorer/address/${tx.to}`}
              className="text-brand hover:underline"
            >
              {tx.to}
            </Link>
          ) : tx.isContractCreation ? (
            <span className="text-muted">Contract creation</span>
          ) : (
            <span className="text-muted">—</span>
          )}
        </DetailRow>
        <DetailRow label="Value">{formatWei(tx.value)}</DetailRow>
        <DetailRow label="Method">
          {tx.method ?? <span className="text-muted">—</span>}
        </DetailRow>
        <DetailRow label="Gas Used">
          {tx.gasUsed ? formatNumber(Number(tx.gasUsed)) : "—"}
        </DetailRow>
      </DetailCard>
    </div>
  );
}
