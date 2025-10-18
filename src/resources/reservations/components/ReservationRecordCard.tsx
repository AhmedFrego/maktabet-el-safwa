import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Paper,
  styled,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { Identifier, useTranslate, useUpdate } from 'react-admin';
import { Done, DoneAll, ExpandMore, HelpOutline, RotateRight } from '@mui/icons-material';

import { ReservationRecord } from 'store';
import { formatDateTime, toArabicNumerals, translateDayToArabic } from 'utils';

import { Reservation } from '..';
import { ReservationItemCta } from '.';
import { TablesInsert } from 'types/supabase-generated.types';

export const ReservationRecordCard = ({ reservation }: ReservationItemProps) => {
  const translate = useTranslate();

  const {
    client: { full_name, phone_number },
    dead_line,
    reservation_status,
    reserved_items,
    total_price,
    paid_amount,
    remain_amount,
    id,
  } = reservation;
  const { day, dayOfWeek, month, time } = formatDateTime(dead_line);

  const [update] = useUpdate<
    Omit<TablesInsert<'reservations'>['reserved_items'], 'id'> & { id: Identifier }
  >();

  const handleStatusChange = (itemId: string, newStatus: string) => {

    update(
      'reservations',
      { id, data: { status: newStatus }, previousData: reservedItems },
      {
        onSuccess: () => {
          // Handle success (e.g., show a notification)
        },
        onError: () => {
          // Handle error (e.g., show an error message)
        },
      }
    );
  };

  return (
    <StyledReservationItem>
      <Accordion sx={{ '&.MuiAccordion-root': { m: 0 } }}>
        <AccordionSummary
          expandIcon={<ExpandMore />}
          sx={(theme) => ({
            backgroundColor:
              reservation_status === 'ready'
                ? theme.palette.info.dark
                : reservation_status === 'delivered'
                  ? theme.palette.success.light
                  : theme.palette.warning.main,
            '& .MuiAccordionSummary-content': {
              justifyContent: 'space-between',
              maxWidth: '95%',
              gap: 1,
              px: 1,
              '& > *': {
                fontSize: 22,
                fontWeight: 900,
              },
            },
          })}
        >
          <Typography noWrap>{full_name}</Typography>
          <Typography noWrap>{phone_number ? toArabicNumerals(phone_number) : ''}</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>{`${translate('resources.reservations.fields.total_price')}: ${total_price}`}</Typography>
          <Typography>{`${translate('resources.reservations.fields.paid_amount')}: ${paid_amount}`}</Typography>
          <Typography>{`${translate('resources.reservations.fields.remain_amount')}: ${remain_amount === 0 ? `${translate('custom.labels.no_remain_amount')}` : `${toArabicNumerals(remain_amount)} ${translate('custom.currency.long')}`}`}</Typography>
          <Typography>{`${translate('resources.reservations.fields.reservation_status')}: ${translate(
            `resources.reservations.status.${reservation_status}`
          )}`}</Typography>
          <Typography>{`${translate('resources.reservations.fields.dead_line')}: ${translateDayToArabic(dayOfWeek.day)} - ${toArabicNumerals(month)}/${toArabicNumerals(day)} - ${toArabicNumerals(time.hourMinute)} ${time.meridiem === 'AM' ? 'ص' : 'م'}`}</Typography>
          <ReservationItemCta reservation={reservation} />
        </AccordionDetails>
      </Accordion>
      <Box>
        <ReservedItems reservedItems={reserved_items} />
      </Box>
    </StyledReservationItem>
  );
};

const ReservedItems = ({ reservedItems }: ReservedItemsProps) => {
  return (
    <TableContainer component={Paper} sx={{ maxHeight: 195, borderRadius: 0 }}>
      <Table
        aria-label="simple table"
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
        <TableHead
          sx={(theme) => ({
            backgroundColor: theme.palette.grey[100],
          })}
        >
          <TableRow sx={{}}>
            <StyledTableCell>{<HelpOutline />}</StyledTableCell>
            <StyledTableCell>المحجوز</StyledTableCell>
            <StyledTableCell align="center">الورق</StyledTableCell>
            <StyledTableCell align="center">الغلاف</StyledTableCell>
            <StyledTableCell align="center">عدد</StyledTableCell>
            <StyledTableCell align="center">سعر الوحدة</StyledTableCell>
            <StyledTableCell align="center">إجمالي السعر</StyledTableCell>
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
                      ? theme.palette.warning.light
                      : item.status === 'delivered'
                        ? theme.palette.success.light
                        : '',
                },
              })}
            >
              <StyledTableCell align="center">
                <Button variant="text" size="small">
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

              <StyledTableCell align="center">{item.paper_type.name}</StyledTableCell>
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
}

const StyledReservationItem = styled(Box)({});

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  border: `1px solid ${theme.palette.grey[200]}`,
  padding: 8,
  backgroundColor: 'transparent',
  whiteSpace: 'nowrap',
}));
