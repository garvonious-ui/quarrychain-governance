"use client";

import { useState } from "react";

/**
 * "One-Click Delegate" shareable link, per the spec's campaigning section.
 *
 * Copies an absolute URL to the voting tab with this miner pre-selected, so a
 * candidate can drop it into a tweet or Discord post and land voters directly
 * on their delegation step.
 */
export function DelegateLinkButton({ validatorId }: { validatorId: string }) {
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);

  async function copy() {
    // Built at click time: window.location is not available during SSR.
    const url = `${window.location.origin}/voting?miner=${validatorId}`;
    try {
      await navigator.clipboard.writeText(url);
      setFailed(false);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API needs a secure context and permission; it can genuinely
      // fail. Say so rather than showing a false "Copied!".
      setFailed(true);
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="rounded-lg border border-border-strong bg-card px-3 py-2 text-xs font-bold text-body transition-colors hover:border-brand hover:text-brand"
    >
      {failed ? "Copy failed" : copied ? "Link copied" : "Copy delegate link"}
    </button>
  );
}
