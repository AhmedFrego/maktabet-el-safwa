import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
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
import { Reservation } from '..';
import { useTranslate } from 'react-admin';
import { ReservationRecord } from 'store';
import { ExpandMore } from '@mui/icons-material';
import { toArabicNumerals } from 'utils/helpers';

export const ReservationItem = ({ reservation }: ReservationItemProps) => {
  const translate = useTranslate();
  return (
    <StyledReservationItem>
      <Accordion sx={{ '&.MuiAccordion-root': { m: 0 } }}>
        <AccordionSummary
          expandIcon={<ExpandMore />}
          sx={(theme) => ({
            backgroundColor:
              reservation.reservation_status === 'ready'
                ? theme.palette.success.dark
                : theme.palette.warning.main,
            '& .MuiAccordionSummary-content': {
              fontWeight: 900,
              fontSize: 3,
              justifyContent: 'space-between',
              maxWidth: '95%',
              gap: 1,
              px: 1,
            },
          })}
        >
          <Typography noWrap>{reservation.client.full_name}</Typography>
          <Typography noWrap>{toArabicNumerals(reservation.client.phone_number)}</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>{`${translate('resources.reservations.fields.total_price')}: ${reservation.total_price}`}</Typography>
          <Typography>{`${translate('resources.reservations.fields.paid_amount')}: ${reservation.paid_amount}`}</Typography>
          <Typography>{`${translate('resources.reservations.fields.remain_amount')}: ${reservation.remain_amount}`}</Typography>
          <Typography>{`${translate('resources.reservations.fields.reservation_status')}: ${reservation.reservation_status}`}</Typography>
          <Typography>{`${translate('resources.reservations.fields.dead_line')}: ${reservation.dead_line}`}</Typography>
        </AccordionDetails>
      </Accordion>
      <Box>
        <ReservedItems reservedItems={reservation.reserved_items} />
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
          // tableLayout: 'auto',
        }}
      >
        <TableHead
          sx={(theme) => ({
            backgroundColor: theme.palette.grey[100],
          })}
        >
          <TableRow>
            <StyledTableCell sx={{ width: '100%' }}>المحجوز</StyledTableCell>
            <StyledTableCell align="center">ح.و</StyledTableCell>
            <StyledTableCell align="center">ع</StyledTableCell>
            <StyledTableCell align="center">س.و</StyledTableCell>
            <StyledTableCell align="center">إ.س</StyledTableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {reservedItems.map((item) => (
            <TableRow key={item.id}>
              <StyledTableCell
                scope="row"
                sx={{
                  width: '100%',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {item.title}
              </StyledTableCell>

              <StyledTableCell align="center">{item.paper_size.name}</StyledTableCell>
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
}));
