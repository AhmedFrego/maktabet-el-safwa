import { CreateGuesser, EditGuesser, ShowGuesser } from 'ra-supabase';

import { DocumentScanner } from '@mui/icons-material';

import { NoteList } from '.';

export const NoteResource = {
  icon: DocumentScanner,
  options: { label: 'مذكرات' },
  name: 'notes',
  list: NoteList,
  edit: EditGuesser,
  create: CreateGuesser,
  show: ShowGuesser,
};
