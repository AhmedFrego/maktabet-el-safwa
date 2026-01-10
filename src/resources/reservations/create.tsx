import { useState, useRef, useMemo } from 'react';
import { Modal } from '@mui/material';
import { Create, SimpleForm, useStore } from 'react-admin';
import dayjs from 'dayjs';
import 'dayjs/locale/ar';

import { ModalWrapper } from 'components/UI';
import { supabase } from 'lib';
import {
  clearItems,
  markAllAsDelivered,
  useAppDispatch,
  useAppSelector,
  ReservationRecord,
} from 'store';
import { Tables, TablesInsert } from 'types';
import { PickerValue } from '@mui/x-date-pickers/internals';
import { useCalcGroupPrice } from 'hooks';

import { ReservationFormContent } from './components';

export const ReservationCreate = () => {
  const dispatch = useAppDispatch();
  const [setting] = useStore<Tables<'settings'>>('settings');
  const submitButtonRef = useRef<HTMLButtonElement>(null);
  const { calcGroupPrice, groupRelatedItems } = useCalcGroupPrice();

  const { isReserving, reservedItems: reserved_items } = useAppSelector(
    (state) => state.reservation
  );

  // Calculate total price with group pricing
  const { total_price, groupedItems } = useMemo(() => {
    type ItemForGrouping = {
      id: string;
      related_publications?: string[] | null;
      originalItem: ReservationRecord;
    };

    // First, group related items together using just id and related_publications
    const itemsForGrouping: ItemForGrouping[] = reserved_items.map((item) => ({
      id: item.id,
      related_publications: (item.related_publications as string[] | null) || null,
      originalItem: item,
    }));

    const groups = groupRelatedItems<ItemForGrouping>(itemsForGrouping);

    // Calculate total for each group and sum
    let totalPrice = 0;
    const groupedResult: { groupId: string; items: ReservationRecord[]; groupTotal: number }[] = [];

    groups.forEach((groupItemsRaw, groupId) => {
      // Convert to GroupPriceItem format for calcGroupPrice
      const groupItems = groupItemsRaw.map((g) => ({
        record: g.originalItem as Parameters<typeof calcGroupPrice>[0][0]['record'],
        quantity: g.originalItem.quantity,
      }));

      const groupResult = calcGroupPrice(groupItems);
      const groupTotal = groupResult.groupTotal.twoFacesPrice;
      totalPrice += groupTotal;

      groupedResult.push({
        groupId,
        items: groupItemsRaw.map((g) => g.originalItem),
        groupTotal,
      });
    });

    return { total_price: totalPrice, groupedItems: groupedResult };
  }, [reserved_items, calcGroupPrice, groupRelatedItems]);

  const dead_line = new Date(new Date().getTime() + (setting?.deliver_after || 2) * 60 * 60 * 1000);
  const [deadLine, setDeadLine] = useState<PickerValue>(dayjs(dead_line));
  const [instantDelivery, setInstantDelivery] = useState(false);

  const handleInstantDelivery = () => {
    setDeadLine(dayjs());
    dispatch(markAllAsDelivered());
    setInstantDelivery(true);
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
      reservation_status: instantDelivery ? 'delivered' : 'in-progress',
      delivered_by: instantDelivery ? session.session.user.id : null,
      delivered_at: instantDelivery ? new Date().toISOString() : null,
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
              groupedItems={groupedItems}
              total_price={total_price}
              deadLine={deadLine}
              setDeadLine={setDeadLine}
              onInstantDelivery={handleInstantDelivery}
              submitButtonRef={submitButtonRef}
            />
          </SimpleForm>
        </Create>
      </ModalWrapper>
    </Modal>
  );
};
