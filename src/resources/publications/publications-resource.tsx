import { DocumentScanner } from '@mui/icons-material';
import {
  PublicationCreate,
  PublicationEdit,
  PublicationShow,
  PublicationsList,
} from './components';

export const PublicationResource = {
  icon: DocumentScanner,
  name: 'publications',
  list: PublicationsList,
  edit: PublicationEdit,
  create: PublicationCreate,
  show: PublicationShow,
};
