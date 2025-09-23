import type { MergeDeep } from 'type-fest';

import type { Database as DatabaseGenerated } from './supabase-generated.types';

import { ReservationRecord } from 'store/slices';

export interface paperPricesType {
  id: string;
  oneFacePrice: number;
  twoFacesPrice: number;
}

type ReservationsOverride = {
  reserved_items: ReservationRecord[];
};
type SettingsOverride = { paper_prices: paperPricesType[] | null };
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
      };
    };
  }
>;
