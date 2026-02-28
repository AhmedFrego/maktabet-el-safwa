import dayjs from 'dayjs';

/**
 * Formats a date to ISO string with beginning-of-day time (YYYY-MM-DDTHH:mm:ssZ)
 * Appends 00:00:00Z to represent the start of the deadline day
 * @param date - Date object, dayjs instance, or date string
 * @returns ISO string with midnight time (e.g., "2026-02-25T00:00:00Z")
 */
export const formatDateOnly = (date: Date | dayjs.Dayjs | string): string => {
  return dayjs(date).format('YYYY-MM-DD') + 'T00:00:00Z';
};
