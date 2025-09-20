import { recordCardStructure } from 'components/UI';
import { toArabicNumerals } from 'utils';
import { Note } from '.';

export const noteToCard = (record: Note): recordCardStructure => {
  return {
    bottomText: { start: record.subject.name, end: record.teacher.name },
    coverUrl: record.cover_url,
    chipText: toArabicNumerals(record.academicYear.short_name),
    tagText: record.price ? [toArabicNumerals(record.price), 'ج.م'] : undefined,
  };
};
