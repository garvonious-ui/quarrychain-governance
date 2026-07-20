# Changelog

## 2026-07-20 — Session 1: Project scaffold + provider seam (Phase 0)

### Built
- Next.js 16.2.10 + TypeScript strict + Tailwind 4.3.3 + pnpm, App Router, `src/` layout.
- `src/app/globals.css` — design tokens pinned to the Phase 6 palette as Tailwind 4
  `@theme` variables. Light mode only. Includes `block-flash` / `fade-in` keyframes
  and a global `prefers-reduced-motion` guard.
- `src/app/layout.tsx` — Inter (sans) + JetBrains Mono (numerics/addresses), metadata,
  sticky header, `max-w-[1600px]` main container.
- `src/components/layout/AppHeader.tsx` — brand lockup ("Quarry" `#007BFF` / "Chain"
  black), `[Governance] [Voting]` nav with active state. Logo failure falls back to
  the wordmark rather than a broken image.
- `src/components/ui/Card.tsx` — shared panel primitive (rounded-xl, hairline border,
  soft shadow) so the spec's surface treatment stays consistent.
- `src/lib/chain.ts` — testnet constants derived from live interrogation.
- `src/lib/types.ts` — domain types; these are the frontend/backend contract.
- `src/lib/providers/types.ts` — `DataProvider` interface (registry, telemetry,
  onboarding, delegation, governance, admin).
- `src/lib/providers/mock.ts` — full mock implementation driving the app standalone.
- `src/lib/providers/node-check.ts` — **real** EVM-RPC probe for onboarding.
- `src/lib/mock/validators.ts` — 21 active + 4 candidate validators.
- `/governance` renders the registry from the provider; `/voting` is a Phase 2 stub.
- `docs/integration.md` — the handoff guide for QuarryChain's dev.

### Decisions
- **Frontend-only with a hard provider seam.** Every value routes through
  `DataProvider`; no component fetches. Going live is one file plus an env flag.
  The alternative — scattered fetches — would have made the handoff a rewrite.
- **Chain determination recorded in code and docs.** Interrogating the testnet showed
  it is Cosmos-SDK/CometBFT with an EVM module (chain-id 1129), *not* a Geth-family
  chain. Empty `extraData` + zero difficulty + a nameless Go client rule out
  Clique and PoW. This matters: the spec says operators "stake into the validator
  registry contract," but on CometBFT that is a Cosmos `create-validator` message
  with an ed25519 consensus pubkey and a native self-delegation. Flagged loudly in
  `integration.md` so their dev doesn't build an ERC-20 registry that can't work.
- **`isLiveNode` flag on every validator.** Only the two IONOS nodes actually
  producing blocks are marked live. The topology widget reads this so the demo
  never presents fictional infrastructure as real — a screenshot of this app
  shouldn't be able to mislead anyone about network size.
- **`checkNodeConnection` is real even in mock mode.** It needs no backend: it
  probes the operator's own node for chain-id 1129, sync distance from the public
  tip, and peer count. Faking a green checkmark on an onboarding flow would be
  actively harmful — operators would believe a broken node was healthy.
- **Light mode only, no dark variant.** The spec's `#212529` accent panels and
  contrast ratios assume a light ground. Explicit comment in `globals.css` so
  nobody "helpfully" adds a dark block later.
- **Next 16, not the Next 15 in the house CLAUDE.md.** `create-next-app` now ships
  16.2.10, and the ICO repo already hit Next 16 async-params behaviour — so 16 is
  what the team is actually on.

### Bugs / Gotchas
- `create-next-app` scaffolds a dark-mode-aware `globals.css` and a Geist font pair.
  Both were replaced wholesale; leaving either would have fought the spec palette.
- Bash cwd resets between tool calls (same as the ICO repo) — chain `cd` into every
  command.

### Open
- **Brand assets not delivered.** `public/assets/README.md` lists the six expected
  filenames. UI degrades gracefully until they land.
- **No live provider.** `NEXT_PUBLIC_DATA_MODE=live` currently warns and falls back
  to mock — deliberate, so the flag exists before the implementation.
- **CORS on `checkNodeConnection`.** Browser-origin RPC calls to an operator's node
  will often be rejected. May need a server-side proxy; noted in `integration.md`.
- Energy/Bandwidth may be presentational rather than a real chain module — unconfirmed.

### Next
- Phase 1 (Module A): topology widget, sortable 12-column registry table,
  `useNodeTelemetry` block ticker with per-row flash.
