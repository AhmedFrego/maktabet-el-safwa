import { DocumentScanner } from '@mui/icons-material';
import { PublicationCreate, PublicationsList, PublicationEdit, PublicationShow } from '.';

export const PublicationResource = {
  icon: DocumentScanner,
  name: 'publications',
  list: PublicationsList,
  edit: PublicationEdit,
  create: PublicationCreate,
  show: PublicationShow,
};
