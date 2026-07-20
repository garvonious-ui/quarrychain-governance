"use client";

import { useEffect, useRef } from "react";

/**
 * Accessibility wiring for a modal dialog: focus management, Escape-to-close,
 * and a focus trap.
 *
 * When `open` becomes true it moves focus into the dialog (the first focusable
 * element, or the container itself), keeps Tab cycling within it, closes on
 * Escape, and restores focus to whatever was focused before it opened. Without
 * this, a keyboard or screen-reader user is left stranded outside the dialog —
 * which on the slashing confirmation would mean they cannot review or dismiss an
 * irreversible action.
 *
 * Attach the returned ref to the dialog container.
 */
export function useDialogA11y<T extends HTMLElement>(
  open: boolean,
  onClose: () => void,
) {
  const containerRef = useRef<T>(null);
  // Keep the latest onClose without re-running the trap effect on every render.
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!open) return;
    const container = containerRef.current;
    if (!container) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;

    const focusable = () =>
      Array.from(
        container.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((el) => el.offsetParent !== null);

    // Move focus in: prefer the first field, else the container.
    const first = focusable()[0];
    if (first) first.focus();
    else {
      container.setAttribute("tabindex", "-1");
      container.focus();
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      if (event.key !== "Tab") return;

      const items = focusable();
      if (items.length === 0) return;
      const firstItem = items[0];
      const lastItem = items[items.length - 1];

      if (event.shiftKey && document.activeElement === firstItem) {
        event.preventDefault();
        lastItem.focus();
      } else if (!event.shiftKey && document.activeElement === lastItem) {
        event.preventDefault();
        firstItem.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      // Restore focus to the trigger so keyboard users aren't dropped at the top.
      previouslyFocused?.focus?.();
    };
  }, [open]);

  return containerRef;
}
