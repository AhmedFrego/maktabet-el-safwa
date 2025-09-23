import { Tables } from 'types';

export interface Note extends Tables<'notes'> {
  teacher: { name: string };
  subject: { name: string };
  term: { name: string };
  academicYear: { name: string; short_name: string };
  paper_size: { name: string };
}
