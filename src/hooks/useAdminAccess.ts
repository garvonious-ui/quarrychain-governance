"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Whether the visitor is treated as a QuarryLabs admin.
 *
 * ⚠️ THIS IS NOT ACCESS CONTROL. It is a dev harness standing in for wallet
 * identity until Phase 6, and it lives entirely in the browser. Anyone can flip
 * it. The admin console it guards performs destructive actions (jailing,
 * slashing, burning supply), so when the backend lands EVERY one of those
 * actions must be authorised server-side against the connected wallet.
 * Hiding a button is not a permission check.
 *
 * See docs/integration.md, "admin.*".
 */

const STORAGE_KEY = "qc-admin-access";
const EVENT = "qc-admin-access-change";

function read(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

function subscribe(onChange: () => void): () => void {
  window.addEventListener(EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

export function useAdminAccess() {
  const isAdmin = useSyncExternalStore(subscribe, read, () => false);

  const setAdmin = useCallback((next: boolean) => {
    try {
      localStorage.setItem(STORAGE_KEY, String(next));
    } catch {
      /* non-persistent is fine for a dev harness */
    }
    window.dispatchEvent(new Event(EVENT));
  }, []);

  return { isAdmin, setAdmin };
}
