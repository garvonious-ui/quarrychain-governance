"use client";

import Image from "next/image";
import { useState } from "react";

/**
 * Optional profile hero graphic.
 *
 * The wrapper stays `hidden` until the image actually loads. Without that, the
 * <img> reserves its full 1200x480 box for a frame before onError fires, which
 * flashes a large empty panel on every page load while brand assets are
 * missing. `display:none` does not prevent the browser from fetching the image,
 * so this costs nothing once the real assets land.
 *
 * If the asset is absent or fails, this renders nothing at all — a framed
 * "image missing" placeholder would look broken on a page a validator is using
 * to campaign for votes.
 */
export function MinerHero({ asset, name }: { asset: string | null; name: string }) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  if (!asset || failed) return null;

  return (
    <div
      className={
        loaded ? "overflow-hidden rounded-xl border border-border bg-well" : "hidden"
      }
    >
      <Image
        src={`/assets/${asset}`}
        alt={`${name} profile graphic`}
        width={1200}
        height={480}
        className="h-auto w-full object-cover"
        onLoad={() => setLoaded(true)}
        onError={() => setFailed(true)}
      />
    </div>
  );
}
