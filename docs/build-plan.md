# Build Plan

Source specs: `QuarryChain DPoS Governance VibeCode Prompt.docx` (original) and
`QuarryChain Testnet Phase 6 Instructions.docx` (**authoritative** — supersedes
the first, and ships reference React/Tailwind source for each module).

Scope: **frontend only.** Backend is plugged in by the QuarryChain dev against
the provider interface — see [integration.md](integration.md).

## Phase 0 — Scaffold
- [x] Next.js 16 + TS strict + Tailwind 4 + pnpm
- [x] Design tokens pinned to the spec palette (light-only fintech)
- [x] Inter + JetBrains Mono via next/font
- [x] Sticky header with blue/black brand lockup + Governance/Voting nav
- [x] Provider/adapter seam (`DataProvider`) + mock implementation
- [x] Domain types (`src/lib/types.ts`) as the frontend/backend contract
- [x] Chain constants from live testnet interrogation (chain-id 1129)
- [x] Mock registry: 21 active + 4 candidates, 2 flagged as real IONOS nodes
- [x] Real EVM-RPC node probe for onboarding "Check Connection"
- [x] `docs/integration.md` handoff guide
- [ ] Brand assets dropped into `public/assets/` (blocked — awaiting files)

## Theming (added 2026-07-20, overrides the spec's "light only")
- [x] Semantic tokens split into `:root` (light) / `.dark` (dark)
- [x] Dark palette inherited from quarrychain-web
- [x] Header toggle, persisted to localStorage, defaults to OS preference
- [x] Pre-paint init script — no flash of the wrong theme
- [ ] Re-audit each new module in both themes as it ships

## Phase 1 — Module A: Governance Dashboard
- [x] Network topology widget (real IONOS nodes only; AWS shown as supported, not live)
- [x] Sortable registry table (all 12 columns per spec)
- [x] `useNodeTelemetry` hook — block-height ticker + per-row green flash
- [x] Latency / uptime micro-fluctuation simulation
- [x] Featured miners emphasised, with icon assets + initials fallback

## Phase 2 — Module B: Voting & Yield Portal
- [x] 4-step wizard: Freeze → Select → Cast → Manage
- [x] Energy / Bandwidth derivation from frozen QRY
- [x] Miner selection grid
- [x] Vote confirmation step (wallet signature deferred to Phase 6)
- [x] `[Vote Out]` revoke/unstake path
- [x] Live earnings odometer (6dp, 100ms tick)
- [x] Auto-compounding toggle + spec-exact tooltip copy
- [x] Dynamic APY window

## Phase 3 — Miner Detail Pages
- [ ] `/governance/[id]` profile: header, wallet address, stats sidebar
- [ ] Featured content for DRMZ / Hydro Ocean / Carpenter Union
- [ ] Prominent Vote/Delegate CTA
- [ ] One-click delegate deep-link (`/voting?miner=<id>`)

## Phase 4 — Module C: Onboarding + Validator Dashboard
- [ ] "Become a Miner" wizard: profile → infra config → collateral lockup
- [ ] Real node command block (per AWS / IONOS / bare metal)
- [ ] `[Check Connection]` wired to the real EVM-RPC probe
- [ ] 500,000 QRY self-bond step
- [ ] Validator personal dashboard, sidebar nav (5 workspaces)
- [ ] Server telemetry panel, self-bond locker, commission slider
- [ ] Campaign hub (profile editor + pinned announcement)
- [ ] Validator governance panel (Aye / Nay / Abstain)
- [ ] Block production telemetry + QRY yield ticker

## Phase 5 — Module D: QuarryLabs Admin Console
- [ ] Wallet-gated admin surface + "PHASE 1 MANUAL CONTROL" badge
- [ ] Pending candidate approvals (`[Approve & Authorize]`)
- [ ] Emergency terminal: `[Jail Node]` / `[Slash & Evict]`
- [ ] Infraction presets (2% / 30% / 100%) + custom penalty slider
- [ ] Dynamic burn calculator + double-confirm destructive action

## Phase 6 — Real Seams & Polish
- [ ] RainbowKit wallet connect (role gating: voter / candidate / miner / admin)
- [ ] Live block height from public RPC (`NEXT_PUBLIC_DATA_MODE=live` partial)
- [ ] Candidate standings page
- [ ] Responsive + reduced-motion audit
- [ ] Accessibility pass on tables, modals, and the wizard

## Open Items
1. Brand assets — logo + 3 featured icons + 2 hero graphics (owed by Lou)
2. Node artifact name/version, genesis, seed peers (owed by chain team)
3. Cosmos REST / CometBFT RPC exposure (owed by chain team)
4. Staking denom + min-self-delegation param
5. Is `create-validator` permissioned in Phase 1?
6. Energy/Bandwidth — real module or presentational metaphor?
