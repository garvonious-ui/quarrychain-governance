import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DetailCard, DetailRow } from "@/components/explorer/DetailRow";
import { getBlock, getBlockTransactions } from "@/lib/explorer/blockscout";
import {
  formatNumber,
  formatWei,
  shortenAddress,
  shortenHash,
  timeAgo,
} from "@/lib/format";

interface PageProps {
  params: Promise<{ height: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { height } = await params;
  return { title: `Block #${height} — QuarryChain Explorer` };
}

export const revalidate = 30;

export default async function BlockPage({ params }: PageProps) {
  const { height } = await params;
  const [block, transactions] = await Promise.all([
    getBlock(height),
    getBlockTransactions(height),
  ]);

  if (!block) notFound();

  const gasUsedPct =
    Number(block.gasLimit) > 0
      ? (Number(block.gasUsed) / Number(block.gasLimit)) * 100
      : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link
            href="/explorer"
            className="text-xs text-muted transition-colors hover:text-brand"
          >
            ← Explorer
          </Link>
          <h1 className="mt-1 font-mono text-2xl font-bold text-heading">
            Block #{formatNumber(block.height)}
          </h1>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/explorer/block/${block.height - 1}`}
            className="rounded-lg border border-border-strong bg-card px-3 py-2 text-xs font-bold text-body transition-colors hover:border-brand hover:text-brand"
          >
            ‹ Prev
          </Link>
          <Link
            href={`/explorer/block/${block.height + 1}`}
            className="rounded-lg border border-border-strong bg-card px-3 py-2 text-xs font-bold text-body transition-colors hover:border-brand hover:text-brand"
          >
            Next ›
          </Link>
        </div>
      </div>

      <DetailCard title="Block Details">
        <DetailRow label="Block Height">
          {formatNumber(block.height)}
        </DetailRow>
        <DetailRow label="Timestamp">
          {timeAgo(block.timestamp)}{" "}
          <span className="text-muted">({block.timestamp})</span>
        </DetailRow>
        <DetailRow label="Transactions">
          {block.transactionCount === 0 ? (
            <span className="text-muted">No transactions in this block</span>
          ) : (
            `${block.transactionCount} transaction${block.transactionCount === 1 ? "" : "s"}`
          )}
        </DetailRow>
        <DetailRow label="Proposed By">
          <Link
            href={`/explorer/address/${block.proposer}`}
            className="text-brand hover:underline"
          >
            {block.proposer}
          </Link>
        </DetailRow>
        <DetailRow label="Block Hash">{block.hash}</DetailRow>
        <DetailRow label="Parent Hash">
          <Link
            href={`/explorer/block/${block.height - 1}`}
            className="text-brand hover:underline"
          >
            {block.parentHash}
          </Link>
        </DetailRow>
        <DetailRow label="Gas Used">
          {formatNumber(Number(block.gasUsed))}{" "}
          <span className="text-muted">
            ({gasUsedPct.toFixed(2)}% of {formatNumber(Number(block.gasLimit))})
          </span>
        </DetailRow>
        <DetailRow label="Size">{formatNumber(block.size)} bytes</DetailRow>
      </DetailCard>

      {transactions.length > 0 && (
        <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          <div className="border-b border-border px-6 py-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-body">
              Transactions in this block
            </h2>
          </div>
          <ul className="divide-y divide-border">
            {transactions.map((t) => (
              <li key={t.hash} className="flex items-center gap-3 px-6 py-3">
                <span
                  className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                    t.status === "success" ? "bg-success" : "bg-danger"
                  }`}
                />
                <Link
                  href={`/explorer/tx/${t.hash}`}
                  className="min-w-0 flex-1 truncate font-mono text-xs text-brand hover:underline"
                >
                  {shortenHash(t.hash)}
                </Link>
                <span className="font-mono text-[11px] text-muted">
                  {shortenAddress(t.from)}
                </span>
                <span className="w-24 text-right font-mono text-[11px] text-body">
                  {formatWei(t.value, 2)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
