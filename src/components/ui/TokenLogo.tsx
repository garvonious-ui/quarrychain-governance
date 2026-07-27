/**
 * The QRY coin, inline. Alec wants the token mark to appear on the freeze,
 * confirm, and wallet surfaces.
 *
 * Defaults to the white/silver coin — the canonical variant used across the
 * ecosystem (Alec's call). Its coloured hexagons and black Q keep it legible on
 * light card surfaces; pass variant="dark" only if a surface ever needs it.
 * Decorative, so aria-hidden.
 */
export function TokenLogo({
  size = 20,
  variant = "white",
  className = "",
}: {
  size?: number;
  variant?: "dark" | "white";
  className?: string;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- decorative same-origin SVG; next/image would need dangerouslyAllowSVG
    <img
      src={`/assets/quarry-token-${variant}.svg`}
      alt=""
      aria-hidden="true"
      width={size}
      height={size}
      className={`inline-block shrink-0 ${className}`}
      style={{ width: size, height: size }}
    />
  );
}
