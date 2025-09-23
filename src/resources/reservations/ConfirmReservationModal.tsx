import { useState } from 'react';
import {
  AutocompleteInput,
  Form,
  FormDataConsumer,
  NumberInput,
  ReferenceInput,
  useTranslate,
  useDataProvider,
} from 'react-admin';
import { Box, Button, Divider, Modal, styled, Typography } from '@mui/material';

import { toArabicNumerals, toSupabaseTimestamp } from 'utils';
import { useAppDispatch, useAppSelector, clearItems, setIsReserving } from 'store';
import { ReservedItem } from './components';
import { TablesInsert } from 'types/supabase-generated.types';
import { supabase } from 'lib/supabase';

export const ConfirmReservationModal = () => {
  const dataProvider = useDataProvider();
  const translate = useTranslate();
  const dispatch = useAppDispatch();
  const { isReserving, reservedItems } = useAppSelector((state) => state.reservation);
  const totalPrice = reservedItems.reduce((acc, curr) => acc + curr.totalPrice, 0);

  const confirmReserve = async (params) => {
    const { data: session } = await supabase.auth.getSession();

    const getDateAfterTwoDays = (): Date => {
      const now = new Date();
      const twoDaysLater = new Date(now);
      twoDaysLater.setDate(now.getDate() + 2);
      return twoDaysLater;
    };

    const data: TablesInsert<'reservations'> = {
      created_by: session.session?.user.id || null,
      reserved_items: reservedItems,
      total_price: totalPrice,
      paid_amount: params.paid_amount,
      client_id: params.client_id,
      remain_amount: totalPrice - params.paid_amount,
      dead_line: toSupabaseTimestamp(getDateAfterTwoDays()),
    };
    return dataProvider
      .create('reservations', { data })
      .then(({ data }) => {
        return { data };
      })
      .catch((error) => {
        return Promise.reject(error);
      });
  };

  return (
    <Modal
      open={isReserving === 'confirming'}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <ModalWrapper>
        <Form onSubmit={confirmReserve}>
          <ModalContent>
            <ReferenceInput source="client_id" reference="users" isRequired>
              <AutocompleteInput isRequired
                sx={{ width: '100%' }}
                variant="standard"
                label={translate('custom.labels.client')}
                optionText={(record) =>
                  record ? `${record.full_name} (${record.phone_number})` : ''
                }
                filterToQuery={(searchText) => {
                  if (!searchText) return {};
                  const q = `%${searchText.trim()}%`;
                  return { or: `(full_name.ilike.${q},phone_number.ilike.${q})` };
                }}
              />
            </ReferenceInput>
            {reservedItems.map((x) => (
              <ReservedItem item={x} key={x.id} />
            ))}
            <Typography>
              {`${translate('custom.labels.total_price')} : ${toArabicNumerals(totalPrice)} ${translate('custom.currency.long')}`}
            </Typography>

            <FormDataConsumer>
              {({ formData }) => (
                <>
                  {`${translate('custom.labels.remain_amount')} : ${toArabicNumerals(
                    totalPrice - (Number(formData.paid_amount) || 0)
                  )} ${translate('custom.currency.long')}`}
                </>
              )}
            </FormDataConsumer>

            <NumberInput
              source="paid_amount"
              label={translate('custom.labels.paid_amount')}
              required
            />

            <Box sx={{ display: 'flex', gap: '1rem' }}>
              <NestedModal />{' '}
              <Button
                variant="outlined"
                sx={{ fontFamily: 'inherit' }}
                onClick={() => dispatch(setIsReserving(true))}
                color="info"
              >
                {translate('ra.action.edit')}
              </Button>
              <Button
                variant="outlined"
                sx={{ fontFamily: 'inherit' }}
                type="submit"
                color="success"
              >
                {translate('ra.action.confirm')}
              </Button>
            </Box>
          </ModalContent>
        </Form>
      </ModalWrapper>
    </Modal>
  );
};

const NestedModal = () => {
  const translate = useTranslate();
  const dispatch = useAppDispatch();

  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);

  const handleClose = () => setOpen(false);

  return (
    <div>
      <Button variant="outlined" sx={{ fontFamily: 'inherit' }} onClick={handleOpen} color="error">
        {translate('ra.action.cancel')}
      </Button>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="parent-modal-title"
        aria-describedby="parent-modal-description"
      >
        <ModalWrapper>
          <ModalContent>
            <Box sx={{ display: 'flex', gap: '1rem' }}>
              <Button
                variant="contained"
                sx={{ fontFamily: 'inherit' }}
                onClick={handleClose}
                color="primary"
              >
                {translate('ra.action.undo')}
              </Button>
              <Button
                variant="contained"
                color="error"
                sx={{ fontFamily: 'inherit' }}
                onClick={() => dispatch(clearItems())}
              >
                {translate('ra.action.confirm')}
              </Button>
            </Box>
          </ModalContent>
        </ModalWrapper>
      </Modal>
    </div>
  );
};

const ModalWrapper = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100vh',
  overflow: 'auto',
});

const ModalContent = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.grey[50],
  width: '30rem',
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius,
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
}));
