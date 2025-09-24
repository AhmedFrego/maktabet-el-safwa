import { DocumentScanner } from '@mui/icons-material';

import { EditGuesser, ShowGuesser } from 'react-admin';
import { ReservationList } from '.';

export const reservationsResource = {
  icon: DocumentScanner,
  name: 'reservations',
  list: ReservationList,
  edit: EditGuesser,
  show: ShowGuesser,
};
