import { toArabicNumerals } from 'utils';

/**
 * Formats a number as Egyptian Pound currency with Arabic numerals
 * @param value - The numeric value to format
 * @returns Formatted currency string (e.g., "١٢٣.٤٥ ج.م")
 */
export const formatCurrency = (value: number): string => {
  return `${toArabicNumerals(value.toFixed(2))} ج.م`;
};
