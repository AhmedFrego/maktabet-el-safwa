import { useGetList, useStore } from 'react-admin';
import { Tables } from 'types/supabase-generated.types';

export const useGetCovers = () => {
  const [setting] = useStore<Tables<'settings'>>('settings');
  const availble_covers = useGetList<Tables<'cover_types'>>('cover_types').data?.filter((x) =>
    setting?.available_covers?.includes(x.id)
  );

  const getCovers = (paperType: string) => {
    const covers = availble_covers
      ?.filter((x) => x.to_paper_size.includes(paperType))
      .map((x) => ({ ...x, ...setting?.covers_prices?.find((c) => c.id === x.id) }));
    return { covers };
  };
  return { getCovers };
};
