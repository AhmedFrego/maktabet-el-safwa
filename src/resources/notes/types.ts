import { Tables } from 'types';

export interface Publication extends Tables<'publications'> {
  publisher_data: { name: string };
  subject: { name: string };
  academicYear: { name: string; short_name: string };
  paper_size: { name: string };
}
