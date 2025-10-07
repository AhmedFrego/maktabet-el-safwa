import { useStore } from 'react-admin';
import { Tables } from 'types/supabase-generated.types';
import { useGetCovers } from './useGetCovers';

export const useCalcPrice = () => {
  const [setting] = useStore<Tables<'settings'>>('settings');
  const { getCovers } = useGetCovers();

  const calcPrice = ({ record, paperTypeId, coverId: cover }: UseCalcPriceProps) => {
    const paperType = paperTypeId || record.paper_type_id;
    const paperPrice = setting?.paper_prices?.find((x) => x.id === paperType);
    const printPrices = {
      oneFacePrice: ((paperPrice?.oneFacePrice || 0) * record.pages) / 100,
      twoFacesPrice: ((paperPrice?.twoFacesPrice || 0) * record.pages) / 100,
    };

    const { covers } = getCovers(paperType);
    const chosenCover = cover ? covers?.find((c) => c.id === cover) : covers?.[0];

    const coverPrice =
      (record.two_faces_cover ? chosenCover?.twoFacesPrice : chosenCover?.oneFacePrice) || 0;

    const round_to = record.do_round ? setting?.price_ceil_to || 1 : 1;

    const roundedPriceWithCover = {
      oneFacePrice:
        Math.ceil((printPrices.oneFacePrice + coverPrice) / round_to) * round_to +
        (record.change_price?.oneFacePrice || 0),
      twoFacesPrice:
        Math.ceil((printPrices.twoFacesPrice + coverPrice) / round_to) * round_to +
        (record.change_price?.twoFacesPrice || 0),
    };
    return { price: roundedPriceWithCover, cover: chosenCover };
  };

  return { calcPrice };
};

interface UseCalcPriceProps<T = unknown> {
  record: T & Tables<'publications'>;
  paperTypeId?: string;
  coverId?: string;
}
