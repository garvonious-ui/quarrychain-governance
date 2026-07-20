"use client";

import Image from "next/image";
import { useState } from "react";

/**
 * Validator avatar with a graceful fallback.
 *
 * Brand assets have not been delivered yet, so every icon currently falls back
 * to initials. That is intentional — a missing PNG must never render as a
 * broken image. Drop files into public/assets (see the README there) and they
 * light up with no code change.
 */

function initialsFor(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

export function ValidatorIcon({
  name,
  asset,
  size = 24,
}: {
  name: string;
  asset: string | null;
  size?: number;
}) {
  const [failed, setFailed] = useState(false);
  const showFallback = !asset || failed;

  return (
    <span
      className="inline-flex shrink-0 items-center justify-center overflow-hidden rounded-md border border-border-strong bg-well"
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      {showFallback ? (
        <span
          className="font-bold text-body"
          style={{ fontSize: Math.max(8, size * 0.36) }}
        >
          {initialsFor(name)}
        </span>
      ) : (
        <Image
          src={`/assets/${asset}`}
          alt=""
          width={size}
          height={size}
          className="h-full w-full object-contain"
          onError={() => setFailed(true)}
        />
      )}
    </span>
  );
}
