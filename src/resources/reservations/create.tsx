import { useState } from 'react';
import { Modal } from '@mui/material';
import { Create, SimpleForm, useStore } from 'react-admin';
import dayjs from 'dayjs';
import 'dayjs/locale/ar';

import { ModalWrapper } from 'components/UI';
import { supabase } from 'lib';
import { clearItems, markAllAsDelivered, useAppDispatch, useAppSelector } from 'store';
import { Tables, TablesInsert } from 'types';
import { PickerValue } from '@mui/x-date-pickers/internals';

import { ReservationFormContent } from './components';

export const ReservationCreate = () => {
  const dispatch = useAppDispatch();
  const [setting] = useStore<Tables<'settings'>>('settings');

  const { isReserving, reservedItems: reserved_items } = useAppSelector(
    (state) => state.reservation
  );
  const total_price = reserved_items.reduce((acc, curr) => acc + curr.totalPrice, 0);
  const dead_line = new Date(new Date().getTime() + (setting?.deliver_after || 2) * 60 * 60 * 1000);
  const [deadLine, setDeadLine] = useState<PickerValue>(dayjs(dead_line));
  const [isDeliveredNow, setIsDeliveredNow] = useState(false);

  const handleSetNow = () => {
    setDeadLine(dayjs());
    dispatch(markAllAsDelivered());
    setIsDeliveredNow(true);
  };

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
      dead_line: `${deadLine?.toISOString()}`,
      branch: setting?.branch,
      reservation_status: isDeliveredNow ? 'delivered' : 'in-progress',
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
            <ReservationFormContent
              reserved_items={reserved_items}
              total_price={total_price}
              deadLine={deadLine}
              setDeadLine={setDeadLine}
              onSetNow={handleSetNow}
            />
          </SimpleForm>
        </Create>
      </ModalWrapper>
    </Modal>
  );
};
