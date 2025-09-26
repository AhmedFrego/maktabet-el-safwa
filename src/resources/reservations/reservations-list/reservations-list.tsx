import {
  List,
  ReferenceInput,
  AutocompleteInput,
  useListContext,
  SelectArrayInput,
} from 'react-admin';
import { useTranslate } from 'react-admin'; // make sure you have this
import { Loading, StyledContainer } from 'components/UI';
import { Reservation } from '..';
import { ReservationItem } from '../components';
import { Enums } from 'types/supabase-generated.types';

export const ReservationList = () => {
  const translate = useTranslate();
  const filters = [
    <ReferenceInput
      key="clientFilter"
      source="client_id"
      reference="users"
      sort={{ field: 'created_at', order: 'DESC' }}
      alwaysOn
    >
      <AutocompleteInput
        sx={{ width: '100%' }}
        variant="standard"
        label={translate('custom.labels.client')}
        optionText={(record) => (record ? `${record.full_name} (${record.phone_number})` : '')}
        filterToQuery={(searchText) => {
          if (!searchText) return {};
          const q = `%${searchText.trim()}%`;
          return {
            or: `(full_name.ilike.${q},phone_number.ilike.${q})`,
          };
        }}
      />
    </ReferenceInput>,
    <SelectArrayInput
      variant="standard"
      key="statusFilter"
      source="reservation_status"
      alwaysOn
      choices={
        [
          { id: 'in-progress', name: 'In Progress' },
          { id: 'ready', name: 'Ready' },
          { id: 'canceled', name: 'Canceled' },
          { id: 'delivered', name: 'Delivered' },
        ] as { id: Enums<'reservation_state'>; name: string }[]
      }
    />,
  ];

  return (
    <List
      sort={{ field: 'dead_line', order: 'ASC' }}
      actions={false}
      filters={filters}
      filterDefaultValues={{
        reservation_status: [
          'in-progress' as Enums<'reservation_state'>,
          'ready' as Enums<'reservation_state'>,
        ],
      }}
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
  if (isLoading) return <Loading />;

  return (
    <StyledContainer>
      {reservations?.map((reservation) => (
        <ReservationItem key={reservation.id} reservation={reservation} />
      ))}
    </StyledContainer>
  );
};
