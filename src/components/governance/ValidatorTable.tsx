"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ValidatorIcon } from "@/components/governance/ValidatorIcon";
import type { Validator } from "@/lib/types";

/**
 * Active consensus registry — the spec's 12-column sortable table.
 *
 * "Latest Block" is derived: the validator that just produced flashes at the
 * current tip, everyone else trails by a small stable offset. That mirrors how
 * a real set looks mid-round without implying every node is exactly in sync.
 */

type SortKey =
  | "rank"
  | "name"
  | "votes"
  | "status"
  | "protocolVersion"
  | "latencyMs"
  | "uptimePct"
  | "latestBlock"
  | "blocksProduced"
  | "missedBlocks"
  | "dailyRewardQry"
  | "apyPct";

type Direction = "asc" | "desc";

const COLUMNS: { key: SortKey; label: string; align: "left" | "right" }[] = [
  { key: "rank", label: "Rank", align: "left" },
  { key: "name", label: "Name", align: "left" },
  { key: "votes", label: "Votes", align: "right" },
  { key: "status", label: "Status", align: "left" },
  { key: "protocolVersion", label: "Version", align: "left" },
  { key: "latencyMs", label: "Latency", align: "right" },
  { key: "uptimePct", label: "Uptime", align: "right" },
  { key: "latestBlock", label: "Latest Block", align: "right" },
  { key: "blocksProduced", label: "Blocks Produced", align: "right" },
  { key: "missedBlocks", label: "Missed", align: "right" },
  { key: "dailyRewardQry", label: "Daily Reward", align: "right" },
  { key: "apyPct", label: "APY", align: "right" },
];

/** Stable per-validator lag from the tip, so rows don't jitter between renders. */
const lagFor = (v: Validator) => v.rank % 3;

function sortValue(v: Validator, key: SortKey, height: number): number | string {
  if (key === "latestBlock") return height - lagFor(v);
  return v[key];
}

export function ValidatorTable({
  validators,
  height,
  flashId,
}: {
  validators: Validator[];
  height: number;
  flashId: string | null;
}) {
  const [sortKey, setSortKey] = useState<SortKey>("rank");
  const [direction, setDirection] = useState<Direction>("asc");

  const sorted = useMemo(() => {
    const rows = [...validators];
    rows.sort((a, b) => {
      const av = sortValue(a, sortKey, height);
      const bv = sortValue(b, sortKey, height);
      const cmp =
        typeof av === "string" && typeof bv === "string"
          ? av.localeCompare(bv)
          : Number(av) - Number(bv);
      return direction === "asc" ? cmp : -cmp;
    });
    return rows;
    // height intentionally excluded: it changes every block and would re-sort
    // the table constantly. latestBlock ordering tracks rank anyway.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [validators, sortKey, direction]);

  function toggleSort(key: SortKey) {
    if (key === sortKey) {
      setDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setDirection(key === "rank" || key === "name" ? "asc" : "desc");
    }
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="border-b border-border px-6 py-5">
        <h2 className="text-lg font-bold text-heading">
          Active Consensus Registry (Top {validators.length} Quarry Miners)
        </h2>
        <p className="mt-0.5 text-xs text-muted">
          Sovereign consensus set secured by Delegated Proof of Stake incentives.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-border bg-surface text-[11px] font-bold uppercase tracking-wider text-body">
              {COLUMNS.map(({ key, label, align }) => {
                const active = sortKey === key;
                return (
                  <th
                    key={key}
                    scope="col"
                    aria-sort={
                      active
                        ? direction === "asc"
                          ? "ascending"
                          : "descending"
                        : "none"
                    }
                    className="whitespace-nowrap px-4 py-3.5"
                  >
                    <button
                      type="button"
                      onClick={() => toggleSort(key)}
                      className={`flex w-full items-center gap-1 transition-colors hover:text-ink ${
                        align === "right" ? "justify-end" : "justify-start"
                      } ${active ? "text-brand" : ""}`}
                    >
                      <span>{label}</span>
                      <span className="text-[9px] text-faint">
                        {active ? (direction === "asc" ? "▲" : "▼") : "▲▼"}
                      </span>
                    </button>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody className="divide-y divide-border text-xs font-medium text-heading">
            {sorted.map((v) => {
              const isFlashing = v.id === flashId;
              return (
                <tr
                  key={v.id}
                  className={`bg-card transition-colors hover:bg-surface ${
                    isFlashing ? "animate-block-flash" : ""
                  }`}
                >
                  <td className="px-4 py-4 font-mono tabular-nums text-muted">
                    #{v.rank}
                  </td>

                  <td className="whitespace-nowrap px-4 py-4">
                    <div className="flex items-center gap-2.5">
                      <ValidatorIcon name={v.name} asset={v.iconAsset} />
                      <Link
                        href={`/governance/${v.id}`}
                        className={`hover:underline ${
                          v.featured ? "font-semibold text-brand" : "text-brand"
                        }`}
                      >
                        {v.name}
                      </Link>
                      {v.isLiveNode && (
                        <span className="rounded bg-success-tint px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-success-deep">
                          live
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="px-4 py-4 text-right font-mono tabular-nums">
                    {v.votes.toLocaleString()}
                  </td>

                  <td className="px-4 py-4">
                    <span className="inline-flex items-center rounded-full bg-success-tint px-2 py-0.5 text-[10px] font-bold text-success-deep">
                      <span className="mr-1.5 h-1 w-1 animate-pulse rounded-full bg-success" />
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
                    <span className={isFlashing ? "font-bold text-brand" : "text-body"}>
                      #{(height - lagFor(v)).toLocaleString()}
                    </span>
                  </td>

                  <td className="px-4 py-4 text-right font-mono tabular-nums">
                    {v.blocksProduced.toLocaleString()}
                  </td>

                  <td
                    className={`px-4 py-4 text-right font-mono tabular-nums ${
                      v.missedBlocks > 0 ? "text-danger" : "text-faint"
                    }`}
                  >
                    {v.missedBlocks}
                  </td>

                  <td className="px-4 py-4 text-right font-mono tabular-nums text-brand">
                    {v.dailyRewardQry.toLocaleString()} QRY
                  </td>

                  <td className="px-4 py-4 text-right">
                    <span className="rounded-md bg-brand-tint px-2 py-1 font-mono font-bold text-brand">
                      {v.apyPct}%
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
