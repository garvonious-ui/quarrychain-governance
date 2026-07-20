import { createMockProvider } from "@/lib/providers/mock";
import type { DataProvider } from "@/lib/providers/types";

/**
 * Runtime provider resolution.
 *
 * NEXT_PUBLIC_DATA_MODE=mock  → simulated data (default; ships standalone)
 * NEXT_PUBLIC_DATA_MODE=live  → real chain data
 *
 * TO GO LIVE: implement createLiveProvider() satisfying the DataProvider
 * interface in src/lib/providers/types.ts, import it below, and set the env
 * var. No component changes are required — the UI only ever talks to this
 * interface. See docs/integration.md for the endpoint backing each method.
 */

let cached: DataProvider | null = null;

export function getProvider(): DataProvider {
  if (cached) return cached;

  const mode = process.env.NEXT_PUBLIC_DATA_MODE ?? "mock";

  if (mode === "live") {
    // eslint-disable-next-line no-console
    console.warn(
      "[quarrychain] NEXT_PUBLIC_DATA_MODE=live but no live provider is implemented yet — falling back to mock. See docs/integration.md.",
    );
  }

  cached = createMockProvider();
  return cached;
}

export type { DataProvider } from "@/lib/providers/types";
