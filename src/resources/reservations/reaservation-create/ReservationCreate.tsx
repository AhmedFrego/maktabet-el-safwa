import { Box, Modal, Typography } from '@mui/material';
import {
  Button,
  Create,
  FormDataConsumer,
  maxValue,
  NumberInput,
  required,
  SimpleForm,
  useStore,
  useTranslate,
} from 'react-admin';

import { ModalContent, ModalWrapper, NestedModal } from 'components/UI';
import { supabase } from 'lib';
import { clearItems, setIsReserving, useAppDispatch, useAppSelector } from 'store';
import { Tables, TablesInsert } from 'types';
import { toArabicNumerals } from 'utils';

import { ReservedItem } from '../components';
import { ClientInput } from 'components/form';

export const ReservationCreate = () => {
  const translate = useTranslate();
  const dispatch = useAppDispatch();
  const [setting] = useStore<Tables<'settings'>>('settings');

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
    if (!session.session) return;

    const data: TablesInsert<'reservations'> = {
      created_by: session.session.user.id,
      reserved_items,
      total_price,
      paid_amount,
      client_id,
      remain_amount: total_price - paid_amount,
      dead_line: `${new Date(new Date().getTime() + (setting?.deliver_after || 2) * 60 * 60 * 1000)}`,
      branch: setting?.branch,
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
          <SimpleForm
            toolbar={false}
            sx={(theme) => ({
              backgroundColor: theme.palette.grey[50],
              border: `2px solid ${theme.palette.info.dark}`,
              borderRadius: 1,
              width: '100%',
            })}
          >
            <ModalContent>
              <ClientInput />
              {reserved_items.map((x) => (
                <ReservedItem item={x} key={x.id} />
              ))}
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
              />
              <CTA />
            </ModalContent>
          </SimpleForm>
        </Create>
      </ModalWrapper>
    </Modal>
  );
};

const CTA = () => {
  const dispatch = useAppDispatch();
  const translate = useTranslate();

  return (
    <Box sx={{ display: 'flex', gap: '1rem' }}>
      <NestedModal
        confirmFn={() => dispatch(clearItems())}
        title={translate('resources.reservations.actions.cancel')}
      />
      <Button
        variant="outlined"
        sx={{ fontFamily: 'inherit' }}
        onClick={() => dispatch(setIsReserving(true))}
        color="info"
      >
        {translate('ra.action.edit')}
      </Button>
      <Button variant="outlined" sx={{ fontFamily: 'inherit' }} type="submit" color="success">
        {translate('ra.action.confirm')}
      </Button>
    </Box>
  );
};
