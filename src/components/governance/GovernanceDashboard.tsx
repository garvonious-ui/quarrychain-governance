"use client";

import { GovernanceTransition } from "@/components/governance/GovernanceTransition";
import { NetworkTopology } from "@/components/governance/NetworkTopology";
import { ValidatorTable } from "@/components/governance/ValidatorTable";
import { useNodeTelemetry } from "@/hooks/useNodeTelemetry";
import type { NetworkStatus, Validator } from "@/lib/types";

/**
 * Client shell for Module A. The page stays a server component and fetches the
 * initial snapshot through the provider; this component owns the live ticker.
 */

export function GovernanceDashboard({
  initialValidators,
  status,
  liveProposerCount,
}: {
  initialValidators: Validator[];
  status: NetworkStatus;
  /** Real distinct proposers from the chain; null if the indexer was unreachable. */
  liveProposerCount: number | null;
}) {
  const { validators, height, flashId } = useNodeTelemetry(
    initialValidators,
    status.height,
  );

  return (
    <>
      <NetworkTopology
        validators={validators}
        height={height}
        isLiveData={status.isLive}
        liveProposerCount={liveProposerCount}
      />
      <ValidatorTable
        validators={validators}
        height={height}
        flashId={flashId}
      />
      <GovernanceTransition />
    </>
  );
}
