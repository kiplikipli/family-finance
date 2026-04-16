/**
 * Format a date string to a readable format
 */
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format a date string to ISO date only (YYYY-MM-DD)
 */
export function toISODate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString().split('T')[0];
}

/**
 * Get start of current month
 */
export function startOfMonth(date?: Date): Date {
  const d = date ?? new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

/**
 * Get end of current month
 */
export function endOfMonth(date?: Date): Date {
  const d = date ?? new Date();
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
}
