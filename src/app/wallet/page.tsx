import type { Metadata } from "next";
import { WalletDashboard } from "@/components/wallet/WalletDashboard";
import { getProvider } from "@/lib/providers";

export const metadata: Metadata = {
  title: "Quarry Wallet — QuarryChain",
  description:
    "Your QRY balances, active delegations, and staking rewards on the QuarryChain testnet.",
};

export default async function WalletPage() {
  const summary = await getProvider().wallet.getSummary();
  return <WalletDashboard summary={summary} />;
}
