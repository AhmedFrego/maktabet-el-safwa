import { DocumentScanner } from '@mui/icons-material';

import { PublicationsList, PublicationCreate, PublicationEdit, PublicationShow } from '.';

export const NoteResource = {
  icon: DocumentScanner,
  name: 'publications',
  list: PublicationsList,
  edit: PublicationEdit,
  create: PublicationCreate,
  show: PublicationShow,
};
