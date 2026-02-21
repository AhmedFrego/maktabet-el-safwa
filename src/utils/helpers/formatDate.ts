import dayjs from 'dayjs';

/**
 * Formats a date string to DD/MM format
 * @param dateStr - ISO date string or date object
 * @returns Formatted date string (e.g., "21/02")
 */
export const formatDate = (dateStr: string | Date): string => {
  return dayjs(dateStr).format('DD/MM');
};
