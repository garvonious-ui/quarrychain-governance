import type { Validator } from "@/lib/types";

/**
 * Voting / freeze economics.
 *
 * Ratios match the original DPoS Governance demo Alec is referencing:
 * freezing QRY yields Energy at 0.1× and Bandwidth at 0.3× (50,000 QRY →
 * 5,000 Energy / 15,000 Bandwidth). Energy is the resource spent on delegation
 * weight; in a split, it is divided across the chosen miners.
 */
export const ENERGY_PER_QRY = 0.1;
export const BANDWIDTH_PER_QRY = 0.3;

export const energyFor = (qry: number) => Math.round(qry * ENERGY_PER_QRY);
export const bandwidthFor = (qry: number) => Math.round(qry * BANDWIDTH_PER_QRY);

/** Quick-select freeze presets shown as chips under the amount input. */
export const FREEZE_PRESETS = [10_000, 50_000, 100_000, 500_000] as const;

/** Even-percentage quick buttons on each miner in split mode. */
export const SPLIT_PERCENTS = [25, 50, 75] as const;

/** Reward projections for a delegation of `qry` to a validator. */
export function rewardEstimate(qry: number, apyPct: number) {
  const annual = qry * (apyPct / 100);
  return { annual, daily: annual / 365 };
}

/**
 * A miner's APY renders green when they are a featured / top-tier node, blue
 * otherwise — matching the demo, where the top three are highlighted.
 */
export const isTopTier = (v: Validator) => v.featured || v.rank <= 3;
