const CURRENCY = 'IDR';
const LOCALE = 'id-ID';

/**
 * Format minor units to IDR currency string
 * e.g. 1000000 => "Rp 10.000"
 */
export function formatCurrency(amountMinor: number): string {
  const amount = amountMinor / 100;
  return new Intl.NumberFormat(LOCALE, {
    style: 'currency',
    currency: CURRENCY,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Parse a currency string to minor units
 * e.g. "10000" => 1000000 (minor units)
 */
export function parseCurrency(value: string): number {
  const cleaned = value.replace(/[^0-9.-]/g, '');
  const amount = parseFloat(cleaned);
  if (isNaN(amount)) return 0;
  return Math.round(amount * 100);
}

/**
 * Format minor units for display (without currency symbol)
 * e.g. 1000000 => "10,000"
 */
export function formatAmount(amountMinor: number): string {
  const amount = amountMinor / 100;
  return new Intl.NumberFormat(LOCALE, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
