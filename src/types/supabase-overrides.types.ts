import type { MergeDeep } from 'type-fest';

import type { Database as DatabaseGenerated } from './supabase-generated.types';

import { ReservationRecord } from 'store/slices';

export interface PaperPricesType {
  id: string;
  oneFacePrice: number;
  twoFacesPrice: number;
}

type ReservationsOverride = { reserved_items: ReservationRecord[] };

type SettingsOverride = {
  paper_prices: PaperPricesType[] | null;
  covers_prices: PaperPricesType[] | null;
};

type CoverTypesOverride = { to_paper_size: string[] };

export type MergedDatabase = MergeDeep<
  DatabaseGenerated,
  {
    public: {
      Tables: {
        settings: {
          Row: SettingsOverride;
          Insert: SettingsOverride;
          Update: SettingsOverride;
        };
        reservations: {
          Row: ReservationsOverride;
          Insert: ReservationsOverride;
          Update: ReservationsOverride;
        };
        cover_types: {
          Row: CoverTypesOverride;
          Insert: CoverTypesOverride;
          Update: CoverTypesOverride;
        };
      };
    };
  }
>;
