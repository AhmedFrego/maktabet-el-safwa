import { Assignment } from '@mui/icons-material';
import { ShowGuesser } from 'react-admin';
import { ReservationList, ReservationEdit } from '.';

export const reservationsResource = {
  icon: Assignment,
  name: 'reservations',
  list: ReservationList,
  edit: ReservationEdit,
  show: ShowGuesser,
};
