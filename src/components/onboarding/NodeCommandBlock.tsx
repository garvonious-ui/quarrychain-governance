"use client";

import { useState } from "react";

/**
 * Copy-pasteable node deployment command.
 *
 * The image name and genesis URL are NOT yet confirmed by the QuarryChain node
 * team, and this block says so in the UI rather than quietly presenting a
 * guess as gospel. An operator who copies a wrong image name gets a confusing
 * failure at the worst possible moment — first contact with the network.
 * See docs/integration.md open question 1.
 */
export function NodeCommandBlock({ command }: { command: string }) {
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(command);
      setFailed(false);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setFailed(true);
    }
  }

  return (
    <div className="space-y-2">
      <div className="relative rounded-lg border border-border-strong bg-panel p-3">
        <pre className="overflow-x-auto whitespace-pre font-mono text-[11px] leading-relaxed text-panel-ink">
          <code>{command}</code>
        </pre>
        <button
          type="button"
          onClick={copy}
          className="absolute right-2 top-2 rounded border border-panel-ink/20 bg-panel-ink/10 px-2 py-1 text-[10px] font-bold text-panel-ink transition-colors hover:bg-panel-ink/20"
        >
          {failed ? "Copy failed" : copied ? "Copied" : "Copy"}
        </button>
      </div>
      <p className="rounded-lg border border-warning/30 bg-warning-tint px-3 py-2 text-[11px] font-medium text-warning">
        Image name and genesis URL are pending confirmation from the QuarryChain
        node team. Verify before running in production.
      </p>
    </div>
  );
}
