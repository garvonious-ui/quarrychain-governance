import type { Metadata } from "next";
import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";

export const metadata: Metadata = {
  title: "Become a Quarry Miner — QuarryChain",
  description:
    "Provision a validator node on AWS, IONOS, or bare metal, verify it against the live testnet, and commit collateral to join the QuarryChain consensus set.",
};

export default function OnboardingPage() {
  return <OnboardingWizard />;
}
