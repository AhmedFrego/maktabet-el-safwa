import { ShowGuesser } from 'ra-supabase';

import { DocumentScanner } from '@mui/icons-material';

import { NoteList, NoteCreate, NoteEdit } from '.';

export const NoteResource = {
  icon: DocumentScanner,
  options: { label: 'مذكرات' },
  name: 'notes',
  list: NoteList,
  edit: NoteEdit,
  create: NoteCreate,
  show: ShowGuesser,
};
