import { Settings } from '@mui/icons-material';
import { EditGuesser, ListGuesser, ShowGuesser } from 'react-admin';

export const settingsResource = {
  icon: Settings,
  name: 'settings',
  list: ListGuesser,
  edit: EditGuesser,
  show: ShowGuesser,
};
