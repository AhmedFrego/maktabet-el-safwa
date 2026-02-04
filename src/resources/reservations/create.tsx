import { useState, useRef, useMemo } from 'react';
import { Modal } from '@mui/material';
import { Create, Edit, SimpleForm, useStore, useGetOne } from 'react-admin';
import dayjs from 'dayjs';
import 'dayjs/locale/ar';

import { ModalWrapper, ModalContent } from 'components/UI';
import { supabase } from 'lib';
import {
  clearItems,
  markAllAsDelivered,
  useAppDispatch,
  useAppSelector,
  ReservationRecord,
  setEditingReservation,
} from 'store';
import { Tables, TablesInsert, TablesUpdate } from 'types';
import { PickerValue } from '@mui/x-date-pickers/internals';
import { useCalcGroupPrice } from 'hooks';

import { ReservationFormContent, ReceiptPreview } from './components';

// State for created reservation data
interface CreatedReservation {
  id: string;
  clientId: string;
  paidAmount: number;
}

export const ReservationCreate = () => {
  const dispatch = useAppDispatch();
  const [setting] = useStore<Tables<'settings'>>('settings');
  const submitButtonRef = useRef<HTMLButtonElement>(null);
  const { groupRelatedItems } = useCalcGroupPrice();

  const {
    isReserving,
    reservedItems: reserved_items,
    editingReservation,
  } = useAppSelector((state) => state.reservation);

  // Calculate total price from reserved items (reflects any manual/unit price edits)
  const { total_price, groupedItems } = useMemo(() => {
    type ItemForGrouping = {
      id: string;
      related_publications?: string[] | null;
      originalItem: ReservationRecord;
    };

    // First, group related items together using just id and related_publications
    const itemsForGrouping: ItemForGrouping[] = reserved_items.map((item) => ({
      id: item.id,
      related_publications: item.related_publications || null,
      originalItem: item,
    }));

    const groups = groupRelatedItems<ItemForGrouping>(itemsForGrouping);

    // Sum totals for each group and compute overall total
    let totalPrice = 0;
    const groupedResult: { groupId: string; items: ReservationRecord[]; groupTotal: number }[] = [];

    groups.forEach((groupItemsRaw, groupId) => {
      const groupTotal = groupItemsRaw.reduce(
        (sum, g) => sum + (g.originalItem.totalPrice || 0),
        0
      );
      totalPrice += groupTotal;

      groupedResult.push({
        groupId,
        items: groupItemsRaw.map((g) => g.originalItem),
        groupTotal,
      });
    });

    return { total_price: totalPrice, groupedItems: groupedResult };
  }, [reserved_items, groupRelatedItems]);

  const dead_line = new Date(new Date().getTime() + (setting?.deliver_after || 2) * 60 * 60 * 1000);
  const [deadLine, setDeadLine] = useState<PickerValue>(dayjs(dead_line));
  const [instantDelivery, setInstantDelivery] = useState(false);
  const [createdReservation, setCreatedReservation] = useState<CreatedReservation | null>(null);

  // Fetch client data for receipt
  const { data: clientData } = useGetOne(
    'users',
    { id: createdReservation?.clientId || '' },
    { enabled: !!createdReservation?.clientId }
  );

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

    // Determine reservation status based on items' statuses
    const allDelivered = reserved_items.every((item) => item.status === 'delivered');
    const allReady = reserved_items.every((item) => item.status === 'ready');
    const hasInProgress = reserved_items.some((item) => item.status === 'in-progress');

    let calculatedStatus: 'in-progress' | 'ready' | 'delivered' = 'in-progress';
    if (instantDelivery || allDelivered) {
      calculatedStatus = 'delivered';
    } else if (allReady && !hasInProgress) {
      calculatedStatus = 'ready';
    } else if (hasInProgress) {
      calculatedStatus = 'in-progress';
    }

    // If editing an existing reservation, return update data
    if (editingReservation) {
      const updateData: TablesUpdate<'reservations'> = {
        reserved_items,
        total_price,
        paid_amount,
        client_id,
        remain_amount: total_price - paid_amount,
        dead_line: `${deadLine?.toISOString()}`,
        reservation_status: calculatedStatus,
        delivered_by: allDelivered ? session.session.user.id : null,
        delivered_at: allDelivered ? new Date().toISOString() : null,
      };
      return updateData;
    }

    // Otherwise, create new reservation
    const data: TablesInsert<'reservations'> = {
      created_by: session.session.user.id,
      reserved_items,
      total_price,
      paid_amount,
      client_id,
      remain_amount: total_price - paid_amount,
      dead_line: `${deadLine?.toISOString()}`,
      branch: setting?.branch,
      reservation_status: calculatedStatus,
      delivered_by: allDelivered ? session.session.user.id : null,
      delivered_at: allDelivered ? new Date().toISOString() : null,
    };

    return data;
  };

  // Handle closing after receipt is shown
  const handleCloseReceipt = () => {
    setCreatedReservation(null);
    dispatch(clearItems());
    dispatch(setEditingReservation(null));
  };

  // If reservation was just created, show the receipt
  if (createdReservation && !editingReservation) {
    return (
      <Modal
        open={isReserving === 'confirming'}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <ModalWrapper>
          <ModalContent sx={{ gap: 1.5 }}>
            <ReceiptPreview
              clientName={clientData?.full_name || 'العميل'}
              clientPhone={clientData?.phone_number}
              groupedItems={groupedItems}
              totalPrice={total_price}
              paidAmount={createdReservation.paidAmount}
              deadLine={deadLine}
              reservationId={createdReservation.id}
              onBack={() => {}} // Not used when onClose is provided
              autoDownloadPdf={true}
              onClose={handleCloseReceipt}
            />
          </ModalContent>
        </ModalWrapper>
      </Modal>
    );
  }

  return (
    <Modal
      open={isReserving === 'confirming'}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <ModalWrapper>
        {editingReservation ? (
          <Edit
            resource="reservations"
            id={editingReservation.reservation_id}
            transform={confirmReserve}
            mutationOptions={{
              onSuccess: () => {
                dispatch(clearItems());
                dispatch(setEditingReservation(null));
              },
            }}
            mutationMode="pessimistic"
          >
            <SimpleForm
              toolbar={false}
              defaultValues={{
                client_id: editingReservation.client_id,
                paid_amount: editingReservation.paid_amount,
              }}
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
          </Edit>
        ) : (
          <Create
            transform={confirmReserve}
            resource="reservations"
            mutationOptions={{
              onSuccess: (data) => {
                // Store the created reservation info to show receipt
                setCreatedReservation({
                  id: data.id,
                  clientId: data.client_id,
                  paidAmount: data.paid_amount,
                });
              },
            }}
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
        )}
      </ModalWrapper>
    </Modal>
  );
};
