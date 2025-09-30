import { recordCardStructure } from 'components/UI';
import { toArabicNumerals } from 'utils';
import { Publication } from '.';

export const noteToCard = (record: Publication): recordCardStructure => {
  return {
    bottomText: { start: record.subject.name, end: record.publisher_data.name },
    coverUrl: record.cover_url,
    chipText: toArabicNumerals(record.academicYear.short_name),
    tagText: record.price ? [toArabicNumerals(record.price), 'ج.م'] : undefined,
  };
};
