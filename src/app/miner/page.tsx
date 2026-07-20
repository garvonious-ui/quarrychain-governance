import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MinerDashboard } from "@/components/miner/MinerDashboard";
import { getProvider } from "@/lib/providers";

export const metadata: Metadata = {
  title: "Your Node — QuarryChain Quarry Miner",
  description:
    "Validator workspace: node telemetry, staking and pool economics, campaign hub, and protocol governance.",
};

export default async function MinerPage() {
  const provider = getProvider();
  const [active, candidates, proposals, status] = await Promise.all([
    provider.registry.listActive(),
    provider.registry.listCandidates(),
    provider.governance.listProposals(),
    provider.telemetry.getNetworkStatus(),
  ]);

  // Until wallet connect lands, the dev harness impersonates one of two real
  // registry entries rather than inventing a synthetic "your node" record —
  // so what the operator sees matches what voters see on the public profile.
  const electedNode = active[0];
  const candidateNode = candidates[0];
  if (!electedNode || !candidateNode) notFound();

  const networkVoteTotal = active.reduce((sum, v) => sum + v.votes, 0);

  return (
    <MinerDashboard
      electedNode={electedNode}
      candidateNode={candidateNode}
      proposals={proposals}
      seedHeight={status.height}
      networkVoteTotal={networkVoteTotal}
    />
  );
}
