import { Box, Modal, Typography } from '@mui/material';
import {
  AutocompleteInput,
  Button,
  Create,
  FormDataConsumer,
  NumberInput,
  ReferenceInput,
  required,
  SimpleForm,
  useTranslate,
} from 'react-admin';

import { ModalContent, ModalWrapper } from 'components/UI';
import { supabase } from 'lib';
import { clearItems, setIsReserving, useAppDispatch, useAppSelector } from 'store';
import { TablesInsert } from 'types';
import { toArabicNumerals, toSupabaseTimestamp } from 'utils';

import { CancelModal } from '.';
import { ReservedItem } from '../components';

export const CreateReservation = () => {
  const translate = useTranslate();
  const dispatch = useAppDispatch();
  const { isReserving, reservedItems: reserved_items } = useAppSelector(
    (state) => state.reservation
  );
  const total_price = reserved_items.reduce((acc, curr) => acc + curr.totalPrice, 0);

  const confirmReserve = async ({
    paid_amount,
    client_id,
  }: {
    paid_amount: number;
    client_id: string;
  }) => {
    const { data: session } = await supabase.auth.getSession();

    const getDateAfterTwoDays = (): Date => {
      const now = new Date();
      const twoDaysLater = new Date(now);
      twoDaysLater.setDate(now.getDate() + 2);
      return twoDaysLater;
    };

    const data: TablesInsert<'reservations'> = {
      created_by: session.session?.user.id || null,
      reserved_items,
      total_price,
      paid_amount,
      client_id,
      remain_amount: total_price - paid_amount,
      dead_line: toSupabaseTimestamp(getDateAfterTwoDays()),
    };

    return data;
  };

  return (
    <Modal
      open={isReserving === 'confirming'}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <ModalWrapper>
        <Create
          transform={confirmReserve}
          resource="reservations"
          mutationOptions={{ onSuccess: () => dispatch(clearItems()) }}
        >
          <SimpleForm toolbar={false}>
            <ModalContent>
              <ReferenceInput source="client_id" reference="users">
                <AutocompleteInput
                  validate={required()}
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
                  // create={() => {}}
                />
              </ReferenceInput>
              {reserved_items.map((x) => (
                <ReservedItem item={x} key={x.id} />
              ))}
              <Typography>
                {`${translate('custom.labels.total_price')} : ${toArabicNumerals(total_price)} ${translate('custom.currency.long')}`}
              </Typography>

              <FormDataConsumer>
                {({ formData }) => (
                  <>
                    {`${translate('custom.labels.remain_amount')} : ${toArabicNumerals(
                      total_price - (Number(formData.paid_amount) || 0)
                    )} ${translate('custom.currency.long')}`}
                  </>
                )}
              </FormDataConsumer>

              <NumberInput
                source="paid_amount"
                label={translate('custom.labels.paid_amount')}
                validate={required()}
              />

              <Box sx={{ display: 'flex', gap: '1rem' }}>
                <CancelModal />
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
          </SimpleForm>
        </Create>
      </ModalWrapper>
    </Modal>
  );
};
