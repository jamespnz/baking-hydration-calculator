// Numeric formatting helpers — single source of truth for terminal display.

const GRAM_FMT = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });

export function fmtGrams(n: number): string {
  return GRAM_FMT.format(n);
}

export function fmtPercent(n: number, digits = 1): string {
  return `${n.toFixed(digits)}%`;
}

export function fmtFixed(n: number, digits = 1): string {
  return n.toFixed(digits);
}
