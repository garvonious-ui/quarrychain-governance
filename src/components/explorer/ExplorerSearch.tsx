"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/**
 * Explorer search.
 *
 * Resolves the unambiguous shapes client-side (block height, tx hash, address)
 * so the common case is an instant navigation with no round trip. Anything else
 * falls through to the server route, which asks Blockscout.
 */
export function ExplorerSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const q = query.trim();
    if (!q) return;
    setError(null);

    if (/^\d+$/.test(q)) return router.push(`/explorer/block/${q}`);
    if (/^0x[a-fA-F0-9]{64}$/.test(q)) return router.push(`/explorer/tx/${q}`);
    if (/^0x[a-fA-F0-9]{40}$/.test(q)) return router.push(`/explorer/address/${q}`);

    setError("Enter a block height, transaction hash, or address.");
  }

  return (
    <form onSubmit={submit} className="w-full">
      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setError(null);
          }}
          placeholder="Search by block height, transaction hash, or address"
          aria-label="Search the explorer"
          className="min-w-0 flex-1 rounded-lg border border-border-strong bg-card px-4 py-2.5 font-mono text-sm text-ink transition-colors focus:border-brand focus:outline-none"
        />
        <button
          type="submit"
          className="rounded-lg bg-brand px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-hover"
        >
          Search
        </button>
      </div>
      {error && (
        <p role="alert" className="mt-2 text-[11px] font-medium text-danger">
          {error}
        </p>
      )}
    </form>
  );
}
