import { GovernanceDashboard } from "@/components/governance/GovernanceDashboard";
import { getProvider } from "@/lib/providers";

/**
 * Module A — Main Governance Dashboard.
 *
 * Server component: fetches the initial snapshot through the provider, then
 * hands off to the client shell which owns the live telemetry ticker.
 */
export default async function GovernancePage() {
  const provider = getProvider();
  const [validators, status] = await Promise.all([
    provider.registry.listActive(),
    provider.telemetry.getNetworkStatus(),
  ]);

  return <GovernanceDashboard initialValidators={validators} status={status} />;
}
