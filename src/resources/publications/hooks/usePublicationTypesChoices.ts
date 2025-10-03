import { useTranslate } from 'react-admin';
import { Enums } from 'types/supabase-generated.types';

export const usePublicationTypesChoices = (): {
  id: Enums<'publications_types'>;
  name: string;
}[] => {
  const translate = useTranslate();

  return [
    { id: 'book', name: translate('resources.publications.labels.publications_types.book') },
    { id: 'note', name: translate('resources.publications.labels.publications_types.note') },
    { id: 'other', name: translate('resources.publications.labels.publications_types.other') },
  ];
};
