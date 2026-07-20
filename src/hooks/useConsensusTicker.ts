"use client";

import { useEffect, useState } from "react";
import type { Validator } from "@/lib/types";

/**
 * Block-production telemetry for a validator's own node.
 *
 * Cycles the CometBFT-style consensus states and advances height / streak /
 * mined-total on each commit. Mined total is derived from elapsed wall-clock
 * time against the node's daily reward rate rather than accumulated per tick,
 * for the same reason as useLiveEarnings: interval drift would silently skew
 * the number.
 */

const CONSENSUS_SEQUENCE = [
  "Awaiting Slot…",
  "Proposing Block…",
  "Signing Block…",
  "Block Committed Successfully",
] as const;

export type ConsensusState = (typeof CONSENSUS_SEQUENCE)[number];

const STEP_MS = 1500;
const COMMIT_INDEX = CONSENSUS_SEQUENCE.length - 1;
const SECONDS_PER_DAY = 86_400;

export interface ConsensusTelemetry {
  consensusState: ConsensusState;
  blockHeight: number;
  consecutiveBlocks: number;
  epoch: number;
  round: number;
  totalMined: number;
  flash: boolean;
}

export function useConsensusTicker(
  validator: Validator,
  seedHeight: number,
): ConsensusTelemetry {
  const [stepIndex, setStepIndex] = useState(0);
  const [blockHeight, setBlockHeight] = useState(seedHeight);
  const [consecutiveBlocks, setConsecutiveBlocks] = useState(2_411);
  const [totalMined, setTotalMined] = useState(124_510.82);

  const perSecond = validator.dailyRewardQry / SECONDS_PER_DAY;

  useEffect(() => {
    const startedAt = Date.now();
    const baseMined = 124_510.82;

    const timer = setInterval(() => {
      setStepIndex((prev) => {
        const next = (prev + 1) % CONSENSUS_SEQUENCE.length;
        if (next === COMMIT_INDEX) {
          setBlockHeight((h) => h + 1);
          setConsecutiveBlocks((c) => c + 1);
        }
        return next;
      });

      const elapsedSeconds = (Date.now() - startedAt) / 1000;
      setTotalMined(baseMined + perSecond * elapsedSeconds);
    }, STEP_MS);

    return () => clearInterval(timer);
  }, [perSecond]);

  return {
    consensusState: CONSENSUS_SEQUENCE[stepIndex],
    blockHeight,
    consecutiveBlocks,
    // Cosmetic derivations so the epoch/round readout moves with the chain.
    epoch: Math.floor(blockHeight / 15_000),
    round: blockHeight % 15_000,
    totalMined,
    flash: stepIndex === COMMIT_INDEX,
  };
}
