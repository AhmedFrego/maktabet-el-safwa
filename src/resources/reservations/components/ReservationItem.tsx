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
import { Enums } from 'types/supabase-generated.types';

export const ReservationItem = ({ reservation }: ReservationItemProps) => {
  const translate = useTranslate();
  return (
    <StyledReservationItem>
      <Box>
        <ReservedItems
          reservedItems={reservation.reserved_items}
          status={reservation.reservation_status}
        />
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

const ReservedItems = ({ reservedItems, status }: ReservedItemsProps) => {
  return (
    <TableContainer component={Paper} sx={{ maxHeight: 195 }}>
      <Table
        aria-label="simple table"
        stickyHeader
        sx={{
          width: '100%',
          tableLayout: 'auto', // let columns take min-content naturally
        }}
      >
        <TableHead
          sx={(theme) => ({
            backgroundColor:
              status === 'ready' ? theme.palette.success.light : theme.palette.warning.light,
          })}
        >
          <TableRow>
            {/* expanding column */}
            <StyledTableCell sx={{ width: '100%' }}>المحجوز</StyledTableCell>

            {/* others: no width, they just shrink to min-content */}
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
                  width: '100%', // grows into remaining space
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {item.title}
              </StyledTableCell>

              {/* others shrink naturally */}
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
  status?: Enums<'reservation_state'>;
}

const StyledReservationItem = styled(Box)(({ theme }) => ({
  minWidth: theme.spacing(40),
  flex: '1',
  // maxHeight: theme.spacing(60),
  // backgroundColor: theme.palette.grey[100],
  // padding: theme.spacing(0.2),
  // display: 'flex',
  // flexDirection: 'column',
  // justifyContent: 'space-between',
  // borderRadius: theme.shape.borderRadius,
}));

const StyledTableCell = styled(TableCell)({
  borderInline: '1px solid rgba(224, 224, 224, 1)',
  padding: 8,
  backgroundColor: 'transparent',
});
