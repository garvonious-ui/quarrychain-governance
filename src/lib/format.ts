/** Shared number formatting. Keeps QRY/percent rendering consistent everywhere. */

export const formatQry = (n: number): string =>
  `${Math.round(n).toLocaleString()} QRY`;

export const formatNumber = (n: number): string =>
  Math.round(n).toLocaleString();

/** Odometer display — the spec asks for 6 decimal places on live earnings. */
export const formatEarnings = (n: number): string =>
  n.toLocaleString(undefined, {
    minimumFractionDigits: 6,
    maximumFractionDigits: 6,
  });

export const formatPct = (n: number): string => `${n.toFixed(2)}%`;

/** 0x1234…abcd */
export const shortenAddress = (address: string): string =>
  address.length <= 12 ? address : `${address.slice(0, 6)}…${address.slice(-4)}`;

/** Longer prefix for 32-byte hashes, which are harder to disambiguate. */
export const shortenHash = (hash: string): string =>
  hash.length <= 20 ? hash : `${hash.slice(0, 10)}…${hash.slice(-8)}`;

/**
 * Wei → QRY. Uses BigInt so large balances don't lose precision the way
 * Number(wei) / 1e18 would.
 */
export function formatWei(wei: string, decimals = 4): string {
  let value: bigint;
  try {
    value = BigInt(wei || "0");
  } catch {
    return "0 QRY";
  }
  if (value === 0n) return "0 QRY";

  const base = 10n ** 18n;
  const whole = value / base;
  const fraction = value % base;

  if (fraction === 0n) return `${whole.toLocaleString()} QRY`;

  const frac = fraction.toString().padStart(18, "0").slice(0, decimals).replace(/0+$/, "");
  return frac
    ? `${whole.toLocaleString()}.${frac} QRY`
    : `${whole.toLocaleString()} QRY`;
}

/** "12s ago", "4m ago", "3h ago", "2d ago" */
export function timeAgo(iso: string | null, now = Date.now()): string {
  if (!iso) return "—";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "—";
  const seconds = Math.max(0, Math.floor((now - then) / 1000));
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}
