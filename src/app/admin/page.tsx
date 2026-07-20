import type { Metadata } from "next";
import { AdminConsole } from "@/components/admin/AdminConsole";
import { getProvider } from "@/lib/providers";

/**
 * QuarryLabs admin console.
 *
 * Deliberately NOT linked from the global nav — the spec scopes this surface to
 * authorised deployer wallets. It is reachable at /admin and gated (cosmetically,
 * for now) inside the component.
 */
export const metadata: Metadata = {
  title: "QuarryLabs Control Panel — QuarryChain",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const provider = getProvider();
  const [validators, applications] = await Promise.all([
    provider.registry.listActive(),
    provider.admin.listPendingApplications(),
  ]);

  return <AdminConsole validators={validators} applications={applications} />;
}
