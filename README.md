# QuarryChain — DPoS Governance Suite

Frontend for QuarryChain's Delegated Proof of Stake governance: validator
registry, delegation and yield, miner profiles, validator onboarding, and a
personal node dashboard.

**Live demo:** https://quarrychain-governance.vercel.app

---

## ⚠️ Read this first if you're wiring the backend

This repo is **frontend only**. It ships with a mock data provider so the whole
app runs standalone. To connect it to the real chain you implement **one
interface** — you do not touch a single component.

👉 **[docs/integration.md](docs/integration.md)** is the guide. It covers what
the chain actually is, which endpoint backs each method, and the open questions
still outstanding.

Two findings in that doc that will save you time:

1. **This is a Cosmos-SDK / CometBFT chain with an EVM module** (EVM chain-id
   `1129`), not a Geth-family chain.
2. **Validators register via a Cosmos `create-validator` message** — an ed25519
   consensus pubkey plus a native QRY self-delegation. There is **no ERC-20
   "validator registry contract"**, despite what the original spec implies.
   Building one would not work.

---

## Quick start

```bash
pnpm install
pnpm dev          # http://localhost:3000
```

No environment variables are required — it runs on mock data out of the box.
Copy `.env.example` to `.env.local` to override endpoints.

```bash
pnpm build        # production build
pnpm lint         # eslint
npx tsc --noEmit  # typecheck
```

## Routes

| Route | What it is |
|---|---|
| `/governance` | Validator registry + network topology (Module A) |
| `/governance/[id]` | Public miner profile, one-click delegate link |
| `/voting` | Freeze → Select → Cast → Manage delegation wizard (Module B) |
| `/onboarding` | "Become a Quarry Miner" wizard (Module C) |
| `/miner` | Validator personal dashboard (Module C) |

## Architecture

```
src/lib/types.ts            ← domain shapes; these ARE the integration contract
src/lib/providers/types.ts  ← the DataProvider interface you implement
src/lib/providers/mock.ts   ← reference implementation (simulated)
src/lib/providers/index.ts  ← runtime resolver, reads NEXT_PUBLIC_DATA_MODE
```

Every value the UI renders comes through `getProvider()`. No component issues a
`fetch`. Swapping the provider swaps the entire app's data source.

## What is real vs. simulated

Being precise about this matters — parts of this app look live and are not.

**Real:**
- The onboarding **[Check Connection]** probe. It calls the operator's own EVM
  JSON-RPC and asserts chain-id, sync distance against the public tip, and peer
  count. It reports genuine failures and never fakes a pass.
- Chain constants (chain-id 1129, RPC and explorer URLs) — verified against the
  live testnet.
- The two IONOS validator addresses flagged `isLiveNode` — real block proposers.

**Simulated:**
- The validator registry, vote weights, APY, rewards, latency and uptime drift.
- Block-height and consensus-state tickers.
- All transactions. Hashes render with a `SIMULATED` badge.
- Validator identity on `/miner`, via a deliberately loud dev harness bar.

`NetworkStatus.isLive` tells the UI which mode it is in, and the UI says so on
screen. **Please preserve that.** The topology widget in particular only renders
nodes that actually exist — `Validator.isLiveNode` should never be flipped on to
make the network look larger.

## Security note

UI-level gating in this app (the admin surface, the miner dashboard) is
**cosmetic**. Hiding a button is not access control. Every privileged action must
be authorised server-side when the backend lands.

## Outstanding

Brand assets are not yet delivered — see
[public/assets/README.md](public/assets/README.md) for the expected filenames.
Avatars fall back to initials until they land.

Open questions for the chain team are listed at the end of
[docs/integration.md](docs/integration.md).

## Project docs

- [docs/integration.md](docs/integration.md) — backend integration guide
- [docs/build-plan.md](docs/build-plan.md) — phased plan and status
- [docs/changelog.md](docs/changelog.md) — dated decision record
- [AGENTS.md](AGENTS.md) — conventions and critical rules
