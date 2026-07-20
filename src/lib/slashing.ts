import type { InfractionKind, SlashPreset } from "@/lib/types";

/**
 * Phase-1 slashing presets, per the spec's Emergency Action Terminal.
 *
 * These percentages are policy, not UI decoration — they determine how much QRY
 * is permanently burned. The backend must enforce them independently; the
 * console only proposes an action.
 */
export const SLASH_PRESETS: Record<InfractionKind, SlashPreset> = {
  downtime: {
    kind: "downtime",
    label: "Minor Downtime",
    penaltyPct: 2,
    action: "Jail for 24 hours",
  },
  double_sign: {
    kind: "double_sign",
    label: "Double Signing (Equivocation)",
    penaltyPct: 30,
    action: "Permanent eviction",
  },
  malicious: {
    kind: "malicious",
    label: "Malicious Exploitation / Collusion",
    penaltyPct: 100,
    action: "Total blacklist and permanent eviction",
  },
};

export const BURN_ADDRESS = "0x0000000000000000000000000000000000000000";

/**
 * Spec-mandated disclosure shown beside the burn calculator.
 *
 * The Module D verification checklist requires this to render
 * CHARACTER-FOR-CHARACTER. Note the ASCII "..." inside the burn address — not a
 * typographic ellipsis. Do not "tidy" the punctuation; it is an audit
 * requirement, and a prettier dash would fail the check.
 */
export const BURN_DISCLOSURE =
  "All penalized QRY are immediately routed to the Burn Address (0x0000...0000), reducing the total global supply of QRY permanently. Delegator funds are un-frozen and returned to liquid state to protect innocent community members during Phase 1.";

/** Fixed global supply cap — spec section 6, Core Economic Variables. */
export const TOTAL_QRY_SUPPLY = 200_000_000;

export function penaltyAmount(selfBond: number, penaltyPct: number): number {
  return Math.round(selfBond * (penaltyPct / 100));
}
