import { useGetList, useStore } from 'react-admin';
import { Publication } from 'resources/notes';
import { Tables } from 'types/supabase-generated.types';

export const useCalcPrice = () => {
  const [setting] = useStore<Tables<'settings'>>('settings');
  const availble_cover_types = useGetList<Tables<'cover_types'>>('cover_types').data?.filter((x) =>
    setting?.available_covers?.includes(x.id)
  );

  // .map((x) => x.to_paper_size);

  const calcPrice = ({ record, paperSize }: UseCalcPriceProps) => {
    const paper_type = paperSize || record.default_paper_size;
    const paper_price = setting?.paper_prices?.find((x) => x.id === paper_type)?.[
      record.is_double_face ? 'twoFacesPrice' : 'oneFacePrice'
    ];
    const suitable_available_cover = availble_cover_types?.filter((x) => x.includes(paper_type));

    const covers_prices = [];

    const round_to = record.do_round ? setting?.price_ceil_to : 1;
    console.log((paper_price || 0) * record.pages, suitable_available_cover);
  };

  return { calcPrice };
};

interface UseCalcPriceProps {
  record: Publication | Tables<'publications'>;
  paperSize?: Tables<'paper_types'>['id'];
}
