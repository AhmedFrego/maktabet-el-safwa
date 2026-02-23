import { useCallback } from 'react';
import { Tables } from 'types';
import { useCalcPrice, useGetCovers } from 'hooks';

export interface ReservationItemData {
  pages: number;
  paperTypeId: string;
  coverless: boolean;
  coverId: string;
  isDublix: boolean;
  doRound: boolean;
  paperPriceOverride: number | null;
  itemPriceOverride: number | null;
}

export interface CalculatedPrice {
  itemPrice: number;
  isOverridden: boolean;
}

type SettingsWithRounding = Tables<'settings'> & {
  round_to_nearest?: number;
};

interface UseDirectReservationPricingProps {
  setting?: SettingsWithRounding;
}

export const useDirectReservationPricing = ({ setting }: UseDirectReservationPricingProps) => {
  const { calcRawPrice } = useCalcPrice();
  const { getCovers } = useGetCovers();

  /**
   * Calculate price for a single item based on its configuration
   * Memoized to prevent unnecessary recalculations
   */
  const calculateItemPrice = useCallback(
    (item: ReservationItemData): number => {
      // Return override if set
      if (item.itemPriceOverride !== null) {
        return item.itemPriceOverride;
      }

      // Return 0 if no pages
      if (item.pages <= 0) return 0;

      const record = {
        pages: item.pages,
        paper_type_id: item.paperTypeId,
        coverless: item.coverless,
        two_faces_cover: true,
        do_round: false, // We'll apply rounding manually
        change_price: { oneFacePrice: 0, twoFacesPrice: 0 },
      };

      // Get paper price
      let paperPrice: number;
      if (item.paperPriceOverride !== null) {
        // Use override if set
        paperPrice = item.paperPriceOverride;
      } else {
        // Calculate from settings
        const rawPrice = calcRawPrice({
          record,
          paperTypeId: item.paperTypeId,
          coverId: item.coverless ? undefined : item.coverId,
        });

        // Get base paper price (without cover)
        paperPrice = item.isDublix ? rawPrice.twoFacesPrice : rawPrice.oneFacePrice;
        if (!item.coverless) {
          paperPrice -= rawPrice.coverPrice;
        }

        // Convert to per 100 pages rate
        paperPrice = item.pages > 0 ? (paperPrice * 100) / item.pages : 0;
      }

      // Calculate total print price from paper price
      const printPrice = (paperPrice * item.pages) / 100;

      // Add cover price if not coverless
      let totalPrice = printPrice;
      if (!item.coverless) {
        const { covers } = getCovers(item.paperTypeId);
        const cover = covers?.find((c) => c.id === item.coverId);
        const coverPrice = Number(cover?.twoFacesPrice || cover?.oneFacePrice || 0);
        totalPrice += coverPrice;
      }

      // Always ceil the base price first
      totalPrice = Math.ceil(totalPrice);

      // Apply rounding if enabled
      if (item.doRound) {
        const roundTo = setting?.round_to_nearest || 1;
        totalPrice = Math.ceil(totalPrice / roundTo) * roundTo;
      }

      return totalPrice;
    },
    [calcRawPrice, getCovers, setting?.round_to_nearest]
  );

  /**
   * Calculate prices for multiple items
   * Returns individual prices and total with group rounding
   */
  const calculateGroupPrice = useCallback(
    (items: ReservationItemData[]) => {
      const itemPrices = items.map((item) => ({
        id: item.pages ? `${item.paperTypeId}-${item.coverId}` : 'temp',
        price: calculateItemPrice(item),
        isOverridden: item.itemPriceOverride !== null,
      }));

      const calculatedTotal = itemPrices.reduce((sum, p) => sum + p.price, 0);

      // Apply group rounding if any item has doRound
      const shouldRound = items.some((item) => item.doRound);
      const roundTo = shouldRound ? setting?.round_to_nearest || 1 : 1;
      const finalTotal = Math.ceil(calculatedTotal / roundTo) * roundTo;

      return { itemPrices, calculatedTotal, finalTotal };
    },
    [calculateItemPrice, setting?.round_to_nearest]
  );

  /**
   * Get available covers for a paper type
   */
  const getAvailableCovers = useCallback(
    (paperTypeId: string) => {
      return getCovers(paperTypeId).covers;
    },
    [getCovers]
  );

  /**
   * Get first available cover for a paper type
   */
  const getDefaultCoverId = useCallback(
    (paperTypeId: string) => {
      const covers = getCovers(paperTypeId).covers;
      return covers?.[0]?.id || '';
    },
    [getCovers]
  );

  return {
    calculateItemPrice,
    calculateGroupPrice,
    getAvailableCovers,
    getDefaultCoverId,
  };
};
