import type { MergeDeep } from 'type-fest';

import type { Database as DatabaseGenerated } from './supabase-generated.types';

export interface paperPricesType {
  id: string;
  oneFacePrice: number;
  twoFacesPrice: number;
}

export type MergedDatabase = MergeDeep<
  DatabaseGenerated,
  {
    public: {
      Tables: {
        settings: {
          Row: {
            paper_prices: paperPricesType[] | null,
          },
        },
      },
    },
  }
>;
