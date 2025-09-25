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
      <Box>
        <ReservedItems reservedItems={reservation.reserved_items} />
      </Box>

      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMore />}
          sx={(theme) => ({
            backgroundColor: theme.palette.info.light,
            '& .MuiAccordionSummary-content': {
              justifyContent: 'space-between',
              maxWidth: '95%',
              gap: 1,
              px: 1,
            },
          })}
        >
          <Typography noWrap>{reservation.client.full_name}</Typography>
          <Typography noWrap>{reservation.client.phone_number}</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>{`${translate('resources.reservations.fields.total_price')}: ${reservation.total_price}`}</Typography>
          <Typography>{`${translate('resources.reservations.fields.paid_amount')}: ${reservation.paid_amount}`}</Typography>
          <Typography>{`${translate('resources.reservations.fields.remain_amount')}: ${reservation.remain_amount}`}</Typography>
          <Typography>{`${translate('resources.reservations.fields.reservation_status')}: ${reservation.reservation_status}`}</Typography>
        </AccordionDetails>
      </Accordion>
    </StyledReservationItem>
  );
};

const ReservedItems = ({ reservedItems }: { reservedItems: ReservationRecord[] }) => {
  return (
    <TableContainer component={Paper} sx={{ maxHeight: 195 }}>
      <Table aria-label="simple table" stickyHeader>
        <TableHead
          sx={(theme) => ({
            backgroundColor: theme.palette.grey[200],
          })}
        >
          <TableRow>
            <StyledTableCell>المحجوز</StyledTableCell>
            <StyledTableCell align="center">ح.و</StyledTableCell>
            <StyledTableCell align="center">ع</StyledTableCell>
            <StyledTableCell align="center">س.و</StyledTableCell>
            <StyledTableCell align="center">إ.س</StyledTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {reservedItems.map((item) => (
            <TableRow key={item.id}>
              <StyledTableCell scope="row">{item.title}</StyledTableCell>
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

const StyledReservationItem = styled(Box)(({ theme }) => ({
  width: theme.spacing(40),
  maxHeight: theme.spacing(60),
  backgroundColor: theme.palette.grey[100],
  padding: theme.spacing(0.2),
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
}));

const StyledTableCell = styled(TableCell)({
  borderInline: '1px solid rgba(224, 224, 224, 1)',
  padding: 8,
});
