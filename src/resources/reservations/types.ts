import { Tables } from 'types';

export interface Reservation extends Tables<'reservations'> {
  client: { full_name: string; phone_number: string };
}
