import { Tables, TablesInsert, TablesUpdate } from 'types';

export interface Publication extends Tables<'publications'> {
  publisher_data: { name: string };
  subject: { name: string };
  academicYear: { name: string; short_name: string };
  paper_size: { name: string };
}

export type PublicationWithFileCover = Omit<
  TablesInsert<'publications'> | TablesUpdate<'publications'>,
  'cover_url'
> & {
  cover_url?: { rawFile: File };
};

export interface recordCardStructure {
  coverUrl: string | null;
  chipText?: string;
  tagText?: (string | number)[];
  bottomText: {
    start: string;
    end: string;
  };
}
