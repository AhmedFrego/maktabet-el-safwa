import { DocumentScanner } from '@mui/icons-material';

import { NoteList, NoteCreate, NoteEdit, NoteShow } from '.';

export const NoteResource = {
  icon: DocumentScanner,
  options: { label: 'مذكرات' },
  name: 'notes',
  list: NoteList,
  edit: NoteEdit,
  create: NoteCreate,
  show: NoteShow,
};
