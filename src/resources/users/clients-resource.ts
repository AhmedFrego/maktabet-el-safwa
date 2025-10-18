import { Groups } from '@mui/icons-material';
import { EditGuesser, ShowGuesser } from 'react-admin';

import { ClientsList } from './clients-list';

export const clientsResource = {
  icon: Groups,
  name: 'users',
  list: ClientsList,
  edit: EditGuesser,
  show: ShowGuesser,
};
