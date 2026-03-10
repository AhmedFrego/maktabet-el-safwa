import {
  Box,
  Button,
  IconButton,
  Paper,
  styled,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useTheme,
} from '@mui/material';
import { Identifier, useDelete, useRefresh, useTranslate, useUpdate } from 'react-admin';
import { Cancel, Done, DoneAll, HelpOutline, RotateRight } from '@mui/icons-material';
import { useState } from 'react';

import { NestedModal } from 'components/UI';
import { ReservationRecord } from 'store';
import {
  formatDateTime,
  toArabicNumerals,
  translateDayToArabic,
  calculateReservationTotal,
  calculateRemaining,
  isFullyPaid,
} from 'utils';
import { myProvider, supabase } from 'lib';
import { formatDateOnly } from 'utils/helpers';

import { Reservation } from '..';
import { ReservationEditModal } from './ReservationEditModal';
import { Enums, TablesUpdate } from 'types/supabase-generated.types';

const STATUS_COLOR_MAP: Record<Enums<'reservation_state'>, string> = {
  'in-progress': 'warning.main',
  ready: 'info.main',
  delivered: 'success.main',
  canceled: 'error.main',
};

export const ReservationRecordCard = ({ reservation }: ReservationItemProps) => {
  const translate = useTranslate();
  const refresh = useRefresh();
  const [editModalOpen, setEditModalOpen] = useState(false);
  const theme = useTheme();

  const {
    client: { full_name, phone_number },
    dead_line,
    reservation_status,
    reserved_items,
    paid_amount,
    id,
    delivered_at,
    reservation_code,
  } = reservation;

  const isDelivered = reservation_status === 'delivered';

  // Normalize items for delivered reservations with stale item statuses
  const normalizedItems = isDelivered
    ? reserved_items.map((item) =>
        item.status !== 'delivered'
          ? { ...item, status: 'delivered' as Enums<'reservation_state'> }
          : item
      )
    : reserved_items;

  const total_price = calculateReservationTotal(normalizedItems);
  const remain_amount = calculateRemaining(normalizedItems, paid_amount);
  const fullyPaid = isFullyPaid(normalizedItems, paid_amount);

  const displayTime = isDelivered && delivered_at ? delivered_at : dead_line;
  const { day, dayOfWeek, month, time } = formatDateTime(displayTime);
  const timeLabel = isDelivered
    ? translate('resources.reservations.fields.delivered_at')
    : translate('resources.reservations.fields.dead_line');

  const [_palette, _shade] = STATUS_COLOR_MAP[reservation_status].split('.') as [
    'warning' | 'info' | 'success' | 'error',
    'main',
  ];
  const statusColor = theme.palette[_palette][_shade];

  const [update, { isLoading }] = useUpdate<
    Omit<TablesUpdate<'reservations'>, 'id'> & { id: Identifier }
  >();

  const handleStatusChange = async (itemId: string) => {
    const { data: session } = await supabase.auth.getSession();

    const updatedItems = reserved_items.map((item) =>
      item.id === itemId
        ? {
            ...item,
            status:
              item?.status === 'in-progress'
                ? ('ready' as Enums<'reservation_state'>)
                : item?.status === 'ready'
                  ? ('delivered' as Enums<'reservation_state'>)
                  : item?.status === 'delivered'
                    ? ('in-progress' as Enums<'reservation_state'>)
                    : item.status,
            deliveredAt: item?.status === 'ready' ? new Date().toISOString() : null,
            deliveredBy: item?.status === 'ready' ? session.session?.user.id : null,
          }
        : item
    );
    const allReady =
      updatedItems.every((item) => item.status === 'ready') ||
      updatedItems.every((item) => item.status !== 'in-progress');
    const allDelivered = updatedItems.every((item) => item.status === 'delivered');
    const newReservationStatus = allDelivered
      ? ('delivered' as Enums<'reservation_state'>)
      : allReady
        ? ('ready' as Enums<'reservation_state'>)
        : ('in-progress' as Enums<'reservation_state'>);

    update('reservations', {
      id,
      data: {
        reserved_items: updatedItems,
        reservation_status: newReservationStatus,
        delivered_at: allDelivered ? new Date().toISOString() : null,
        delivered_by: allDelivered ? session.session?.user.id : null,
        ...(allDelivered && { paid_amount: total_price }),
      },
      previousData: reservation,
    });
  };

  const handleDeliver = async () => {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) return;

    const payload: TablesUpdate<'reservations'> = {
      reservation_status: 'delivered',
      delivered_at: new Date().toISOString(),
      dead_line: formatDateOnly(new Date()),
      delivered_by: session.session.user.id,
      paid_amount: total_price,
      reserved_items: reserved_items.map((item) => ({ ...item, status: 'delivered' })),
    };

    await myProvider.update('reservations', { id, data: payload, previousData: reservation });
    refresh();
  };

  return (
    <>
      <Box
        onDoubleClick={() => !isDelivered && setEditModalOpen(true)}
        sx={{
          position: 'relative',
          ml: '12px',
          cursor: isDelivered ? 'default' : 'pointer',
          '&::before': {
            content: '""',
            position: 'absolute',
            left: '-8px',
            top: '8%',
            bottom: '8%',
            width: '3px',
            backgroundColor: statusColor,
            borderRadius: '2px',
          },
        }}
      >
        <Box
          sx={{
            border: `2px solid ${statusColor}`,
            borderRadius: 1,
            overflow: 'hidden',
          }}
        >
          <CardWrapper elevation={0}>
            {/* Row 1: Cancel + Name | Remaining + Deliver */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {!isDelivered && <CancelReservation id={id} />}
              <Typography noWrap sx={{ fontWeight: 700, fontSize: 18, flex: 1 }}>
                {full_name} ({toArabicNumerals(reservation_code)})
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 700,
                  fontSize: 14,
                  color: fullyPaid ? 'success.main' : 'error.main',
                  whiteSpace: 'nowrap',
                }}
              >
                {fullyPaid
                  ? translate('custom.labels.no_remain_amount')
                  : `${translate('resources.reservations.fields.remain_amount')}: ${toArabicNumerals(remain_amount)} ${translate('custom.currency.short')}`}
              </Typography>
              {!isDelivered && (
                <IconButton
                  size="small"
                  color="success"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeliver();
                  }}
                  title={translate('resources.reservations.actions.deliver')}
                >
                  <DoneAll fontSize="small" />
                </IconButton>
              )}
            </Box>

            {/* Row 2: Phone | Deadline */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                pl: !isDelivered ? '28px' : 0,
              }}
            >
              {phone_number && (
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: 14 }}>
                  {toArabicNumerals(phone_number)}
                </Typography>
              )}
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontSize: 14, whiteSpace: 'nowrap' }}
              >
                {`${timeLabel}: ${translateDayToArabic(dayOfWeek.day)} - ${toArabicNumerals(month)}/${toArabicNumerals(day)} - ${toArabicNumerals(time.hourMinute)} ${time.meridiem === 'AM' ? 'ص' : 'م'}`}
              </Typography>
            </Box>
          </CardWrapper>

          {/* Items table — always visible */}
          <ReservedItems
            reservedItems={normalizedItems}
            changeItemStatus={handleStatusChange}
            loading={isLoading}
            reservationStatus={reservation_status}
          />
        </Box>
      </Box>

      {/* Edit modal — opened via double-click */}
      <ReservationEditModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        reservation={reservation}
      />
    </>
  );
};

const CancelReservation = ({ id }: { id: string }) => {
  const translate = useTranslate();
  const [deleteOne] = useDelete();
  const refresh = useRefresh();

  const handleDelete = () => deleteOne('reservations', { id }, { onSuccess: refresh });

  return (
    <NestedModal
      confirmFn={handleDelete}
      title={translate('resources.reservations.actions.cancel')}
      buttonText={<Cancel fontSize="small" sx={{ color: 'error.main' }} />}
      buttonSize="small"
      color="error"
      buttonSx={{
        border: 'none',
        padding: 0,
        minWidth: 'auto',
        '&:hover': { border: 'none', backgroundColor: 'transparent' },
      }}
    />
  );
};

const ReservedItems = ({
  reservedItems,
  loading,
  changeItemStatus,
  reservationStatus,
}: ReservedItemsProps) => {
  const isDelivered = reservationStatus === 'delivered';

  return (
    <TableContainer component={Paper} sx={{ maxHeight: 196, borderRadius: 0 }}>
      <Table
        aria-label="reserved items"
        stickyHeader
        sx={{
          width: '100%',
          borderCollapse: 'collapse',
          tableLayout: 'auto',
          '& > th, & > td': {
            whiteSpace: 'nowrap',
          },
        }}
      >
        <TableHead>
          <TableRow>
            <StyledTableCell component="th">{<HelpOutline />}</StyledTableCell>
            <StyledTableCell component="th">المحجوز</StyledTableCell>
            <StyledTableCell component="th" align="center">
              الورق
            </StyledTableCell>
            <StyledTableCell component="th" align="center">
              الغلاف
            </StyledTableCell>
            <StyledTableCell component="th" align="center">
              عدد
            </StyledTableCell>
            <StyledTableCell component="th" align="center">
              سعر الوحدة
            </StyledTableCell>
            <StyledTableCell component="th" align="center">
              إجمالي السعر
            </StyledTableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {reservedItems.map((item) => (
            <TableRow
              key={item.id}
              sx={(theme) => ({
                '& > *': {
                  color:
                    item.status === 'ready'
                      ? theme.palette.info.main
                      : item.status === 'delivered'
                        ? theme.palette.success.main
                        : theme.palette.warning.main,
                },
              })}
            >
              <StyledTableCell align="center">
                <Button
                  variant="text"
                  size="small"
                  onClick={() => changeItemStatus(item.id)}
                  loading={loading}
                  disabled={isDelivered}
                >
                  {item.status === 'in-progress' ? (
                    <RotateRight />
                  ) : item.status === 'ready' ? (
                    <Done />
                  ) : (
                    <DoneAll />
                  )}
                </Button>
              </StyledTableCell>

              <StyledTableCell
                scope="row"
                sx={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {item.title}
              </StyledTableCell>

              <StyledTableCell align="center">{item.paper_type?.name}</StyledTableCell>
              <StyledTableCell align="center">{item.cover_type?.name}</StyledTableCell>
              <StyledTableCell align="center">{toArabicNumerals(item.quantity)}</StyledTableCell>
              <StyledTableCell align="center">
                {toArabicNumerals(Number(item.price))}
              </StyledTableCell>
              <StyledTableCell align="center">{toArabicNumerals(item.totalPrice)}</StyledTableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

interface ReservationItemProps {
  reservation: Reservation;
}
interface ReservedItemsProps {
  reservedItems: ReservationRecord[];
  changeItemStatus: (itemId: string) => void;
  loading?: boolean;
  reservationStatus: Enums<'reservation_state'>;
}

const CardWrapper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(1.5, 2),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(0.5),
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  border: `1px solid ${theme.palette.grey[200]}`,
  padding: 8,
  whiteSpace: 'nowrap',
  backgroundColor: 'transparent',
  '&.MuiTableCell-head': {
    backgroundColor: `${theme.palette.grey[100]} !important`,
    fontWeight: 600,
    position: 'sticky',
    top: 0,
    zIndex: 1,
  },
}));
