import { List, useListContext } from 'react-admin';

import { Loading, StyledContainer } from 'components/UI';
import { Reservation } from '.';
import { ReservationItem } from './components';

export const ReservationList = () => {
  return (
    <List
      actions={false}
      queryOptions={{
        meta: {
          columns: ['*', 'client:users(full_name, phone_number)'],
        },
      }}
    >
      <ReservationsContainer />
    </List>
  );
};

const ReservationsContainer = () => {
  const { data: reservations, isLoading } = useListContext<Reservation>();
  console.log(reservations);
  if (isLoading) return <Loading />;

  return (
    <StyledContainer>
      {reservations?.map((reservation) => (
        <ReservationItem key={reservation.id} reservation={reservation} />
      ))}
    </StyledContainer>
  );
};
