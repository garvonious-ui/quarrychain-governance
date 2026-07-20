/**
 * Explorer domain types.
 *
 * Unlike the governance registry, this data is REAL — sourced live from the
 * QuarryChain Blockscout API. Keep it that way: the explorer's entire value is
 * that it reflects the actual chain.
 */

export interface ExplorerStats {
  /** Height of the newest indexed block — the true chain tip. */
  latestHeight: number;
  totalBlocks: number;
  totalTransactions: number;
  totalAddresses: number;
  /** Milliseconds. */
  averageBlockTime: number;
  /** Distinct block proposers observed in a recent sample. */
  activeProposers: string[];
}

export interface ExplorerBlock {
  height: number;
  hash: string;
  timestamp: string;
  transactionCount: number;
  proposer: string;
  gasUsed: string;
  gasLimit: string;
  size: number;
  parentHash: string;
}

export type TxStatus = "success" | "failed" | "pending";

export interface ExplorerTransaction {
  hash: string;
  status: TxStatus;
  blockHeight: number | null;
  timestamp: string | null;
  from: string;
  to: string | null;
  /** Human label when Blockscout can decode it, else the raw selector. */
  method: string | null;
  /** Wei, as a decimal string. */
  value: string;
  gasUsed: string | null;
  /** True when this transaction deployed a contract. */
  isContractCreation: boolean;
}

export interface ExplorerAddress {
  hash: string;
  /** Wei, as a decimal string. */
  balance: string;
  transactionCount: number;
  isContract: boolean;
  isVerifiedContract: boolean;
  name: string | null;
}

export type SearchResultKind = "block" | "transaction" | "address" | "unknown";

export interface SearchResult {
  kind: SearchResultKind;
  /** Route within our explorer, e.g. /explorer/block/123. */
  href: string;
  label: string;
}
