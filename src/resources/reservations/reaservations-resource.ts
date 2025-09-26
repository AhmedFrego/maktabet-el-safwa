import { Assignment } from '@mui/icons-material';
import { EditGuesser, ShowGuesser } from 'react-admin';
import { ReservationList } from '.';

export const reservationsResource = {
  icon: Assignment,
  name: 'reservations',
  list: ReservationList,
  edit: EditGuesser,
  show: ShowGuesser,
};
