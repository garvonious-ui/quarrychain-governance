"use client";

import { useMinerRole, type MinerRole } from "@/hooks/useMinerRole";

/**
 * Loud, unmissable dev harness for switching validator identity.
 *
 * Deliberately amber and deliberately ugly. Until wallet connect lands there is
 * no real gate on the miner dashboard, and anyone glancing at a screenshot
 * should be able to tell that immediately — the same reasoning as the ICO
 * repo's test-mode banner. Delete this component when Phase 6 wires real
 * wallet-based identity.
 */

const ROLES: { value: MinerRole; label: string }[] = [
  { value: "visitor", label: "Not registered" },
  { value: "candidate", label: "Candidate" },
  { value: "elected", label: "Elected (Top 21)" },
];

export function DevHarnessBar() {
  const { role, setRole } = useMinerRole();

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-warning/40 bg-warning-tint px-4 py-2.5">
      <span className="text-[11px] font-bold uppercase tracking-wider text-warning">
        Dev harness — simulated identity, not a real access gate
      </span>
      <div className="ml-auto flex gap-1">
        {ROLES.map((r) => (
          <button
            key={r.value}
            type="button"
            onClick={() => setRole(r.value)}
            aria-pressed={role === r.value}
            className={`rounded px-2.5 py-1 text-[11px] font-bold transition-colors ${
              role === r.value
                ? "bg-warning text-black"
                : "bg-card text-body hover:text-ink"
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>
    </div>
  );
}
