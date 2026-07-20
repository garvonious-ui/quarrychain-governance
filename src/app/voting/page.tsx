import { VotingPortal } from "@/components/voting/VotingPortal";
import { getProvider } from "@/lib/providers";

/**
 * Module B — Interactive Voting, Staking & Yield Portal.
 * Server component fetches the selectable miner set; the portal owns the
 * wizard state client-side.
 */
export default async function VotingPage() {
  const validators = await getProvider().registry.listActive();
  return <VotingPortal validators={validators} />;
}
