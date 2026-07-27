/**
 * Provider interfaces — the frontend/backend seam.
 *
 * Every piece of data the UI renders comes through one of these interfaces.
 * No component issues a raw fetch. To go live, implement these against the
 * real chain and flip NEXT_PUBLIC_DATA_MODE=live; the UI does not change.
 *
 * See docs/integration.md for the endpoint backing each method.
 */

import type {
  Delegation,
  NetworkStatus,
  NodeCheckResult,
  Proposal,
  ProposalVote,
  Validator,
  ValidatorApplication,
  WalletSummary,
} from "@/lib/types";

export interface ValidatorRegistryProvider {
  /** The elected top-21 consensus set, ranked by vote weight. */
  listActive(): Promise<Validator[]>;
  /** Backup miners campaigning for a slot. */
  listCandidates(): Promise<Validator[]>;
  getById(id: string): Promise<Validator | null>;
}

export interface ChainTelemetryProvider {
  getNetworkStatus(): Promise<NetworkStatus>;
  /**
   * Push block-height updates. Returns an unsubscribe fn.
   * Mock drives this from a timer; live should poll eth_blockNumber or
   * subscribe over a websocket.
   */
  subscribeHeight(onHeight: (height: number) => void): () => void;
}

export interface OnboardingProvider {
  /**
   * Probe a prospective validator's own EVM JSON-RPC endpoint.
   * This is a REAL network call even in mock mode — it needs no backend.
   * Note: the operator's node must allow browser-origin requests, or this
   * has to be proxied server-side. See docs/integration.md.
   */
  checkNodeConnection(rpcUrl: string): Promise<NodeCheckResult>;
  /** Submit a candidacy for Phase-1 manual approval by QuarryLabs. */
  submitApplication(application: ValidatorApplication): Promise<{ id: string }>;
  /** The exact shell command an operator runs to bring a node up. */
  buildNodeCommand(host: ValidatorApplication["host"]): string;
}

export interface DelegationProvider {
  listForWallet(address: string): Promise<Delegation[]>;
  freeze(amountQry: number): Promise<{ energy: number; bandwidth: number }>;
  delegate(validatorId: string, amountQry: number): Promise<{ txHash: string }>;
  undelegate(validatorId: string): Promise<{ txHash: string }>;
  setAutoCompound(validatorId: string, enabled: boolean): Promise<void>;
}

export interface WalletProvider {
  /** Portfolio summary for the Quarry Wallet Dashboard. */
  getSummary(address?: string): Promise<WalletSummary>;
}

export interface GovernanceProvider {
  listProposals(): Promise<Proposal[]>;
  castVote(proposalId: string, vote: ProposalVote): Promise<{ txHash: string }>;
}

export interface AdminProvider {
  listPendingApplications(): Promise<ValidatorApplication[]>;
  approveApplication(id: string): Promise<void>;
  jail(validatorId: string): Promise<void>;
  slashAndEvict(validatorId: string, penaltyPct: number): Promise<void>;
}

/** The full surface the app resolves at runtime. */
export interface DataProvider {
  mode: "mock" | "live";
  registry: ValidatorRegistryProvider;
  telemetry: ChainTelemetryProvider;
  onboarding: OnboardingProvider;
  delegation: DelegationProvider;
  wallet: WalletProvider;
  governance: GovernanceProvider;
  admin: AdminProvider;
}
