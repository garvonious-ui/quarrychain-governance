"use client";

import { useEffect, useState } from "react";

/**
 * Live staking-reward odometer.
 *
 * Earnings are computed from ELAPSED WALL-CLOCK TIME rather than by adding a
 * fixed increment per tick. setInterval drifts — under load or in a background
 * tab it fires late, and an accumulate-per-tick approach silently under-counts.
 * Deriving from elapsed time keeps the number honest regardless of tick timing.
 *
 * (The spec's reference code accumulates per tick, and also runs a 1000ms
 * interval while adding 100ms worth of rewards each time — a 10x undercount.
 * Not reproduced.)
 */

const MS_PER_YEAR = 365 * 24 * 60 * 60 * 1000;
const TICK_MS = 100;

export function useLiveEarnings(
  stakeQry: number,
  apyPct: number,
  active: boolean,
): number {
  const [earned, setEarned] = useState(0);

  useEffect(() => {
    if (!active || stakeQry <= 0) return;

    const startedAt = Date.now();
    const perYear = stakeQry * (apyPct / 100);

    const timer = setInterval(() => {
      const elapsed = Date.now() - startedAt;
      setEarned(perYear * (elapsed / MS_PER_YEAR));
    }, TICK_MS);

    return () => clearInterval(timer);
  }, [active, stakeQry, apyPct]);

  // Derived rather than reset in an effect, so the value collapses to zero the
  // moment a delegation is revoked without a stale frame.
  return active ? earned : 0;
}
