import { Tables, TablesInsert, TablesUpdate } from 'types';

export interface Publication extends Tables<'publications'> {
  publisher: { name: string };
  subject: { name: string };
  paper_type: { name: string };
}

export type PublicationWithFileCover = Omit<
  TablesInsert<'publications'> | TablesUpdate<'publications'>,
  'cover_url'
> & {
  cover_url?: { rawFile: File };
};

export const publicationsColumns = [
  '*',
  'paper_type:paper_types(name)',
  'publisher:publishers(name)',
  'subject:subjects(name)',
];
