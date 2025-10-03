import { recordCardStructure } from 'components/UI';
import { toArabicNumerals } from 'utils';
import { Publication } from '.';

export const publicationToCard = (record: Publication): recordCardStructure => {
  return {
    bottomText: {
      start: `${record.subject.name} ${record.additional_data ? `(${record.additional_data})` : ''}`,
      end: record.publisher_data.name,
    },
    coverUrl: record.cover_url,
    chipText: toArabicNumerals(record.academicYear.short_name),
    tagText: record.price ? [toArabicNumerals(record.price), 'ج.م'] : undefined,
  };
};
