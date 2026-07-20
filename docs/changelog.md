# Changelog

## 2026-07-20 — Session 1b: Module A governance dashboard (Phase 1)

### Built
- `src/hooks/useNodeTelemetry.ts` — subscribes to the provider's height stream,
  advances the tip, picks one validator per block to have produced it (flash +
  `blocksProduced++`), and applies the spec's telemetry deviations
  (latency ±2ms, uptime ±0.01%). Height comes from the provider, so a live
  provider starts driving real chain progress with no change to this hook.
- `src/components/governance/NetworkTopology.tsx` — multi-cloud health widget.
- `src/components/governance/ValidatorTable.tsx` — the 12-column sortable
  registry with per-row block flash and derived "Latest Block".
- `src/components/governance/ValidatorIcon.tsx` — avatar with initials fallback.
- `src/components/governance/GovernanceDashboard.tsx` — client shell; the page
  stays a server component and fetches the initial snapshot through the provider.

### Decisions
- **Topology shows only real infrastructure.** The spec's reference code hardcodes
  "3 Nodes on AWS / 2 Nodes on IONOS" and named clusters in West Virginia and
  Frankfurt. Only the two IONOS nodes actually exist, so the widget renders one
  live cluster and presents AWS + Bare Metal as *onboarding targets* ("no live
  nodes — supported onboarding target"). This keeps the demo honest and doubles
  as a funnel into the onboarding flow, which is the module Lou cares most about.
- **Sorting does not re-sort on every block.** `height` is deliberately excluded
  from the sort memo; otherwise the table would reshuffle every 3.6s and be
  unusable. Ordering by "Latest Block" tracks rank anyway.
- **Per-validator block lag is stable (`rank % 3`), not random.** A random offset
  would make every row's height jitter on each render, which reads as broken
  rather than as a live network mid-round.
- **Default sort direction depends on the column** — ascending for rank/name,
  descending for every numeric. Clicking "APY" should show the best yield first.
- **Flash is CSS-driven**, so the global `prefers-reduced-motion` rule neutralises
  it without any conditional logic in the hook.

### Bugs / Gotchas
- Validator names wrapped onto three lines and crushed the Name column; fixed
  with `whitespace-nowrap` on that cell. The table scrolls horizontally at narrow
  widths rather than compressing — correct for a 12-column data grid.
- `pnpm dev` landed on **port 3001**; 3000 was already occupied.

### Verified
Lint, typecheck, and production build all clean. Confirmed in the browser: 21
validators render, sorting works (Votes ▼ ordered correctly), the height ticker
advances, `blocksProduced` increments off the seed values, and icon fallbacks
render as initials while brand assets are outstanding.

### Next
- Phase 2 (Module B): the 4-step Freeze → Select → Cast → Manage voting wizard,
  live earnings odometer, auto-compounding toggle.

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
