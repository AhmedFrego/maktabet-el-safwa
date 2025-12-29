import { Typography } from '@mui/material';
import { FormDataConsumer, NumberInput, maxValue, required, useTranslate } from 'react-admin';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { MobileDateTimePicker } from '@mui/x-date-pickers/MobileDateTimePicker';
import dayjs from 'dayjs';
import 'dayjs/locale/ar';

import { ModalContent } from 'components/UI';
import { ClientInput } from 'components/form';
import { toArabicNumerals } from 'utils';
import { PickerValue } from '@mui/x-date-pickers/internals';
import { ReservationRecord } from 'store/slices/reserviationSlice';

import { ReservedItem } from './ReservedItem';
import { AddCustomPublicationButton } from './AddCustomPublicationButton';
import { ReservationCTA } from './ReservationCTA';

interface ReservationFormContentProps {
  reserved_items: ReservationRecord[];
  total_price: number;
  deadLine: PickerValue;
  setDeadLine: (value: PickerValue) => void;
}

export const ReservationFormContent = ({
  reserved_items,
  total_price,
  deadLine,
  setDeadLine,
}: ReservationFormContentProps) => {
  const translate = useTranslate();

  return (
    <ModalContent sx={{ gap: 1.5 }}>
      <ClientInput />
      {reserved_items.length === 0 ? (
        <Typography
          variant="body1"
          sx={{
            textAlign: 'center',
            py: 2,
            px: 3,
            color: 'secondary.contrastText',
            backgroundColor: 'secondary.main',
            borderRadius: 1,
          }}
        >
          {translate('resources.reservations.messages.no_items')}
        </Typography>
      ) : (
        reserved_items.map((x) => <ReservedItem item={x} key={x.id} />)
      )}
      <AddCustomPublicationButton />
      <Typography>
        {`${translate('custom.labels.total_price')} : ${toArabicNumerals(total_price)} ${translate('custom.currency.long')}`}
      </Typography>
      <FormDataConsumer>
        {({ formData }) => {
          const remain_amount = total_price - (Number(formData.paid_amount) || 0);
          return `${translate('custom.labels.remain_amount')} : ${remain_amount === 0 ? `${translate('custom.labels.no_remain_amount')}` : `${toArabicNumerals(remain_amount)} ${translate('custom.currency.long')}`}`;
        }}
      </FormDataConsumer>
      <NumberInput
        source="paid_amount"
        label={translate('custom.labels.paid_amount')}
        validate={[required(), maxValue(total_price)]}
        helperText={false}
      />
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ar">
        <MobileDateTimePicker
          label={translate('resources.reservations.fields.dead_line')}
          defaultValue={dayjs(deadLine)}
          viewRenderers={{
            minutes: null,
            seconds: null,
          }}
          orientation="landscape"
          onChange={(v) => setDeadLine(v)}
          disablePast
        />
      </LocalizationProvider>
      <ReservationCTA hasItems={reserved_items.length > 0} />
    </ModalContent>
  );
};
