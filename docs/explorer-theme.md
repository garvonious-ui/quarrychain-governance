# Explorer Reskin — Blockscout Theme Config

**Target:** https://explorer.testnet.quarrychain.network
**For:** whoever controls the Blockscout deployment (this is infra, not this repo)

The explorer runs the **modern Blockscout Next.js frontend** (confirmed via
`__NEXT_DATA__` / `_next/static` in the served HTML). That matters: it is themed
almost entirely through **environment variables on the frontend container**. No
fork, no patched CSS, no rebuild from source.

> ⚠️ **Verify variable names against your Blockscout version before applying.**
> Blockscout has renamed and added frontend envs across releases. The canonical
> list is `ENVS.md` in the `blockscout/frontend` repo, matched to your deployed
> tag. Names below are the common set; treat the *values* as authoritative and
> the *keys* as needing a version check.

---

## Palette mapping

These are the governance suite's tokens (`src/app/globals.css`), so the explorer
and the DPoS app read as one product.

| Role | Light | Dark |
|---|---|---|
| Brand / primary | `#007BFF` | `#3B82F6` |
| Brand hover | `#0056B3` | `#60A5FA` |
| Page ground | `#F8F9FA` | `#08080F` |
| Panel / card | `#FFFFFF` | `#0F1019` |
| Border | `#E9ECEF` | `#1E2130` |
| Heading text | `#212529` | `#F1F5F9` |
| Body text | `#495057` | `#94A3B8` |
| Success | `#198754` | `#22C55E` |
| Danger | `#DC3545` | `#EF4444` |

Note the brand blue **differs per theme on purpose** — `#007BFF` is punchy on
white but over-saturated on a near-black ground.

---

## Environment config

```bash
# ── Network identity ────────────────────────────────────────────────
NEXT_PUBLIC_NETWORK_NAME="QuarryChain Testnet"
NEXT_PUBLIC_NETWORK_SHORT_NAME="QuarryChain"
NEXT_PUBLIC_NETWORK_ID=1129
NEXT_PUBLIC_NETWORK_RPC_URL="https://rpc.testnet.quarrychain.network"
NEXT_PUBLIC_NETWORK_CURRENCY_NAME="Quarry"
NEXT_PUBLIC_NETWORK_CURRENCY_SYMBOL="QRY"
NEXT_PUBLIC_NETWORK_CURRENCY_DECIMALS=18
NEXT_PUBLIC_IS_TESTNET=true

# ── Branding assets (must be publicly reachable URLs) ───────────────
NEXT_PUBLIC_NETWORK_LOGO="https://<cdn>/quarrychain-logo.png"
NEXT_PUBLIC_NETWORK_LOGO_DARK="https://<cdn>/quarrychain-logo-dark.png"
NEXT_PUBLIC_NETWORK_ICON="https://<cdn>/quarrychain-icon.png"
NEXT_PUBLIC_NETWORK_ICON_DARK="https://<cdn>/quarrychain-icon-dark.png"

# ── Theme ───────────────────────────────────────────────────────────
# Blockscout ships named themes; "dark" is the closest match to the
# main QuarryChain site. Set the accent to the brand blue.
NEXT_PUBLIC_COLOR_THEME_DEFAULT="dark"
NEXT_PUBLIC_HOMEPAGE_PLATE_BACKGROUND="linear-gradient(136deg, #08080F 0%, #0F1019 50%, #007BFF 100%)"
NEXT_PUBLIC_HOMEPAGE_PLATE_TEXT_COLOR="#F1F5F9"

# ── Homepage ────────────────────────────────────────────────────────
NEXT_PUBLIC_HOMEPAGE_CHARTS="['daily_txs']"

# ── Cross-links back to the governance suite ────────────────────────
NEXT_PUBLIC_FOOTER_LINKS="https://<cdn>/quarrychain-footer-links.json"
```

### `quarrychain-footer-links.json`

Host this anywhere public; it puts the governance suite one click from the
explorer.

```json
[
  {
    "title": "QuarryChain",
    "links": [
      { "text": "Governance", "url": "https://quarrychain-governance.vercel.app/governance" },
      { "text": "Voting", "url": "https://quarrychain-governance.vercel.app/voting" },
      { "text": "Become a Miner", "url": "https://quarrychain-governance.vercel.app/onboarding" }
    ]
  }
]
```

---

## Assets needed

Same brand assets this repo is waiting on (see `public/assets/README.md`), plus
light/dark variants for the explorer, which places the logo on a dark plate:

| Asset | Notes |
|---|---|
| `quarrychain-logo.png` | Full wordmark, transparent background |
| `quarrychain-logo-dark.png` | Light-ink variant for dark chrome |
| `quarrychain-icon.png` | Square mark, used as the network icon |
| `quarrychain-icon-dark.png` | Light-ink square mark |
| Favicon master | ≥512×512 PNG; Blockscout generates the set |

---

## What this does *not* change

Env theming covers colors, logo, network naming, homepage plate, and footer
links. It does **not** restructure Blockscout's page layouts or component
markup. If the brief requires layout changes beyond theming, that is a frontend
fork of Blockscout and a much larger commitment — worth pushing back on, since
Blockscout already does the explorer job well and a fork means owning upstream
merges forever.

## Suggested verification

After applying, check that:

1. The header logo renders on both light and dark themes (dark plate is the easy
   one to get wrong).
2. `QRY` appears as the currency symbol on block and address pages — not `ETH`.
3. Chain ID reads `1129`.
4. The footer links resolve to the governance suite.
