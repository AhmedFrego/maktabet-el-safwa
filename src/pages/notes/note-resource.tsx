import { Resource } from 'react-admin';

import DocumentScannerIcon from '@mui/icons-material/DocumentScanner';

import { CreateGuesser, EditGuesser, ShowGuesser } from 'ra-supabase';
import { NoteList } from '.';

export const NoteResource = (
  <Resource
    icon={DocumentScannerIcon}
    options={{ label: 'مذكرات' }}
    name="notes"
    list={NoteList}
    edit={EditGuesser}
    create={CreateGuesser}
    show={ShowGuesser}
  />
);
