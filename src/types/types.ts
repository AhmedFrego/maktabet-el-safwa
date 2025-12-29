import type { Tables } from './supabase-generated.types';

export interface idName<T = string> {
  id: T;
  name: string;
}

export type PriceCalculationRecord = Pick<
  Tables<'publications'>,
  'pages' | 'paper_type_id' | 'coverless' | 'two_faces_cover' | 'do_round' | 'change_price'
>;
