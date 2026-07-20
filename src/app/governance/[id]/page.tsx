import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MinerProfile } from "@/components/governance/MinerProfile";
import { getProvider } from "@/lib/providers";

/**
 * Quarry Miner detail page.
 *
 * Note the Next 16 signature: `params` is a Promise and must be awaited.
 */

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  const provider = getProvider();
  const [active, candidates] = await Promise.all([
    provider.registry.listActive(),
    provider.registry.listCandidates(),
  ]);
  return [...active, ...candidates].map((v) => ({ id: v.id }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const validator = await getProvider().registry.getById(id);
  if (!validator) return { title: "Miner not found — QuarryChain" };
  return {
    title: `${validator.name} — QuarryChain Quarry Miner`,
    description:
      validator.description ??
      `Consensus performance and delegation for ${validator.name}.`,
  };
}

export default async function MinerPage({ params }: PageProps) {
  const { id } = await params;
  const validator = await getProvider().registry.getById(id);

  if (!validator) notFound();

  return <MinerProfile validator={validator} />;
}
