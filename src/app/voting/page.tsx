import { VotingPortal } from "@/components/voting/VotingPortal";
import { getProvider } from "@/lib/providers";

/**
 * Module B — Interactive Voting, Staking & Yield Portal.
 *
 * `?miner=<id>` pre-selects a validator: that is the spec's "One-Click
 * Delegate" shareable link, which candidates drop into campaign posts.
 * Read server-side rather than via useSearchParams so the portal stays a
 * plain client component with no Suspense boundary needed.
 */

interface PageProps {
  searchParams: Promise<{ miner?: string }>;
}

export default async function VotingPage({ searchParams }: PageProps) {
  const [{ miner }, validators] = await Promise.all([
    searchParams,
    getProvider().registry.listActive(),
  ]);

  // Only honour the param if it resolves to a real validator — a stale or
  // hand-edited link should fall back to the normal flow, not error.
  const preselectedId = validators.some((v) => v.id === miner) ? miner : undefined;

  return <VotingPortal validators={validators} preselectedId={preselectedId} />;
}
