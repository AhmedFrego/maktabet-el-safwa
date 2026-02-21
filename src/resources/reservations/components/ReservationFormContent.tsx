import { Box, Divider, Typography, Button } from '@mui/material';
import {
  FormDataConsumer,
  NumberInput,
  maxValue,
  required,
  useTranslate,
  useGetOne,
} from 'react-admin';
import { useFormContext, useWatch } from 'react-hook-form';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { MobileDateTimePicker } from '@mui/x-date-pickers/MobileDateTimePicker';
import dayjs from 'dayjs';
import 'dayjs/locale/ar';
import { RefObject, useState } from 'react';
import { Star, Receipt } from '@mui/icons-material';

import { ModalContent } from 'components/UI';
import { ClientInput } from 'components/form';
import { toArabicNumerals } from 'utils';
import { PickerValue } from '@mui/x-date-pickers/internals';
import { ReservationRecord } from 'store/slices/reserviationSlice';

import { ReservedItem } from './ReservedItem';
import { AddCustomPublicationButton } from './AddCustomPublicationButton';
import { ReservationCTA } from './ReservationCTA';
import { ReceiptPreview } from './ReceiptPreview';

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
  onCancel?: () => void; // Optional cancel handler for edit mode
  onEdit?: () => void; // Optional edit handler for edit mode
}

export const ReservationFormContent = ({
  reserved_items,
  groupedItems,
  total_price,
  deadLine,
  setDeadLine,
  onInstantDelivery,
  submitButtonRef,
  onCancel,
  onEdit,
}: ReservationFormContentProps) => {
  const translate = useTranslate();
  const { setValue } = useFormContext();
  const [showReceiptPreview, setShowReceiptPreview] = useState(false);

  // Watch form values for receipt preview
  const clientId = useWatch({ name: 'client_id' });
  const paidAmount = useWatch({ name: 'paid_amount' });

  // Fetch client data for receipt
  const { data: clientData } = useGetOne('users', { id: clientId }, { enabled: !!clientId });

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

      // Find the master item in the group (if any)
      const masterItem = group.items.find((item) => item.is_collection_master === true);
      const nonMasterItems = group.items.filter((item) => item.is_collection_master !== true);

      // Sort items: master first, then by additional_data
      const sortedItems = masterItem ? [masterItem, ...nonMasterItems] : group.items;

      return (
        <Box key={group.groupId}>
          {isGrouped && masterItem && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                color: 'warning.main',
                mb: 0.5,
                backgroundColor: 'warning.light',
                px: 1.5,
                py: 0.5,
                borderRadius: 1,
              }}
            >
              <Star fontSize="small" />
              <Typography variant="body2" sx={{ fontFamily: 'inherit', fontWeight: 'bold' }}>
                {masterItem.title}
              </Typography>
              <Typography variant="caption" sx={{ mr: 'auto' }}>
                ({toArabicNumerals(group.items.length)} {translate('custom.labels.item')})
              </Typography>
            </Box>
          )}
          {isGrouped && !masterItem && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                color: 'secondary.main',
                mb: 0.5,
              }}
            >
              <Typography variant="caption" color="secondary">
                {translate('resources.publications.messages.collection_items')}:{' '}
                {toArabicNumerals(group.items.length)}
              </Typography>
            </Box>
          )}
          <Box
            sx={{
              borderRight: isGrouped ? '3px solid' : 'none',
              borderColor: masterItem ? 'warning.main' : 'secondary.main',
              pr: isGrouped ? 1.5 : 0,
              mb: 1,
            }}
          >
            {sortedItems.map((item) => (
              <ReservedItem
                item={item}
                key={item.id}
                isGroupMember={isGrouped}
                isMaster={item.is_collection_master === true}
              />
            ))}
            {isGrouped && (
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  backgroundColor: masterItem ? 'warning.light' : 'secondary.light',
                  color: masterItem ? 'warning.contrastText' : 'secondary.contrastText',
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 1,
                  mt: 0.5,
                }}
              >
                <Typography variant="caption">
                  {translate('resources.publications.messages.group_total')}:{' '}
                  {toArabicNumerals(group.groupTotal)} {translate('custom.currency.short')}
                </Typography>
                {savings > 0 && (
                  <Typography variant="caption" sx={{ color: 'success.main' }}>
                    ({translate('resources.publications.messages.saved')}{' '}
                    {toArabicNumerals(savings)} {translate('custom.currency.short')})
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

  // Show receipt preview
  if (showReceiptPreview) {
    return (
      <ModalContent sx={{ gap: 1.5 }}>
        <ReceiptPreview
          clientName={clientData?.full_name || translate('custom.labels.client')}
          clientPhone={clientData?.phone_number}
          groupedItems={groupedItems}
          totalPrice={total_price}
          paidAmount={Number(paidAmount) || 0}
          deadLine={deadLine}
          onBack={() => setShowReceiptPreview(false)}
        />
      </ModalContent>
    );
  }

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
      {/* Receipt Preview Button */}
      <Button
        variant="outlined"
        startIcon={<Receipt />}
        onClick={() => setShowReceiptPreview(true)}
        disabled={reserved_items.length === 0 || !clientId}
        sx={{ fontFamily: 'inherit' }}
      >
        معاينة الإيصال
      </Button>
      <FormDataConsumer>
        {({ formData }) => (
          <ReservationCTA
            hasItems={reserved_items.length > 0}
            onInstantDelivery={handleInstantDelivery}
            total_price={total_price}
            reserved_items={reserved_items}
            client_id={formData.client_id}
            submitButtonRef={submitButtonRef}
            onCancel={onCancel}
            onEdit={onEdit}
          />
        )}
      </FormDataConsumer>
    </ModalContent>
  );
};
