"use client";

import { useEffect, useRef, useState } from "react";
import { getProvider } from "@/lib/providers";
import type { Validator } from "@/lib/types";

/**
 * Drives the "living network" feel on the governance dashboard.
 *
 * On every block tick we advance the global height, pick one validator to have
 * produced the block (flash + blocksProduced++), and apply the small telemetry
 * deviations the spec asks for (latency ±2ms, uptime ±0.01%).
 *
 * The height itself comes from the provider, so when a live provider lands this
 * hook starts reflecting real chain progress without any change here. The
 * per-validator jitter stays simulated until the Cosmos endpoints are exposed —
 * see docs/integration.md.
 *
 * The flash animation is CSS-driven, so the global prefers-reduced-motion rule
 * in globals.css neutralises it without extra logic here.
 */

const FLASH_MS = 800;
const LATENCY_JITTER_MS = 2;
const UPTIME_JITTER_PCT = 0.01;

const clamp = (n: number, min: number, max: number) =>
  Math.min(max, Math.max(min, n));

export function useNodeTelemetry(seedValidators: Validator[], seedHeight: number) {
  const [validators, setValidators] = useState(seedValidators);
  const [height, setHeight] = useState(seedHeight);
  const [flashId, setFlashId] = useState<string | null>(null);

  // Mirror of state so the subscription callback can read the current roster
  // without re-subscribing on every tick.
  const rosterRef = useRef(seedValidators);
  useEffect(() => {
    rosterRef.current = validators;
  }, [validators]);

  useEffect(() => {
    const provider = getProvider();

    return provider.telemetry.subscribeHeight((nextHeight) => {
      setHeight(nextHeight);

      const roster = rosterRef.current;
      if (roster.length === 0) return;

      const index = Math.floor(Math.random() * roster.length);
      setFlashId(roster[index].id);

      setValidators((prev) =>
        prev.map((v, i) => {
          if (i !== index) return v;
          const latencyDelta = Math.random() > 0.5 ? LATENCY_JITTER_MS : -LATENCY_JITTER_MS;
          const uptimeDelta = Math.random() > 0.5 ? UPTIME_JITTER_PCT : -UPTIME_JITTER_PCT;
          return {
            ...v,
            blocksProduced: v.blocksProduced + 1,
            latencyMs: clamp(v.latencyMs + latencyDelta, 5, 120),
            uptimePct: Number(clamp(v.uptimePct + uptimeDelta, 99.5, 100).toFixed(2)),
          };
        }),
      );
    });
  }, []);

  useEffect(() => {
    if (!flashId) return;
    const timer = setTimeout(() => setFlashId(null), FLASH_MS);
    return () => clearTimeout(timer);
  }, [flashId]);

  return { validators, height, flashId };
}
