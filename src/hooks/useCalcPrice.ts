import { useStore } from 'react-admin';
import { Tables } from 'types/supabase-generated.types';
import { PriceCalculationRecord } from 'types';
import { useGetCovers } from './useGetCovers';

export interface RawPriceResult {
  oneFacePrice: number;
  twoFacesPrice: number;
  coverPrice: number;
  chosenCover: ReturnType<ReturnType<typeof useGetCovers>['getCovers']>['covers'] extends
    | (infer T)[]
    | undefined
    ? T | null
    : never;
  doRound: boolean;
}

export const useCalcPrice = () => {
  const [setting] = useStore<Tables<'settings'>>('settings');
  const { getCovers } = useGetCovers();

  /**
   * Calculate raw prices without rounding - used for group pricing
   * Returns base prices that can be summed before applying group rounding
   */
  const calcRawPrice = ({
    record,
    paperTypeId,
    coverId: cover,
  }: UseCalcPriceProps): RawPriceResult => {
    const paperType = paperTypeId || record.paper_type_id;
    const paperPrice = setting?.paper_prices?.find((x) => x.id === paperType);

    const printPrices = {
      oneFacePrice: ((paperPrice?.oneFacePrice || 0) * record.pages) / 100,
      twoFacesPrice: ((paperPrice?.twoFacesPrice || 0) * record.pages) / 100,
    };

    // Skip cover price if coverless
    let coverPrice = 0;
    let chosenCover = null;

    if (!record.coverless) {
      const { covers } = getCovers(paperType);
      chosenCover = cover ? covers?.find((c) => c.id === cover) : covers?.[0];
      coverPrice =
        Number(record.two_faces_cover ? chosenCover?.twoFacesPrice : chosenCover?.oneFacePrice) ||
        0;
    }

    // Return raw prices with change_price included but no rounding
    return {
      oneFacePrice:
        printPrices.oneFacePrice + coverPrice + (+record.change_price?.oneFacePrice || 0),
      twoFacesPrice:
        printPrices.twoFacesPrice + coverPrice + (+record.change_price?.twoFacesPrice || 0),
      coverPrice,
      chosenCover: chosenCover ?? null,
      doRound: record.do_round ?? false,
    };
  };

  /**
   * Calculate price for a single publication with individual rounding
   */
  const calcPrice = ({ record, paperTypeId, coverId: cover }: UseCalcPriceProps) => {
    const paperType = paperTypeId || record.paper_type_id;
    const paperPrice = setting?.paper_prices?.find((x) => x.id === paperType);
    const printPrices = {
      oneFacePrice: ((paperPrice?.oneFacePrice || 0) * record.pages) / 100,
      twoFacesPrice: ((paperPrice?.twoFacesPrice || 0) * record.pages) / 100,
    };

    // Skip cover price if coverless
    let coverPrice = 0;
    let chosenCover = null;

    if (!record.coverless) {
      const { covers } = getCovers(paperType);
      chosenCover = cover ? covers?.find((c) => c.id === cover) : covers?.[0];
      coverPrice =
        Number(record.two_faces_cover ? chosenCover?.twoFacesPrice : chosenCover?.oneFacePrice) ||
        0;
    }

    const round_to = record.do_round ? setting?.price_ceil_to || 1 : 1;

    const roundedPriceWithCover = {
      oneFacePrice:
        Math.ceil((printPrices.oneFacePrice + coverPrice) / round_to) * round_to +
        (+record.change_price?.oneFacePrice || 0),
      twoFacesPrice:
        Math.ceil((printPrices.twoFacesPrice + coverPrice) / round_to) * round_to +
        (+record.change_price?.twoFacesPrice || 0),
    };
    return { price: roundedPriceWithCover, cover: chosenCover };
  };

  /**
   * Get the rounding value from settings
   */
  const getRoundTo = () => setting?.price_ceil_to || 1;

  return { calcPrice, calcRawPrice, getRoundTo };
};

interface UseCalcPriceProps<T = unknown> {
  record: PriceCalculationRecord & T;
  paperTypeId?: string;
  coverId?: string;
}
