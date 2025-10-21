import {
  ArrayField,
  BooleanField,
  DataTable,
  DateField,
  FunctionField,
  ImageField,
  NumberField,
  ReferenceField,
  Show,
  SimpleShowLayout,
  TextField,
  Title,
  useTranslate,
} from 'react-admin';

import { DividedContainer } from 'components/UI';
import { Tables } from 'types';
import { formatDateTime, toArabicNumerals, translateDayToArabic } from 'utils';
import { Reservation } from './types';
import { Box, Typography } from '@mui/material';
import { ReservationRecord } from 'store';

export const ReservationShow = () => {
  const translate = useTranslate();
  return (
    <Show<Reservation> title="تفاصيل الحجز">
      <SimpleShowLayout>
        <FunctionField
          source="reservation_status"
          label={false}
          render={(record) => {
            if (record.reservation_status === 'delivered') {
              return (
                <>
                  <DividedContainer>
                    {translate('resources.reservations.fields.reservation_status')}:
                    <FunctionField
                      source="reservation_status"
                      render={(record) =>
                        ` ${translate(`resources.reservations.status.${record.reservation_status}`)}`
                      }
                    />
                  </DividedContainer>
                  <DividedContainer>
                    {`${translate('resources.reservations.fields.delivered_by')}: `}
                    <ReferenceField
                      source="delivered_by"
                      reference="users"
                      render={({ referenceRecord }: { referenceRecord?: Tables<'users'> }) =>
                        referenceRecord?.full_name
                      }
                    />
                  </DividedContainer>

                  <DividedContainer>
                    {`${translate('resources.reservations.fields.delivered_at')}: `}
                    <FunctionField
                      source="delivered_at"
                      render={(record) => {
                        const { day, dayOfWeek, month, time } = formatDateTime(record.delivered_at);
                        return `${translateDayToArabic(dayOfWeek.day)} - ${toArabicNumerals(month)}/${toArabicNumerals(day)} - ${toArabicNumerals(time.hourMinute)} ${time.meridiem === 'AM' ? 'ص' : 'م'}`;
                      }}
                    />
                  </DividedContainer>
                </>
              );
            } else
              return (
                <DividedContainer>
                  {translate('resources.reservations.fields.reservation_status')}:
                  <FunctionField
                    source="reservation_status"
                    render={(record) =>
                      ` ${translate(`resources.reservations.status.${record.reservation_status}`)}`
                    }
                  />
                </DividedContainer>
              );
          }}
        />

        <DividedContainer>
          {`${translate('resources.reservations.fields.client_id')}: `}
          <ReferenceField
            source="client_id"
            reference="users"
            render={({ referenceRecord }: { referenceRecord?: Tables<'users'> }) =>
              referenceRecord?.full_name
            }
          />
        </DividedContainer>
        <DividedContainer>
          {`${translate('resources.reservations.fields.created_at')}: `}
          <FunctionField
            source="created_at"
            render={(record) => {
              const { day, dayOfWeek, month, time } = formatDateTime(record.created_at);
              return `${translateDayToArabic(dayOfWeek.day)} - ${toArabicNumerals(month)}/${toArabicNumerals(day)} - ${toArabicNumerals(time.hourMinute)} ${time.meridiem === 'AM' ? 'ص' : 'م'}`;
            }}
          />
        </DividedContainer>
        <DividedContainer>
          {translate('resources.reservations.fields.created_by')}:
          <ReferenceField
            source="created_by"
            reference="users"
            render={({ referenceRecord }: { referenceRecord?: Tables<'users'> }) =>
              ` ${referenceRecord?.full_name}`
            }
          />
        </DividedContainer>
        <DividedContainer>
          {translate('resources.reservations.fields.total_price')}:
          <FunctionField
            source="paid_amount"
            render={(record) =>
              ` ${toArabicNumerals(record.total_price)} ${translate('custom.currency.long')}`
            }
          />
        </DividedContainer>
        <DividedContainer>
          {translate('resources.reservations.fields.paid_amount')}:
          <FunctionField
            source="paid_amount"
            render={(record) =>
              ` ${toArabicNumerals(record.paid_amount)} ${translate('custom.currency.long')}`
            }
          />
        </DividedContainer>
        <DividedContainer>
          {translate('resources.reservations.fields.remain_amount')}:
          <FunctionField
            source="remain_amount"
            render={(record) =>
              ` ${record.remain_amount === 0 ? `${translate('custom.labels.no_remain_amount')}` : `${toArabicNumerals(record.remain_amount)} ${translate('custom.currency.long')}`}`
            }
          />
        </DividedContainer>
        <Box>
          <Typography variant="h4" gutterBottom color="info" align="center">
            {translate('resources.reservations.fields.reserved_items')}
          </Typography>
          <FunctionField
            source="reserved_items
          "
            label={false}
            render={(record) => {
              return record.reserved_items && record.reserved_items.length > 0 ? (
                record.reserved_items.map((item: ReservationRecord) => (
                  <Typography key={item.id}>{item.title}</Typography>
                ))
              ) : (
                <Box>{translate('resources.reservations.labels.no_reserved_items')}</Box>
              );
            }}
          />
        </Box>
      </SimpleShowLayout>
    </Show>
  );
};
