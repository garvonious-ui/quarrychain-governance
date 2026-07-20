"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Light/dark theme control.
 *
 * The `dark` class on <html> IS the source of truth — not React state. An
 * inline script (THEME_INIT_SCRIPT) sets it before first paint to avoid a
 * flash of the wrong theme, so any React state would start out stale. Rather
 * than mirroring the DOM into state and reconciling in an effect, we subscribe
 * to the class attribute directly via useSyncExternalStore. Toggling just
 * mutates the class; the store notifies every consumer.
 *
 * Hand-rolled instead of next-themes: this is a handoff deliverable, and every
 * dependency is one more thing QuarryChain's dev inherits.
 */

export type Theme = "light" | "dark";

const STORAGE_KEY = "qc-theme";

/**
 * Inlined into <head> and executed synchronously before paint. Kept as a
 * string on purpose — it has to run ahead of React hydration.
 */
export const THEME_INIT_SCRIPT = `(function(){try{var s=localStorage.getItem("${STORAGE_KEY}");var d=s?s==="dark":window.matchMedia("(prefers-color-scheme: dark)").matches;if(d)document.documentElement.classList.add("dark");}catch(e){}})();`;

function readStoredPreference(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function subscribe(onChange: () => void): () => void {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });

  // Follow the OS, but only until the user makes an explicit choice.
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  const onMediaChange = (event: MediaQueryListEvent) => {
    if (readStoredPreference()) return;
    document.documentElement.classList.toggle("dark", event.matches);
  };
  media.addEventListener("change", onMediaChange);

  return () => {
    observer.disconnect();
    media.removeEventListener("change", onMediaChange);
  };
}

const getSnapshot = (): Theme =>
  document.documentElement.classList.contains("dark") ? "dark" : "light";

/** SSR has no DOM; the init script corrects this before the user sees paint. */
const getServerSnapshot = (): Theme => "light";

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggleTheme = useCallback(() => {
    const next: Theme = document.documentElement.classList.contains("dark")
      ? "light"
      : "dark";
    document.documentElement.classList.toggle("dark", next === "dark");
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Private browsing / storage disabled — the theme still applies for this
      // session, it just won't persist.
    }
  }, []);

  return { theme, toggleTheme };
}
