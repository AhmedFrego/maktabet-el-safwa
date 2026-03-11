import {
  List,
  ReferenceInput,
  AutocompleteInput,
  SelectArrayInput,
  TextInput,
  ListControllerResult,
} from 'react-admin';
import { useTranslate } from 'react-admin'; // make sure you have this
import { Loading, StyledContainer } from 'components/UI';
import { Reservation } from '.';
import { ReservationRecordCard } from './components';
import { Enums } from 'types/supabase-generated.types';
import { Box, Divider } from '@mui/material';
import { Fragment } from 'react';

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
        sx={{ width: '100%', minWidth: 300 }}
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
    <TextInput
      key="codeFilter"
      source="reservation_code"
      label={translate('resources.reservations.fields.reservation_code')}
      variant="standard"
      alwaysOn
      resettable
    />,
    <SelectArrayInput
      variant="standard"
      key="statusFilter"
      source="reservation_status"
      alwaysOn
      choices={
        [
          { id: 'in-progress', name: translate('resources.reservations.status.in-progress') },
          { id: 'ready', name: translate('resources.reservations.status.ready') },
          { id: 'canceled', name: translate('resources.reservations.status.canceled') },
          { id: 'delivered', name: translate('resources.reservations.status.delivered') },
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
        reservation_status: ['in-progress', 'ready'] as Enums<'reservation_state'>[],
      }}
      queryOptions={{
        meta: {
          columns: ['*', 'client:users(full_name, phone_number)', 'reserved_items'],
        },
      }}
      render={({
        isPending,
        error,
        data: reservations,
      }: ListControllerResult<Reservation, Error>) => {
        if (isPending) return <Loading />;
        if (error)
          return (
            <Box>
              {translate('custom.messages.error_prefix')}: {error.message}
            </Box>
          );
        if (!reservations.length)
          return <div>{translate('resources.reservations.messages.no_items')}</div>;

        return (
          <StyledContainer sx={{ flexDirection: 'column' }}>
            {reservations?.map((reservation, index) => (
              <Fragment key={reservation.id}>
                {index > 0 && <Divider sx={{ my: 1.5 }} />}
                <ReservationRecordCard reservation={reservation} />
              </Fragment>
            ))}
          </StyledContainer>
        );
      }}
    ></List>
  );
};
