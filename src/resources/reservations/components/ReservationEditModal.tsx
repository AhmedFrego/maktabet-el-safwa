import { useState, useRef, useMemo, useEffect } from 'react';
import { Modal } from '@mui/material';
import { Edit, SimpleForm, useRedirect } from 'react-admin';
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
  setReservedItems,
  setIsReserving,
  setEditingReservation,
} from 'store';
import { TablesUpdate } from 'types';
import { PickerValue } from '@mui/x-date-pickers/internals';
import { useCalcGroupPrice } from 'hooks';

import { ReservationFormContent } from './ReservationFormContent';
import { Reservation } from '../types';

interface ReservationEditModalProps {
  open: boolean;
  onClose: () => void;
  reservation: Reservation;
}

export const ReservationEditModal = ({ open, onClose, reservation }: ReservationEditModalProps) => {
  const dispatch = useAppDispatch();
  const redirect = useRedirect();
  const submitButtonRef = useRef<HTMLButtonElement>(null);
  const { groupRelatedItems } = useCalcGroupPrice();

  const { reservedItems: reserved_items } = useAppSelector((state) => state.reservation);

  const [deadLine, setDeadLine] = useState<PickerValue>(dayjs(reservation.dead_line));
  const [instantDelivery, setInstantDelivery] = useState(false);

  // Initialize form with reservation data when modal opens
  useEffect(() => {
    if (open && reservation) {
      // Load all reserved items with ALL their properties preserved:
      // - manualPrice, isDublix, note, status, deliveredAt, deliveredBy, groupId, etc.
      dispatch(setReservedItems(reservation.reserved_items));
      dispatch(
        setEditingReservation({
          client_id: reservation.client_id,
          paid_amount: reservation.paid_amount,
          reservation_id: reservation.id,
        })
      );
      setDeadLine(dayjs(reservation.dead_line));
      setInstantDelivery(false);
    }
  }, [open, reservation, dispatch]);

  // Calculate total price from reserved items
  const { total_price, groupedItems } = useMemo(() => {
    type ItemForGrouping = {
      id: string;
      related_publications?: string[] | null;
      originalItem: ReservationRecord;
    };

    const itemsForGrouping: ItemForGrouping[] = reserved_items.map((item) => ({
      id: item.id,
      related_publications: item.related_publications || null,
      originalItem: item,
    }));

    const groups = groupRelatedItems<ItemForGrouping>(itemsForGrouping);

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

  const handleInstantDelivery = () => {
    setDeadLine(dayjs());
    dispatch(markAllAsDelivered());
    setInstantDelivery(true);
  };

  const confirmUpdate = async ({
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

    let calculatedStatus = reservation.reservation_status;
    if (instantDelivery || allDelivered) {
      calculatedStatus = 'delivered';
    } else if (allReady && !hasInProgress) {
      calculatedStatus = 'ready';
    } else if (hasInProgress) {
      calculatedStatus = 'in-progress';
    }

    const data: TablesUpdate<'reservations'> = {
      reserved_items,
      total_price,
      paid_amount,
      client_id,
      remain_amount: total_price - paid_amount,
      dead_line: `${deadLine?.toISOString()}`,
      reservation_status: calculatedStatus,
      delivered_by: allDelivered ? session.session.user.id : reservation.delivered_by,
      delivered_at: allDelivered ? new Date().toISOString() : reservation.delivered_at,
    };

    return data;
  };

  const handleClose = () => {
    dispatch(clearItems());
    dispatch(setEditingReservation(null));
    setInstantDelivery(false);
    onClose();
  };

  const handleEdit = () => {
    // Close modal but keep items and client data in Redux, enable reservation mode, and redirect to publications
    dispatch(setIsReserving(true));
    setInstantDelivery(false);
    onClose();
    redirect('/publications');
  };

  return (
    <Modal
      open={open}
      onClose={(_, reason) => {
        // Only close on escape key or explicit close button, not on backdrop click
        if (reason === 'escapeKeyDown') {
          handleClose();
        }
      }}
    >
      <ModalWrapper>
        <Edit
          resource="reservations"
          id={reservation.id}
          transform={confirmUpdate}
          mutationOptions={{
            onSuccess: () => {
              handleClose();
            },
          }}
          mutationMode="pessimistic"
        >
          <SimpleForm
            toolbar={false}
            key={reservation.id} // Force re-render when reservation changes
            defaultValues={{
              client_id: reservation.client_id,
              paid_amount: reservation.paid_amount,
            }}
            sx={(theme) => ({
              backgroundColor: theme.palette.grey[50],
              border: `2px solid ${theme.palette.warning.main}`,
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
              onCancel={handleClose}
              onEdit={handleEdit}
            />
          </SimpleForm>
        </Edit>
      </ModalWrapper>
    </Modal>
  );
};
