import { Box, Divider, Typography } from '@mui/material';
import { FormDataConsumer, NumberInput, maxValue, required, useTranslate } from 'react-admin';
import { useFormContext } from 'react-hook-form';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { MobileDateTimePicker } from '@mui/x-date-pickers/MobileDateTimePicker';
import dayjs from 'dayjs';
import 'dayjs/locale/ar';
import { RefObject } from 'react';
import { GroupWork } from '@mui/icons-material';

import { ModalContent } from 'components/UI';
import { ClientInput } from 'components/form';
import { toArabicNumerals } from 'utils';
import { PickerValue } from '@mui/x-date-pickers/internals';
import { ReservationRecord } from 'store/slices/reserviationSlice';

import { ReservedItem } from './ReservedItem';
import { AddCustomPublicationButton } from './AddCustomPublicationButton';
import { ReservationCTA } from './ReservationCTA';

interface GroupedItems {
  groupId: string;
  items: ReservationRecord[];
  groupTotal: number;
}

interface ReservationFormContentProps {
  reserved_items: ReservationRecord[];
  groupedItems: GroupedItems[];
  total_price: number;
  deadLine: PickerValue;
  setDeadLine: (value: PickerValue) => void;
  onInstantDelivery: () => void;
  submitButtonRef: RefObject<HTMLButtonElement>;
}

export const ReservationFormContent = ({
  reserved_items,
  groupedItems,
  total_price,
  deadLine,
  setDeadLine,
  onInstantDelivery,
  submitButtonRef,
}: ReservationFormContentProps) => {
  const translate = useTranslate();
  const { setValue } = useFormContext();

  const handleInstantDelivery = () => {
    setValue('paid_amount', total_price);
    onInstantDelivery();
  };

  // Render items grouped by related publications
  const renderGroupedItems = () => {
    return groupedItems.map((group, groupIndex) => {
      const isGrouped = group.items.length > 1;
      const individualSum = group.items.reduce((sum, item) => sum + item.totalPrice, 0);
      const savings = individualSum - group.groupTotal;

      return (
        <Box key={group.groupId}>
          {isGrouped && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                color: 'secondary.main',
                mb: 0.5,
              }}
            >
              <GroupWork fontSize="small" />
              <Typography variant="caption" color="secondary">
                مجموعة مرتبطة ({toArabicNumerals(group.items.length)} عناصر)
              </Typography>
            </Box>
          )}
          <Box
            sx={{
              borderRight: isGrouped ? '3px solid' : 'none',
              borderColor: 'secondary.main',
              pr: isGrouped ? 1.5 : 0,
              mb: 1,
            }}
          >
            {group.items.map((item) => (
              <ReservedItem item={item} key={item.id} />
            ))}
            {isGrouped && (
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  backgroundColor: 'secondary.light',
                  color: 'secondary.contrastText',
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 1,
                  mt: 0.5,
                }}
              >
                <Typography variant="caption">
                  إجمالي المجموعة: {toArabicNumerals(group.groupTotal)}{' '}
                  {translate('custom.currency.short')}
                </Typography>
                {savings > 0 && (
                  <Typography variant="caption" sx={{ color: 'success.main' }}>
                    (وفرت {toArabicNumerals(savings)} {translate('custom.currency.short')})
                  </Typography>
                )}
              </Box>
            )}
          </Box>
          {groupIndex < groupedItems.length - 1 && <Divider sx={{ my: 1 }} />}
        </Box>
      );
    });
  };

  return (
    <ModalContent sx={{ gap: 1.5 }}>
      <ClientInput />
      {/* Hidden submit button for programmatic submission */}
      <button type="submit" ref={submitButtonRef} style={{ display: 'none' }} />
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
        renderGroupedItems()
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
          value={deadLine || dayjs()}
          orientation="landscape"
          onChange={(v) => setDeadLine(v)}
          disablePast
        />
      </LocalizationProvider>
      <FormDataConsumer>
        {({ formData }) => (
          <ReservationCTA
            hasItems={reserved_items.length > 0}
            onInstantDelivery={handleInstantDelivery}
            total_price={total_price}
            reserved_items={reserved_items}
            client_id={formData.client_id}
            submitButtonRef={submitButtonRef}
          />
        )}
      </FormDataConsumer>
    </ModalContent>
  );
};
