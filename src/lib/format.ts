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
