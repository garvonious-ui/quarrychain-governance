"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Which validator identity the visitor is treated as.
 *
 * Until wallet connect lands in Phase 6 there is no real way to know whether a
 * visitor operates a node, so this is a DEV HARNESS, not an auth mechanism.
 * It is deliberately loud in the UI (see DevHarnessBar) — nobody should be able
 * to screenshot the validator dashboard and mistake it for a real gated view.
 *
 * When wallet connect ships, this hook gets replaced by a lookup of the
 * connected address against the validator registry. The dashboard components
 * take the role as a prop and do not care where it came from.
 *
 * NOTE FOR THE INTEGRATOR: hiding UI is not access control. Any privileged
 * action must be authorised server-side.
 */

export type MinerRole = "visitor" | "candidate" | "elected";

const STORAGE_KEY = "qc-miner-role";
const EVENT = "qc-miner-role-change";

function read(): MinerRole {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "candidate" || stored === "elected") return stored;
  } catch {
    /* storage unavailable — fall through to default */
  }
  return "visitor";
}

function subscribe(onChange: () => void): () => void {
  window.addEventListener(EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

export function useMinerRole() {
  const role = useSyncExternalStore<MinerRole>(
    subscribe,
    read,
    () => "visitor",
  );

  const setRole = useCallback((next: MinerRole) => {
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* non-persistent is fine for a dev harness */
    }
    window.dispatchEvent(new Event(EVENT));
  }, []);

  return { role, setRole };
}
