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
