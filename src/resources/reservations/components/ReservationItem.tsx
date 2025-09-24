import { Reservation } from '..';

export const ReservationItem = ({ reservation }: ReservationItemProps) => {
  return <div>{reservation.paid_amount}</div>;
};

interface ReservationItemProps {
  reservation: Reservation;
}
