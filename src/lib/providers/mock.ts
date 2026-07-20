import { ACTIVE_SET_SIZE, CHAIN } from "@/lib/chain";
import {
  MOCK_ACTIVE_VALIDATORS,
  MOCK_CANDIDATE_VALIDATORS,
} from "@/lib/mock/validators";
import { checkNodeConnection } from "@/lib/providers/node-check";
import type { DataProvider } from "@/lib/providers/types";
import type {
  Proposal,
  ServerHost,
  Validator,
  ValidatorApplication,
} from "@/lib/types";

/**
 * Mock provider — drives the entire app with simulated data.
 *
 * Per the Phase 6 spec, telemetry is deliberately simulated to give a "living
 * network" feel without depending on early-testnet stability. The one thing
 * that is NOT simulated is checkNodeConnection, which makes a real RPC call.
 */

const latency = <T,>(value: T, ms = 120): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms));

const MOCK_PROPOSALS: Proposal[] = [
  {
    id: "QC-Prop-04",
    title: "Adjust Block Size Limit",
    description:
      "Raise the per-block gas ceiling to accommodate higher throughput ahead of the QuarrySwap deployment.",
    status: "voting",
    tally: { aye: 12, nay: 3, abstain: 2 },
  },
  {
    id: "QC-Prop-05",
    title: "Reduce Minimum Self-Bond to 400,000 QRY",
    description:
      "Lower the validator entry threshold to broaden geographic participation during Phase 1.",
    status: "voting",
    tally: { aye: 6, nay: 9, abstain: 4 },
  },
];

function hostBreakdown(validators: Validator[]): Record<ServerHost, number> {
  const counts: Record<ServerHost, number> = { AWS: 0, IONOS: 0, BareMetal: 0 };
  for (const v of validators) counts[v.host] += 1;
  return counts;
}

export function createMockProvider(): DataProvider {
  // Seeded from the real observed tip so the demo starts plausibly.
  let height = 650_538;

  return {
    mode: "mock",

    registry: {
      listActive: () => latency(MOCK_ACTIVE_VALIDATORS.slice(0, ACTIVE_SET_SIZE)),
      listCandidates: () => latency(MOCK_CANDIDATE_VALIDATORS),
      getById: (id) =>
        latency(
          [...MOCK_ACTIVE_VALIDATORS, ...MOCK_CANDIDATE_VALIDATORS].find(
            (v) => v.id === id,
          ) ?? null,
        ),
    },

    telemetry: {
      getNetworkStatus: () =>
        latency({
          height,
          chainId: CHAIN.id,
          // Only nodes flagged isLiveNode actually exist today.
          activeNodes: MOCK_ACTIVE_VALIDATORS.filter((v) => v.isLiveNode).length,
          hostBreakdown: hostBreakdown(MOCK_ACTIVE_VALIDATORS),
          isLive: false,
        }),
      subscribeHeight: (onHeight) => {
        const timer = setInterval(() => {
          height += 1;
          onHeight(height);
        }, CHAIN.blockTimeMs);
        return () => clearInterval(timer);
      },
    },

    onboarding: {
      // Real call, even in mock mode.
      checkNodeConnection,
      submitApplication: (application: ValidatorApplication) =>
        latency({ id: `app_${application.minerName.toLowerCase().replace(/\s+/g, "_")}` }, 600),
      buildNodeCommand: (host) => {
        const hostFlag = host === "BareMetal" ? "custom" : host.toLowerCase();
        return [
          "docker pull quarrychain/node:latest",
          `docker run -d --name quarrychain-validator \\`,
          `  -p 26656:26656 -p 26657:26657 -p 8545:8545 \\`,
          `  -e CHAIN_ID=${CHAIN.id} \\`,
          `  -e HOST_PROFILE=${hostFlag} \\`,
          "  quarrychain/node:latest",
        ].join("\n");
      },
    },

    delegation: {
      listForWallet: () => latency([]),
      freeze: (amountQry) =>
        latency({ energy: amountQry * 1.25, bandwidth: amountQry * 0.85 }, 400),
      delegate: () => latency({ txHash: `0x${"de1e6a7e".repeat(8)}` }, 700),
      undelegate: () => latency({ txHash: `0x${"c0ffee11".repeat(8)}` }, 700),
      setAutoCompound: () => latency(undefined, 200),
    },

    governance: {
      listProposals: () => latency(MOCK_PROPOSALS),
      castVote: () => latency({ txHash: `0x${"a1e0ba11".repeat(8)}` }, 600),
    },

    admin: {
      listPendingApplications: () => latency([]),
      approveApplication: () => latency(undefined, 400),
      jail: () => latency(undefined, 400),
      slashAndEvict: () => latency(undefined, 600),
    },
  };
}
