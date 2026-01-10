import { useCalcPrice, RawPriceResult } from './useCalcPrice';
import { Json, PriceCalculationRecord } from 'types';

export interface GroupPriceItem {
  record: PriceCalculationRecord & { id: string; related_publications?: string[] | Json[] | null };
  paperTypeId?: string;
  coverId?: string;
  quantity?: number;
}

export interface GroupPriceResult {
  /** Total price for all items in the group (with group rounding applied) */
  groupTotal: {
    oneFacePrice: number;
    twoFacesPrice: number;
  };
  /** Individual raw prices for each item (before group rounding) */
  itemPrices: {
    id: string;
    rawPrice: RawPriceResult;
    quantity: number;
    itemTotal: {
      oneFacePrice: number;
      twoFacesPrice: number;
    };
  }[];
  /** Whether group rounding was applied (any item has do_round: true) */
  isRounded: boolean;
  /** The rounding value used */
  roundTo: number;
}

/**
 * Hook for calculating prices for a group of related publications.
 *
 * Pricing rules:
 * - All items in a related group (partial or full) are summed without individual rounding
 * - The total is ceiled together using group rounding
 * - If ANY member has do_round: true, the whole group total gets rounded
 * - Quantity is multiplied after raw price calculation
 */
export const useCalcGroupPrice = () => {
  const { calcRawPrice, getRoundTo } = useCalcPrice();

  /**
   * Calculate grouped price for multiple related publications
   * @param items Array of publications with their quantities
   * @returns GroupPriceResult with group total and individual breakdowns
   */
  const calcGroupPrice = (items: GroupPriceItem[]): GroupPriceResult => {
    if (items.length === 0) {
      return {
        groupTotal: { oneFacePrice: 0, twoFacesPrice: 0 },
        itemPrices: [],
        isRounded: false,
        roundTo: 1,
      };
    }

    // Calculate raw prices for each item
    const itemPrices = items.map((item) => {
      const rawPrice = calcRawPrice({
        record: item.record,
        paperTypeId: item.paperTypeId,
        coverId: item.coverId,
      });
      const quantity = item.quantity || 1;

      return {
        id: item.record.id,
        rawPrice,
        quantity,
        itemTotal: {
          oneFacePrice: rawPrice.oneFacePrice * quantity,
          twoFacesPrice: rawPrice.twoFacesPrice * quantity,
        },
      };
    });

    // Sum all raw prices
    const rawTotals = itemPrices.reduce(
      (acc, item) => ({
        oneFacePrice: acc.oneFacePrice + item.itemTotal.oneFacePrice,
        twoFacesPrice: acc.twoFacesPrice + item.itemTotal.twoFacesPrice,
      }),
      { oneFacePrice: 0, twoFacesPrice: 0 }
    );

    // Check if ANY item has do_round: true
    const shouldRound = itemPrices.some((item) => item.rawPrice.doRound);
    const roundTo = shouldRound ? getRoundTo() : 1;

    // Apply single ceiling to group total
    const groupTotal = {
      oneFacePrice: Math.ceil(rawTotals.oneFacePrice / roundTo) * roundTo,
      twoFacesPrice: Math.ceil(rawTotals.twoFacesPrice / roundTo) * roundTo,
    };

    return {
      groupTotal,
      itemPrices,
      isRounded: shouldRound,
      roundTo,
    };
  };

  /**
   * Check if items belong to the same related group
   * @param items Array of publication records
   * @returns true if all items share the same related_publications group
   */
  const areItemsRelated = (
    items: { id: string; related_publications?: string[] | null }[]
  ): boolean => {
    if (items.length <= 1) return false;

    // Check if each item's related_publications includes other items
    return items.every((item) => {
      if (!item.related_publications || item.related_publications.length === 0) {
        return false;
      }
      // Check if at least one other item in the group is in this item's related_publications
      return items.some(
        (other) => other.id !== item.id && item.related_publications?.includes(other.id)
      );
    });
  };

  /**
   * Group items by their related publication groups
   * @param items Array of reservation items
   * @returns Map of groupId -> items in that group
   */
  const groupRelatedItems = <T extends { id: string; related_publications?: string[] | null }>(
    items: T[]
  ): Map<string, T[]> => {
    const groups = new Map<string, T[]>();
    const processedIds = new Set<string>();

    items.forEach((item) => {
      if (processedIds.has(item.id)) return;

      // Find all items that are related to this one
      const relatedIds = new Set(item.related_publications || []);
      relatedIds.add(item.id);

      // Collect all items in this group
      const groupItems = items.filter((i) => relatedIds.has(i.id));

      if (groupItems.length > 1) {
        // Create a consistent group ID by sorting and joining IDs
        const groupId = [...relatedIds].sort().join('|');
        groups.set(groupId, groupItems);
        groupItems.forEach((gi) => processedIds.add(gi.id));
      } else {
        // Single item, use its own ID as group ID
        groups.set(item.id, [item]);
        processedIds.add(item.id);
      }
    });

    return groups;
  };

  return { calcGroupPrice, areItemsRelated, groupRelatedItems };
};
