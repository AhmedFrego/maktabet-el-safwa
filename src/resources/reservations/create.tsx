import { useState, useRef, useMemo } from 'react';
import { Box, Modal } from '@mui/material';
import { Create, Edit, SimpleForm, useStore, useNotify } from 'react-admin';
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
  setEditingReservation,
} from 'store';
import { Tables, TablesInsert, TablesUpdate } from 'types';
import { PickerValue } from '@mui/x-date-pickers/internals';
import { useCalcGroupPrice } from 'hooks';

import { ReservationFormContent, ReceiptPreview } from './components';

export const ReservationCreate = () => {
  const dispatch = useAppDispatch();
  const [setting] = useStore<Tables<'settings'>>('settings');
  const submitButtonRef = useRef<HTMLButtonElement>(null);
  const { groupRelatedItems } = useCalcGroupPrice();

  // Receipt settings from Redux (persisted to localStorage)
  const receiptFormat = useAppSelector((state) => state.ui.reservationReceiptFormat);
  const autoPrint = useAppSelector((state) => state.ui.reservationAutoPrint);

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
  const notify = useNotify();

  // State for receipt generation after successful creation
  const [receiptData, setReceiptData] = useState<{
    clientName: string;
    clientPhone?: string;
    reservationCode: string;
    paidAmount: number;
  } | null>(null);

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

  // Handle success - show receipt for auto-download
  const handleCreateSuccess = async (data: Tables<'reservations'>) => {
    try {
      // Fetch client data for the receipt
      const { data: client } = await supabase
        .from('users')
        .select('full_name, phone_number')
        .eq('id', data.client_id)
        .single();

      // Set receipt data to trigger hidden receipt render + auto-download
      setReceiptData({
        clientName: client?.full_name || 'العميل',
        clientPhone: client?.phone_number || undefined,
        reservationCode: data.reservation_code,
        paidAmount: data.paid_amount,
      });

      notify('تم إنشاء الحجز بنجاح', { type: 'success' });
    } catch (error) {
      console.error('Error fetching client:', error);
      notify('تم إنشاء الحجز بنجاح', { type: 'success' });
      // Close even if client fetch failed
      setInstantDelivery(false);
      dispatch(clearItems());
      dispatch(setEditingReservation(null));
    }
  };

  // Called after PDF is auto-downloaded
  const handleReceiptClose = () => {
    setReceiptData(null);
    setInstantDelivery(false);
    dispatch(clearItems());
    dispatch(setEditingReservation(null));
  };

  return (
    <>
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
                  setInstantDelivery(false);
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
                onSuccess: handleCreateSuccess,
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

      {/* Hidden receipt for auto-download after creation */}
      {receiptData && (
        <Box
          sx={{
            position: 'fixed',
            left: '-9999px',
            top: 0,
            width: '400px',
            zIndex: -1,
          }}
        >
          <ReceiptPreview
            clientName={receiptData.clientName}
            clientPhone={receiptData.clientPhone}
            groupedItems={groupedItems}
            totalPrice={total_price}
            paidAmount={receiptData.paidAmount}
            deadLine={deadLine}
            reservationCode={receiptData.reservationCode}
            onBack={() => {}}
            autoDownloadPdf={receiptFormat === 'pdf'}
            autoDownloadImage={receiptFormat === 'jpg'}
            autoPrint={autoPrint}
            onClose={handleReceiptClose}
          />
        </Box>
      )}
    </>
  );
};
