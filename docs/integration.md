# Backend Integration Guide

**Audience:** the QuarryChain developer wiring this frontend to the real chain.

This app is **frontend-only**. Every value it renders comes from a mock provider.
To go live you implement one interface — you do not touch a single component.

---

## 1. What the chain actually is

Determined by interrogating the live testnet on 2026-07-20. Recording it here
because the original spec's wording is misleading in one important way.

| Property | Value |
|---|---|
| Chain type | **Cosmos-SDK + CometBFT consensus + EVM module** (Evmos / Cosmos-EVM lineage) |
| EVM chain-id | **1129** (`0x469`) |
| Block time | ~3.6s |
| Public EVM JSON-RPC | `https://rpc.testnet.quarrychain.network` |
| Explorer (Blockscout) | `https://explorer.testnet.quarrychain.network` |
| Cosmos REST (`:1317`) | **not publicly exposed** |
| CometBFT RPC (`:26657`) | **not publicly exposed** |

**Evidence it is CometBFT, not Geth/Clique/PoW:** blocks carry empty
`extraData`, `difficulty: 0x0`, `gasLimit: 0xffffffff`, and the client string is
a nameless custom Go build. Clique always stuffs a signer list and seal into
`extraData`; PoW would have non-zero difficulty.

### ⚠️ Validators do NOT register via an ERC-20 registry contract

The spec says operators "stake into the validator registry contract." On a
CometBFT chain that is not how it works. Validators register with a Cosmos
**`create-validator`** transaction carrying:

- an **ed25519 consensus public key** (the node's, from `tendermint show-validator`)
- a **self-delegation** of the native QRY staking coin (500,000 QRY minimum)

In Phase 1 this is expected to be **permissioned** — which is what the admin
panel's `[Approve & Authorize]` flow models. Budget for this before building the
staking path; it is a Cosmos SDK message, not an EVM contract call.

---

## 2. The seam

```
src/lib/providers/types.ts   ← the interface you implement
src/lib/providers/mock.ts    ← reference implementation (simulated)
src/lib/providers/index.ts   ← runtime resolver, reads NEXT_PUBLIC_DATA_MODE
src/lib/types.ts             ← domain shapes; these ARE the contract
```

To go live:

1. Write `src/lib/providers/live.ts` exporting `createLiveProvider(): DataProvider`.
2. Import and return it from `getProvider()` when `NEXT_PUBLIC_DATA_MODE === "live"`.
3. Set `NEXT_PUBLIC_DATA_MODE=live`.

No component imports anything but `getProvider()`. Swapping the provider swaps
the whole app's data source.

---

## 3. Method-by-method: what backs what

### `registry.listActive()` / `listCandidates()` / `getById()`
→ **Cosmos REST** `GET /cosmos/staking/v1beta1/validators?status=BOND_STATUS_BONDED`

Maps to `Validator[]`. Notes:
- `votes` ← `delegator_shares` (convert from base units to whole QRY)
- `selfBond` ← query `/cosmos/staking/v1beta1/validators/{addr}/delegations/{self}`
- `commissionPct` ← `commission.commission_rates.rate` (×100)
- `rank` ← sort by `tokens` descending
- `name`, `website`, `description` ← `description.moniker` / `.website` / `.details`
- `missedBlocks` ← **Slashing module**: `/cosmos/slashing/v1beta1/signing_infos`
- `apyPct`, `dailyRewardQry` ← derived; see the mint + distribution modules
- `iconAsset` / `heroAsset` / `pinnedNotice` — **off-chain**, no on-chain source.
  These need a small profile store (the campaign hub writes them).

**Requires exposing Cosmos REST (`:1317`) read-only.**

### `telemetry.getNetworkStatus()` / `subscribeHeight()`
→ **EVM JSON-RPC** `eth_blockNumber`, `eth_chainId` — already public, works today.
→ For true consensus data (validator set, peers) use CometBFT RPC `/status`, `/net_info`.

`NetworkStatus.isLive` must be set `true` by the live provider so the UI can
label the data source honestly.

### `onboarding.checkNodeConnection(rpcUrl)`
→ **Already implemented for real** in `src/lib/providers/node-check.ts`. Used by
both mock and live. It probes the *operator's own* node:
`eth_chainId === 1129`, `eth_blockNumber` within 10 blocks of the public tip,
`net_peerCount > 0`.

> **CORS caveat:** this is a browser-origin request. Most node configs reject it.
> If that bites in the field, move the probe behind a server route — the
> interface does not change.

### `onboarding.buildNodeCommand(host)`
→ Returns the shell command an operator runs. **The mock returns a placeholder
image name (`quarrychain/node:latest`) — replace with the real published
artifact.** Needed: image/binary name, version tag, required ports, genesis URL,
and seed/persistent-peer strings (`nodeID@ip:26656`) for the existing IONOS nodes.

### `onboarding.submitApplication(app)`
→ Off-chain. Needs a small backend to hold pending candidacies until an admin
approves them (Phase-1 manual permissioning).

### `delegation.*`
→ Cosmos staking messages: `MsgDelegate`, `MsgUndelegate`, `MsgWithdrawDelegatorReward`.
`freeze()` models the Energy/Bandwidth resource concept — confirm whether the
chain actually implements a freeze/resource module or whether this is purely a
presentation-layer metaphor.

### `governance.*`
→ Cosmos gov module: `/cosmos/gov/v1/proposals`, `MsgVote`.

### `admin.*`
→ Jail/slash are consensus-level operations (slashing module / governance), not
arbitrary API calls. `approveApplication` is off-chain. **Gate every admin
method server-side** — the UI hiding a button is not authorization.

---

## 4. What the frontend deliberately does NOT do

- No private keys, no signing logic beyond wallet-provider calls.
- No custody of funds.
- No claim that mock nodes are real: `Validator.isLiveNode` is `true` only for
  the two IONOS nodes actually producing blocks. **Keep it that way** — the
  topology widget reads this flag so the demo never presents fictional
  infrastructure as live.

## 5. Open questions for the chain team

1. Node artifact — real docker image / binary name + version?
2. `genesis.json` URL + seed / persistent-peer strings for the 2 IONOS nodes?
3. Can Cosmos REST (`:1317`) + CometBFT RPC (`:26657`) be exposed read-only?
4. Staking denom (`aqry`? `uqry`?) and `min_self_delegation` param value?
5. Is `create-validator` open, or gov-gated / permissioned in Phase 1?
6. Is there a testnet faucet? Operators need 500k QRY to self-bond.
7. Is there a real Energy/Bandwidth resource module, or is that presentational?
