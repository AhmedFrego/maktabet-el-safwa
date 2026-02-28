import { Tables } from 'types';
import { ReservationItemData } from 'hooks/useDirectReservationPricing';

/**
 * Create default form data for a reservation item
 */
export const createDefaultItemData = (
  setting: Tables<'settings'> | undefined,
  getDefaultCoverId: (paperTypeId: string) => string,
  defaultCoverless: boolean = true
): ReservationItemData => {
  const defaultPaperTypeId = setting?.default_paper_size || '';
  const defaultCoverId = defaultPaperTypeId ? getDefaultCoverId(defaultPaperTypeId) : '';

  return {
    pages: 0,
    paperTypeId: defaultPaperTypeId,
    coverless: defaultCoverless,
    coverId: defaultCoverId,
    isDublix: true,
    doRound: false,
    paperPriceOverride: null,
    itemPriceOverride: null,
  };
};

/**
 * Handle updates to item data with automatic cover selection
 */
export const updateItemData = (
  item: ReservationItemData,
  updates: Partial<ReservationItemData>,
  getDefaultCoverId: (paperTypeId: string) => string
): ReservationItemData => {
  const updated = { ...item, ...updates };

  // If paper type changed, update cover to first available
  if (updates.paperTypeId && updates.paperTypeId !== item.paperTypeId) {
    updated.coverId = getDefaultCoverId(updates.paperTypeId);
  }

  // Clear price override when other fields change (except when setting the override itself)
  if (
    'pages' in updates ||
    'paperTypeId' in updates ||
    'coverless' in updates ||
    'coverId' in updates ||
    'isDublix' in updates
  ) {
    if (!('itemPriceOverride' in updates)) {
      updated.itemPriceOverride = null;
    }
    if (!('paperPriceOverride' in updates)) {
      updated.paperPriceOverride = null;
    }
  }

  return updated;
};

/**
 * Generate a unique ID for a reservation item
 */
export const generateItemId = (type: 'custom' | 'direct' = 'custom'): string => {
  return `${type}-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
};

/**
 * Calculate paper price per 100 pages from item price and cover price
 */
export const calculatePaperPriceFromItemPrice = (
  itemPrice: number,
  pages: number,
  coverPrice: number = 0
): number => {
  if (pages <= 0) return 0;
  const paperPrice = itemPrice - coverPrice;
  return Math.round((paperPrice * 100) / pages);
};
/**
 * Calculate total reservation price from reserved items
 * Sums the totalPrice of each item in the reservation
 * @param reservedItems - Array of reservation items with totalPrice
 * @returns Total price of all items
 */
export const calculateReservationTotal = (
  reservedItems: Array<{ totalPrice?: number; price?: number }> | null | undefined
): number => {
  if (!reservedItems || !Array.isArray(reservedItems)) {
    return 0;
  }
  return reservedItems.reduce((sum, item) => {
    const price = item.totalPrice ?? item.price ?? 0;
    return sum + (typeof price === 'number' ? price : 0);
  }, 0);
};

/**
 * Calculate remaining amount to be paid for a reservation
 * Formula: total_price - paid_amount
 * @param reservedItems - Array of reservation items
 * @param paidAmount - Amount already paid by client
 * @returns Remaining amount to be paid
 */
export const calculateRemaining = (
  reservedItems: Array<{ totalPrice?: number; price?: number }> | null | undefined,
  paidAmount: number = 0
): number => {
  const total = calculateReservationTotal(reservedItems);
  const paid = typeof paidAmount === 'number' ? paidAmount : 0;
  return Math.max(0, total - paid);
};

/**
 * Check if a reservation is fully paid
 * @param reservedItems - Array of reservation items
 * @param paidAmount - Amount already paid by client
 * @returns true if remaining amount is 0
 */
export const isFullyPaid = (
  reservedItems: Array<{ totalPrice?: number; price?: number }> | null | undefined,
  paidAmount: number = 0
): boolean => {
  return calculateRemaining(reservedItems, paidAmount) === 0;
};
