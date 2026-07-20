"use client";

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
}: {
  initialValidators: Validator[];
  status: NetworkStatus;
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
      />
      <ValidatorTable
        validators={validators}
        height={height}
        flashId={flashId}
      />
    </>
  );
}
